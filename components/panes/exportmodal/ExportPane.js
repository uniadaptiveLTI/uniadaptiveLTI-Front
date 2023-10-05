import { useLayoutEffect, useState, useContext, useRef } from "react";
import styles from "/styles/ExportModal.module.css";
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
import LessonSelector from "@components/forms/components/LessonSelector";

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
	const selectDOM = useRef(null);

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
			switch (platform) {
				case "moodle":
					delete node.data.label;
					break;
				case "sakai":
					break;
			}
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

			delete node.x;
			delete node.y;
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
			switch (platform) {
				case "moodle":
					delete node.type;
					break;
				case "sakai":
					node.c = data.requisites;
					node.pageId = 5;
					break;
			}
			if (ActionNodes.includes(type)) {
				const actionNode = {
					...node,
					...data,
					actionType: type,
				};
				if (platform == "moodle") {
					if (type == "badge") {
						return parseMoodleBadgeToExport(
							actionNode,
							reactFlowInstance.getNodes(),
							metaData
						);
					}
				} else {
					return actionNode;
				}
			} else {
				return { ...node, ...data };
			}
		});

		let nodesAsString = JSON.stringify(nodesToExport);
		console.log(nodesAsString);
		//Replacing block Ids by the resource ids
		fullNodes.forEach((fullNode) => {
			const originalId = fullNode.id;
			const lmsResource =
				fullNode.data.lmsResource == undefined
					? "-1"
					: fullNode.data.lmsResource;
			const regex = new RegExp('"' + originalId + '"', "g");
			nodesAsString = nodesAsString.replace(
				regex,
				platform == "moodle" ? lmsResource : JSON.stringify(String(lmsResource))
			);
		});

		let nodesReadyToExport = JSON.parse(nodesAsString);
		if (platform == "moodle") {
			nodesReadyToExport.filter((node) => {
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

				if (!section) {
					return true;
				}
			});
		}

		console.log("nodesReadyToExport", nodesReadyToExport);
		console.log(platform);
		if (platform === "sakai") {
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

			let nodesToUpdateRequest = [];
			nodesReadyToExport.map((node) => {
				const newNode = { ...node };
				if (newNode.c && newNode.c.length >= 1) {
					const dateCondition = newNode.c.find(
						(condition) => condition.type === "date"
					);

					const groupCondition = newNode.c.find(
						(condition) => condition.type === "group"
					);

					const dateExceptionCheck = newNode.c.some(
						(condition) => condition.type === "dateException"
					);

					if (dateCondition) {
						if (dateCondition.openingDate) {
							newNode.openDate = Date.parse(dateCondition?.openingDate) / 1000;
						}

						if (dateCondition.dueDate) {
							newNode.dueDate = Date.parse(dateCondition?.dueDate) / 1000;
						}

						if (dateCondition?.closeTime) {
							newNode.closeDate = Date.parse(dateCondition?.closeTime) / 1000;
						}
					}

					if (groupCondition) {
						newNode.groupRefs = [];
						groupCondition.groupList.map((group) => {
							newNode.groupRefs.push(group.id);
						});
					}

					if (dateExceptionCheck) {
						newNode.timeExceptions = [];

						let dateExceptionFiltered = newNode.c.filter(
							(condition) => condition.type === "dateException"
						);
						dateExceptionFiltered.map((exception) => {
							const newException = {};
							newException.openDate = Date.parse(exception?.openingDate) / 1000;
							newException.dueDate = Date.parse(exception?.dueDate) / 1000;
							newException.closeDate = Date.parse(exception?.closeTime) / 1000;

							if (exception.op && exception.op === "group") {
								newException.forEntityRef =
									"/site/" +
									metaData.course_id +
									"/group/" +
									exception.entityId;
							}

							if (exception.op && exception.op === "user") {
								newException.forEntityRef = "/user/" + exception.entityId;
							}

							newNode.timeExceptions.push(newException);
						});
					}
				}

				newNode.title = newNode.label;
				newNode.type = sakaiExportTypeSwitch(newNode.type);

				delete newNode.label;
				delete newNode.c;
				delete newNode.children;
				delete newNode.indent;
				delete newNode.lmsVisibility;
				delete newNode.requisites;
				delete newNode.pageId;
				delete newNode.order;
				delete newNode.section;

				nodesToUpdateRequest.push(newNode);
			});
			console.log(nodesToUpdateRequest, nodesReadyToExport);

			let resultJson = [];
			const sectionProcessed = {};

			console.log(sortedSectionColumnPairs, nodesReadyToExport);
			sortedSectionColumnPairs.map((jsonObj) => {
				if (!sectionProcessed[jsonObj.section]) {
					// Process the section if it hasn't been processed yet
					resultJson.push({
						pageId: 5,
						type: 14,
						title: "",
						format: "section",
					});

					const filteredArray = nodesReadyToExport
						.filter(
							(node) =>
								node.section === jsonObj.section &&
								node.indent === jsonObj.indent
						)
						.sort((a, b) => a.order - b.order);

					filteredArray.map((node) => {
						console.log(node);
						const nodeTypeParsed = sakaiTypeSwitch(node);
						resultJson.push({
							pageId: 5,
							type: nodeTypeParsed.type,
							title: node.label,
							contentRef: nodeTypeParsed.contentRef,
						});
					});

					sectionProcessed[jsonObj.section] = true; // Mark the section as processed
				} else {
					resultJson.push({
						pageId: 5,
						type: 14,
						title: "",
						format: "column",
					});

					const filteredArray = nodesReadyToExport
						.filter(
							(node) =>
								node.section === jsonObj.section &&
								node.indent === jsonObj.indent
						)
						.sort((a, b) => a.order - b.order);
					console.log(filteredArray);
					filteredArray.map((node) => {
						console.log(node);
						const nodeTypeParsed = sakaiTypeSwitch(node);
						resultJson.push({
							pageId: 5,
							type: nodeTypeParsed.type,
							title: node.label,
							contentRef: nodeTypeParsed.contentRef,
						});
					});
				}
			});
			/*
<<<<<<< Updated upstream*/
			/* AQUI LLAMAREMOS A LA FUNCION PARA QUE A DAVID LE LLEGUE EL
			   nodesReadyToExport (que es para que se actualicen los objetos)
			   y resultJson (que es para que se creen los lessons items en la lesson (bloques) <= PRIORIZAR ESTE Y COMPROBARLO EN BACK PLS
			   no importeis una lesson, porque no va, cread literalmente 2 bloques uno de examen y otro de tarea y exportarlo para ver que se crea
			*/
			/*} else {
			sendNodes(nodesReadyToExport);
		}*/

			sortedSectionColumnPairs.sort((a, b) => {
				// Compare by "section" first
				if (a.section < b.section) return -1;
				if (a.section > b.section) return 1;

				// If "section" values are the same, compare by "indent" (column)
				return a.indent - b.indent;
			});

			console.log(sortedSectionColumnPairs);

			console.log(resultJson);

			console.log(sortedSectionColumnPairs);
			console.log(nodesReadyToExport);
			sendNodes(nodesReadyToExport, resultJson, nodesToUpdateRequest);
		} else {
			sendNodes(nodesReadyToExport);
		}
	};

	function sakaiTypeSwitch(node) {
		switch (node.type) {
			case "resource":
				return { type: 1, contentRef: node.id.toString() };
			case "html":
				return { type: 1, contentRef: node.id.toString() };
			case "text":
				return { type: 5, contentRef: node.id.toString() };
			case "url":
				return { type: 6, contentRef: node.id.toString() };
			/* IS NOT SUPPORTED case "folder":
				return { type: 20, contentRef: "" };*/
			case "exam":
				return { type: 4, contentRef: "/sam_pub/" + node.id };
			case "assign":
				return { type: 3, contentRef: "/assignment/" + node.id };
			case "forum":
				return { type: 8, contentRef: "/forum_forum/" + node.id };
		}
	}

	function sakaiExportTypeSwitch(id) {
		switch (id) {
			case "resource":
				return "RESOURCE";
			case "html":
				return "HTML";
			case "text":
				return "TEXT";
			case "url":
				return "URL";
			/* IS NOT SUPPORTED case "folder":
				return { type: 20, contentRef: "" };*/
			case "exam":
				return "ASSESSMENT";
			case "assign":
				return "ASSIGNMENT";
			case "forum":
				return "FORUM";
		}
	}

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

	async function sendNodes(nodes, resultJson, resultJsonSecondary) {
		console.log(nodes);
		try {
			const payload = {
				course: metaData.course_id,
				instance: metaData.instance_id,
				userId: userData.user_id,
				userPerms: userData.userperms,
				save: true,
				selection: currentSelectionInfo.selection,
			};

			if (platform == "sakai") {
				payload.nodes = resultJson;
				payload.nodesToUpdate = resultJsonSecondary;
			} else {
				payload.nodes = nodes;
			}

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
				allowModularSelection={platform == "moodle"}
				metaData={metaData}
				showErrors={true}
				errorList={errorList}
				warningList={warningList}
				handleSelectionChange={handleSelectionChange}
				mapName={platform == "moodle" ? "" : mapName}
			/>

			{platform == "sakai" && (
				<LessonSelector
					ref={selectDOM}
					lessons={metaData.lessons}
					label={"Seleccione la lección donde el contenido será exportado"}
				></LessonSelector>
			)}

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
