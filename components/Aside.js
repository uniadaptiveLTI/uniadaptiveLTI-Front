import styles from "@components/styles/Aside.module.css";
import {
	CaretDownFill,
	CaretUpFill,
	ArrowClockwise,
	ArrowBarLeft,
} from "react-bootstrap-icons";
import { Container, Button, Form, Spinner } from "react-bootstrap";
import { useState, useContext, useEffect, useRef } from "react";
import {
	PlatformContext,
	BlockInfoContext,
	BlockJsonContext,
	ExpandedContext,
	ItineraryInfoContext,
	VersionInfoContext,
	MapContext,
	VersionJsonContext,
	SettingsContext,
} from "../pages/_app.js";

export default function Aside({ className, closeBtn }) {
	const [expandedContent, setExpandedContent] = useState(true);
	const [expandedAttr, setExpandedAttr] = useState(true);
	const [expandedInteract, setExpandedInteract] = useState(true);
	const [expandedCondition, setExpandedCondition] = useState(true);

	const [selectedOption, setSelectedOption] = useState("");
	const [showSpinner, setShowSpinner] = useState(false);
	const [allowResourceSelection, setAllowResourceSelection] = useState(true);

	const { platform, setPlatform } = useContext(PlatformContext);
	const { blockSelected, setBlockSelected } = useContext(BlockInfoContext);
	const { itinerarySelected, setItinerarySelected } =
		useContext(ItineraryInfoContext);
	const { selectedEditVersion, setSelectedEditVersion } =
		useContext(VersionInfoContext);
	const { settings, setSettings } = useContext(SettingsContext);

	const parsedSettings = JSON.parse(settings);
	let { reducedAnimations } = parsedSettings;

	//Referencias
	const titleDOM = useRef(null);
	const optionsDOM = useRef(null);
	const contentDOM = useRef(null);
	const itineraryTitleDOM = useRef(null);
	const versionTitleDOM = useRef(null);
	const refreshIconDOM = useRef(null);

	const [secondOptions, setSecondOptions] = useState([]);
	const { blockJson, setBlockJson } = useContext(BlockJsonContext);
	const { versionJson, setVersionJson } = useContext(VersionJsonContext);
	const { map, setMap } = useContext(MapContext);

	const { expanded, setExpanded } = useContext(ExpandedContext);

	const [moodleResource, setMoodleResource] = useState([
		{ id: 0, value: "questionnaire", name: "Cuestionario", default: "true" },
		{ id: 1, value: "assignment", name: "Tarea", default: "true" },
		{ id: 3, value: "workshop", name: "Taller", default: "true" },
		{ id: 4, value: "inquery", name: "Consulta", default: "true" },
		{ id: 5, value: "forum", name: "Foro", default: "true" },
		{ id: 6, value: "file", name: "Archivo", default: "true" },
		{ id: 7, value: "folder", name: "Carpeta", default: "true" },
		{ id: 8, value: "tag", name: "Etiqueta", default: "true" },
		{ id: 9, value: "page", name: "Página", default: "true" },
		{ id: 10, value: "url", name: "URL", default: "true" },
		{ id: 11, value: "badge", name: "Medalla", default: "true" },
		//{ id: 12, value: "fragment", name: "Fragmento", default: "true" },
	]);

	const [sakaiResource, setSakaiResource] = useState([
		{ id: 0, value: "questionnaire", name: "Exámenes", default: "true" },
		{ id: 1, value: "assignment", name: "Tareas", default: "true" },
		{ id: 3, value: "forum", name: "Foro", default: "true" },
		{ id: 4, value: "resources", name: "Recursos", default: "true" },
		{ id: 5, value: "file", name: "Archivo", default: "true" },
		{ id: 6, value: "folder", name: "Carpeta", default: "true" },
		{ id: 7, value: "url", name: "URL", default: "true" },
		{ id: 8, value: "page", name: "Página", default: "true" },
		{
			id: 9,
			value: "file",
			name: "Documento de texto simple",
			default: "true",
		},
		{ id: 10, value: "html-page", name: "Página HTML", default: "true" },
		//{ id: 11, value: "fragment", name: "Fragmento", default: "true" },
	]);

	useEffect(() => {
		switch (selectedOption) {
			case "questionnaire":
				setSecondOptions([
					{ id: 0, name: "Cuestionario 1" },
					{ id: 1, name: "Cuestionario 2" },
					{ id: 2, name: "Cuestionario 3" },
				]);
				break;
			case "assignment":
				setSecondOptions([
					{ id: 0, name: "Tarea 1" },
					{ id: 1, name: "Tarea 2" },
					{ id: 2, name: "Tarea 3" },
				]);
				break;
			case "workshop":
				setSecondOptions([
					{ id: 0, name: "Taller 1" },
					{ id: 1, name: "Taller 2" },
					{ id: 2, name: "Taller 3" },
				]);
				break;
			case "consultation":
				setSecondOptions([
					{ id: 0, name: "Consulta 1" },
					{ id: 1, name: "Consulta 2" },
					{ id: 2, name: "Consulta 3" },
				]);
				break;
			case "forum":
				setSecondOptions([
					{ id: 0, name: "Foro 1" },
					{ id: 1, name: "Foro 2" },
					{ id: 2, name: "Foro 3" },
				]);
				break;
			case "file":
				setSecondOptions([
					{ id: 0, name: "Archivo 1" },
					{ id: 1, name: "Archivo 2" },
					{ id: 2, name: "Archivo 3" },
				]);
				break;
			case "folder":
				setSecondOptions([
					{ id: 0, name: "Carpeta 1" },
					{ id: 1, name: "Carpeta 2" },
					{ id: 2, name: "Carpeta 3" },
				]);
				break;
			case "tag":
				setSecondOptions([
					{ id: 0, name: "Etiqueta 1" },
					{ id: 1, name: "Etiqueta 2" },
					{ id: 2, name: "Etiqueta 3" },
				]);
				break;
			case "page":
				setSecondOptions([
					{ id: 0, name: "Página 1" },
					{ id: 1, name: "Página 2" },
					{ id: 2, name: "Página 3" },
				]);
				break;
			case "url":
				setSecondOptions([
					{ id: 0, name: "Url 1" },
					{ id: 1, name: "Url 2" },
					{ id: 2, name: "Url 3" },
				]);
				break;
			case "badge":
				setSecondOptions([
					{ id: 0, name: "Medalla 1" },
					{ id: 1, name: "Medalla 2" },
					{ id: 2, name: "Medalla 3" },
				]);
				break;
			default:
				setSecondOptions([]);
				break;
		}
	}, [selectedOption]);

	const handleSelect = (event) => {
		setShowSpinner(true);

		let input = optionsDOM.current;
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
	};

	useEffect(() => {
		setSelectedOption(blockSelected.type);
		const title = titleDOM.current;
		if (title) {
			title.value = blockSelected.title;
		}
	}, [blockSelected]);

	useEffect(() => {
		const titleItinerary = itineraryTitleDOM.current;
		if (titleItinerary) {
			titleItinerary.value = itinerarySelected.name;
		}
	}, [itinerarySelected]);

	useEffect(() => {
		const titleVersion = versionTitleDOM.current;
		if (titleVersion) {
			titleVersion.value = selectedEditVersion.name;
		}
	}, [selectedEditVersion]);

	/**
	 * Updates the selected block with the values from the specified DOM elements.
	 */
	const updateBlock = () => {
		setBlockJson({
			id: blockSelected.id,
			x: blockSelected.x,
			y: blockSelected.y,
			type: contentDOM.current.value,
			title: titleDOM.current.value,
			resource: optionsDOM.current.value,
			children: blockSelected.children,
			identation: blockSelected.identation,
		});
	};

	/**
	 * Updates the selected itinerary with the value from the specified DOM element.
	 */
	const updateItinerary = () => {
		setMap((prevMap) => ({
			...prevMap,
			id: itinerarySelected.id,
			name: document.getElementById("itinerary-title").value,
		}));
	};

	/**
	 * Updates the selected version with the value from the specified DOM element.
	 */
	const updateVersion = () => {
		setVersionJson((prevVersionJson) => ({
			...prevVersionJson,
			name: document.getElementById("version-title").value,
			lastUpdate: selectedEditVersion.lastUpdate,
			default: selectedEditVersion.default,
		}));
	};

	/**
	 * Collapses the side panel.
	 */
	function collapseAside() {
		setExpanded(false);
	}

	return (
		<aside className={`${className} ${styles.aside}`}>
			<div className={"text-center p-2"}>
				<div
					role="button"
					onClick={() => setExpanded(false)}
					className={
						styles.uniadaptive + " " + (reducedAnimations && styles.noAnimation)
					}
					style={{ transition: "all 0.5s ease" }}
					tabIndex={0}
				>
					<h1 className="display-5">UNI Adaptive</h1>
					<p className="display-6">Prototipo de Interfaz</p>
					<span className={styles.collapse + " display-6"}>
						<ArrowBarLeft width={38} height={38} />
					</span>
				</div>
				<hr />
				<div id={itinerarySelected.id}></div>
			</div>

			{blockSelected &&
			!(blockSelected.type == "start" || blockSelected.type == "end") ? (
				<Form method="post" action="/test">
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
										{!expandedContent ? <CaretUpFill /> : <CaretDownFill />}
									</div>
								</div>
							</div>
							<div
								style={{
									opacity: expandedContent ? "1" : "0",
									visibility: expandedContent ? "visible" : "hidden",
									maxHeight: expandedContent ? "" : "0",
									transition: "all .2s",
								}}
							>
								<Form.Group className="mb-3">
									<Form.Label className="mb-1">Nombre del contenido</Form.Label>
									<Form.Control
										ref={titleDOM}
										id="title"
										type="text"
										className="w-100"
									></Form.Control>
								</Form.Group>
								<Form.Group className="mb-3">
									<Form.Label htmlFor="content" className="mb-1">
										Tipo de contenido
									</Form.Label>
									<Form.Select
										ref={contentDOM}
										id="content"
										className="w-100"
										value={selectedOption}
										onChange={handleSelect}
									>
										{platform == "moodle"
											? moodleResource.map((option) => (
													<option key={option.id} value={option.value}>
														{option.name}
													</option>
											  ))
											: sakaiResource.map((option) => (
													<option key={option.id} value={option.value}>
														{option.name}
													</option>
											  ))}
									</Form.Select>
								</Form.Group>

								{blockSelected.type != "fragment" ? (
									<div className="mb-3">
										<div className="d-flex gap-2">
											<div className="mb-1">Recurso en el LMS</div>
											<div className="d-flex">
												<div ref={refreshIconDOM} id="refresh-icon">
													<ArrowClockwise></ArrowClockwise>
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
											ref={optionsDOM}
											id="options"
											className="w-100"
										>
											{allowResourceSelection &&
												secondOptions.map((option) => (
													<option key={option.id} value={option.name}>
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
								onClick={() => setExpandedAttr(!expandedAttr)}
							>
								<div className="fw-bold">Atributos</div>
								<div>
									<div role="button">
										{!expandedAttr ? <CaretUpFill /> : <CaretDownFill />}
									</div>
								</div>
							</div>

							<div
								style={{
									opacity: expandedAttr ? "1" : "0",
									visibility: expandedAttr ? "visible" : "hidden",
									maxHeight: expandedAttr ? "" : "0",
									transition: "all .2s",
								}}
								className="mb-3"
							>
								<Form.Group>
									<Form.Label htmlFor="mandatory" className="mb-1">
										Bloque obligatorio
									</Form.Label>
									<Form.Select id="mandatory" className="w-100">
										<option>Si</option>
										<option>No</option>
									</Form.Select>
								</Form.Group>
							</div>
						</div>

						<div className="mb-2">
							<div
								className="d-flex gap-2"
								role="button"
								onClick={() => setExpandedInteract(!expandedInteract)}
							>
								<div className="fw-bold">Interacción</div>
								<div>
									<div role="button">
										{!expandedInteract ? <CaretUpFill /> : <CaretDownFill />}
									</div>
								</div>
							</div>

							<div
								style={{
									opacity: expandedInteract ? "1" : "0",
									visibility: expandedInteract ? "visible" : "hidden",
									maxHeight: expandedInteract ? "" : "0",
									transition: "all .2s",
								}}
								className="mb-3"
							>
								<Form.Group>
									<Form.Label className="mb-1">Visibilidad</Form.Label>
									<Form.Select>
										<option>Si</option>
										<option>No</option>
									</Form.Select>
								</Form.Group>
							</div>
						</div>

						<div className="mb-2">
							<div
								className="d-flex gap-2"
								role="button"
								onClick={() => setExpandedCondition(!expandedCondition)}
							>
								<div className="fw-bold">Precondiciones</div>
								<div>
									<div role="button">
										{!expandedCondition ? <CaretUpFill /> : <CaretDownFill />}
									</div>
								</div>
							</div>

							<div
								style={{
									opacity: expandedCondition ? "1" : "0",
									visibility: expandedCondition ? "visible" : "hidden",
									maxHeight: expandedCondition ? "" : "0",
									transition: "all .2s",
								}}
								className="mb-3"
							>
								<Form.Group>
									<Form.Label htmlFor="actions" className="mb-1">
										Acciones
									</Form.Label>
									<Form.Select id="actions">
										<option>Si</option>
										<option>No</option>
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

			{itinerarySelected ? (
				<Form method="post" action="/test">
					<div className="container-fluid">
						<Form.Group className="mb-3">
							<div
								className="d-flex gap-2"
								role="button"
								onClick={() => setExpanded(!expanded)}
							>
								<div className="fw-bold">Contenido</div>
								<div>
									<div>{!expanded ? <CaretUpFill /> : <CaretDownFill />}</div>
								</div>
							</div>
							<div
								style={{
									opacity: expanded ? "1" : "0",
									visibility: expanded ? "visible" : "hidden",
									maxHeight: expanded ? "" : "0",
									transition: "all .2s",
								}}
							>
								<Form.Group className="mb-3">
									<Form.Label className="mb-1">
										Nombre del itinerario
									</Form.Label>
									<Form.Control
										id="itinerary-title"
										ref={itineraryTitleDOM}
										type="text"
										className="w-100"
									></Form.Control>
								</Form.Group>
							</div>
							<Button
								onClick={updateItinerary}
								disabled={!allowResourceSelection}
							>
								Guardar
							</Button>
						</Form.Group>
					</div>
				</Form>
			) : (
				<></>
			)}

			{selectedEditVersion ? (
				<Form method="post" action="/test">
					<div className="container-fluid">
						<Form.Group className="mb-3">
							<div
								className="d-flex gap-2"
								role="button"
								onClick={() => setExpanded(!expanded)}
							>
								<div className="fw-bold">Contenido</div>
								<div>
									<div>{!expanded ? <CaretUpFill /> : <CaretDownFill />}</div>
								</div>
							</div>
							<div
								style={{
									opacity: expanded ? "1" : "0",
									visibility: expanded ? "visible" : "hidden",
									maxHeight: expanded ? "" : "0",
									transition: "all .2s",
								}}
							>
								<Form.Group className="mb-3">
									<Form.Label className="mb-1">Nombre de la versión</Form.Label>
									<Form.Control
										id="version-title"
										type="text"
										className="w-100"
									></Form.Control>
								</Form.Group>
							</div>
							<Button
								onClick={updateVersion}
								disabled={!allowResourceSelection}
							>
								Guardar
							</Button>
						</Form.Group>
					</div>
				</Form>
			) : (
				<></>
			)}
		</aside>
	);
}
