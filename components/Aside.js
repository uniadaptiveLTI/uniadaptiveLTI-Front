import styles from "@components/styles/Aside.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faCaretDown,
	faCaretUp,
	faRotateRight,
	faCompress,
} from "@fortawesome/free-solid-svg-icons";
import { useReactFlow } from "reactflow";
import { Container, Button, Form, Spinner } from "react-bootstrap";
import Qualification from "./flow/conditions/Qualification.js";
import { useState, useContext, useEffect, useRef, useId, version } from "react";
import {
	PlatformContext,
	BlockInfoContext,
	ExpandedAsideContext,
	MapInfoContext,
	VersionInfoContext,
	VersionJsonContext,
	SettingsContext,
	BlocksDataContext,
} from "../pages/_app.js";
import { getUpdatedArrayById, orderByPropertyAlphabetically } from "./Utils.js";
import { ActionBlocks } from "./flow/nodes/ActionNode.js";
import { getMoodleTypes, getSakaiTypes } from "./flow/nodes/TypeDefinitions.js";

export default function Aside({ className, closeBtn, svgExists }) {
	const [expandedContent, setExpandedContent] = useState(true);
	const [expandedAttr, setExpandedAttr] = useState(true);
	const [expandedInteract, setExpandedInteract] = useState(true);
	const [expandedRelations, setExpandedRelations] = useState(true);
	const [expandedCondition, setExpandedCondition] = useState(false);

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

	const parsedSettings = JSON.parse(settings);
	let { reducedAnimations, autoHideAside } = parsedSettings;

	//References
	const titleDOM = useRef(null);
	const optionsDOM = useRef(null);
	const typeDOM = useRef(null);
	const lmsResourceDOM = useRef(null);
	const mapTitleDOM = useRef(null);
	const versionTitleDOM = useRef(null);
	const refreshIconDOM = useRef(null);
	//IDs
	const titleID = useId();
	const optionsID = useId();
	const lmsResourceId = useId();
	const contentID = useId();
	//TODO: Add the rest

	const [secondOptions, setSecondOptions] = useState([]);
	const { versionJson, setVersionJson } = useContext(VersionJsonContext);
	const reactFlowInstance = useReactFlow();

	const { expandedAside, setExpandedAside } = useContext(ExpandedAsideContext);

	const validTypes = ["badge", "mail", "addgroup", "remgroup"];

	const moodleResource = orderByPropertyAlphabetically(
		getMoodleTypes(),
		"name"
	);
	const sakaiResource = orderByPropertyAlphabetically(getSakaiTypes(), "name");

	useEffect(() => {
		switch (selectedOption) {
			case "quiz":
				setSecondOptions([
					{ id: 0, name: "Cuestionario 1" },
					{ id: 1, name: "Cuestionario 2" },
					{ id: 2, name: "Cuestionario 3" },
				]);
				break;
			case "assign":
				setSecondOptions([
					{ id: 3, name: "Tarea 1" },
					{ id: 4, name: "Tarea 2" },
					{ id: 5, name: "Tarea 3" },
				]);
				break;
			case "workshop":
				setSecondOptions([
					{ id: 6, name: "Taller 1" },
					{ id: 7, name: "Taller 2" },
					{ id: 8, name: "Taller 3" },
				]);
				break;
			case "choice":
				setSecondOptions([
					{ id: 9, name: "Consulta 1" },
					{ id: 10, name: "Consulta 2" },
					{ id: 11, name: "Consulta 3" },
				]);
				break;
			case "forum":
				setSecondOptions([
					{ id: 12, name: "Foro 1" },
					{ id: 13, name: "Foro 2" },
					{ id: 14, name: "Foro 3" },
				]);
				break;
			case "resource":
				setSecondOptions([
					{ id: 15, name: "Archivo 1" },
					{ id: 16, name: "Archivo 2" },
					{ id: 17, name: "Archivo 3" },
				]);
				break;
			case "folder":
				setSecondOptions([
					{ id: 18, name: "Carpeta 1" },
					{ id: 19, name: "Carpeta 2" },
					{ id: 20, name: "Carpeta 3" },
				]);
				break;
			case "label":
				setSecondOptions([
					{ id: 21, name: "Etiqueta 1" },
					{ id: 22, name: "Etiqueta 2" },
					{ id: 23, name: "Etiqueta 3" },
				]);
				break;
			case "page":
				setSecondOptions([
					{ id: 24, name: "Página 1" },
					{ id: 25, name: "Página 2" },
					{ id: 26, name: "Página 3" },
				]);
				break;
			case "url":
				setSecondOptions([
					{ id: 27, name: "Url 1" },
					{ id: 28, name: "Url 2" },
					{ id: 29, name: "Url 3" },
				]);
				break;
			case "badge":
				setSecondOptions([
					{ id: 30, name: "Medalla 1" },
					{ id: 31, name: "Medalla 2" },
					{ id: 32, name: "Medalla 3" },
				]);
				break;
			case "addgroup":
				setSecondOptions([
					{ id: "group-1", name: "Grupo A" },
					{ id: "group-2", name: "Grupo B" },
					{ id: "group-3", name: "Grupo C" },
					{ id: "group-4", name: "Grupo D" },
					{ id: "group-5", name: "Grupo E" },
					{ id: "group-6", name: "Grupo F" },
					{ id: "group-7", name: "Grupo G" },
				]);
				break;
			case "remgroup":
				setSecondOptions([
					{ id: "group-1", name: "Grupo A" },
					{ id: "group-2", name: "Grupo B" },
					{ id: "group-3", name: "Grupo C" },
					{ id: "group-4", name: "Grupo D" },
					{ id: "group-5", name: "Grupo E" },
					{ id: "group-6", name: "Grupo F" },
					{ id: "group-7", name: "Grupo G" },
				]);
				break;
			case "generic":
				setSecondOptions([{ id: 0, name: "Genérico" }]);
				break;
			default:
				setSecondOptions([]);
				break;
		}
	}, [selectedOption]);

	useEffect(() => {
		if (secondOptions.length > 0) {
			const lmsResourceCurrent = lmsResourceDOM.current;
			if (lmsResourceCurrent) {
				lmsResourceCurrent.value = blockSelected.data.lmsResource;
			}
			setLmsResource(blockSelected.data.lmsResource);
		}
	}, [secondOptions]);

	const handleSelect = (event) => {
		let input = lmsResourceDOM.current;

		if (selectedOption !== "mail") {
			setShowSpinner(true);
			setSelectedOption(event.target.value);
			setAllowResourceSelection(false);

			let refresh = refreshIconDOM.current;
			refresh.classList.add("d-none");
			input.disabled = true;

			setTimeout(() => {
				refresh.classList.remove("d-none");
				input.disabled = false;
				setShowSpinner(false);
				setAllowResourceSelection(true);
			}, 2000);
		} else {
			setSelectedOption(event.target.value);
		}
	};

	/*useEffect(() => {
		alert("AUGH");
		if (blockSelected) {
			alert("AUGH");
			let newBlock = currentBlocksData.find(
				(block) => block.id == blockSelected.id
			);
			if (newBlock) {
				setBlockSelected(newBlock);
			}
		}
	}, [reactFlowInstance]);*/

	useEffect(() => {
		console.log(blockSelected);
		if (blockSelected) {
			const titleCurrent = titleDOM.current;
			const typeCurrent = typeDOM.current;

			if (titleCurrent) {
				titleCurrent.value = blockSelected.data.label;
			}

			if (typeCurrent) {
				typeCurrent.value = blockSelected.type;
			}

			setSelectedOption(blockSelected.type);
		}
	}, [blockSelected]);

	/**
	 * Updates the selected block with the values from the specified DOM elements.
	 */
	const updateBlock = () => {
		console.log(blockSelected.type);

		const updatedData = {
			...blockSelected,
			id: blockSelected.id,
			type: typeDOM.current.value,
			data: {
				label: titleDOM.current.value,
				lmsResource: lmsResourceDOM.current.value,
			},
		};

		if (!validTypes.includes(blockSelected.type)) {
			updatedData.data = {
				...updatedData.data,
				...blockSelected.data,
			};
		}

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

	return (
		//TODO: ADD AN OPTION TO EDIT DATA.UNIT AND DATA.ORDER OF A BLOCK
		<aside className={`${className} ${styles.aside}`}>
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
									<Form.Label htmlFor={titleID} className="mb-1">
										Nombre del contenido
									</Form.Label>
									<Form.Control
										ref={titleDOM}
										id={titleID}
										type="text"
										className="w-100"
									></Form.Control>
								</Form.Group>
								<Form.Group className="mb-3">
									<Form.Label htmlFor={contentID} className="mb-1">
										{ActionBlocks.includes(blockSelected.type)
											? "Acción a realizar"
											: "Tipo de contenido"}
									</Form.Label>
									<Form.Select
										ref={typeDOM}
										id={contentID}
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
											: sakaiResource.map((option) => {
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

								{blockSelected.type != "fragment" &&
								blockSelected.type !== "mail" &&
								selectedOption !== "mail" ? (
									<div className="mb-3">
										<div className="d-flex gap-2">
											<Form.Label htmlFor={lmsResourceId} className="mb-1">
												Recurso en el LMS
											</Form.Label>
											<div className="d-flex">
												<div ref={refreshIconDOM} id="refresh-icon">
													<FontAwesomeIcon icon={faRotateRight} />
												</div>
												<div>
													{showSpinner && (
														<Spinner animation="border" role="status" size="sm">
															<span className="visually-hidden">
																Loading...
															</span>
														</Spinner>
													)}
												</div>
											</div>
										</div>
										<Form.Select
											ref={lmsResourceDOM}
											id={lmsResourceId}
											className="w-100"
											defaultValue={lmsResource}
										>
											{allowResourceSelection &&
												secondOptions.map((option) => (
													<option key={option.id} value={option.id}>
														{option.name}
													</option>
												))}
										</Form.Select>
									</div>
								) : (
									<></>
								)}
							</div>
						</Form.Group>

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
								<Form.Group>
									<Form.Label className="mb-1">Visibilidad</Form.Label>
									<Form.Select>
										<option>Ocultar hasta tener acceso</option>
										<option>Mostrar siempre sin acceso</option>
									</Form.Select>
								</Form.Group>
							</div>
						</div>

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
