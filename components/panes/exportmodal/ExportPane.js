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
import { fetchBackEnd, saveVersion } from "@utils/Utils";
import { toast } from "react-toastify";
import {
	parseMoodleBadgeToExport,
	parseMoodleCalifications,
	parseMoodleConditionsGroupOut,
} from "@utils/Moodle";
import LessonSelector from "@components/forms/components/LessonSelector";
import { sakaiTypeSwitch } from "@utils/Sakai";

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

	const DEFAULT_TOAST_SUCCESS = {
		hideProgressBar: false,
		autoClose: 2000,
		type: "success",
		position: "bottom-center",
	};

	const DEFAULT_TOAST_ERROR = {
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

	const BACKUP_URL = getBackupURL(platform, metaData);
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

		if (platform == "sakai") {
			nodesToExport = nodesToExport.filter((node) => node.type !== "generic");
		}

		const CONDITION_LIST = [];

		nodesToExport.map((node) => {
			if (
				node.data.gradeRequisites &&
				node.data.gradeRequisites.subConditions.length >= 1
			) {
				const newCondition = { ...node.data.gradeRequisites };
				let blockResource = reactFlowInstance
					.getNodes()
					.find((node) => node.id == newCondition.itemId).data.lmsResource;
				newCondition.itemId = sakaiTypeSwitch({
					id: blockResource,
					type: newCondition.itemType,
				}).contentRef;

				delete newCondition?.itemType;

				newCondition?.subConditions.map((subCondition) => {
					if (
						subCondition.subConditions &&
						subCondition.subConditions.length >= 1
					) {
						subCondition.subConditions.map((childCondition) => {
							let childResource = reactFlowInstance
								.getNodes()
								.find((node) => node.id == childCondition.itemId)
								.data.lmsResource;

							childCondition.itemId = sakaiTypeSwitch({
								id: childResource,
								type: childCondition.itemType,
							}).contentRef;
							delete childCondition?.itemType;
						});
					}
				});

				CONDITION_LIST.push(newCondition);
			}
		});

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
		const FULL_NODES = JSON.parse(JSON.stringify(nodesToExport));

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
			const DATA = node.data;
			if (DATA.c) {
				const FINAL_SHOWC = [];
				if (DATA.c.op == "&" || DATA.c.op == "!|") {
					delete DATA.c.showc;
					if (DATA.c.c)
						if (Array.isArray(DATA.c.c)) {
							DATA.c.c.forEach((innerCondition) => {
								FINAL_SHOWC.push(innerCondition.showc);
								deleteRecursiveShowC(innerCondition);
							});
						}
					DATA.c.showc = FINAL_SHOWC;
				} else {
					if (DATA.c.c)
						if (Array.isArray(DATA.c.c)) {
							DATA.c.c.forEach((innerCondition) => {
								deleteRecursiveShowC(innerCondition);
							});
						}
					DATA.c.show = DATA.c.showc;
					delete DATA.c.id;
					delete DATA.c.showc;
				}

				specifyRecursiveConditionType(DATA.c);
				deleteRecursiveNull(DATA.c);
				DATA.c = deleteEmptyC(DATA.c);
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
			const TYPE = node.type;
			switch (platform) {
				case "moodle":
					delete node.type;
					break;
				case "sakai":
					node.c = DATA.requisites;
					node.pageId = Number(selectDOM.current.value);
					break;
			}
			if (ActionNodes.includes(TYPE)) {
				const ACTION_NODE = {
					...node,
					...DATA,
					actionType: TYPE,
				};
				if (platform == "moodle") {
					if (TYPE == "badge") {
						return parseMoodleBadgeToExport(
							ACTION_NODE,
							reactFlowInstance.getNodes(),
							metaData
						);
					}
				} else {
					return ACTION_NODE;
				}
			} else {
				return { ...node, ...DATA };
			}
		});

		let nodesAsString = JSON.stringify(nodesToExport);
		//Replacing block Ids by the resource ids
		FULL_NODES.forEach((fullNode) => {
			const ORIGINAL_ID = fullNode.id;
			const LMS_RESOURCE =
				fullNode.data.lmsResource == undefined
					? "-1"
					: fullNode.data.lmsResource;
			const REGEX = new RegExp('"' + ORIGINAL_ID + '"', "g");
			nodesAsString = nodesAsString.replace(
				REGEX,
				platform == "moodle"
					? LMS_RESOURCE
					: JSON.stringify(String(LMS_RESOURCE))
			);
		});

		let nodesReadyToExport = JSON.parse(nodesAsString);
		if (platform == "moodle") {
			nodesReadyToExport.filter((node) => {
				const SECTION = metaData.sections.find(
					(section) => section.position == node.section
				);

				//Change section position for section id
				if (SECTION != undefined) {
					node.section = SECTION.id;
				}

				if (node.id == "") {
					node.id = -1;
				} else {
					node.id = Number(node.id);
				}

				if (SECTION && currentSelectionInfo.selection.includes(SECTION.id))
					return true;

				if (!SECTION) {
					return true;
				}
			});
		}

		console.log("nodesReadyToExport", nodesReadyToExport);
		if (platform === "sakai") {
			const LESSON_FIND = metaData.lessons.find(
				(lesson) => lesson.id === Number(selectDOM.current.value)
			);

			const UNIQUE_SECTION_COLUMN_PAIRS = new Set();

			const SORTED_SECTION_COLUMN_PAIRS = nodesReadyToExport
				.filter((item) => {
					const { section, indent } = item;
					const pairString = `${section}-${indent}`;

					if (!UNIQUE_SECTION_COLUMN_PAIRS.has(pairString)) {
						UNIQUE_SECTION_COLUMN_PAIRS.add(pairString);
						return true;
					}

					return false;
				})
				.map(({ section, indent }) => ({ section, indent }));

			SORTED_SECTION_COLUMN_PAIRS.sort((a, b) => {
				// Compare by "section" first
				if (a.section < b.section) return -1;
				if (a.section > b.section) return 1;

				// If "section" values are the same, compare by "indent" (column)
				return a.indent - b.indent;
			});

			let nodesToUpdateRequest = [];
			nodesReadyToExport.map((node) => {
				const NEW_NODE = { ...node };
				if (NEW_NODE.c && NEW_NODE.c.length >= 1) {
					const DATE_CONDITION = NEW_NODE.c.find(
						(condition) => condition.type === "date"
					);

					const GROUP_CONDITION = NEW_NODE.c.find(
						(condition) => condition.type === "group"
					);

					const DATE_EXCEPTION_CHECK = NEW_NODE.c.some(
						(condition) => condition.type === "dateException"
					);

					if (DATE_CONDITION) {
						if (DATE_CONDITION.openingDate) {
							NEW_NODE.openDate =
								Date.parse(DATE_CONDITION?.openingDate) / 1000;
						}

						if (node.type === "exam" || node.type === "assign") {
							if (DATE_CONDITION.dueDate) {
								NEW_NODE.dueDate = Date.parse(DATE_CONDITION?.dueDate) / 1000;
							}

							if (DATE_CONDITION?.closeTime) {
								NEW_NODE.closeDate =
									Date.parse(DATE_CONDITION?.closeTime) / 1000;
							}
						} else {
							if (DATE_CONDITION.dueDate) {
								NEW_NODE.closeDate = Date.parse(DATE_CONDITION?.dueDate) / 1000;
							}
						}

						NEW_NODE.dateRestricted = true;
					}

					if (GROUP_CONDITION) {
						NEW_NODE.groupRefs = [];
						GROUP_CONDITION.groupList.map((group) => {
							NEW_NODE.groupRefs.push(group.id);
						});
					}

					if (DATE_EXCEPTION_CHECK) {
						NEW_NODE.timeExceptions = [];

						let dateExceptionFiltered = NEW_NODE.c.filter(
							(condition) => condition.type === "dateException"
						);
						dateExceptionFiltered.map((exception) => {
							const NEW_EXCEPTION = {};
							NEW_EXCEPTION.openDate =
								Date.parse(exception?.openingDate) / 1000;
							NEW_EXCEPTION.dueDate = Date.parse(exception?.dueDate) / 1000;
							NEW_EXCEPTION.closeDate = Date.parse(exception?.closeTime) / 1000;

							if (exception.op && exception.op === "group") {
								NEW_EXCEPTION.forEntityRef =
									"/site/" +
									metaData.course_id +
									"/group/" +
									exception.entityId;
							}

							if (exception.op && exception.op === "user") {
								NEW_EXCEPTION.forEntityRef = "/user/" + exception.entityId;
							}

							NEW_NODE.timeExceptions.push(NEW_EXCEPTION);
						});
					}

					NEW_NODE.type = sakaiExportTypeSwitch(NEW_NODE.type);

					delete NEW_NODE.label;
					delete NEW_NODE.c;
					delete NEW_NODE.children;
					delete NEW_NODE.indent;
					delete NEW_NODE.lmsVisibility;
					delete NEW_NODE.requisites;
					delete NEW_NODE.pageId;
					delete NEW_NODE.order;
					delete NEW_NODE.section;

					nodesToUpdateRequest.push(NEW_NODE);
				}
			});

			console.log("CONDITION LIST", CONDITION_LIST);

			let resultJson = [];
			const SECTION_PROCESSED = {};

			SORTED_SECTION_COLUMN_PAIRS.map((jsonObj) => {
				if (!SECTION_PROCESSED[jsonObj.section]) {
					// Process the section if it hasn't been processed yet
					resultJson.push({
						pageId: Number(LESSON_FIND.page_id),
						type: 14,
						title: "",
						format: "section",
					});

					const FILTERED_ARRAY = nodesReadyToExport
						.filter(
							(node) =>
								node.section === jsonObj.section &&
								node.indent === jsonObj.indent
						)
						.sort((a, b) => a.order - b.order);

					FILTERED_ARRAY.map((node) => {
						const NODE_TYPE_PARSED = sakaiTypeSwitch(node);
						resultJson.push({
							pageId: Number(LESSON_FIND.page_id),
							type: NODE_TYPE_PARSED.type,
							title: node.label,
							contentRef: NODE_TYPE_PARSED.contentRef,
						});
					});

					SECTION_PROCESSED[jsonObj.section] = true; // Mark the section as processed
				} else {
					resultJson.push({
						pageId: Number(LESSON_FIND.page_id),
						type: 14,
						title: "",
						format: "column",
					});

					const FILTERED_ARRAY = nodesReadyToExport
						.filter(
							(node) =>
								node.section === jsonObj.section &&
								node.indent === jsonObj.indent
						)
						.sort((a, b) => a.order - b.order);
					FILTERED_ARRAY.map((node) => {
						const NODE_TYPE_PARSED = sakaiTypeSwitch(node);
						resultJson.push({
							pageId: Number(LESSON_FIND.page_id),
							type: NODE_TYPE_PARSED.type,
							title: node.label,
							contentRef: NODE_TYPE_PARSED.contentRef,
						});
					});
				}
			});

			SORTED_SECTION_COLUMN_PAIRS.sort((a, b) => {
				// Compare by "section" first
				if (a.section < b.section) return -1;
				if (a.section > b.section) return 1;

				// If "section" values are the same, compare by "indent" (column)
				return a.indent - b.indent;
			});

			console.log(
				"NODES TO LESSON ITEMS",
				resultJson,
				"NODES TO UPDATE",
				nodesToUpdateRequest,
				metaData
			);
			sendNodes(
				nodesReadyToExport,
				resultJson,
				nodesToUpdateRequest,
				LESSON_FIND,
				CONDITION_LIST
			);
		} else {
			const MOODLE_NODES = nodesReadyToExport.map((node) => {
				let newNode = parseMoodleCalifications(node);
				newNode = { ...newNode, c: parseMoodleConditionsGroupOut(newNode.c) };
				delete newNode.children;
				delete newNode.type;
				return newNode;
			});
			sendNodes(MOODLE_NODES);
		}
	};

	function sakaiExportTypeSwitch(id) {
		switch (id) {
			case "resource":
			case "html":
			case "text":
			case "url":
				return "RESOURCE";
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
		const isObj = (x) => x !== null && typeof x === "object";
		const isArray = (x) => Array.isArray(x);

		const nullish = (x) => x === null;

		const clean = (x) =>
			[x]
				.map((x) => Object.entries(x))
				.map((x) =>
					x.map(([k, v]) =>
						isArray(v)
							? [k, v.map((vv) => (isObj(vv) ? clean(vv) : vv))]
							: isObj(v)
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

	async function sendNodes(
		nodes,
		resultJson,
		resultJsonSecondary,
		lesson,
		conditionList
	) {
		try {
			const PAYLOAD = {
				course: metaData.course_id,
				instance: metaData.instance_id,
				userId: userData.user_id,
				userPerms: userData.userperms,
				save: true,
				selection: currentSelectionInfo.selection,
			};

			if (platform == "sakai") {
				PAYLOAD.lessonId = lesson.id;
				PAYLOAD.nodes = resultJson;
				PAYLOAD.nodesToUpdate = resultJsonSecondary;
				PAYLOAD.conditionList = conditionList;
			} else {
				PAYLOAD.nodes = nodes;
			}

			const RESPONSE = await fetchBackEnd(
				LTISettings,
				sessionStorage.getItem("token"),
				"api/lti/export_version",
				"POST",
				PAYLOAD
			);
			if (RESPONSE) {
				const OK = RESPONSE.ok;
				if (OK) {
					saveVersion(
						rfNodes,
						metaData,
						platform,
						userData,
						mapSelected,
						selectedVersion,
						LTISettings,
						DEFAULT_TOAST_SUCCESS,
						DEFAULT_TOAST_ERROR,
						toast,
						enableExporting,
						RESPONSE.successType,
						lesson?.id
					);
				} else {
					enableExporting(false);

					if (RESPONSE.errorType) {
						const UNABLE_TO_EXPORT = "No se pudo exportar: ";
						if (platform == "sakai") {
							switch (RESPONSE.errorType) {
								case "PAGE_EXPORT_ERROR":
									console.log(
										"%c ❌ Los bloques no comparten el mismo identificador de página (pageId) // Codigo de error: PAGE_EXPORT_ERROR",
										"background: #FFD7DC; color: black; padding: 4px;"
									);
									throw new Error(
										UNABLE_TO_EXPORT +
											"Los bloques no comparten el mismo identificador de página (pageId)",
										DEFAULT_TOAST_ERROR
									);
								case "LESSON_COPY_ERROR":
									console.log(
										"%c ❌ No se pudo hacer una copia de seguridad de la página de contenidos a exportar // Codigo de error: LESSON_COPY_ERROR",
										"background: #FFD7DC; color: black; padding: 4px;"
									);
									throw new Error(
										UNABLE_TO_EXPORT +
											"No se pudo hacer una copia de seguridad de la página de contenidos a exportar",
										DEFAULT_TOAST_ERROR
									);
								case "LESSON_DELETE_ERROR":
									console.log(
										"%c ❌ No se ha podido reconstruir la página de contenidos // Codigo de error: LESSON_DELETE_ERROR",
										"background: #FFD7DC; color: black; padding: 4px;"
									);
									throw new Error(
										UNABLE_TO_EXPORT +
											"No se ha podido reconstruir la página de contenidos",
										DEFAULT_TOAST_ERROR
									);
								case "FATAL_ERROR":
									console.log(
										"%c ❌ No se ha podido reestablecer la copia de seguridad // Codigo de error: FATAL_ERROR",
										"background: #FFD7DC; color: black; padding: 4px;"
									);
									throw new Error(
										UNABLE_TO_EXPORT +
											"No se ha podido reestablecer la copia de seguridad",
										DEFAULT_TOAST_ERROR
									);
								case "LESSON_ITEMS_CREATION_ERROR":
									console.log(
										"%c ❌ Se ha reestablecido la copia de seguridad de la página de contenidos // Codigo de error: LESSON_ITEMS_CREATION_ERROR",
										"background: #FFD7DC; color: black; padding: 4px;"
									);
									throw new Error(
										UNABLE_TO_EXPORT +
											"Se ha reestablecido la copia de seguridad de la página de contenidos",
										DEFAULT_TOAST_ERROR
									);
								case "LESSON_ITEMS_WITHOUT_CONDITIONS_CREATION_ERROR":
									console.log(
										"%c ❌ Se ha reestablecido la copia de seguridad de la página de contenidos pero las condiciones no // Codigo de error: LESSON_ITEMS_WITHOUT_CONDITIONS_CREATION_ERROR",
										"background: #FFD7DC; color: black; padding: 4px;"
									);
									throw new Error(
										UNABLE_TO_EXPORT +
											"Se ha reestablecido la copia de seguridad de la página de contenidos pero las condiciones no",
										DEFAULT_TOAST_ERROR
									);
								case "NODE_UPDATE_ERROR":
									console.log(
										"%c ❌ No se han podido actualizar los bloques // Codigo de error: NODE_UPDATE_ERROR",
										"background: #FFD7DC; color: black; padding: 4px;"
									);
									throw new Error(
										UNABLE_TO_EXPORT +
											"No se han podido actualizar los bloques",
										DEFAULT_TOAST_ERROR
									);
							}
						} else {
							switch (RESPONSE.errorType) {
								case "":
									break;
							}
						}
					} else {
						throw new Error("No se pudo exportar", DEFAULT_TOAST_ERROR);
					}
				}
			} else {
				enableExporting(false);
				throw new Error("No se pudo exportar", DEFAULT_TOAST_ERROR);
			}
		} catch (e) {
			toast("No se pudo exportar", DEFAULT_TOAST_ERROR);
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
			{BACKUP_URL && (
				<p>
					<b>Atención: </b>{" "}
					<a href={BACKUP_URL} target="_blank">
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
