import {
	useState,
	useContext,
	useRef,
	Dispatch,
	SetStateAction,
	useEffect,
} from "react";
import styles from "/styles/ExportModal.module.css";
import { Alert, Button, Spinner, Dropdown } from "react-bootstrap";
import SectionSelector from "@components/forms/components/SectionSelector";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faCircleQuestion,
	faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { getRootStyle } from "@utils/Colors";
import { useReactFlow, useNodes } from "reactflow";
import { NodeDeclarations } from "@utils/TypeDefinitions";
import {
	DEFAULT_TOAST_ERROR,
	DEFAULT_TOAST_SUCCESS,
	MapInfoContext,
} from "pages/_app";
import { Platforms, getBackupURL } from "@utils/Platform";
import { ActionNodes } from "@utils/Nodes";
import { saveVersion, parseBool } from "@utils/Utils";
import { toast } from "react-toastify";
import {
	parseMoodleBadgeToExport,
	parseMoodleCalifications,
	parseMoodleConditionsGroupOut,
} from "@utils/Moodle";
import LessonSelector from "@components/forms/components/LessonSelector";
import { sakaiTypeSwitch } from "@utils/Sakai";
import { getSectionNodes } from "../../../utils/Nodes";
import { INodeError } from "@components/interfaces/INodeError";
import { IMetaData } from "@components/interfaces/IMetaData";
import { IVersion } from "@components/interfaces/IVersion";
import exportVersion, { IVersionExport } from "middleware/api/exportVersion";
import { INode } from "@components/interfaces/INode";
import moodleExport from "./utils/moodleExport";
import sakaiExport from "./utils/sakaiExport";

interface Props {
	errorList: Array<INodeError>;
	warningList: Array<INodeError>;
	changeTab: Dispatch<SetStateAction<string>>;
	metaData: IMetaData;
	userData: IUserData;
	mapName: string;
	selectedVersion: IVersion;
	changeSelectedLesson: Function;
}

export interface ISendNodesPayload {
	resources: Array<Object>;
	resultJson?: Array<Object>;
	resultJsonSecondary?: Array<Object>;
	lesson?: Object;
	conditionList?: Array<Object>;
}

