import { useLayoutEffect, useState, useContext, useRef } from "react";
import styles from "@root/styles/ExportModal.module.css";
import { Alert, Button, Spinner } from "react-bootstrap";
import SectionSelector from "@components/forms/components/SectionSelector";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { getRootStyle } from "@utils/Colors";
import { useReactFlow, useNodes } from "reactflow";
import { NodeTypes } from "@utils/TypeDefinitions";
import { MapInfoContext, PlatformContext } from "pages/_app";
import { getBackupURL } from "@utils/Platform";
import { ActionNodes } from "@utils/Nodes";
import {
	fetchBackEnd,
	getHTTPPrefix,
	getSectionIDFromPosition,
	saveVersion,
} from "@utils/Utils";
import { toast } from "react-toastify";
import { parseMoodleBadgeToExport } from "@utils/Moodle";

export default function ExportPanel({
	errorList,
	warningList,
	changeTab,
	metaData,
	userData,
	mapName,
	LTISettings,
	selectedVersion,
}) {
	const reactFlowInstance = useReactFlow();
	const rfNodes = useNodes();

	const { platform } = useContext(PlatformContext);
	const { mapSelected, setMapSelected } = useContext(MapInfoContext);

	const [exporting, setExporting] = useState(false);
	const [ableToExport, setAbleToExport] = useState(false);
	const [hasErrors, setHasErrors] = useState(!ableToExport);
	const [errorCount, setErrorCount] = useState(0);
	const [hasWarnings, setHasWarnings] = useState(false);
	const [warningCount, setWarningCount] = useState(0);
	const [currentSelectionInfo, setCurrentSelectionInfo] = useState({
		selection: [],
	});

	const exportButtonRef = useRef(null);

	const defaultToastSuccess = {
		hideProgressBar: false,
		autoClose: 2000,
		type: "success",
		position: "bottom-center",
	};

	const defaultToastError = {
		hideProgressBar: false,
		autoClose: 2000,
		type: "error",
		position: "bottom-center",
	};

	function enableExporting(boolean) {
		setExporting(boolean);
		if (exportButtonRef.current) {
			exportButtonRef.current.disabled = boolean;
		}
	}

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

	const exportAndSave = async () => {
		try {
			enableExporting(true);
			await exportMap();
		} catch (error) {
			// Handle error
		}
	};

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
				const finalshowc = [];
				if (data.c.op == "&" || data.c.op == "!|") {
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

				specifyRecursiveConditionType(data.c);

				//deleteRecursiveId(data.c);
				deleteRecursiveNull(data.c);
				data.c = deleteEmptyC(data.c);
				console.log(data.c);
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
				const actionNode = {
					...node,
					...data,
					actionType: type,
				};
				if (platform == "moodle") {
					if (type == "badge") {
						return parseMoodleBadgeToExport(actionNode);
					}
				} else {
					return actionNode;
				}
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

		console.log(nodesReadyToExport);

		const uniqueSectionColumnPairs = new Set();

		const sortedSectionColumnPairs = nodesReadyToExport
			.filter((item) => {
				const { section, indent } = item;
				const pairString = `${section}-${indent}`;

				if (!uniqueSectionColumnPairs.has(pairString)) {
					uniqueSectionColumnPairs.add(pairString);
					return true;
				}

				return false;
			})
			.map(({ section, indent }) => ({ section, indent }));

		sortedSectionColumnPairs.sort((a, b) => {
			// Compare by "section" first
			if (a.section < b.section) return -1;
			if (a.section > b.section) return 1;

			// If "section" values are the same, compare by "indent" (column)
			return a.indent - b.indent;
		});

		console.log(sortedSectionColumnPairs);

		let resultJson = [];
		const sectionProcessed = {};

		sortedSectionColumnPairs.map((jsonObj) => {
			if (!sectionProcessed[jsonObj.section]) {
				// Process the section if it hasn't been processed yet
				resultJson.push({
					pageId: 1,
					type: 14,
					title: "",
					format: "section",
				});

				resultJson = resultJson.concat(
					nodesReadyToExport
						.filter(
							(node) =>
								node.section === jsonObj.section &&
								node.indent === jsonObj.indent
						)
						.sort((a, b) => a.order - b.order)
				);

				sectionProcessed[jsonObj.section] = true; // Mark the section as processed
			} else {
				resultJson.push({
					pageId: 1,
					type: 14,
					title: "",
					format: "column",
				});

				resultJson = resultJson.concat(
					nodesReadyToExport
						.filter(
							(node) =>
								node.section === jsonObj.section &&
								node.indent === jsonObj.indent
						)
						.sort((a, b) => a.order - b.order)
				);
			}
		});
		console.log(resultJson);

		console.log(sortedSectionColumnPairs);
		sendNodes(nodesReadyToExport);
	};

	function deleteEmptyC(obj) {
		if (obj.hasOwnProperty("c") && Array.isArray(obj.c) && obj.c.length > 0) {
			obj.c.forEach(deleteEmptyC);
		} else {
			delete obj.c;
		}
		return obj;
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

	function specifyRecursiveConditionType(condition) {
		let type = "";
		if (condition.hasOwnProperty("type")) {
			type = condition.type;
		}

		switch (type) {
			case "grade":
				condition.id = condition.cm;
				if (condition.min) delete condition.cm;
				break;
			case "courseGrade":
				condition.id = condition.courseId;
				delete condition.courseId;
				break;
			case "group":
				if (condition.groupId) {
					condition.id = condition.groupId;
				} else {
					delete condition.id;
				}
				delete condition.groupId;
				break;
			case "grouping":
				condition.id = condition.groupingId;
				delete condition.groupingId;
				break;
			default:
				delete condition.id;
				break;
		}

		if (condition.hasOwnProperty("c") && Array.isArray(condition.c)) {
			condition.c.forEach(specifyRecursiveConditionType);
		}
	}

	async function sendNodes(nodes) {
		console.log(nodes);
		try {
			const payload = {
				course: metaData.course_id,
				instance: metaData.instance_id,
				userId: userData.user_id,
				userPerms: userData.userperms,
				nodes: nodes,
				save: true,
				selection: currentSelectionInfo.selection,
			};

			const response = await fetchBackEnd(
				LTISettings,
				sessionStorage.getItem("token"),
				"api/lti/export_version",
				"POST",
				payload
			);

			if (response) {
				const ok = response.ok;
				if (ok) {
					await saveVersion(
						rfNodes,
						metaData,
						platform,
						userData,
						mapSelected,
						selectedVersion,
						LTISettings,
						defaultToastSuccess,
						defaultToastError,
						toast,
						enableExporting
					);
				} else {
					enableExporting(false);
					throw new Error("No se pudo exportar", defaultToastError);
				}
			} else {
				enableExporting(false);
				throw new Error("No se pudo exportar", defaultToastError);
			}
		} catch (e) {
			toast("No se pudo exportar", defaultToastError);
		}

		enableExporting(false);
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
				ref={exportButtonRef}
				disabled={hasErrors || currentSelectionInfo.selection.length <= 0}
				onClick={exportAndSave}
			>
				{!exporting && <div>Guardar y exportar</div>}
				{exporting && (
					<Spinner
						as="span"
						animation="border"
						size="sm"
						role="status"
						aria-hidden="true"
					/>
				)}
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
