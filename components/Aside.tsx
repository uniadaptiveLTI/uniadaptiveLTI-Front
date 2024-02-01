import styles from "/styles/Aside.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faCaretDown,
	faCaretUp,
	faRotateRight,
	faCompress,
	faCircleQuestion,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import { useReactFlow } from "reactflow";
import {
	Tooltip,
	Button,
	Form,
	Spinner,
	OverlayTrigger,
} from "react-bootstrap";
import {
	useState,
	useContext,
	useEffect,
	useRef,
	useId,
	SyntheticEvent,
} from "react";
import {
	ErrorListContext,
	EditedNodeContext,
	ExpandedAsideContext,
	MapInfoContext,
	EditedVersionContext,
	CurrentVersionContext,
	SettingsContext,
	MetaDataContext,
} from "pages/_app";
import {
	capitalizeFirstLetter,
	deduplicateById,
	getUpdatedArrayById,
	orderByPropertyAlphabetically,
	handleNameCollision,
} from "@utils/Utils";
import {
	ActionNodes,
	getLastPositionInSection,
	reorderFromSection,
	reorderFromSectionAndColumn,
} from "@utils/Nodes";
import { errorListCheck } from "@utils/ErrorHandling";
import {
	NodeTypes,
	getMoodleTypes,
	getSakaiTypes,
} from "@utils/TypeDefinitions.js";
import {
	getSupportedTypes,
	getVisibilityOptions,
	hasUnorderedResources,
} from "@utils/Platform.js";
import { getLastPositionInSakaiColumn } from "@utils/Sakai";
import { parseBool } from "../utils/Utils";
import getModulesByType from "middleware/api/getModulesByType";
import { IElementNodeData } from "./interfaces/INode";

