import styles from "@root/styles/Aside.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faCaretDown,
	faCaretUp,
	faRotateRight,
	faCompress,
	faCircleQuestion,
} from "@fortawesome/free-solid-svg-icons";
import { useReactFlow } from "reactflow";
import {
	Tooltip,
	Button,
	Form,
	Spinner,
	OverlayTrigger,
} from "react-bootstrap";
import { useState, useContext, useEffect, useRef, useId, version } from "react";
import {
	ErrorListContext,
	PlatformContext,
	NodeInfoContext,
	ExpandedAsideContext,
	MapInfoContext,
	VersionInfoContext,
	VersionJsonContext,
	SettingsContext,
	MetaDataContext,
} from "../pages/_app.js";
import {
	capitalizeFirstLetter,
	deduplicateById,
	getHTTPPrefix,
	getUpdatedArrayById,
	isUnique,
	orderByPropertyAlphabetically,
	parseBool,
} from "@utils/Utils";
import {
	ActionNodes,
	getLastPositionInSection,
	reorderFromSection,
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

export default function Aside({ LTISettings, className, closeBtn, svgExists }) {
	const { errorList, setErrorList } = useContext(ErrorListContext);

	const [expandedContent, setExpandedContent] = useState(true);
	const [expandedInteract, setExpandedInteract] = useState(true);

	const [selectedOption, setSelectedOption] = useState("");
	const [lmsResource, setLmsResource] = useState("");
	const [showSpinner, setShowSpinner] = useState(false);
	const [allowResourceSelection, setAllowResourceSelection] = useState(true);

	const { platform, setPlatform } = useContext(PlatformContext);
	const shownTypes = getVisibilityOptions(platform);
	const { nodeSelected, setNodeSelected } = useContext(NodeInfoContext);
	const { mapSelected, setMapSelected } = useContext(MapInfoContext);
	const { editVersionSelected, setEditVersionSelected } =
		useContext(VersionInfoContext);
	const { settings, setSettings } = useContext(SettingsContext);
	const { metaData, setMetaData } = useContext(MetaDataContext);

	const parsedSettings = JSON.parse(settings);
	let { reducedAnimations, autoHideAside } = parsedSettings;

	//References
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
	const { versionJson, setVersionJson } = useContext(VersionJsonContext);
	const reactFlowInstance = useReactFlow();

	const { expandedAside, setExpandedAside } = useContext(ExpandedAsideContext);

	const moodleResource = orderByPropertyAlphabetically(
		getMoodleTypes(),
		"name"
	);
	const sakaiResource = orderByPropertyAlphabetically(getSakaiTypes(), "name");

	const fetchResources = async (
		selectedOption,
		platform,
		instance,
		lms,
		course,
		session
	) => {
		try {
			const encodedSelectedOption = encodeURIComponent(selectedOption);
			const encodedPlatform = encodeURIComponent(platform);
			const encodedInstance = encodeURIComponent(instance);
			const encodedLMS = encodeURIComponent(lms);
			const encodedCourse = encodeURIComponent(course);
			const encodedSession = encodeURIComponent(session);
			console.log(encodedLMS);
			setShowSpinner(true);
			setAllowResourceSelection(false);
			const response = await fetch(
				selectedOption == "generic"
					? `${getHTTPPrefix()}//${
							LTISettings.back_url
					  }/lti/get_modules_by_type?type=${encodeURIComponent(
							"unsupported"
					  )}&instance=${encodedInstance}&platform=${encodedPlatform}&course=${encodedCourse}&url_lms=${encodedLMS}&session=${encodedSession}&supportedTypes=${encodeURIComponent(
							getSupportedTypes(platform)
					  )}&sections=${encodeURIComponent(
							JSON.stringify(
								metaData.sections.map((section) => {
									return { id: section.id, position: section.position };
								})
							)
					  )}`
					: `${getHTTPPrefix()}//${
							LTISettings.back_url
					  }/lti/get_modules_by_type?type=${encodedSelectedOption}&instance=${encodedInstance}&platform=${encodedPlatform}&course=${encodedCourse}&url_lms=${encodedLMS}&session=${encodedSession}`
			);
			if (!response.ok) {
				throw new Error("Request failed");
			}
			const data = await response.json();
			setShowSpinner(false);
			setAllowResourceSelection(true);
			return data;
		} catch (e) {
			const error = new Error(
				"No se pudieron obtener los datos del curso desde el LMS."
			);
			error.log = e;
			throw error;
		}
	};

	useEffect(() => {
		//FIXME: No sucede
		if (!selectedOption) {
			setResourceOptions([]);
		} else {
			if (LTISettings.debugging.dev_files) {
				setResourceOptions([]);
				setTimeout(() => {
					const data = [
						{
							id: 0,
							name: `${capitalizeFirstLetter(
								NodeTypes.filter((node) => node.type == selectedOption)[0].name
							)} A`,
						},
						{
							id: 1,
							name: `${capitalizeFirstLetter(
								NodeTypes.filter((node) => node.type == selectedOption)[0].name
							)} B`,
						},
						{
							id: 2,
							name: `${capitalizeFirstLetter(
								NodeTypes.filter((node) => node.type == selectedOption)[0].name
							)} C`,
						},
						{
							id: 3,
							name: `${capitalizeFirstLetter(
								NodeTypes.filter((node) => node.type == selectedOption)[0].name
							)} D`,
						},
					];
					const filteredData = [];
					data.forEach((resource) => {
						if (!getUsedResources().includes(resource.id)) {
							filteredData.push(resource);
						}
					});

					//Adds current resource if exists
					if (nodeSelected && nodeSelected.data) {
						if (nodeSelected.data.lmsResource != undefined) {
							if (nodeSelected.data.lmsResource > -1) {
								const lmsRes = nodeSelected.data.lmsResource;
								const storedRes = data.find(
									(resource) => resource.id === lmsRes
								);

								if (storedRes != undefined) {
									filteredData.push(storedRes);
								}
							}
						}
					}

					const uniqueFilteredData = orderByPropertyAlphabetically(
						deduplicateById(filteredData),
						"name"
					);
					uniqueFilteredData.unshift({ id: -1, name: "Vacío" });
					setResourceOptions(uniqueFilteredData);
				}, 1000);
			} else {
				fetchResources(
					selectedOption,
					metaData.platform,
					metaData.instance_id,
					metaData.lms_url,
					metaData.course_id,
					metaData.session_id
				).then((data) => {
					const filteredData = [];
					data.forEach((resource) => {
						if (!getUsedResources().includes(resource.id)) {
							filteredData.push(resource);
						}
					});
					//Adds current resource if exists
					if (nodeSelected && nodeSelected.data) {
						if (nodeSelected.data.lmsResource) {
							if (nodeSelected.data.lmsResource > -1) {
								const lmsRes = nodeSelected.data.lmsResource;
								const storedRes = data.find(
									(resource) => resource.id === lmsRes
								);

								if (storedRes != undefined) {
									filteredData.push(storedRes);
								}
							}
						}
					}
					const uniqueFilteredData = orderByPropertyAlphabetically(
						deduplicateById(filteredData),
						"name"
					);
					uniqueFilteredData.forEach((option) =>
						hasUnorderedResources(platform)
							? (option.bettername = `${option.name}`)
							: (option.bettername = `${option.name} - Sección: ${option.section}`)
					);
					uniqueFilteredData.unshift({ id: -1, name: "Vacío" });
					setResourceOptions(uniqueFilteredData);
				});
			}
		}
	}, [selectedOption, nodeSelected]);

	useEffect(() => {
		if (nodeSelected) {
			if (resourceOptions.length > 0) {
				const resourceIDs = resourceOptions.map((resource) => resource.id);
				const lmsResourceCurrent = lmsResourceDOM.current;
				if (lmsResourceCurrent) {
					if (resourceIDs.includes(nodeSelected.data.lmsResource)) {
						lmsResourceCurrent.value = nodeSelected.data.lmsResource;
					} else {
						lmsResourceCurrent.value = -1;
					}
				}
				setLmsResource(nodeSelected.data.lmsResource);
			}
		}
	}, [resourceOptions]);

	const syncLabel = (e) => {
		if (nodeSelected) {
			if (
				!(
					ActionNodes.includes(nodeSelected.type) ||
					nodeSelected.type == "fragment"
				)
			) {
				const labelCurrent = labelDOM.current;

				labelCurrent.value = resourceOptions.find(
					(resource) => resource.id == e.target.value
				).name;
			}
		}
	};

	const handleSelect = (event) => {
		// FIXME Del cambio de calquier tipo a mail el icono refresh no se mapea por lo que no puede pillar las referencia
		setSelectedOption(event.target.value);
	};

	useEffect(() => {
		if (nodeSelected) {
			const labelCurrent = labelDOM.current;
			const typeCurrent = resourceDOM.current;
			const lmsVisibilityCurrent = lmsVisibilityDOM.current;
			const sectionCurrent = sectionDOM.current;
			const orderCurrent = orderDOM.current;
			const indentCurrent = indentDOM.current;

			if (labelCurrent) {
				labelCurrent.value = nodeSelected.data.label;
			}

			if (typeCurrent) {
				typeCurrent.value = nodeSelected.type;
			}

			if (lmsVisibilityCurrent) {
				lmsVisibilityCurrent.value = nodeSelected.data.lmsVisibility;
			}

			if (sectionCurrent) {
				sectionCurrent.value = nodeSelected.data.section;
			}

			if (orderCurrent) {
				orderCurrent.value = nodeSelected.data.order + 1;
			}

			if (indentCurrent) {
				indentCurrent.value = nodeSelected.data.indent;
			}

			setSelectedOption(nodeSelected.type);
		}
	}, [nodeSelected]);

	/**
	 * Updates the selected block with the values from the specified DOM elements.
	 */
	const updateBlock = () => {
		if (nodeSelected.type != "fragment") {
			let type = resourceDOM.current.value;
			let newData;
			if (!ActionNodes.includes(nodeSelected.type)) {
				//if element node
				const newSection = Number(
					sectionDOM.current.value ? sectionDOM.current.value : 0
				); //FIXME: Only valid for moodle maybe?
				const originalSection = nodeSelected.data.section;

				const originalOrder = nodeSelected.data.order;
				const limitedOrder = Math.min(
					Math.max(orderDOM.current.value, 0),
					getLastPositionInSection(newSection, reactFlowInstance.getNodes()) + 1
				);
				let limitedindent = indentDOM.current.value;
				limitedindent = Math.min(Math.max(limitedindent, 0), 16);

				newData = {
					...nodeSelected.data,
					label: labelDOM.current.value,
					lmsResource: Number(lmsResourceDOM.current.value),
					lmsVisibility: lmsVisibilityDOM.current.value
						? lmsVisibilityDOM.current.value
						: "hidden_until_access",
					section: newSection,
					order: limitedOrder - 1,
					indent: limitedindent,
				};

				const updatedData = {
					...nodeSelected,
					id: nodeSelected.id,
					type: resourceDOM.current.value,
					data: newData,
				};

				const aNodeWithNewOrderExists = reactFlowInstance
					.getNodes()
					.filter((node) => {
						if (
							node.data.order == limitedOrder - 1 &&
							node.data.section == newSection
						) {
							return true;
						}
					});

				console.log(aNodeWithNewOrderExists, limitedOrder - 1);

				//if reordered
				if (
					(limitedOrder - 1 != originalOrder &&
						aNodeWithNewOrderExists.length > 0) ||
					originalSection != newSection
				) {
					console.log((originalSection, newSection));
					if (originalSection == newSection) {
						//Change in order
						const to = limitedOrder - 1;
						const from = originalOrder;
						const reorderedArray = reorderFromSection(
							newSection,
							from,
							to,
							reactFlowInstance.getNodes()
						);

						reactFlowInstance.setNodes([...reorderedArray, updatedData]);
					} else {
						//(Section change) Add to section AND then the order
						console.log("CAMBIO DE SECCIÓN");
						const virtualNodes = reactFlowInstance.getNodes();
						const forcedPos =
							getLastPositionInSection(newSection, virtualNodes) + 1;
						console.log(forcedPos);
						updatedData.data.order = forcedPos;
						virtualNodes.push(updatedData);
						if (!(limitedOrder - 1 > forcedPos)) {
							//If the desired position is inside the section
							const to = limitedOrder;
							const from = forcedPos;
							const reorderedArray = reorderFromSection(
								newSection,
								from,
								to,
								virtualNodes
							);
							reactFlowInstance.setNodes([...reorderedArray, updatedData]);
						} else {
							//If the desired position is outside the section
							reactFlowInstance.setNodes([...virtualNodes, updatedData]);
						}
					}
				} else {
					reactFlowInstance.setNodes(
						getUpdatedArrayById(updatedData, reactFlowInstance.getNodes())
					);
				}

				errorListCheck(updatedData, errorList, setErrorList, false);
			} else {
				console.log(nodeSelected);
				//if action node
				newData = {
					...nodeSelected.data,
					label: labelDOM.current.value,
					lmsResource:
						type !== "mail" ? Number(lmsResourceDOM.current.value) : type,
				};

				console.log(newData);

				const updatedData = {
					...nodeSelected,
					id: nodeSelected.id,
					type: resourceDOM.current.value,
					data: newData,
				};

				errorListCheck(updatedData, errorList, setErrorList, false);

				reactFlowInstance.setNodes(
					getUpdatedArrayById(updatedData, reactFlowInstance.getNodes())
				);

				errorListCheck(updatedData, errorList, setErrorList);
			}

			if (autoHideAside) {
				setExpandedAside(false);
			}
		} else {
			const newData = {
				...nodeSelected.data,
				label: labelDOM.current.value,
			};

			const updatedData = {
				...nodeSelected,
				id: nodeSelected.id,
				data: newData,
			};

			reactFlowInstance.setNodes(
				getUpdatedArrayById(updatedData, reactFlowInstance.getNodes())
			);
		}
	};

	/**
	 * Updates the selected map with the value from the specified DOM element.
	 */
	const updateMap = () => {
		setMapSelected((prevMap) => ({
			...prevMap,
			id: mapSelected.id,
			name: mapTitleDOM.current.value,
		}));
	};

	/**
	 * Updates the selected version with the value from the specified DOM element.
	 */
	const updateVersion = () => {
		setVersionJson((prevVersionJson) => ({
			...prevVersionJson,
			id: editVersionSelected.id,
			name: versionTitleDOM.current.value,
			lastUpdate: editVersionSelected.lastUpdate,
			default: editVersionSelected.default,
		}));
	};

	const getUsedResources = () => {
		const nodes = reactFlowInstance.getNodes();
		const usedResources = [];
		nodes.map((node) => {
			if (node.data.lmsResource != undefined) {
				usedResources.push(node.data.lmsResource);
			}
		});
		return usedResources;
	};

	return (
		<aside id="aside" className={`${className} ${styles.aside}`}>
			{/* TODO: FocusTrap this */}
			<div className={"text-center p-2"}>
				<div
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
						style={{ width: "100%" }}
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
					onSubmit={allowResourceSelection ? updateBlock : null}
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
												ActionNodes.includes(nodeSelected.type) ||
												nodeSelected.type == "fragment"
											)
										}
									></Form.Control>
								</Form.Group>
								{nodeSelected.type != "fragment" && (
									<Form.Group className="mb-3">
										<Form.Label htmlFor={typeDOMId} className="mb-1">
											{ActionNodes.includes(nodeSelected.type)
												? "Acción a realizar"
												: "Tipo de recurso"}
										</Form.Label>
										<Form.Select
											ref={resourceDOM}
											id={typeDOMId}
											className="w-100"
											defaultValue={selectedOption}
											onChange={handleSelect}
										>
											{platform == "moodle"
												? moodleResource.map((option) => {
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
												: sakaiResource.map((option) => {
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
														Recurso en el LMS
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
																platform
															)}. Para crear un elemento nuevo en ${capitalizeFirstLetter(
																platform
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
											disabled={!resourceOptions.length > 0}
											onChange={syncLabel}
										>
											{allowResourceSelection && (
												<>
													<option key="-1" hidden value>
														{"Esperando recursos..."}
													</option>
													{resourceOptions.map((resource) => (
														<option key={resource.id} value={resource.id}>
															{resource.bettername != undefined
																? resource.bettername
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
									<Form.Group className="mb-2">
										<Form.Label htmlFor={lmsVisibilityDOMId}>
											Visibilidad
										</Form.Label>
										<Form.Select
											ref={lmsVisibilityDOM}
											id={lmsVisibilityDOMId}
											defaultValue={nodeSelected.data.lmsVisibility}
										>
											{orderByPropertyAlphabetically(shownTypes, "name").map(
												(option) => (
													<option key={option.value} value={option.value}>
														{option.name}
													</option>
												)
											)}
											{/*<option>Ocultar hasta tener acceso</option>
											<option>Mostrar siempre sin acceso</option>*/}
										</Form.Select>
									</Form.Group>

									<>
										<Form.Group className="mb-2">
											<Form.Label htmlFor={orderDOMId}>Sección</Form.Label>
											<Form.Select
												ref={sectionDOM}
												id={sectionDOMId}
												defaultValue={nodeSelected.data.section}
											>
												{metaData.sections &&
													orderByPropertyAlphabetically(
														[...metaData.sections].map((section) => {
															if (!section.name.match(/^\d/)) {
																section.name =
																	platform == "moodle"
																		? section.position + "- " + section.name
																		: section.position +
																		  1 +
																		  "- " +
																		  section.name;
																section.value = section.position + 1;
															}
															return section;
														}),
														"name"
													).map((section) => (
														<option key={section.id} value={section.position}>
															{section.name}
														</option>
													))}
											</Form.Select>
										</Form.Group>
										<Form.Group className="mb-2">
											<Form.Label htmlFor={orderDOMId}>
												Posición en la sección
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
				<div className="container-fluid">
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
							]}
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
				</div>
			) : (
				<></>
			)}

			{editVersionSelected ? (
				<div className="container-fluid">
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
				</div>
			) : (
				<></>
			)}
		</aside>
	);
}
