import { useLayoutEffect, useState, useContext } from "react";
import styles from "@root/styles/ExportModal.module.css";
import { Alert, Button } from "react-bootstrap";
import SectionSelector from "@components/forms/components/SectionSelector";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { getRootStyle } from "@utils/Colors";
import { useReactFlow } from "reactflow";
import { NodeTypes } from "@utils/TypeDefinitions";
import { PlatformContext } from "pages/_app";
import { getBackupURL } from "@utils/Platform";
import { ActionNodes } from "@utils/Nodes";
import { getHTTPPrefix, getSectionIDFromPosition } from "@utils/Utils";
import { toast } from "react-toastify";

export default function ExportPanel({
	errorList,
	warningList,
	changeTab,
	metaData,
	userData,
	mapName,
	LTISettings,
}) {
	const reactFlowInstance = useReactFlow();
	const { platform } = useContext(PlatformContext);
	const [ableToExport, setAbleToExport] = useState(false);
	const [hasErrors, setHasErrors] = useState(!ableToExport);
	const [errorCount, setErrorCount] = useState(0);
	const [hasWarnings, setHasWarnings] = useState(false);
	const [warningCount, setWarningCount] = useState(0);
	const [currentSelectionInfo, setCurrentSelectionInfo] = useState({
		selection: [],
	});

	const backupURL = getBackupURL(platform, metaData);
	const handleSelectionChange = (selectionInfo) => {
		if (selectionInfo != undefined && selectionInfo.selection != []) {
			const hasSelectedErrors = () => {
				for (let i = 0; i < selectionInfo.selection.length; i++) {
					if (selectionInfo.errors[selectionInfo.selection[i]] !== undefined) {
						return true;
					}
				}
				return false;
			};
			const getSelectedErrorCount = () => {
				let sum = 0;
				for (let i = 0; i < selectionInfo.selection.length; i++) {
					if (selectionInfo.errors[selectionInfo.selection[i]] !== undefined) {
						let error = selectionInfo.errors[selectionInfo.selection[i]];
						if (error === null) {
							error = 0;
						}
						sum += error;
					}
				}
				return sum;
			};
			const hasSelectedWarnings = () => {
				for (let i = 0; i < selectionInfo.selection.length; i++) {
					if (
						selectionInfo.warnings[selectionInfo.selection[i]] !== undefined &&
						selectionInfo.warnings[selectionInfo.selection[i]] !== 0
					) {
						return true;
					}
				}
				return false;
			};

			const getSelectedWarningCount = () => {
				let sum = 0;
				for (let i = 0; i < selectionInfo.selection.length; i++) {
					if (
						selectionInfo.warnings[selectionInfo.selection[i]] !== undefined
					) {
						let warning = selectionInfo.warnings[selectionInfo.selection[i]];
						if (warning === null) {
							warning = 0;
						}
						sum += warning;
					}
				}
				return sum;
			};

			setAbleToExport(
				() => !hasSelectedErrors() && selectionInfo.selection.length > 0
			);
			setHasErrors(() => hasSelectedErrors());
			setErrorCount(() => getSelectedErrorCount());
			setHasWarnings(() => hasSelectedWarnings());
			setWarningCount(() => getSelectedWarningCount());
			setCurrentSelectionInfo(selectionInfo);
		}
	};

	useLayoutEffect(() => {
		console.log(currentSelectionInfo);
	}, [currentSelectionInfo]);

	const exportMap = async () => {
		let nodesToExport = JSON.parse(
			JSON.stringify(reactFlowInstance.getNodes()) //Deep clone TODO: DO THIS BETTER
		);
		nodesToExport = nodesToExport.filter((node) =>
			NodeTypes.find((declaration) => {
				if (node.type == declaration.type) {
					if (!declaration.lms.includes("lti")) {
						return true;
					} else {
						return false;
					}
				}
			})
		);
		const fullNodes = JSON.parse(JSON.stringify(nodesToExport));
		//Deletting unnecessary info and flattening the nodes
		nodesToExport = nodesToExport.map((node) => {
			delete node.data.label;
			delete node.data.lmsResource;
			const data = node.data;
			if (data.c) {
				specifyConditionType(data.c);
				const finalshowc = [];
				if (data.c.op == "&") {
					delete data.c.showc;
					if (data.c.c)
						if (Array.isArray(data.c.c)) {
							data.c.c.forEach((innerCondition) => {
								finalshowc.push(innerCondition.showc);
								deleteRecursiveShowC(innerCondition);
							});
						}
					data.c.showc = finalshowc;
				} else {
					if (data.c.c)
						if (Array.isArray(data.c.c)) {
							data.c.c.forEach((innerCondition) => {
								deleteRecursiveShowC(innerCondition);
							});
						}
					data.c.show = data.c.showc;
					delete data.c.id;
					delete data.c.showc;
				}
				deleteRecursiveId(data.c);
				deleteRecursiveNull(data.c);
			}
			delete node.data;
			delete node.height;
			delete node.width;
			delete node.position;
			delete node.positionAbsolute;
			delete node.dragging;
			delete node.draggable;
			delete node.selected;
			delete node.parentNode;
			delete node.expandParent;
			const type = node.type;
			delete node.type;
			if (ActionNodes.includes(type)) {
				return { ...node, ...data, actionType: type };
			} else {
				return { ...node, ...data };
			}
		});
		let nodesAsString = JSON.stringify(nodesToExport);
		//Replacing block Ids by the resource ids
		fullNodes.forEach((fullNode) => {
			const originalId = fullNode.id;
			const lmsResource =
				fullNode.data.lmsResource == undefined
					? -1
					: Number(fullNode.data.lmsResource);
			const regex = new RegExp('"' + originalId + '"', "g");
			nodesAsString = nodesAsString.replace(regex, lmsResource);
		});

		const nodesReadyToExport = JSON.parse(nodesAsString).filter((node) => {
			const section = metaData.sections.find(
				(section) => section.position == node.section
			);

			//Change section position for section id
			if (section != undefined) {
				node.section = section.id;
			}

			if (node.id == "") {
				node.id = -1;
			} else {
				node.id = Number(node.id);
			}

			if (section && currentSelectionInfo.selection.includes(section.id))
				return true;
		});
		sendNodes(nodesReadyToExport);
	};

	function deleteRecursiveId(obj) {
		if (obj.hasOwnProperty("id")) {
			delete obj.id;
		}
		if (obj.hasOwnProperty("c") && Array.isArray(obj.c)) {
			obj.c.forEach(deleteRecursiveId);
		}
	}

	function deleteRecursiveShowC(obj) {
		if (obj.hasOwnProperty("showc")) {
			delete obj.showc;
		}
		if (obj.hasOwnProperty("c") && Array.isArray(obj.c)) {
			obj.c.forEach(deleteRecursiveShowC);
		}
	}

	function deleteRecursiveNull(obj) {
		const is_obj = (x) => x !== null && typeof x === "object";
		const is_arr = (x) => Array.isArray(x);

		const nullish = (x) => x === null;

		const clean = (x) =>
			[x]
				.map((x) => Object.entries(x))
				.map((x) =>
					x.map(([k, v]) =>
						is_arr(v)
							? [k, v.map((vv) => (is_obj(vv) ? clean(vv) : vv))]
							: is_obj(v)
							? [k, clean(v)]
							: [k, v]
					)
				)
				.map((x) => x.filter(([k, v]) => !nullish(v)))
				.map((x) => Object.fromEntries(x))
				.pop();

		return clean(obj);
	}

	function deleteSelfBySpecificId(obj, id) {
		if (obj.hasOwnProperty("op")) {
			if (obj.op == id) obj = null;
		}
		if (obj.hasOwnProperty("conditions") && Array.isArray(obj.conditions)) {
			obj.conditions.forEach((obj) =>
				deleteRecursdeleteSelfBySpecificIdiveId(obj, id)
			);
		}
	}

	function specifyConditionType(condition) {
		let type = "";
		if (condition.hasOwnProperty("type")) {
			type = condition.type;
			delete condition.type;
		}

		condition.id = Number(condition.id);

		switch (type) {
			case "grade":
				condition.id = Number(condition.cm);
				delete condition.cm;
				break;
			case "courseQualification":
				condition.id = Number(condition.courseId);
				delete condition.courseId;
				break;
			case "group":
				condition.id = Number(condition.groupId);
				delete condition.groupId;
				break;
			case "grouping":
				condition.id = Number(condition.groupingId);
				delete condition.groupingId;
				break;
			default:
		}

		if (
			condition.hasOwnProperty("conditions") &&
			Array.isArray(condition.conditions)
		) {
			condition.conditions.forEach(specifyConditionType);
		}
	}

	async function sendNodes(nodes) {
		console.log(nodes);
		try {
			const response = await fetch(
				`${getHTTPPrefix()}://${LTISettings.back_url}/api/lti/export_version`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						course: metaData.course_id,
						instance: metaData.instance_id,
						userId: userData.user_id,
						userPerms: userData.userperms,
						nodes: nodes,
						save: true,
						selection: currentSelectionInfo.selection,
					}),
				}
			);

			if (response) {
				const ok = response.ok;
				if (ok) {
					toast("Versión guardada con éxito", defaultToastSuccess);
				} else {
					throw new Error("No se pudo guardar");
				}
			} else {
				throw new Error("No se pudo guardar");
			}
		} catch (e) {
			console.error(e);
		}
	}

	return (
		<>
			<SectionSelector
				metaData={metaData}
				showErrors={true}
				errorList={errorList}
				warningList={warningList}
				handleSelectionChange={handleSelectionChange}
				mapName={mapName}
			/>
			{hasErrors && (
				<Alert variant={"danger"}>
					<strong>Atención: </strong>
					<a
						role="button"
						className={styles.nodeError}
						onClick={() => changeTab("error")}
					>{`No es posible exportar debido a ${errorCount} ${
						errorCount > 1 ? "errores" : "error"
					}.`}</a>
				</Alert>
			)}

			{currentSelectionInfo.selection.length < 0 && (
				<Alert variant={"danger"}>
					<strong>Atención: </strong>
					<a
						role="button"
						className={styles.nodeError}
						onClick={() => changeTab("error")}
					>{`Ha de seleccionar una sección como mínimo.`}</a>
				</Alert>
			)}

			<Button
				disabled={hasErrors || currentSelectionInfo.selection.length <= 0}
				onClick={exportMap}
			>
				Guardar y exportar
				{warningCount > 0 && (
					<FontAwesomeIcon
						icon={faExclamationTriangle}
						style={{
							color: getRootStyle("--warning-background-color"),
						}}
						title={`${warningList.length} advertencia(s)`}
					/>
				)}
			</Button>
			{backupURL && (
				<p>
					<b>Atención: </b>{" "}
					<a href={backupURL} target="_blank">
						se recomienda hacer una copia de seguridad del curso.
					</a>
				</p>
			)}
			{hasWarnings && (
				<Alert variant={"warning"}>
					<strong>Atención: </strong>
					<a
						role="button"
						className={styles.nodeWarning}
						onClick={() => changeTab("warning")}
					>{`Tiene ${warningCount} ${
						warningCount > 1 ? "advertencias" : "advertencia"
					}.`}</a>
				</Alert>
			)}
		</>
	);
}