export default function Aside({ LTISettings, className }) {
	const { errorList, setErrorList } = useContext(ErrorListContext);

	const [expandedContent, setExpandedContent] = useState(true);
	const [expandedInteract, setExpandedInteract] = useState(true);

	const [selectedOption, setSelectedOption] = useState("");
	const [lmsResource, setLmsResource] = useState("");
	const [showSpinner, setShowSpinner] = useState(false);
	const [allowResourceSelection, setAllowResourceSelection] = useState(true);

	const { nodeSelected } = useContext(EditedNodeContext);
	const { mapSelected, setMapSelected } = useContext(MapInfoContext);
	const { editVersionSelected } = useContext(EditedVersionContext);
	const { settings } = useContext(SettingsContext);
	const { metaData } = useContext(MetaDataContext);

	const [shownTypes, setShownTypes] = useState([]);

	useEffect(() => {
		if (metaData != undefined)
			setShownTypes(getVisibilityOptions(metaData.platform) as Array<object>);
	}, [metaData]);

	const parsedSettings = JSON.parse(settings);
	let { reducedAnimations, autoHideAside } = parsedSettings;
	//References
	const autofocus = useRef(null);
	const labelDOM = useRef(null);
	const optionsDOM = useRef(null);
	const resourceDOM = useRef(null);
	const lmsResourceDOM = useRef(null);
	const mapTitleDOM = useRef(null);
	const versionTitleDOM = useRef(null);
	const refreshIconDOM = useRef(null);
	const lmsVisibilityDOM = useRef(null);
	const sectionDOM = useRef(null);
	const orderDOM = useRef(null);
	const indentDOM = useRef(null);
	//IDs
	const labelDOMId = useId();
	const optionsID = useId();
	const lmsResourceDOMId = useId();
	const typeDOMId = useId();
	const sectionDOMId = useId();
	const lmsVisibilityDOMId = useId();
	const orderDOMId = useId();
	const indentDOMId = useId();
	//TODO: Add the rest

	const [resourceOptions, setResourceOptions] = useState([]);
	const { versionJson, setVersionJson } = useContext(CurrentVersionContext);
	const reactFlowInstance = useReactFlow();

	const { expandedAside, setExpandedAside } = useContext(ExpandedAsideContext);

	const MOODLE_RESOURCE_NAMES = orderByPropertyAlphabetically(
		getMoodleTypes(),
		"name"
	);
	const SAKAI_RESOURCE_NAMES = orderByPropertyAlphabetically(
		getSakaiTypes(),
		"name"
	);

	const fetchResources = async (selectedOption) => {
		try {
			const encodedSelectedOption = encodeURIComponent(selectedOption);
			setShowSpinner(true);
			setAllowResourceSelection(false);
			const payload = {
				type:
					selectedOption == "generic" ? "unsupported" : encodedSelectedOption,
				supportedTypes:
					selectedOption == "generic"
						? getSupportedTypes(metaData.platform)
						: undefined,
			};

			if (selectedOption == "generic" && metaData.platform != "moodle") {
				setShowSpinner(false);
				setAllowResourceSelection(true);
				return [];
			}

			const RESPONSE = await getModulesByType(payload);

			if (!RESPONSE.ok) {
				console.error(`❌ Error: `, RESPONSE.data);
				toast("No se pudieron obtener los datos del curso desde el LMS", {
					hideProgressBar: false,
					autoClose: 2000,
					type: "error",
					position: "bottom-center",
				});
			}

			const DATA = RESPONSE.data.items;

			setShowSpinner(false);
			setAllowResourceSelection(true);
			return DATA;
		} catch (e) {
			console.error(`❌ Error: `, e);
			toast("No se pudieron obtener los datos del curso desde el LMS", {
				hideProgressBar: false,
				autoClose: 2000,
				type: "error",
				position: "bottom-center",
			});
		}
	};

	useEffect(() => {
		//FIXME: No sucede
		if (!selectedOption) {
			setResourceOptions([]);
		} else {
			if (parseBool(process.env.NEXT_PUBLIC_DEV_FILES)) {
				setResourceOptions([]);
				setTimeout(() => {
					const DATA = [
						{
							id: "0",
							name: `${capitalizeFirstLetter(
								NodeTypes.filter((node) => node.type == selectedOption)[0].name
							)} A`,
						},
						{
							id: "1",
							name: `${capitalizeFirstLetter(
								NodeTypes.filter((node) => node.type == selectedOption)[0].name
							)} B`,
						},
						{
							id: "2",
							name: `${capitalizeFirstLetter(
								NodeTypes.filter((node) => node.type == selectedOption)[0].name
							)} C`,
						},
						{
							id: "3",
							name: `${capitalizeFirstLetter(
								NodeTypes.filter((node) => node.type == selectedOption)[0].name
							)} D`,
						},
					];
					const FILTERED_DATA = [];
					DATA.forEach((resource) => {
						if (!getUsedResources().includes(resource.id)) {
							FILTERED_DATA.push(resource);
						}
					});

					//Adds current resource if exists
					if (nodeSelected && nodeSelected.data) {
						if ("lmsResource" in nodeSelected.data)
							if (nodeSelected.data.lmsResource != undefined) {
								if (nodeSelected.data.lmsResource != "") {
									const LMS_RESOURCE = nodeSelected.data.lmsResource;
									const STORED_RESOURCE = DATA.find(
										(resource) => resource.id == LMS_RESOURCE
									);

									if (STORED_RESOURCE != undefined) {
										FILTERED_DATA.push(STORED_RESOURCE);
									}
								}
							}
					}

					const UNIQUE_FILTERED_DATA = orderByPropertyAlphabetically(
						deduplicateById(FILTERED_DATA),
						"name"
					);
					UNIQUE_FILTERED_DATA.unshift({
						id: -1,
						name: NodeTypes.filter((node) => node.type == selectedOption)[0]
							.emptyName,
					});
					setResourceOptions(UNIQUE_FILTERED_DATA);
				}, 1000);
			} else {
				fetchResources(selectedOption).then((data) => {
					const FILTERED_DATA = [];
					data.forEach((resource) => {
						if (!getUsedResources().includes(resource.id)) {
							FILTERED_DATA.push(resource);
						}
					});
					//Adds current resource if exists
					if (nodeSelected && nodeSelected.data) {
						if ("lmsResource" in nodeSelected.data)
							if (nodeSelected.data.lmsResource) {
								if (nodeSelected.data.lmsResource != "") {
									const lmsRes = nodeSelected.data.lmsResource;
									const storedRes = data.find(
										(resource) => resource.id == lmsRes
									);

									if (storedRes != undefined) {
										FILTERED_DATA.push(storedRes);
									}
								}
							}
					}
					const UNIQUE_FILTERED_DATA = orderByPropertyAlphabetically(
						deduplicateById(FILTERED_DATA),
						"name"
					);
					UNIQUE_FILTERED_DATA.forEach((option) => {
						return hasUnorderedResources(metaData.platform)
							? (option.oname = `${option.name}`)
							: (option.oname = `${option.name} ${
									option.section > -1 ? "- Sección: " + option.section : ""
							  }`);
					});
					UNIQUE_FILTERED_DATA.unshift({
						id: -1,
						name: NodeTypes.filter((node) => node.type == selectedOption)[0]
							.emptyName,
					});

					setResourceOptions(UNIQUE_FILTERED_DATA);
				});
			}
		}
	}, [selectedOption, nodeSelected]);

	useEffect(() => {
		if (nodeSelected) {
			if (resourceOptions.length > 0) {
				const resourceIDs = resourceOptions.map((resource) => resource.id);
				const lmsResourceCurrent = lmsResourceDOM.current;
				if ("lmsResource" in nodeSelected.data) {
					if (lmsResourceCurrent) {
						if (resourceIDs.includes(nodeSelected.data.lmsResource)) {
							lmsResourceCurrent.value = nodeSelected.data.lmsResource;
						} else {
							lmsResourceCurrent.value = "-1";
						}
					}
					setLmsResource(nodeSelected.data.lmsResource);
				}
			}
		}
	}, [resourceOptions]);

	const syncLabel = (e) => {
		if (nodeSelected) {
			if (
				!(
					(ActionNodes.includes(nodeSelected.type) &&
						nodeSelected.type != "badge") ||
					nodeSelected.type == "fragment"
				)
			) {
				const labelCurrent = labelDOM.current;
				//TODO: Test it even more
				labelCurrent.value =
					metaData.platform == "moodle"
						? resourceOptions.find(
								(resource) => e.target.value == resource.id && resource.id > -1
						  )?.name ||
						  handleNameCollision(
								NodeTypes.find((ntype) => nodeSelected.type == ntype.type)
									.emptyName,
								reactFlowInstance.getNodes().map((node) => node?.data?.label),
								false,
								"("
						  )
						: e.target.options[e.target.selectedIndex].text ||
						  handleNameCollision(
								NodeTypes.find((ntype) => nodeSelected.type == ntype.type)
									.emptyName,
								reactFlowInstance.getNodes().map((node) => node?.data?.label),
								false,
								"("
						  );
			}
		}
	};

	const handleSelect = (event) => {
		setSelectedOption(event.target.value);
	};

	useEffect(() => {
		if (nodeSelected) {
			const CURRENT_LABEL = labelDOM.current;
			const CURRENT_TYPE = resourceDOM.current;
			const CURRENT_LMS_VISIBILITY = lmsVisibilityDOM.current;
			const CURRENT_SECTION = sectionDOM.current;
			const CURRENT_ORDER = orderDOM.current;
			const CURRENT_INDENT = indentDOM.current;

			if (CURRENT_LABEL) {
				CURRENT_LABEL.value = nodeSelected.data.label;
			}

			if (CURRENT_TYPE) {
				CURRENT_TYPE.value = nodeSelected.type;
			}

			if (CURRENT_LMS_VISIBILITY) {
				if ("lmsVisibility" in nodeSelected.data)
					CURRENT_LMS_VISIBILITY.value = nodeSelected.data.lmsVisibility;
			}

			if (CURRENT_SECTION) {
				if ("section" in nodeSelected.data)
					CURRENT_SECTION.value = nodeSelected.data.section;
			}

			if (CURRENT_ORDER) {
				if ("order" in nodeSelected.data)
					CURRENT_ORDER.value = nodeSelected.data.order + 1;
			}

			if (CURRENT_INDENT) {
				if ("indent" in nodeSelected.data)
					if (metaData.platform == "sakai") {
						CURRENT_INDENT.value = nodeSelected.data.indent + 1;
					} else {
						CURRENT_INDENT.value = nodeSelected.data.indent;
					}
			}

			setSelectedOption(nodeSelected.type);
		}
	}, [nodeSelected]);

	/**
	 * Focuses into the aside if autoHideAside is active and autoFocus is visible
	 */
	useEffect(() => {
		if (autofocus && autoHideAside) {
			autofocus.current.focus();
		}
	});

	/**
	 * Updates the selected block with the values from the specified DOM elements.
	 */
	const updateBlock = (e: SyntheticEvent) => {
		if (nodeSelected.type != "fragment") {
			const RESOURCE_TYPE = resourceDOM.current.value;
			let newData;
			if (!ActionNodes.includes(nodeSelected.type)) {
				//if element node
				const getValue = (dom) => Number(dom?.current?.value || 0);
				const newSection = getValue(sectionDOM);
				const newIndent = getValue(indentDOM);
				const {
					section: originalSection,
					indent: originalIndent,
					order: originalOrder,
				} = nodeSelected.data as IElementNodeData;

				const LIMITED_ORDER = Math.min(
					Math.max(orderDOM.current.value, 0),
					metaData.platform != "sakai"
						? getLastPositionInSection(
								newSection,
								reactFlowInstance.getNodes()
						  ) + 1
						: getLastPositionInSakaiColumn(
								newSection,
								newIndent,
								reactFlowInstance.getNodes()
						  ) + 1
				);
				let LIMITED_INDENT = Math.min(Math.max(indentDOM.current.value, 0), 16);

				newData = {
					...nodeSelected.data,
					label: labelDOM.current.value,
					lmsResource: lmsResourceDOM.current.value,
					lmsVisibility: lmsVisibilityDOM?.current?.value
						? lmsVisibilityDOM?.current?.value
						: metaData.platform == "moodle"
						? "hidden"
						: "hidden_until_access",
					section: newSection,
					order: LIMITED_ORDER - 1,
					indent:
						metaData.platform == "sakai" ? LIMITED_INDENT - 1 : LIMITED_INDENT,
				};

				const UPDATED_DATA = {
					...nodeSelected,
					id: nodeSelected.id,
					type: resourceDOM.current.value,
					data: newData,
				};

				const NODE_WITH_NEW_ORDER_EXISTS = reactFlowInstance
					.getNodes()
					.some(
						(node) =>
							node.data.order == LIMITED_ORDER - 1 &&
							node.data.section == newSection
					);

				const reorderNodes = (newSection, originalOrder, limitedOrder) => {
					const [FROM, TO] = [originalOrder, limitedOrder - 1];
					const reorderedArray = reorderFromSection(
						newSection,
						FROM,
						TO,
						reactFlowInstance.getNodes()
					);
					reactFlowInstance.setNodes([...reorderedArray, UPDATED_DATA]);
				};

				const reorderNodesColumn = (
					newSection,
					newColumn,
					originalOrder,
					limitedOrder
				) => {
					const [FROM, TO] = [originalOrder, limitedOrder - 1];
					const reorderedArray = reorderFromSectionAndColumn(
						newSection,
						newColumn,
						FROM,
						TO,
						reactFlowInstance.getNodes()
					);

					reactFlowInstance.setNodes([
						...reactFlowInstance.getNodes(),
						...reorderedArray,
						UPDATED_DATA,
					]);
				};

				const updateNodes = (updatedData) => {
					reactFlowInstance.setNodes(
						getUpdatedArrayById(updatedData, reactFlowInstance.getNodes())
					);
				};

				if (
					NODE_WITH_NEW_ORDER_EXISTS ||
					originalSection != newSection ||
					(metaData.platform == "sakai" && originalIndent != newIndent)
				) {
					if (originalSection == newSection && metaData.platform != "sakai") {
						//Change in order
						reorderNodes(newSection, originalOrder, LIMITED_ORDER);
					} else {
						const virtualNodes = reactFlowInstance.getNodes();
						const forcedPos =
							metaData.platform == "moodle"
								? getLastPositionInSection(newSection, virtualNodes) + 1
								: getLastPositionInSakaiColumn(
										newSection,
										newIndent,
										virtualNodes
								  ) + 1;

						if (metaData.platform == "moodle")
							UPDATED_DATA.data.order = forcedPos;
						if (metaData.platform == "sakai")
							UPDATED_DATA.data.order = forcedPos - 1;
						virtualNodes.push(UPDATED_DATA);
						if (!(LIMITED_ORDER - 1 > forcedPos)) {
							//If the desired position is inside the section
							reorderNodesColumn(
								newSection,
								newIndent,
								forcedPos + 1,
								LIMITED_ORDER
							);
						} else {
							//If the desired position is outside the section

							updateNodes(UPDATED_DATA);
						}
					}
				} else {
					updateNodes(UPDATED_DATA);
				}

				errorListCheck(UPDATED_DATA, errorList, setErrorList);
			} else {
				//if action node
				newData = {
					...nodeSelected.data,
					label: labelDOM.current.value,
					lmsResource:
						RESOURCE_TYPE !== "mail"
							? lmsResourceDOM.current.value
							: RESOURCE_TYPE,
				};

				const UPDATED_DATA = {
					...nodeSelected,
					id: nodeSelected.id,
					type: resourceDOM.current.value,
					data: newData,
				};

				errorListCheck(UPDATED_DATA, errorList, setErrorList);

				reactFlowInstance.setNodes(
					getUpdatedArrayById(UPDATED_DATA, reactFlowInstance.getNodes())
				);

				errorListCheck(UPDATED_DATA, errorList, setErrorList);
			}

			if (autoHideAside) {
				setExpandedAside(false);
			}
		} else {
			const NEW_DATA = {
				...nodeSelected.data,
				label: labelDOM.current.value,
			};

			const UPDATED_DATA = {
				...nodeSelected,
				id: nodeSelected.id,
				data: NEW_DATA,
			};

			reactFlowInstance.setNodes(
				getUpdatedArrayById(UPDATED_DATA, reactFlowInstance.getNodes())
			);
		}
		console.log(nodeSelected);
	};

	/**
	 * Updates the selected map with the value from the specified DOM element.
	 */
	const updateMap = (e: SyntheticEvent) => {
		setMapSelected((prevMap) => ({
			...prevMap,
			id: mapSelected.id,
			name: mapTitleDOM.current.value,
		}));
	};

	/**
	 * Updates the selected version with the value from the specified DOM element.
	 */
	const updateVersion = (e: SyntheticEvent) => {
		setVersionJson((prevVersionJson) => ({
			...prevVersionJson,
			id: editVersionSelected.id,
			name: versionTitleDOM.current.value,
			lastUpdate: editVersionSelected.lastUpdate,
			default: editVersionSelected.default,
		}));
	};

	const getUsedResources = () => {
		const NODES = reactFlowInstance.getNodes();
		const USED_RESOURCES = [];
		NODES.map((node) => {
			if (node.data.lmsResource != undefined) {
				USED_RESOURCES.push(node.data.lmsResource);
			}
		});
		return USED_RESOURCES;
	};

	return (
		<aside id="aside" className={`${className} ${styles.aside}`}>
			<div className={"text-center p-2"}>
				<div
					ref={autofocus}
					role="button"
					onClick={() => setExpandedAside(false)}
					className={
						styles.uniadaptive + " " + (reducedAnimations && styles.noAnimation)
					}
					style={{ transition: "all 0.5s ease" }}
					tabIndex={0}
				>
					<img
						alt="Logo"
						src={LTISettings.branding.logo_path}
						style={{ width: "100%", userSelect: "none" }}
					/>
					<span className={styles.collapse + " display-6"}>
						<FontAwesomeIcon width={38} height={38} icon={faCompress} />
					</span>
				</div>
				<hr />
				<div id={mapSelected?.id}></div>
			</div>

			{nodeSelected &&
			!(nodeSelected.type == "start" || nodeSelected.type == "end") ? (
				<Form
					action="#"
					method=""
					onSubmit={(e) => {
						e.preventDefault();
						allowResourceSelection ? updateBlock(e) : null;
					}}
				>
					<div className="container-fluid">
						<Form.Group className="mb-3">
							<div
								className="d-flex gap-2"
								role="button"
								onClick={() => setExpandedContent(!expandedContent)}
							>
								<div className="fw-bold">Contenido</div>
								<div>
									<div>
										{!expandedContent ? (
											<FontAwesomeIcon icon={faCaretUp} />
										) : (
											<FontAwesomeIcon icon={faCaretDown} />
										)}
									</div>
								</div>
							</div>
							<div
								className={[
									styles.uniadaptiveDetails,
									expandedContent ? styles.active : null,
									reducedAnimations && styles.noAnimation,
								].join(" ")}
							>
								<Form.Group className="mb-3">
									<Form.Label htmlFor={labelDOMId} className="mb-1">
										Nombre del{" "}
										{nodeSelected.type == "fragment" ? "fragmento" : "bloque"}
									</Form.Label>
									<Form.Control
										ref={labelDOM}
										id={labelDOMId}
										type="text"
										className="w-100"
										disabled={
											!(
												(ActionNodes.includes(nodeSelected.type) &&
													nodeSelected.type != "badge") ||
												nodeSelected.type == "fragment"
											)
										}
									></Form.Control>
								</Form.Group>
								{nodeSelected.type != "fragment" && (
									<Form.Group className="mb-3">
										<div className="d-flex justify-content-between">
											<Form.Label htmlFor={typeDOMId} className="mb-1">
												{ActionNodes.includes(nodeSelected.type)
													? "Acción a realizar"
													: "Tipo de recurso"}
											</Form.Label>
											<div>
												<OverlayTrigger
													placement="right"
													overlay={
														ActionNodes.includes(nodeSelected.type) ? (
															<Tooltip>{`Listado de acciones que pueda ejecutar ${capitalizeFirstLetter(
																metaData.platform
															)}.`}</Tooltip>
														) : (
															<Tooltip>{`Listado de tipos de recursos compatibles con ${capitalizeFirstLetter(
																metaData.platform
															)}.`}</Tooltip>
														)
													}
													trigger={["hover", "focus"]}
												>
													<FontAwesomeIcon
														icon={faCircleQuestion}
														tabIndex={0}
													/>
												</OverlayTrigger>
											</div>
										</div>
										<Form.Select
											ref={resourceDOM}
											id={typeDOMId}
											className="w-100"
											defaultValue={selectedOption}
											onChange={handleSelect}
										>
											{metaData.platform == "moodle"
												? MOODLE_RESOURCE_NAMES.map((option) => {
														if (
															(ActionNodes.includes(nodeSelected.type) &&
																option.nodeType == "ActionNode") ||
															(!ActionNodes.includes(nodeSelected.type) &&
																option.nodeType == "ElementNode")
														) {
															return (
																<option key={option.id} value={option.value}>
																	{option.name}
																</option>
															);
														}
												  })
												: SAKAI_RESOURCE_NAMES.map((option) => {
														if (
															(ActionNodes.includes(nodeSelected.type) &&
																option.nodeType == "ActionNode") ||
															(!ActionNodes.includes(nodeSelected.type) &&
																option.nodeType == "ElementNode")
														) {
															return (
																<option key={option.id} value={option.value}>
																	{option.name}
																</option>
															);
														}
												  })}
										</Form.Select>
									</Form.Group>
								)}

								{!(
									nodeSelected.type == "fragment" ||
									nodeSelected.type == "mail" ||
									selectedOption == "mail"
								) && (
									<div className="mb-3">
										<div className="d-flex gap-2">
											<div className="d-flex align-items-center justify-content-between w-100">
												<div className="d-flex align-items-center justify-content-between">
													<Form.Label
														htmlFor={lmsResourceDOMId}
														className="mb-1"
													>
														{`Recurso en ${capitalizeFirstLetter(
															metaData.platform
														)}`}
													</Form.Label>
													<div className="ms-2">
														{!showSpinner && (
															<div ref={refreshIconDOM}>
																<FontAwesomeIcon icon={faRotateRight} />
															</div>
														)}
														{showSpinner && (
															<div ref={refreshIconDOM}>
																<Spinner
																	animation="border"
																	role="status"
																	size="sm"
																>
																	<span className="visually-hidden">
																		Loading...
																	</span>
																</Spinner>
															</div>
														)}
													</div>
												</div>
												<div>
													<OverlayTrigger
														placement="right"
														overlay={
															<Tooltip>{`Solo se mostrarán elementos existentes en ${capitalizeFirstLetter(
																metaData.platform
															)}. Para crear un elemento nuevo en ${capitalizeFirstLetter(
																metaData.platform
															)}, presione este botón.`}</Tooltip>
														}
														trigger={["hover", "focus"]}
													>
														<Button
															className={`btn-light d-flex align-items-center p-0 m-0 ${styles.actionButtons}`}
															onClick={() =>
																window.open(
																	metaData.return_url.startsWith("http")
																		? metaData.return_url
																		: "https://" + metaData.return_url,
																	"_blank"
																)
															}
														>
															<FontAwesomeIcon icon={faCircleQuestion} />
														</Button>
													</OverlayTrigger>
												</div>
											</div>
										</div>
										<Form.Select
											ref={lmsResourceDOM}
											id={lmsResourceDOMId}
											className="w-100"
											defaultValue={lmsResource == "" ? lmsResource : "-1"}
											disabled={!resourceOptions.length}
											onChange={syncLabel}
										>
											{allowResourceSelection && (
												<>
													<option key="-1" hidden value={-1}>
														{"Esperando recursos..."}
													</option>
													{resourceOptions.map((resource) => (
														<option key={resource.id} value={resource.id}>
															{resource.oname != undefined
																? resource.oname
																: resource.name}
														</option>
													))}
												</>
											)}
										</Form.Select>
									</div>
								)}
							</div>
						</Form.Group>
						{!(
							ActionNodes.includes(nodeSelected.type) ||
							nodeSelected.type == "fragment"
						) && (
							<div className="mb-2">
								<div
									className="d-flex gap-2"
									role="button"
									onClick={() => setExpandedInteract(!expandedInteract)}
								>
									<div className="fw-bold">Interacción</div>
									<div>
										<div role="button">
											{!expandedInteract ? (
												<FontAwesomeIcon icon={faCaretUp} />
											) : (
												<FontAwesomeIcon icon={faCaretDown} />
											)}
										</div>
									</div>
								</div>

								<div
									className={[
										styles.uniadaptiveDetails,
										expandedInteract ? styles.active : null,
										reducedAnimations && styles.noAnimation,
									].join(" ")}
								>
									{metaData.platform == "moodle" &&
										"lmsVisibility" in nodeSelected.data && (
											<Form.Group className="mb-2">
												<Form.Label htmlFor={lmsVisibilityDOMId}>
													Visibilidad
												</Form.Label>
												<Form.Select
													ref={lmsVisibilityDOM}
													id={lmsVisibilityDOMId}
													defaultValue={nodeSelected.data.lmsVisibility}
												>
													{shownTypes.length > 0 &&
														orderByPropertyAlphabetically(
															shownTypes,
															"name"
														).map((option) => (
															<option key={option.value} value={option.value}>
																{option.name}
															</option>
														))}
												</Form.Select>
											</Form.Group>
										)}

									<>
										{metaData.platform == "moodle" &&
											"section" in nodeSelected.data && (
												<Form.Group className="mb-2">
													<Form.Label htmlFor={sectionDOMId}>
														Sección
													</Form.Label>
													<Form.Select
														ref={sectionDOM}
														id={sectionDOMId}
														defaultValue={nodeSelected.data.section}
													>
														{metaData.sections &&
															orderByPropertyAlphabetically(
																[...metaData.sections].map((section) => {
																	const newSection = JSON.parse(
																		JSON.stringify(section)
																	);
																	if (!section.name.match(/^\d/)) {
																		newSection.name =
																			metaData.platform == "moodle"
																				? newSection.position +
																				  "- " +
																				  newSection.name
																				: newSection.position +
																				  1 +
																				  "- " +
																				  newSection.name;
																		newSection.value = newSection.position + 1;
																	}
																	return newSection;
																}),
																"name"
															).map((section) => (
																<option
																	key={section.id}
																	value={section.position}
																>
																	{section.name}
																</option>
															))}
													</Form.Select>
												</Form.Group>
											)}
										{metaData.platform == "sakai" &&
											"section" in nodeSelected.data && (
												<Form.Group className="mb-2">
													<Form.Label htmlFor={sectionDOMId}>
														Sección
													</Form.Label>
													<Form.Control
														type="number"
														min={1}
														max={999}
														defaultValue={nodeSelected.data.section}
														ref={sectionDOM}
														id={sectionDOMId}
													></Form.Control>
												</Form.Group>
											)}
										{metaData.platform == "sakai" &&
											"indent" in nodeSelected.data && (
												<Form.Group className="mb-2">
													<Form.Label htmlFor={indentDOMId}>Columna</Form.Label>
													<Form.Control
														type="number"
														min={1}
														max={16}
														defaultValue={nodeSelected.data.indent + 1}
														ref={indentDOM}
														id={indentDOMId}
													></Form.Control>
												</Form.Group>
											)}
										{"order" in nodeSelected.data && (
											<Form.Group className="mb-2">
												<Form.Label htmlFor={orderDOMId}>
													{metaData.platform === "sakai"
														? "Posición"
														: "Posición en la sección"}
												</Form.Label>
												<Form.Control
													type="number"
													min={1}
													max={999}
													defaultValue={nodeSelected.data.order}
													ref={orderDOM}
													id={orderDOMId}
												></Form.Control>
											</Form.Group>
										)}
										{metaData.platform == "moodle" &&
											"indent" in nodeSelected.data && (
												<Form.Group className="mb-2">
													<Form.Label htmlFor={indentDOMId}>
														Identación en la sección
													</Form.Label>
													<Form.Control
														type="number"
														min={0}
														max={16}
														defaultValue={nodeSelected.data.indent}
														ref={indentDOM}
														id={indentDOMId}
													></Form.Control>
												</Form.Group>
											)}
									</>
								</div>
							</div>
						)}

						<Button onClick={updateBlock} disabled={!allowResourceSelection}>
							Guardar
						</Button>
					</div>
				</Form>
			) : (
				<></>
			)}

			{mapSelected && !(nodeSelected || editVersionSelected) ? (
				<Form
					className="container-fluid"
					action="#"
					method=""
					onSubmit={(e) => {
						e.preventDefault();
						updateMap(e);
					}}
				>
					<Form.Group className="mb-3">
						<div
							className="d-flex gap-2"
							role="button"
							onClick={() => setExpandedAside(!expandedAside)}
						>
							<div className="fw-bold">Contenido</div>
							<div>
								<div>
									{!expandedAside ? (
										<FontAwesomeIcon icon={faCaretUp} />
									) : (
										<FontAwesomeIcon icon={faCaretDown} />
									)}
								</div>
							</div>
						</div>
						<div
							className={[
								styles.uniadaptiveDetails,
								expandedAside && styles.active,
								reducedAnimations && styles.noAnimation,
							].join(" ")}
						>
							<Form.Group className="mb-3">
								<Form.Label className="mb-1">Nombre del mapa</Form.Label>
								<Form.Control
									id="map-title"
									ref={mapTitleDOM}
									type="text"
									className="w-100"
									defaultValue={mapSelected.name}
								></Form.Control>
							</Form.Group>
						</div>
						<Button onClick={updateMap} disabled={!allowResourceSelection}>
							Guardar
						</Button>
					</Form.Group>
				</Form>
			) : (
				<></>
			)}

			{editVersionSelected ? (
				<Form
					className="container-fluid"
					action="#"
					method=""
					onSubmit={(e) => {
						e.preventDefault();
						updateVersion(e);
					}}
				>
					<Form.Group className="mb-3">
						<div
							className="d-flex gap-2"
							role="button"
							onClick={() => setExpandedAside(!expandedAside)}
						>
							<div className="fw-bold">Contenido</div>
							<div>
								<div>
									{!expandedAside ? (
										<FontAwesomeIcon icon={faCaretUp} />
									) : (
										<FontAwesomeIcon icon={faCaretDown} />
									)}
								</div>
							</div>
						</div>
						<div
							style={{
								opacity: expandedAside ? "1" : "0",
								visibility: expandedAside ? "visible" : "hidden",
								maxHeight: expandedAside ? "" : "0",
								transition: "all .2s",
							}}
						>
							<Form.Group className="mb-3">
								<Form.Label className="mb-1">Nombre de la versión</Form.Label>
								<Form.Control
									id="version-title"
									ref={versionTitleDOM}
									type="text"
									className="w-100"
									defaultValue={editVersionSelected.name}
								></Form.Control>
							</Form.Group>
						</div>
						<Button onClick={updateVersion} disabled={!allowResourceSelection}>
							Guardar
						</Button>
					</Form.Group>
				</Form>
			) : (
				<></>
			)}
		</aside>
	);
}
