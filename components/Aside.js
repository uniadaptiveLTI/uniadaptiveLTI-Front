import styles from "@components/styles/Aside.module.css";
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
	BlockInfoContext,
	ExpandedAsideContext,
	MapInfoContext,
	VersionInfoContext,
	VersionJsonContext,
	SettingsContext,
	BlocksDataContext,
	MetaDataContext,
} from "../pages/_app.js";
import {
	capitalizeFirstLetter,
	getUpdatedArrayById,
	orderByPropertyAlphabetically,
	errorListCheck,
} from "./Utils.js";
import { ActionBlocks } from "./flow/nodes/ActionNode.js";
import {
	NodeTypes,
	getMoodleTypes,
	getSakaiTypes,
} from "./flow/nodes/TypeDefinitions.js";

export default function Aside({ className, closeBtn, svgExists }) {
	const { errorList, setErrorList } = useContext(ErrorListContext);

	const shownTypes = [
		{ value: "show_unconditionally", name: "Mostrar siempre sin acceso" },
		{ value: "hidden_until_access", name: "Ocultar hasta tener acceso" },
	];
	const [expandedContent, setExpandedContent] = useState(true);
	const [expandedInteract, setExpandedInteract] = useState(true);

	const [selectedOption, setSelectedOption] = useState("");
	const [lmsResource, setLmsResource] = useState("");
	const [showSpinner, setShowSpinner] = useState(false);
	const [allowResourceSelection, setAllowResourceSelection] = useState(true);

	const { platform, setPlatform } = useContext(PlatformContext);
	const { blockSelected, setBlockSelected } = useContext(BlockInfoContext);
	const { mapSelected, setMapSelected } = useContext(MapInfoContext);
	const { selectedEditVersion, setSelectedEditVersion } =
		useContext(VersionInfoContext);
	const { settings, setSettings } = useContext(SettingsContext);
	const { metaData, setMetaData } = useContext(MetaDataContext);

	const parsedSettings = JSON.parse(settings);
	let { reducedAnimations, autoHideAside } = parsedSettings;

	//References
	const titleDOM = useRef(null);
	const optionsDOM = useRef(null);
	const resourceDOM = useRef(null);
	const lmsResourceDOM = useRef(null);
	const mapTitleDOM = useRef(null);
	const versionTitleDOM = useRef(null);
	const refreshIconDOM = useRef(null);
	const lmsVisibilityDOM = useRef(null);
	const unitDOM = useRef(null);
	const orderDOM = useRef(null);
	const identationDOM = useRef(null);
	//IDs
	const titleDOMId = useId();
	const optionsID = useId();
	const lmsResourceDOMId = useId();
	const typeDOMId = useId();
	const unitDOMId = useId();
	const lmsVisibilityDOMId = useId();
	const orderDOMId = useId();
	const identationDOMId = useId();
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

	const fetchData = async (selectedOption, course) => {
		try {
			const encodedSelectedOption = encodeURIComponent(selectedOption);
			const encodedCourse = encodeURIComponent(course);

			setShowSpinner(true);
			setAllowResourceSelection(false);
			const response = await fetch(
				`http://${process.env.BACK_URL}/lti/get_modules_by_type?type=${encodedSelectedOption}&course=${encodedCourse}`
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
		const metaData = JSON.parse(localStorage.getItem("meta_data"));
		switch (selectedOption) {
			case "generic":
				setResourceOptions([{ id: 0, name: "Genérico" }]);
				break;
			default:
				//FIXME: No sucede
				if (!selectedOption) {
					setResourceOptions([]);
				} else {
					if (process.env.DEV_FILES) {
						setResourceOptions([]);
						setTimeout(() => {
							const data = [
								{
									id: 0,
									name: `${capitalizeFirstLetter(
										NodeTypes.filter((node) => node.type == selectedOption)[0]
											.name
									)} A`,
								},
								{
									id: 1,
									name: `${capitalizeFirstLetter(
										NodeTypes.filter((node) => node.type == selectedOption)[0]
											.name
									)} B`,
								},
								{
									id: 2,
									name: `${capitalizeFirstLetter(
										NodeTypes.filter((node) => node.type == selectedOption)[0]
											.name
									)} C`,
								},
								{
									id: 3,
									name: `${capitalizeFirstLetter(
										NodeTypes.filter((node) => node.type == selectedOption)[0]
											.name
									)} D`,
								},
							];
							const filteredData = [];
							data.forEach((resource) => {
								if (!getUsedResources().includes(resource.id)) {
									filteredData.push(resource);
								}
							});

							if (blockSelected.data) {
								console.log("tiene datos");
								if (blockSelected.data.lmsResource) {
									console.log("tiene recurso");
									if (blockSelected.data.lmsResource > -1) {
										const lmsRes = blockSelected.data.lmsResource;
										console.log("tiene recurso y es " + lmsRes);
										const storedRes = data.find(
											(resource) => resource.id == lmsRes
										);
										console.log(
											"el recurso que concuerda con el almacenado es " +
												storedRes
										);

										if (storedRes) {
											filteredData.push(storedRes);
										}
									}
								}
							}

							console.log(filteredData);
							setResourceOptions(filteredData);
						}, 1000);
					} else {
						fetchData(selectedOption, metaData.course_id).then((data) => {
							const filteredData = [];
							data.forEach((resource) => {
								if (!getUsedResources().includes(resource.id)) {
									filteredData.push(resource);
								}
							});
							if (blockSelected.data) {
								if (blockSelected.data.lmsResource) {
									if (blockSelected.data.lmsResource > -1) {
										const lmsRes = blockSelected.data.lmsResource;
										const storedRes = data.find(
											(resource) => resource.id == lmsRes
										);
										console.log(storedRes, lmsRes);

										if (storedRes) {
											filteredData.push(storedRes);
										}
									}
								}
							}
							setResourceOptions(filteredData);
						});
					}
				}

				break;
		}
	}, [selectedOption, blockSelected.id]);

	useEffect(() => {
		if (resourceOptions.length > 0) {
			const lmsResourceCurrent = lmsResourceDOM.current;
			if (lmsResourceCurrent) {
				lmsResourceCurrent.value = blockSelected.data.lmsResource;
			}
			setLmsResource(blockSelected.data.lmsResource);
		}
	}, [resourceOptions]);

	const handleSelect = (event) => {
		// FIXME Del cambio de calquier tipo a mail el icono refresh no se mapea por lo que no puede pillar las referencia
		setSelectedOption(event.target.value);
	};

	useEffect(() => {
		//console.log(blockSelected);
		if (blockSelected) {
			const titleCurrent = titleDOM.current;
			const typeCurrent = resourceDOM.current;
			const lmsVisibilityCurrent = lmsVisibilityDOM.current;
			const lmsResourceCurrent = lmsResourceDOM.current;
			const unitCurrent = unitDOM.current;
			const orderCurrent = orderDOM.current;
			const identationCurrent = identationDOM.current;

			if (titleCurrent) {
				titleCurrent.value = blockSelected.data.label;
			}

			if (typeCurrent) {
				typeCurrent.value = blockSelected.type;
			}

			if (lmsResourceCurrent) {
				lmsResourceCurrent.value = blockSelected.data.lmsResource;
			}

			if (lmsVisibilityCurrent) {
				lmsVisibilityCurrent.value = blockSelected.data.lmsVisibility;
			}

			if (unitCurrent) {
				unitCurrent.value = blockSelected.data.unit;
			}

			if (orderCurrent) {
				orderCurrent.value = blockSelected.data.order;
			}

			if (identationCurrent) {
				identationCurrent.value = blockSelected.data.identation;
			}

			setSelectedOption(blockSelected.type);
		}
	}, [blockSelected]);

	/**
	 * Updates the selected block with the values from the specified DOM elements.
	 */
	const updateBlock = () => {
		let type = resourceDOM.current.value;
		let newData;

		if (!ActionBlocks.includes(blockSelected.type)) {
			let limitedOrder = orderDOM.current.value;
			limitedOrder = Math.min(Math.max(limitedOrder, 1), 999);
			let limitedIdentation = identationDOM.current.value;
			limitedIdentation = Math.min(Math.max(limitedIdentation, 0), 999);

			newData = {
				...blockSelected.data,
				label: titleDOM.current.value,
				lmsResource: lmsResourceDOM.current.value,
				lmsVisibility: lmsVisibilityDOM.current.value,
				unit: unitDOM.current.value,
				order: limitedOrder - 1,
				identation: limitedIdentation,
			};
		} else {
			newData = {
				label: titleDOM.current.value,
				lmsResource: type !== "mail" ? lmsResourceDOM.current.value : type,
			};
		}

		//console.log(newData);

		const updatedData = {
			...blockSelected,
			id: blockSelected.id,
			type: resourceDOM.current.value,
			data: newData,
		};

		errorListCheck(updatedData, errorList, setErrorList, true);

		//console.log(updatedData, blockSelected);

		reactFlowInstance.setNodes(
			getUpdatedArrayById(updatedData, reactFlowInstance.getNodes())
		);

		if (autoHideAside) {
			setExpandedAside(false);
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
			id: selectedEditVersion.id,
			name: versionTitleDOM.current.value,
			lastUpdate: selectedEditVersion.lastUpdate,
			default: selectedEditVersion.default,
		}));
	};

	const getUsedResources = () => {
		const nodes = reactFlowInstance.getNodes();
		const usedResources = [];
		nodes.map((node) => {
			if (node.data.lmsResource) {
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
						src={process.env.LOGO_PATH}
						style={{ width: "100%" }}
					/>
					<span className={styles.collapse + " display-6"}>
						<FontAwesomeIcon width={38} height={38} icon={faCompress} />
					</span>
				</div>
				<hr />
				<div id={mapSelected?.id}></div>
			</div>

			{blockSelected &&
			!(blockSelected.type == "start" || blockSelected.type == "end") ? (
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
									<Form.Label htmlFor={titleDOMId} className="mb-1">
										Nombre del{" "}
										{blockSelected.type == "fragment" ? "fragmento" : "bloque"}
									</Form.Label>
									<Form.Control
										ref={titleDOM}
										id={titleDOMId}
										type="text"
										className="w-100"
									></Form.Control>
								</Form.Group>
								{blockSelected.type != "fragment" && (
									<Form.Group className="mb-3">
										<Form.Label htmlFor={typeDOMId} className="mb-1">
											{ActionBlocks.includes(blockSelected.type)
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
															(ActionBlocks.includes(blockSelected.type) &&
																option.nodeType == "ActionNode") ||
															(!ActionBlocks.includes(blockSelected.type) &&
																option.nodeType == "ElementNode")
														) {
															return (
																<option key={option.id} value={option.value}>
																	{option.name}
																</option>
															);
														}
												  })
												: sakaiResource((option) => {
														if (
															(ActionBlocks.includes(blockSelected.type) &&
																option.nodeType == "ActionNode") ||
															(!ActionBlocks.includes(blockSelected.type) &&
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
									blockSelected.type == "fragment" ||
									blockSelected.type == "mail" ||
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
											disabled={!resourceOptions}
										>
											{allowResourceSelection && (
												<>
													<option key="-1" hidden value>
														{"Vacío"}
													</option>
													{resourceOptions.map((resource) => (
														<option key={resource.id} value={resource.id}>
															{resource.name}
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
							ActionBlocks.includes(blockSelected.type) ||
							blockSelected.type == "fragment"
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
											defaultValue={blockSelected.data.lmsVisibility}
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
											<Form.Label htmlFor={orderDOMId}>Unidad</Form.Label>
											<Form.Select
												ref={unitDOM}
												id={unitDOMId}
												defaultValue={blockSelected.data.unit}
											>
												{metaData.units &&
													orderByPropertyAlphabetically(
														[...metaData.units].map((unit) => {
															if (!unit.name.match(/^\d/)) {
																unit.name =
																	platform == "moodle"
																		? unit.position + "- " + unit.name
																		: unit.position + 1 + "- " + unit.name;
																unit.value = unit.position + 1;
															}
															return unit;
														}),
														"name"
													).map((unit) => (
														<option key={unit.id} value={unit.position}>
															{unit.name}
														</option>
													))}
											</Form.Select>
										</Form.Group>
										<Form.Group className="mb-2">
											<Form.Label htmlFor={orderDOMId}>
												Posición en la unidad
											</Form.Label>
											<Form.Control
												type="number"
												min={1}
												max={999}
												defaultValue={blockSelected.data.order}
												ref={orderDOM}
												id={orderDOMId}
											></Form.Control>
										</Form.Group>
										<Form.Group className="mb-2">
											<Form.Label htmlFor={identationDOMId}>
												Identación en la unidad
											</Form.Label>
											<Form.Control
												type="number"
												min={0}
												max={999}
												defaultValue={blockSelected.data.identation}
												ref={identationDOM}
												id={identationDOMId}
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

			{mapSelected && !(blockSelected || selectedEditVersion) ? (
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

			{selectedEditVersion ? (
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
									defaultValue={selectedEditVersion.name}
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