export default function ExportPanel({
	errorList,
	warningList,
	changeTab,
	metaData,
	userData,
	mapName,
	selectedVersion,
	changeSelectedLesson,
}: Props) {
	const reactFlowInstance = useReactFlow();
	const rfNodes = useNodes() as Array<INode>;

	const { mapSelected, setMapSelected } = useContext(MapInfoContext);

	const [exporting, setExporting] = useState(false);
	const [selectedErrorCount, setSelectedErrorCount] = useState(0);
	const [selectedWarningCount, setSelectedWarningCount] = useState(0);
	const [currentSelectionInfo, setCurrentSelectionInfo] = useState({
		selection: [],
	});

	const exportButtonRef = useRef(null);
	const selectDOM = useRef<HTMLSelectElement>();

	function enableExporting(boolean) {
		setExporting(boolean);
		if (exportButtonRef.current) {
			exportButtonRef.current.disabled = boolean;
		}
	}

	const BACKUP_URL = getBackupURL(metaData.platform, metaData);

	interface SelectionChangeOptions {
		selection: Array<number>;
		errors: Array<number>;
		warnings: Array<number>;
	}
	const handleSelectionChange = (selectionInfo: SelectionChangeOptions) => {
		if (selectionInfo != undefined) {
			const getSelectedErrorCount = () => {
				const errorCount = selectionInfo.selection
					.map((selection) => {
						const error = selectionInfo.errors[selection];
						return error === undefined ? 0 : error;
					})
					.reduce((total, actual) => total + actual, 0);

				return errorCount || 0;
			};

			const getSelectedWarningCount = () => {
				const warningCount = selectionInfo.selection
					.map((selection) => {
						const warning = selectionInfo.warnings[selection];
						return warning === undefined ? 0 : warning;
					})
					.reduce((total, actual) => total + actual, 0);

				return warningCount || 0;
			};

			setSelectedErrorCount(() => getSelectedErrorCount());
			setSelectedWarningCount(() => getSelectedWarningCount());
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

	/**
	 * Searches for any section or all the sections for nodes.
	 * @param level "section" or "map".
	 * @returns returns true if its empty.
	 */
	const seekEmpty = (level: "section" | "map" = "section"): boolean => {
		const nodes = reactFlowInstance.getNodes();
		const emptySections = [];
		// console.log("metaData.sections", metaData.sections);
		if (metaData.platform == Platforms.Moodle) {
			metaData.sections.map((section) => {
				const sectionNodes = getSectionNodes(section.position, nodes);
				emptySections.push(sectionNodes.length < 1);
			});
			if (level == "section") {
				return emptySections.includes(true);
			}
			if (level == "map") {
				return emptySections.every((val) => val == true);
			}
		}

		return false;
	};
	const HAS_UNUSED_SECTIONS = seekEmpty("section");
	const EMPTY_MAP = seekEmpty("map");

	const exportMap = async () => {
		const CLEANED_NODES: Array<INode> = cleanReactFlow();
		let EXPORT: ISendNodesPayload = undefined;

		switch (metaData.platform) {
			case Platforms.Moodle:
				EXPORT = moodleExport(CLEANED_NODES, metaData);
				break;
			case Platforms.Sakai:
				const lessonID = selectDOM.current.value;
				EXPORT = sakaiExport(CLEANED_NODES, metaData, lessonID);
				break;
		}

		sendNodes(EXPORT);
	};

	function cleanReactFlow() {
		//Deep cloning the nodes
		const clonedNodes: Array<INode> = JSON.parse(
			JSON.stringify(reactFlowInstance.getNodes())
		);

		// Remove LTI-specific nodes (Like Fragments)
		const nodesWithoutLTIElements = clonedNodes.filter((node) =>
			NodeDeclarations.find((declaration) => {
				if (node.type == declaration.type) {
					if (!declaration.lms.includes(Platforms.LTI)) {
						return true;
					} else {
						return false;
					}
				}
			})
		);

		// Replace section position by metaData's IDs
		const nodesReordered = nodesWithoutLTIElements.map((node) => {
			const newNode = { ...node };
			if ("section" in node.data) {
				const SECTION = metaData.sections.find((section) => {
					if ("section" in node.data) {
						return section.position == node.data.section;
					}
				});
				console.log(":cohete: ~ SECTION ~ SECTION:", SECTION);
				//Change section position for section id
				if (SECTION != undefined && "section" in newNode.data) {
					newNode.data.section = SECTION.id;
					console.log(
						":cohete: ~ nodesReordered ~ newNode.data.section:",
						newNode.data.section
					);
				}
			}
			console.log(":cohete: ~ nodesReordered ~ newNode:", newNode);
			return newNode;
		});
		// Remove non-selected
		const nodesSelected = nodesReordered.filter((node) => {
			if ("section" in node.data) {
				const SECTION = metaData.sections.find((section) => {
					if ("section" in node.data) {
						return section.id == node.data.section;
					}
				});
				if (
					SECTION &&
					currentSelectionInfo.selection.includes(SECTION.position)
				)
					return true;
				if (SECTION == undefined) {
					return true;
				}
			}
		});

		// Remove unnecesary ReactFlow attributes
		const nodesWithoutRF = nodesSelected.map((node) => {
			let newNode = { ...node };
			delete newNode.position;
			delete newNode.height;
			delete newNode.width;
			delete newNode.position;
			delete newNode.positionAbsolute;
			delete newNode.dragging;
			delete newNode.draggable;
			delete newNode.selected;
			delete newNode.parentNode;
			delete newNode.expandParent;
			return newNode;
		});

		//Replacing node IDs by the resource IDs globally
		let nodesAsString = JSON.stringify(nodesWithoutRF);
		console.log(nodesAsString);
		nodesWithoutRF.forEach((node) => {
			const ORIGINAL_ID = node.id;
			const LMS_RESOURCE =
				node.data.lmsResource == undefined ? "-1" : node.data.lmsResource;
			const REGEX = new RegExp('"' + ORIGINAL_ID + '"', "g");

			nodesAsString = nodesAsString.replace(
				REGEX,
				JSON.stringify(String(LMS_RESOURCE))
			);
		});
		console.log(nodesAsString);

		const nodesWithResourceIDs = JSON.parse(nodesAsString);

		return nodesWithResourceIDs;

		/*
		const FULL_NODES = JSON.parse(JSON.stringify(nodesToExport));

		//Deletting unnecessary info and flattening the nodes
		nodesToExport = nodesToExport.map((node) => {
			switch (metaData.platform) {
				case Platforms.Moodle:
					delete node.data.label;
					break;
				case Platforms.Sakai:
					break;
			}
			delete node.data.lmsResource;
			const DATA = node.data;
			if (DATA.c) {
				const FINAL_SHOWC = [];
				if ("op" in DATA.c && (DATA.c.op == "&" || DATA.c.op == "!|")) {
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
					if ("c" in DATA.c && DATA.c.c)
						if (Array.isArray(DATA.c.c)) {
							DATA.c.c.forEach((innerCondition) => {
								deleteRecursiveShowC(innerCondition);
							});
						}
					if ("showc" && "id" in DATA.c) {
						DATA.c.show = DATA.c.showc; //FIXME: DYNAMIZE DATA
						delete DATA.c.id;
						delete DATA.c.showc;
					}
				}

				specifyRecursiveConditionType(DATA.c);

				if (!ActionNodes.includes(node.type)) {
					DATA.c = replaceGenericConditions(DATA.c);
				}

				console.log("DATA C: ", DATA.c);
				deleteRecursiveNull(DATA.c);
				DATA.c = deleteEmptyC(DATA.c);
			}

			const TYPE = node.type;
			switch (metaData.platform) {
				case Platforms.Moodle:
					delete node.type;
					break;
				case Platforms.Sakai:
					node.c = DATA.requisites; //FIXME
					node.pageId = Number(selectDOM.current.value);
					break;
			}
			if (ActionNodes.includes(TYPE)) {
				const ACTION_NODE = {
					...node,
					...DATA,
					actionType: TYPE,
				};
				if (metaData.platform == Platforms.Moodle) {
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

		//let nodesAsString = JSON.stringify(nodesToExport);

		let nodesReadyToExport = JSON.parse(nodesAsString);
		if (metaData.platform == Platforms.Moodle) {
			nodesReadyToExport = nodesReadyToExport.filter((node) => {
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

				if (
					SECTION &&
					currentSelectionInfo.selection.includes(SECTION.position)
				)
					return true;

				if (!SECTION) {
					return true;
				}
			});
		}

		console.log("nodesReadyToExport", nodesReadyToExport);
		if (metaData.platform === Platforms.Sakai) {
			console.log(Platforms.Sakai);
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
							interface dateException {
								openDate?: number;
								dueDate?: number;
								closeDate?: number;
								forEntityRef?: string;
							}
							const NEW_EXCEPTION: dateException = {};
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
		}*/
	}

	function deleteEmptyC(obj) {
		if (obj.hasOwnProperty("c") && Array.isArray(obj.c) && obj.c.length > 0) {
			obj.c.forEach(deleteEmptyC);
		} else {
			delete obj.c;
		}
		return obj;
	}

	function deleteRecursiveNull(obj) {
		const isObj = (x) => x !== null && typeof x === "object";
		const isArray = (x) => Array.isArray(x);

		const nullish = (x) => x === null;

		const clean = (x: any) =>
			[x]
				.map((x) => Object.entries(x))
				.map((x) =>
					x.map(([k, v]) =>
						isArray(v)
							? [k, (v as any[]).map((vv) => (isObj(vv) ? clean(vv) : vv))]
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

	async function sendNodes({
		resources,
		resultJson,
		resultJsonSecondary,
		lesson,
		conditionList,
	}: ISendNodesPayload) {
		try {
			const PAYLOAD: IVersionExport = {
				course: metaData.course_id,
				instance: metaData.instance_id,
				userId: userData.user_id,
				userPerms: userData.userperms,
				save: true,
				selection: currentSelectionInfo.selection,
				nodes: undefined,
			};

			if (metaData.platform == Platforms.Sakai) {
				PAYLOAD.lessonId = lesson.id;
				PAYLOAD.nodes = resultJson;
				PAYLOAD.nodesToUpdate = resultJsonSecondary;
				PAYLOAD.conditionList = conditionList;
			} else {
				PAYLOAD.nodes = resources;
			}

			const RESPONSE = await exportVersion(PAYLOAD);
			if (RESPONSE) {
				const OK = RESPONSE.ok;
				if (OK) {
					await saveVersion(
						rfNodes,
						metaData,
						metaData.platform,
						userData,
						mapSelected,
						selectedVersion,
						DEFAULT_TOAST_SUCCESS,
						DEFAULT_TOAST_ERROR,
						toast,
						enableExporting,
						RESPONSE.data,
						lesson?.id,
						true
					);
				} else {
					enableExporting(false);

					if (RESPONSE.data) {
						const UNABLE_TO_EXPORT = "No se pudo exportar: ";
						if (metaData.platform == Platforms.Sakai) {
							switch (RESPONSE.data) {
								case "PAGE_EXPORT_ERROR":
									console.log(
										"%c ❌ Los bloques no comparten el mismo identificador de página (pageId) // Codigo de error: PAGE_EXPORT_ERROR",
										"background: #FFD7DC; color: black; padding: 4px;"
									);
									toast(
										UNABLE_TO_EXPORT +
											"Los bloques no comparten el mismo identificador de página (pageId)",
										DEFAULT_TOAST_ERROR
									);
								case "LESSON_COPY_ERROR":
									console.log(
										"%c ❌ No se pudo hacer una copia de seguridad de la página de contenidos a exportar // Codigo de error: LESSON_COPY_ERROR",
										"background: #FFD7DC; color: black; padding: 4px;"
									);
									toast(
										UNABLE_TO_EXPORT +
											"No se pudo hacer una copia de seguridad de la página de contenidos a exportar",
										DEFAULT_TOAST_ERROR
									);
								case "LESSON_DELETE_ERROR":
									console.log(
										"%c ❌ No se ha podido reconstruir la página de contenidos // Codigo de error: LESSON_DELETE_ERROR",
										"background: #FFD7DC; color: black; padding: 4px;"
									);
									toast(
										UNABLE_TO_EXPORT +
											"No se ha podido reconstruir la página de contenidos",
										DEFAULT_TOAST_ERROR
									);
								case "FATAL_ERROR":
									console.log(
										"%c ❌ No se ha podido reestablecer la copia de seguridad // Codigo de error: FATAL_ERROR",
										"background: #FFD7DC; color: black; padding: 4px;"
									);
									toast(
										UNABLE_TO_EXPORT +
											"No se ha podido reestablecer la copia de seguridad",
										DEFAULT_TOAST_ERROR
									);
								case "LESSON_ITEMS_CREATION_ERROR":
									console.log(
										"%c ❌ Se ha reestablecido la copia de seguridad de la página de contenidos // Codigo de error: LESSON_ITEMS_CREATION_ERROR",
										"background: #FFD7DC; color: black; padding: 4px;"
									);
									toast(
										UNABLE_TO_EXPORT +
											"Se ha reestablecido la copia de seguridad de la página de contenidos",
										DEFAULT_TOAST_ERROR
									);
								case "LESSON_ITEMS_WITHOUT_CONDITIONS_CREATION_ERROR":
									console.log(
										"%c ❌ Se ha reestablecido la copia de seguridad de la página de contenidos pero las condiciones no // Codigo de error: LESSON_ITEMS_WITHOUT_CONDITIONS_CREATION_ERROR",
										"background: #FFD7DC; color: black; padding: 4px;"
									);
									toast(
										UNABLE_TO_EXPORT +
											"Se ha reestablecido la copia de seguridad de la página de contenidos pero las condiciones no",
										DEFAULT_TOAST_ERROR
									);
								case "NODE_UPDATE_ERROR":
									console.log(
										"%c ❌ No se han podido actualizar los bloques // Codigo de error: NODE_UPDATE_ERROR",
										"background: #FFD7DC; color: black; padding: 4px;"
									);
									toast(
										UNABLE_TO_EXPORT +
											"No se han podido actualizar los bloques",
										DEFAULT_TOAST_ERROR
									);
							}
						} else {
							switch (RESPONSE.data) {
								case "":
									break;
							}
						}
					} else {
						toast("No se pudo exportar", DEFAULT_TOAST_ERROR);
					}
				}
			} else {
				enableExporting(false);
				toast("No se pudo exportar", DEFAULT_TOAST_ERROR);
			}
		} catch (e) {
			toast("No se pudo exportar", DEFAULT_TOAST_ERROR);
		}

		enableExporting(false);
	}

	return (
		<>
			<SectionSelector
				allowModularSelection={metaData.platform == Platforms.Moodle}
				metaData={metaData}
				showErrors={true}
				errorList={errorList}
				warningList={warningList}
				handleSelectionChange={handleSelectionChange}
				mapName={metaData.platform == Platforms.Moodle ? "" : mapName}
			/>

			{metaData.platform == Platforms.Sakai && (
				<LessonSelector
					ref={selectDOM}
					lessons={metaData.lessons}
					label={"Seleccione la lección donde el contenido será exportado"}
					changeSelectedLesson={changeSelectedLesson}
				></LessonSelector>
			)}

			{selectedErrorCount > 0 && (
				<Alert variant={"danger"}>
					<strong>Atención: </strong>
					<a
						role="button"
						className={styles.nodeError}
						onClick={() => changeTab("error")}
					>{`No es posible exportar debido a ${selectedErrorCount} ${
						selectedErrorCount > 1 ? "errores" : "error"
					}.`}</a>
				</Alert>
			)}

			{selectedWarningCount > 0 && (
				<Alert variant={"warning"}>
					<strong>Atención: </strong>
					<a
						role="button"
						className={styles.nodeWarning}
						onClick={() => changeTab("warning")}
					>{`Tiene ${selectedWarningCount} ${
						selectedWarningCount > 1 ? "advertencias" : "advertencia"
					}.`}</a>
				</Alert>
			)}

			{currentSelectionInfo.selection.length < 1 && (
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
				style={{ marginBottom: "1rem" }}
				ref={exportButtonRef}
				disabled={
					selectedErrorCount > 0 ||
					currentSelectionInfo.selection.length < 1 ||
					EMPTY_MAP
				}
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
				{selectedWarningCount > 0 && (
					<FontAwesomeIcon
						icon={faExclamationTriangle}
						style={{
							color: getRootStyle("--warning-background-color"),
						}}
						title={`${warningList.length} advertencia(s)`}
					/>
				)}
			</Button>
			{EMPTY_MAP && (
				<Alert variant={"danger"}>
					<b>Atención: </b> No se puede exportar un mapa vacío.
				</Alert>
			)}

			{HAS_UNUSED_SECTIONS && !EMPTY_MAP && (
				<Alert variant={"info"}>
					{<FontAwesomeIcon icon={faCircleQuestion} />} Es posible que no este
					utilizando alguna sección. Cabe remarcar que los bloques no utilizados
					en el mapa no sufrirán cambios.
				</Alert>
			)}
			{BACKUP_URL && !EMPTY_MAP && (
				<Alert variant={"info"}>
					<b>Atención: </b>{" "}
					<a href={BACKUP_URL} target="_blank">
						se recomienda hacer una copia de seguridad del curso.
					</a>
				</Alert>
			)}
		</>
	);
}
