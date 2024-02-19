import { forwardRef, useContext, useLayoutEffect, useState } from "react";
import {
	Modal,
	Button,
	Tabs,
	Tab,
	OverlayTrigger,
	Tooltip,
	Spinner,
} from "react-bootstrap";
import {
	ExpandedAsideContext,
	EditedNodeContext,
	EditedVersionContext,
	DEFAULT_TOAST_ERROR,
} from "pages/_app";
import {
	getNodeById,
	getParentsNode,
	getNodeTypeGradableType,
} from "@utils/Nodes";
import { uniqueId, parseBool, createFontAwesome } from "@utils/Utils";
import { getTypeIcon } from "@utils/NodeIcons";
import styles from "/styles/ExportModal.module.css";
import { useReactFlow } from "reactflow";
import {
	faCircleQuestion,
	faExclamationCircle,
	faExclamationTriangle,
	faFileExport,
	faQuestion,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ExportPane from "@components/panes/exportmodal/ExportPane";
import { SettingsContext } from "pages/_app";
import { ILTISettings } from "@components/interfaces/ILTISettings";
import { IVersion } from "@components/interfaces/IVersion";
import { IMetaData } from "@components/interfaces/IMetaData";
import { INodeError } from "@components/interfaces/INodeError";
import { Platforms } from "@utils/Platform";
import { toast } from "react-toastify";
import getModules from "middleware/api/getModules";

interface ExportModalProps {
	showDialog: boolean;
	toggleDialog: () => void;
	errorList: Array<INodeError>;
	metaData: IMetaData;
	userData: IUserData;
	mapName: string;
	LTISettings: ILTISettings;
	selectedVersion: IVersion;
}

export default forwardRef(function ExportModal(
	{
		showDialog,
		toggleDialog,
		metaData,
		userData,
		errorList,
		mapName,
		LTISettings,
		selectedVersion,
	}: ExportModalProps,
	ref
) {
	const [key, setKey] = useState<string>();
	const { expandedAside, setExpandedAside } = useContext(ExpandedAsideContext);
	const { nodeSelected, setNodeSelected } = useContext(EditedNodeContext);
	const { editVersionSelected, setEditVersionSelected } =
		useContext(EditedVersionContext);

	const reactFlowInstance = useReactFlow();

	const [warningList, setWarningList] = useState<Array<INodeError>>();
	const [tabsClassName, setTabsClassName] = useState<Array<string>>();

	const [nodeErrorResourceList, setNodeErrorResourceList] =
		useState<Array<INodeError>>();
	const [nodeErrorSectionList, setNodeErrorSectionList] =
		useState<Array<INodeError>>();
	const [nodeErrorOrderList, setNodeErrorOrderList] =
		useState<Array<INodeError>>();

	const [nodeWarningChildrenList, setNodeWarningChildrenList] =
		useState<Array<INodeError>>();
	const [nodeChildrenWithoutRestriction, setNodeChildrenWithoutRestriction] =
		useState<Array<INodeError>>();
	const [nodeWarningParentList, setNodeWarningParentList] =
		useState<Array<INodeError>>();
	const [missingModuleList, setMissingModuleList] = useState(undefined);

	const [selectedLesson, setSelectedLesson] = useState(undefined);
	const formatErrorList = () => {
		console.log(JSON.stringify(metaData));
	};
	const { settings } = useContext(SettingsContext);
	const PARSED_SETTINGS = JSON.parse(settings);
	const FITVIEW_OPTIONS = {
		duration: PARSED_SETTINGS.reducedAnimations ? 0 : 800,
		padding: 0.25,
	};

	function changeSelectedLesson(lessonId) {
		const fetchData = async () => {
			let result = await generateMissingModuleList(lessonId);
			console.log("Lesson changed to: " + lessonId);
			setMissingModuleList(result);
			setSelectedLesson(lessonId);
		};

		fetchData();
	}

	const generateMissingModuleList = async (lessonId) => {
		console.log("Actual Lesson: " + lessonId);
		let nodes = reactFlowInstance.getNodes();
		const idList = nodes.map((item) => item?.data?.lmsResource);

		let data;

		if (!parseBool(process.env.NEXT_PUBLIC_DEV_FILES)) {
			const RESPONSE = await getModules(lessonId);

			if (!RESPONSE.ok) {
				toast(
					`Ha ocurrido un error durante la busqueda de los bloques`,
					DEFAULT_TOAST_ERROR
				);
				throw new Error("Request failed");
			}
			data = RESPONSE.data;
		} else {
			let endpointJson = null;
			switch (metaData.platform) {
				case Platforms.Moodle:
					endpointJson = "devmoodleimport.json";
					break;
				case Platforms.Sakai:
					endpointJson = "devsakaiimport.json";
			}

			const RESPONSE = await fetch(`resources/${endpointJson}`);

			if (RESPONSE) {
				data = await RESPONSE.json();
			}
		}

		const moodleModuleList = data.map((module) => ({
			id: metaData.platform == Platforms.Sakai ? module?.sakaiId : module?.id,
			type: module?.modname,
			name: module?.name,
		}));

		const moduleMissingList = moodleModuleList.filter(
			(module) => !idList.includes(module?.id)
		);

		console.log(moduleMissingList);

		return moduleMissingList;
	};

	function centerToNode(node) {
		const nodeToCenter = reactFlowInstance
			.getNodes()
			.find((rfNode) => rfNode.id == node.id);
		if (nodeToCenter) {
			const x = nodeToCenter.position.x + nodeToCenter.width / 2;
			const y = nodeToCenter.position.y + nodeToCenter.height / 2;
			reactFlowInstance.setCenter(
				nodeToCenter.position.x + nodeToCenter.width / 2,
				nodeToCenter.position.y + nodeToCenter.height / 2,
				FITVIEW_OPTIONS
			);
		}
	}

	useLayoutEffect(() => {
		if (key) {
			const KEY_TO_CLASS_MAP = {
				error: "errorTabs",
				warning: "warningTabs",
				success: "successTabs",
				primary: "primaryTabs",
			};

			const NEW_TABS_CLASS_NAME = KEY_TO_CLASS_MAP[key] || "";
			setTabsClassName(NEW_TABS_CLASS_NAME);
		}
	}, [key]);

	useLayoutEffect(() => {
		const fetchData = async () => {
			try {
				let selectedLessonId = undefined;

				if (
					metaData.platform == Platforms.Sakai &&
					metaData.lessons.length >= 1
				) {
					let lessonId = metaData.lessons[0].id;
					selectedLessonId = lessonId;
				}

				let result = await generateMissingModuleList(selectedLessonId);

				if (!result || (result && result.length <= 0)) {
					result = [];
				}

				setSelectedLesson(selectedLessonId);

				setMissingModuleList(result);
			} catch (error) {
				setMissingModuleList([]);
			}
		};

		const fetchDataAndContinue = async () => {
			await fetchData();
			generateWarningAndErrorList();
		};

		const generateWarningAndErrorList = () => {
			const WARNING_LIST = generateWarningList(reactFlowInstance.getNodes());
			setWarningList(WARNING_LIST);

			console.log("Error List: ", errorList);
			console.log("Warning List: ", WARNING_LIST);

			const ERROR_RESOURCE_NOT_FOUND = errorList
				.filter(
					(entry) =>
						entry.severity === "error" && entry.type === "resourceNotFound"
				)
				.map((error) => ({
					...error,
					nodeName: getNodeById(error.nodeId, reactFlowInstance.getNodes())
						?.data?.label,
				}));

			const ERROR_SECTION_NOT_FOUND = errorList
				.filter(
					(entry) =>
						entry.severity === "error" && entry.type === "sectionNotFound"
				)
				.map((error) => ({
					...error,
					nodeName: getNodeById(error.nodeId, reactFlowInstance.getNodes())
						?.data?.label,
				}));

			const ERROR_ORDER_NOT_FOUND = errorList
				.filter(
					(entry) =>
						entry.severity === "error" && entry.type === "orderNotFound"
				)
				.map((error) => ({
					...error,
					nodeName: getNodeById(error.nodeId, reactFlowInstance.getNodes())
						?.data?.label,
				}));

			const WARNING_CHILDREN_NOT_FOUND = WARNING_LIST.filter(
				(entry) =>
					entry.seriousness === "warning" && entry.type === "childrenNotFound"
			).map((error) => ({
				...error,
				nodeName: getNodeById(error.nodeId, reactFlowInstance.getNodes())?.data
					?.label,
			}));

			const WARNING_PARENT_NOT_FOUND = WARNING_LIST.filter(
				(entry) =>
					entry.seriousness === "warning" && entry.type === "parentNotFound"
			).map((error) => ({
				...error,
				nodeName: getNodeById(error.nodeId, reactFlowInstance.getNodes())?.data
					?.label,
			}));

			setNodeErrorResourceList(ERROR_RESOURCE_NOT_FOUND);
			setNodeErrorSectionList(ERROR_SECTION_NOT_FOUND);
			setNodeErrorOrderList(ERROR_ORDER_NOT_FOUND);

			setNodeWarningChildrenList(WARNING_CHILDREN_NOT_FOUND);
			setNodeWarningParentList(WARNING_PARENT_NOT_FOUND);

			if (metaData.platform && metaData.platform == Platforms.Moodle) {
				const WARNING_CHILDREN_WITHOUT_RESTRICTION = WARNING_LIST.filter(
					(entry) =>
						entry.seriousness === "warning" &&
						entry.type === "childrenWithoutRestriction"
				).map((error) => ({
					...error,
					nodeName: getNodeById(error.nodeId, reactFlowInstance.getNodes())
						?.data?.label,
				}));

				setNodeChildrenWithoutRestriction(WARNING_CHILDREN_WITHOUT_RESTRICTION);
			}
		};
		fetchDataAndContinue();
	}, []);

	const handleEdit = (blockData) => {
		toggleDialog();
		if (expandedAside != true) {
			setExpandedAside(true);
		}
		setEditVersionSelected(undefined);
		setNodeSelected(blockData);
		centerToNode(blockData);
	};

	function generateWarningList(nodeList) {
		const WARNING_ARRAY = [];
		nodeList.forEach((node) => {
			const ERROR_ENTRY = {
				id: uniqueId(),
				nodeId: node.id,
			};

			if (
				node.type !== "remgroup" &&
				node.type !== "addgroup" &&
				node.type !== "fragment" &&
				node.type !== "mail"
			) {
				let childlessNode = false;

				switch (metaData.platform) {
					case Platforms.Sakai:
						if (node.type !== "exam" && node.type !== "assign") {
							childlessNode = true;
						}
						break;
					case Platforms.Moodle:
						if (node.type == "badge") {
							childlessNode = true;
						}
				}

				if (
					(!node.data.children || node.data.children.length === 0) &&
					!childlessNode
				) {
					const CUSTOM_ENTRY = {
						...ERROR_ENTRY,
						seriousness: "warning",
						type: "childrenNotFound",
					};

					const ERROR_FOUND = WARNING_ARRAY.find(
						(obj) =>
							obj.nodeId === CUSTOM_ENTRY.nodeId &&
							obj.seriousness === CUSTOM_ENTRY.seriousness &&
							obj.type === CUSTOM_ENTRY.type
					);

					if (!ERROR_FOUND) {
						WARNING_ARRAY.push(CUSTOM_ENTRY);
					}
				}

				const PARENTS_NODE_ARRAY = getParentsNode(nodeList, node.id);

				if (PARENTS_NODE_ARRAY.length <= 0) {
					const CUSTOM_ENTRY = {
						...ERROR_ENTRY,
						seriousness: "warning",
						type: "parentNotFound",
					};

					const errorFound = WARNING_ARRAY.find(
						(obj) =>
							obj.nodeId === CUSTOM_ENTRY.nodeId &&
							obj.seriousness === CUSTOM_ENTRY.seriousness &&
							obj.type === CUSTOM_ENTRY.type
					);

					if (!errorFound) {
						WARNING_ARRAY.push(CUSTOM_ENTRY);
					}
				}

				if (
					metaData.platform &&
					metaData.platform == Platforms.Moodle &&
					node?.data?.children?.length <= 0
				) {
					const CUSTOM_ENTRY = {
						...ERROR_ENTRY,
						seriousness: "warning",
						type: "childrenWithoutRestriction",
					};

					const errorFound = WARNING_ARRAY.find(
						(obj) =>
							obj.nodeId === CUSTOM_ENTRY.nodeId &&
							obj.seriousness === CUSTOM_ENTRY.seriousness &&
							obj.type === CUSTOM_ENTRY.type
					);

					if (!errorFound) {
						console.log(node);
						const CURRENT_NODE_GRADABLE_TYPE = getNodeTypeGradableType(
							node,
							metaData.platform
						);

						if (
							CURRENT_NODE_GRADABLE_TYPE &&
							CURRENT_NODE_GRADABLE_TYPE == "simple" &&
							node?.data?.g?.hasToBeSeen === true
						) {
							if (node?.data?.g?.hasToBeSeen === true) {
								WARNING_ARRAY.push(CUSTOM_ENTRY);
							}
						} else {
							if (node?.data?.g?.hasConditions === true) {
								WARNING_ARRAY.push(CUSTOM_ENTRY);
							}
						}
					}
				}
			}
		});
		console.log(WARNING_ARRAY);
		return WARNING_ARRAY;
	}

	const [warningCount, setWarningCount] = useState(
		warningList != undefined ? warningList.length : 0
	);
	const [hasWarnings, setHasWarnings] = useState(warningCount > 0);

	useLayoutEffect(() => {
		const COUNT = warningList != undefined ? warningList.length : 0;
		setWarningCount(COUNT);
		setHasWarnings(COUNT > 0);
	}, [warningList]);

	return (
		<Modal show={showDialog} onHide={toggleDialog} size="lg" centered>
			<Modal.Header closeButton>
				<Modal.Title>Exportación</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				{!missingModuleList && (
					<div className="d-flex justify-content-center align-items-center">
						<Spinner
							as="span"
							animation="border"
							size="sm"
							role="status"
							aria-hidden="true"
						/>
					</div>
				)}
				{missingModuleList && (
					<Tabs
						defaultActiveKey="success"
						id="fill-tab-example"
						className={`${
							styles[
								`${tabsClassName == undefined ? "successTabs" : tabsClassName}`
							]
						} mb-3`}
						activeKey={key}
						onSelect={(k) => setKey(k)}
						fill
					>
						<Tab
							eventKey="success"
							className="border-success"
							title={
								<div className="text-success border-success">
									{createFontAwesome(faFileExport)} <a>Exportación</a>
								</div>
							}
						>
							<ExportPane
								errorList={errorList}
								warningList={warningList}
								changeTab={setKey}
								metaData={metaData}
								userData={userData}
								mapName={mapName}
								selectedVersion={selectedVersion}
								changeSelectedLesson={changeSelectedLesson}
							/>
						</Tab>

						{missingModuleList && missingModuleList.length >= 1 && (
							<Tab
								eventKey="primary"
								className="border-primary"
								title={
									<div className="text-primary">
										{createFontAwesome(faQuestion)} Módulos no utilizados{" "}
										{selectedLesson &&
											(() => {
												const foundLesson = metaData.lessons.find(
													(metaDataLesson) =>
														metaDataLesson.id == selectedLesson
												);

												if (foundLesson) {
													const lessonName = foundLesson.name;
													return <a> en la lección: ({lessonName})</a>;
												}

												return null;
											})()}
									</div>
								}
							>
								<div className="mb-2">
									<div className="mb-2">
										<OverlayTrigger
											placement="right"
											overlay={
												<Tooltip>{`Los módulos no presentes en el mapa no se modificarán a la hora de exportar`}</Tooltip>
											}
											trigger={["hover", "focus"]}
										>
											<FontAwesomeIcon icon={faCircleQuestion} tabIndex={0} />
										</OverlayTrigger>{" "}
										<b>
											Los siguientes módulos no están presentes en el mapa y si
											en el curso:
										</b>
									</div>
									{missingModuleList.map((module) => (
										<div key={module?.id}>
											<a role="button" className={styles.iconPrimary}>
												{getTypeIcon(module?.type, metaData.platform, 16)}
											</a>{" "}
											<a role="button" className={styles.nodePrimary}>
												{module?.name}
											</a>
										</div>
									))}
								</div>
							</Tab>
						)}

						{errorList.length > 0 && (
							<Tab
								eventKey="error"
								className="border-danger"
								title={
									<div className="text-danger border-danger">
										{createFontAwesome(faExclamationCircle)} <a>Errores</a>
									</div>
								}
							>
								{nodeErrorResourceList && nodeErrorResourceList?.length > 0 && (
									<div className="mb-2">
										<div className="mb-2">
											<b>
												Los siguientes bloques no poseen un recurso asociado:
											</b>
										</div>
										{nodeErrorResourceList.map((entry) => {
											const NODE = getNodeById(
												entry.nodeId,
												reactFlowInstance.getNodes()
											);
											return (
												<div key={entry.id} onClick={() => handleEdit(NODE)}>
													<a role="button" className={styles.iconError}>
														{getTypeIcon(NODE.type, metaData.platform, 16)}
													</a>{" "}
													<a role="button" className={styles.nodeError}>
														{entry.nodeName}
													</a>
												</div>
											);
										})}
									</div>
								)}

								{nodeErrorSectionList && nodeErrorSectionList?.length > 0 && (
									<div className="mb-2">
										<div className="mb-2">
											<b>
												Los siguientes bloques no poseen una sección asignada:
											</b>
										</div>
										{nodeErrorSectionList.map((entry) => {
											const NODE = getNodeById(
												entry.nodeId,
												reactFlowInstance.getNodes()
											);
											return (
												<div key={entry.id} onClick={() => handleEdit(NODE)}>
													<a role="button" className={styles.iconError}>
														{getTypeIcon(NODE.type, metaData.platform, 16)}
													</a>{" "}
													<a role="button" className={styles.nodeError}>
														{entry.nodeName}
													</a>
												</div>
											);
										})}
									</div>
								)}

								{nodeErrorOrderList && nodeErrorOrderList?.length > 0 && (
									<div className="mb-2">
										<div className="mb-2">
											<b>Los siguientes bloques no poseen un orden asignado:</b>
										</div>
										{nodeErrorOrderList.map((entry) => {
											const NODE = getNodeById(
												entry.nodeId,
												reactFlowInstance.getNodes()
											);
											return (
												<div key={entry.id} onClick={() => handleEdit(NODE)}>
													<a role="button" className={styles.iconError}>
														{getTypeIcon(NODE.type, metaData.platform, 16)}
													</a>{" "}
													<a role="button" className={styles.nodeError}>
														{entry.nodeName}
													</a>
												</div>
											);
										})}
									</div>
								)}

								{/*JSON.stringify(metaData)*/}
								{/*JSON.stringify(userdata)*/}
							</Tab>
						)}

						{hasWarnings && (
							<Tab
								eventKey="warning"
								className="border-warning"
								title={
									<div className="text-warning border-warning">
										{createFontAwesome(faExclamationTriangle)}{" "}
										<a>Advertencias</a>
									</div>
								}
							>
								<div>
									{nodeWarningChildrenList != undefined &&
										nodeWarningChildrenList.length >= 1 && (
											<div className="mb-2">
												<div className="mb-2">
													<b>
														Los siguientes bloques no poseen una salida a otro
														bloque:
													</b>
												</div>
												{nodeWarningChildrenList.map((entry) => {
													const NODE = getNodeById(
														entry.nodeId,
														reactFlowInstance.getNodes()
													);
													return (
														<div
															key={entry.id}
															onClick={() => handleEdit(NODE)}
														>
															<a role="button" className={styles.iconWarning}>
																{getTypeIcon(NODE.type, metaData.platform, 16)}
															</a>{" "}
															<a role="button" className={styles.nodeWarning}>
																{entry.nodeName}
															</a>
														</div>
													);
												})}
											</div>
										)}
								</div>

								{metaData.platform && metaData.platform == Platforms.Moodle && (
									<div>
										{nodeChildrenWithoutRestriction != undefined &&
											nodeChildrenWithoutRestriction.length >= 1 && (
												<div className="mb-2">
													<div className="mb-2">
														<b>
															Los siguientes bloques no poseen una salida a otro
															bloque a pesar de tener un ajuste de finalización
															definido:
														</b>
													</div>
													{nodeChildrenWithoutRestriction.map((entry) => {
														const NODE = getNodeById(
															entry.nodeId,
															reactFlowInstance.getNodes()
														);
														return (
															<div
																key={entry.id}
																onClick={() => handleEdit(NODE)}
															>
																<a role="button" className={styles.iconWarning}>
																	{getTypeIcon(
																		NODE.type,
																		metaData.platform,
																		16
																	)}
																</a>{" "}
																<a role="button" className={styles.nodeWarning}>
																	{entry.nodeName}
																</a>
															</div>
														);
													})}
												</div>
											)}
									</div>
								)}

								<div>
									{nodeWarningParentList != undefined &&
										nodeWarningParentList.length > 0 && (
											<div className="mb-2">
												<div className="mb-2">
													<b>
														Los siguientes bloques no poseen un bloque padre:
													</b>
												</div>
												{nodeWarningParentList.map((entry) => {
													const NODE = getNodeById(
														entry.nodeId,
														reactFlowInstance.getNodes()
													);
													return (
														<div
															key={entry.id}
															onClick={() => handleEdit(NODE)}
														>
															<a role="button" className={styles.iconWarning}>
																{getTypeIcon(NODE.type, metaData.platform, 16)}
															</a>{" "}
															<a role="button" className={styles.nodeWarning}>
																{entry.nodeName}
															</a>
														</div>
													);
												})}
											</div>
										)}
								</div>
							</Tab>
						)}
					</Tabs>
				)}
			</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={toggleDialog}>
					Cerrar
				</Button>
			</Modal.Footer>
		</Modal>
	);
});
