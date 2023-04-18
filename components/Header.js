import styles from "@components/styles/Header.module.css";
import { useState, useContext, useEffect, forwardRef, useRef } from "react";
import SimpleActionDialog from "./dialogs/SimpleActionDialog";
import UserSettings from "./UserSettings";
import Image from "next/image";
import {
	Button,
	Container,
	Dropdown,
	SplitButton,
	Form,
	Nav,
	Navbar,
	Modal,
	Popover,
	OverlayTrigger,
} from "react-bootstrap";
import {
	Bell,
	InfoCircle,
	PlusCircle,
	Pencil,
	Trash,
} from "react-bootstrap-icons";
import {
	MapContext,
	BlockInfoContext,
	ExpandedContext,
	ItineraryInfoContext,
	VersionJsonContext,
	VersionInfoContext,
	PlatformContext,
	BlocksDataContext,
	MSGContext,
	SettingsContext,
} from "@components/pages/_app";
import { toast } from "react-toastify";

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

function Header({ closeBtn }, ref) {
	const [showModalVersions, setShowModalVersions] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [modalTitle, setModalTitle] = useState();
	const [modalBody, setModalBody] = useState();
	const [modalCallback, setModalCallback] = useState();
	const toggleModal = () => setShowModal(!showModal);

	const closeModalVersiones = () => setShowModalVersions(false);
	const openModalVersiones = () => setShowModalVersions(true);

	const { platform, setPlatform } = useContext(PlatformContext);
	const { blockSelected, setBlockSelected } = useContext(BlockInfoContext);
	const { itinerarySelected, setItinerarySelected } =
		useContext(ItineraryInfoContext);
	const { selectedEditVersion, setSelectedEditVersion } =
		useContext(VersionInfoContext);
	const { msg, setMSG } = useContext(MSGContext);

	const { versionJson, setVersionJson } = useContext(VersionJsonContext);

	const { expanded, setExpanded } = useContext(ExpandedContext);

	const { currentBlocksData, setCurrentBlocksData } =
		useContext(BlocksDataContext);
	const { settings, setSettings } = useContext(SettingsContext);

	const parsedSettings = JSON.parse(settings);
	let { reducedAnimations } = parsedSettings;

	const selectItineraryDOM = useRef(null);
	const selectVersionDOM = useRef(null);

	const [versions, setVersions] = useState([]);

	const emptyMap = { id: -1, name: "Seleccionar un itinerario" };
	const [maps, setMaps] = useState([
		emptyMap,
		{
			id: 1,
			name: "Matemáticas 4ºESO-A",
			versions: [
				{
					id: 0,
					name: "Última versión",
					lastUpdate: "20/05/2023",
					default: "true",
					blocksData: [
						{
							id: -2,
							x: 0,
							y: 125,
							type: "start",
							title: "Inicio",
							children: [0],
							identation: 1,
						},
						{
							id: -1,
							x: 1000,
							y: 500,
							type: "end",
							title: "Final",
							identation: 1,
						},
						{
							id: 0,
							x: 125,
							y: 125,
							type: "file",
							title: "Ecuaciones",
							children: [1],
							identation: 1,
						},
						{
							id: 1,
							x: 250,
							y: 125,
							type: "questionnaire",
							title: "Examen Tema 1",
							conditions: [
								{
									type: "qualification",
									operand: ">",
									objective: 8,
									unlocks: 2,
								},
							],
							children: [2, 4],
							identation: 2,
						},
						{
							id: 2,
							x: 375,
							y: 0,
							type: "folder",
							title: "Ecuaciones",
							children: [3],
							identation: 2,
						},
						{
							id: 3,
							x: 500,
							y: 0,
							type: "badge",
							title: "Insignia Ecuaciones",
							identation: 2,
						},
						{
							id: 4,
							x: 375,
							y: 375,
							type: "url",
							title: "Web raices cuadradas",
							children: [5],
							identation: 1,
						},
						{
							id: 5,
							x: 500,
							y: 375,
							type: "forum",
							title: "Foro de discusión",
							children: [6],
							identation: 2,
						},
						{
							id: 6,
							x: 625,
							y: 375,
							type: "questionnaire",
							title: "Cuestionario de raices",
							children: [7, 8],
							identation: 1,
						},
						{
							id: 7,
							x: 750,
							y: 250,
							type: "assignment",
							title: "Ejercicio de raices",
							identation: 1,
						},
						{
							id: 8,
							x: 750,
							y: 500,
							type: "inquery",
							title: "Preguntas sobre raices",
							children: [9],
							identation: 1,
						},
						{
							id: 9,
							x: 875,
							y: 500,
							type: "page",
							title: "Web informativa",
							children: [-1],
							identation: 2,
						},
					],
				},
				{
					id: 1,
					name: "Prueba 1",
					lastUpdate: "08/04/2023",
					default: "false",
					blocksData: [
						{
							id: 0,
							x: 100,
							y: 500,
							type: "file",
							title: "Ecuaciones",
							children: [1],
							identation: 1,
						},
						{
							id: 1,
							x: 200,
							y: 500,
							type: "questionnaire",
							title: "Examen Tema 1",
							conditions: [
								{
									type: "qualification",
									operand: ">",
									objective: 8,
									unlocks: 2,
								},
							],
							children: [2, 5],
							identation: 2,
						},
						{
							id: 2,
							x: 300,
							y: 300,
							type: "folder",
							title: "Carpeta Ecuaciones",
							children: [10, 11],
							identation: 2,
						},
						{
							id: 5,
							x: 300,
							y: 700,
							type: "questionnaire",
							title: "Cuestionario de raices",
							children: [6, 7],
							identation: 1,
						},
						{
							id: 6,
							x: 400,
							y: 600,
							type: "assignment",
							title: "Ejercicio de raices",
							children: [-1],
							identation: 1,
						},
						{
							id: 7,
							x: 400,
							y: 900,
							type: "inquery",
							title: "Preguntas y respuestas",
							children: [40, 41],
							identation: 1,
						},
						{
							id: 10,
							x: 400,
							y: 100,
							type: "folder",
							title: "Carpeta Ecuaciones 2",
							children: [12, 13],
							identation: 2,
						},
						{
							id: 11,
							x: 400,
							y: 400,
							type: "folder",
							title: "Carpeta Ecuaciones 3",
							identation: 2,
						},
						{
							id: 12,
							x: 500,
							y: 0,
							type: "folder",
							title: "Insignia Ecuaciones 4",
							identation: 2,
						},
						{
							id: 13,
							x: 500,
							y: 200,
							type: "folder",
							title: "Carpeta Ecuaciones 5",
							identation: 2,
						},
						{
							id: 40,
							x: 500,
							y: 800,
							type: "page",
							title: "Web informativa 2",
							identation: 2,
						},
						{
							id: 41,
							x: 500,
							y: 1000,
							type: "page",
							title: "Web informativa 3",
							identation: 2,
						},
					],
				},
				{
					id: 2,
					name: "Prueba 2",
					lastUpdate: "08/04/2023",
					default: "false",
					blocksData: [
						{
							id: 0,
							x: 100,
							y: 100,
							type: "file",
							title: "Ecuaciones",
							children: [1],
							identation: 1,
						},
						{
							id: 1,
							x: 200,
							y: 100,
							type: "questionnaire",
							title: "Examen Tema 1",
							conditions: [
								{
									type: "qualification",
									operand: ">",
									objective: 8,
									unlocks: 2,
								},
							],
							children: [2, 3],
							identation: 2,
						},
						{
							id: 2,
							x: 300,
							y: 0,
							type: "folder",
							title: "Carpeta Ecuaciones",
							identation: 2,
						},
						{
							id: 3,
							x: 300,
							y: 300,
							type: "url",
							title: "Web raices cuadradas",
							children: [4],
							identation: 1,
						},
						{
							id: 4,
							x: 400,
							y: 300,
							type: "forum",
							title: "Foro de discusión",
							children: [5],
							identation: 2,
						},
						{
							id: 5,
							x: 500,
							y: 300,
							type: "questionnaire",
							title: "Cuestionario de raices",
							children: [6, 7],
							identation: 1,
						},
						{
							id: 6,
							x: 600,
							y: 200,
							type: "assignment",
							title: "Ejercicio de raices",
							identation: 1,
						},
						{
							id: 7,
							x: 600,
							y: 500,
							type: "inquery",
							title: "Preguntas de Matemáticas",
							children: [8],
							identation: 1,
						},
						{
							id: 8,
							x: 700,
							y: 500,
							type: "page",
							title: "Web informativa",
							children: [40, 41],
							identation: 2,
						},
						{
							id: 40,
							x: 800,
							y: 400,
							type: "page",
							title: "Web informativa 2",
							identation: 2,
						},
						{
							id: 41,
							x: 800,
							y: 1100,
							type: "page",
							title: "Web informativa 3",
							children: [44, 45],
							identation: 2,
						},
						{
							id: 44,
							x: 900,
							y: 900,
							type: "page",
							title: "Web informativa 6",
							children: [46, 47],
							identation: 2,
						},
						{
							id: 45,
							x: 900,
							y: 1200,
							type: "page",
							title: "Web informativa 7",
							identation: 2,
						},
						{
							id: 46,
							x: 1000,
							y: 700,
							type: "page",
							title: "Web informativa 8",
							children: [48, 49],
							identation: 2,
						},
						{
							id: 47,
							x: 1000,
							y: 1000,
							type: "page",
							title: "Web informativa 9",
							identation: 2,
						},
						{
							id: 48,
							x: 1100,
							y: 600,
							type: "page",
							title: "Web informativa 10",

							identation: 2,
						},
						{
							id: 49,
							x: 1100,
							y: 800,
							type: "page",
							title: "Web informativa 11",
							identation: 2,
						},
					],
				},
				{ id: 3, name: "Prueba 3", lastUpdate: "08/04/2023", default: "false" },
			],
		},
		{
			id: 2,
			name: "Matemáticas 4ºESO-B",
			versions: [
				{
					id: 0,
					name: "Última versión",
					lastUpdate: "20/05/2023",
					default: "true",
				},
			],
		},
		{
			id: 3,
			name: "Matemáticas 4ºESO-C",
			versions: [
				{
					id: 0,
					name: "Última versión",
					lastUpdate: "20/05/2023",
					default: "true",
				},
				{
					id: 0,
					name: "Sin Speaking",
					lastUpdate: "05/03/2023",
					default: "false",
				},
			],
		},
	]);

	const [selectedMap, setSelectedMap] = useState(getMapById(-1));

	const [selectedVersion, setSelectedVersion] = useState();

	const { map, setMap } = useContext(MapContext);

	function updateVersion(newVersion) {
		setVersions((prevVersions) => {
			return prevVersions.map((version) => {
				if (version.id === newVersion.id) {
					return { ...version, ...newVersion };
				} else {
					return version;
				}
			});
		});
	}

	/**
	 * Returns a map object with the specified id.
	 * @param {number} id - The id of the map to find.
	 * @returns {Object} The map object with the specified id.
	 */
	function getMapById(id) {
		return maps.find((m) => m.id == id);
	}

	/**
	 * Resets the edit state.
	 */
	function resetEdit() {
		setBlockSelected("");
		setSelectedEditVersion("");
		setItinerarySelected("");
	}

	/**
	 * Handles a change in the selected map.
	 * @param {Event} e - The change event.
	 */
	function handleMapChange(e) {
		resetEdit();
		let id = Number(e.target.value);
		let selectedMap = [...maps].find((e) => e.id == id);
		setSelectedMap(selectedMap);
		id > -1 ? setMap(selectedMap) : setMap("");
		setVersions(selectedMap.versions);
		if (selectedMap.versions) {
			setSelectedVersion(selectedMap.versions[0]);
			setCurrentBlocksData(selectedMap.versions[0].blocksData);
		}
		resetMapSesion();
	}

	function resetMapSesion() {
		//Empty msgbox
		setMSG([]);
	}

	/**
	 * Changes the selected map to the "you need to select a itinerary" message.
	 */
	function changeToMapSelection() {
		resetEdit();
		setSelectedMap(getMapById(-1));
		setMap("");
		setMSG([]);
	}

	/**
	 * Handles the creation of a new itinerary.
	 */
	const handleNewItinerary = () => {
		const newMap = [
			...maps,
			{
				id: maps.length,
				name: "Nuevo Itinerario " + maps.length,
				versions: [
					{
						id: 0,
						name: "Última versión",
						lastUpdate: new Date().toLocaleDateString(),
						default: "true",
					},
				],
			},
		];
		setMaps(newMap);
		toast(
			`Itinerario: "Nuevo Itinerario ${maps.length}" creado`,
			defaultToastSuccess
		);
	};

	/**
	 * Handles the creation of a new version.
	 */
	const handleNewVersion = () => {
		const newMapVersions = [
			...selectedMap.versions,
			{
				id: selectedMap.versions.length,
				name: "Nueva Versión " + selectedMap.versions.length,
				lastUpdate: new Date().toLocaleDateString(),
				default: "true",
				blocksData: [],
			},
		];
		let modifiedMap = selectedMap;
		modifiedMap.versions = newMapVersions;
		const mapIndex = maps.findIndex((m) => m.id == selectedMap.id);
		const newMaps = [...maps];
		newMaps[mapIndex] = selectedMap;
		setMaps(newMaps);
		setVersions(modifiedMap.versions);
		toast(
			`Versión: "Nueva Versión ${modifiedMap.versions.length - 1}" creada`,
			defaultToastSuccess
		);
	};

	/**
	 * Handles the editing of an itinerary.
	 */
	const editItinerary = () => {
		if (expanded != true) {
			setExpanded(true);
		}
		const itineraryId = selectItineraryDOM.current.value;
		setBlockSelected("");
		setSelectedEditVersion("");
		setItinerarySelected(getMapById(itineraryId));
	};

	/**
	 * Handles the editing of a version.
	 */
	const editVersion = () => {
		if (expanded != true) {
			setExpanded(true);
		}
		setBlockSelected("");
		setItinerarySelected("");
		setSelectedEditVersion(selectedVersion);
	};

	const showDeleteItineraryModal = () => {
		setModalTitle(`¿Eliminar "${selectedMap.name}"?`);
		setModalBody(`¿Desea eliminar "${selectedMap.name}"?`);
		setModalCallback(() => deleteItinerary);
		setShowModal(true);
	};

	/**
	 * Handles the deletion of an itinerary.
	 */
	const deleteItinerary = () => {
		const itineraryId = selectItineraryDOM.current.value;
		if (itineraryId != -1) {
			setMaps((mapas) =>
				mapas.filter((mapa) => mapa.id !== parseInt(itineraryId))
			);
			toast(`Itinerario eliminado con éxito.`, defaultToastSuccess);
			changeToMapSelection();
		} else {
			toast(`No puedes eliminar este itinerario.`, defaultToastError);
		}
	};

	const showDeleteVersionModal = () => {
		setModalTitle(`¿Eliminar "${selectedVersion.name}"?`);
		setModalBody(`¿Desea eliminar "${selectedVersion.name}"?`);
		setModalCallback(() => deleteVersion);
		setShowModal(true);
	};

	/**
	 * Handles the deletion of a version.
	 */
	const deleteVersion = () => {
		const versionId = selectedVersion.id;
		if (versionId != 0) {
			setVersions((versions) =>
				versions.filter((version) => version.id !== parseInt(versionId))
			);

			const firstVersion = versions.find(
				(version) => version.id !== parseInt(versionId)
			);
			setSelectedVersion(firstVersion || versions[0] || null);

			const newMapVersions = selectedMap.versions.filter(
				(version) => version.id !== parseInt(versionId)
			);
			const modifiedMap = { ...selectedMap, versions: newMapVersions };
			const mapIndex = maps.findIndex((m) => m.id === selectedMap.id);
			const newMaps = [...maps];
			newMaps[mapIndex] = modifiedMap;
			setMaps(newMaps);
			setVersions(modifiedMap.versions);
			toast(`Versión eliminada con éxito.`, defaultToastSuccess);
		} else {
			toast(`No puedes eliminar esta versión.`, defaultToastError);
		}
	};

	useEffect(() => {
		let newMap = [...maps];
		newMap[maps.findIndex((b) => b.id == map.id)] = map;
		setMaps(newMap);
	}, [map]);

	useEffect(() => {
		if (selectedVersion) {
			if (selectedVersion.id != versionJson.id) {
				resetEdit();
				setCurrentBlocksData(selectedVersion.blocksData);
				resetMapSesion();
			}
		}
	}, [selectedVersion]);

	useEffect(() => {
		if (versions) {
			let newVersion = [...versions];
			newVersion[versions.findIndex((b) => b.id == versionJson.id)] =
				versionJson;
			setVersions(newVersion);

			if (selectedVersion) {
				if (selectedVersion.id == versionJson.id) {
					setSelectedVersion(versionJson);
				}
			}
		}
	}, [versionJson]);

	/**
	 * A React component that renders a logo.
	 * @returns {JSX.Element} A JSX element representing the logo.
	 */
	function CreateLogo() {
		return (
			<div className="mx-auto d-flex align-items-center" role="button">
				<Image
					onClick={() => setExpanded(!expanded)}
					alt="Uniadaptive"
					src="/images/logo.png"
					width={40}
					height={40}
					className={styles.icon}
					style={{
						transition: "all 0.5s ease",
					}}
				></Image>
			</div>
		);
	}

	/**
	 * A JSX element representing a popover with information.
	 */
	const PopoverInfo = (
		<Popover id="popover-basic">
			<Popover.Header as="h3"></Popover.Header>
			<Popover.Body>
				And here&apos;s some <strong>amazing</strong> content. It&apos;s very
				engaging. right?
			</Popover.Body>
		</Popover>
	);

	/**
	 * A React component that renders a user toggle.
	 * @param {Object} props - The component's props.
	 * @param {JSX.Element} props.children - The component's children.
	 * @param {function} props.onClick - The onClick event handler.
	 * @param {Object} ref - A React ref to access the DOM element of the component.
	 * @returns {JSX.Element} A JSX element representing the user toggle.
	 */
	const UserToggle = forwardRef(({ children, onClick }, ref) => (
		<a
			href=""
			ref={ref}
			onClick={(e) => {
				e.preventDefault();
				onClick(e);
			}}
		>
			{children}
		</a>
	));
	UserToggle.displayName = "UserToggle";

	/**
	 * A React component that renders a user menu.
	 * @param {Object} props - The component's props.
	 * @param {JSX.Element} props.children - The component's children.
	 * @param {Object} props.style - The style of the component.
	 * @param {string} props.className - The className of the component.
	 * @param {string} props.aria-labelledby - The aria-labelledby attribute of the component.
	 * @param {Object} ref - A React ref to access the DOM element of the component.
	 * @returns {JSX.Element} A JSX element representing the user menu.
	 */
	const UserMenu = forwardRef(
		({ children, style, className, "aria-labelledby": labeledBy }, ref) => {
			const [value, setValue] = useState("");

			return (
				<div
					ref={ref}
					style={{ position: "absolute", right: "0px", width: "20em" }}
					className={className}
					aria-labelledby={labeledBy}
				>
					<ul className="list-unstyled">{children}</ul>
				</div>
			);
		}
	);
	UserMenu.displayName = "UserMenu";

	return (
		<header ref={ref} className={styles.header}>
			<Navbar style={{ borderBottom: "1px solid #ccc" }}>
				<Container fluid>
					<Form
						className={
							!expanded ? "d-flex px-2 col-sm-8" : "d-flex px-2 col-sm-8"
						}
						style={{ gap: "20px" }}
					>
						{!expanded && <CreateLogo />}
						<Form.Select
							ref={selectItineraryDOM}
							value={selectedMap.id}
							onChange={handleMapChange}
						>
							{maps.map((mapa) => (
								<option id={mapa.id} key={mapa.id} value={mapa.id}>
									{mapa.name}
								</option>
							))}
						</Form.Select>
					</Form>
					<Nav className={!expanded ? "col-sm-4" : "col-sm-4"}>
						<Container
							fluid
							className={
								!expanded
									? "d-flex align-items-center justify-content-evenly col-sm-7"
									: "d-flex align-items-center justify-content-evenly col-sm-7"
							}
						>
							<Dropdown className={`btn-light d-flex align-items-center`}>
								<Dropdown.Toggle
									variant="light"
									className={`btn-light d-flex align-items-center p-2 ${styles.actionsBorder} ${styles.toggleButton}`}
								>
									<PlusCircle width="20" height="20" />
								</Dropdown.Toggle>
								<Dropdown.Menu>
									<Dropdown.Item onClick={handleNewItinerary}>
										Crear nuevo itinerario
									</Dropdown.Item>
									{selectedMap.id != -1 ? (
										<Dropdown.Item onClick={handleNewVersion}>
											Crear nueva versión
										</Dropdown.Item>
									) : (
										<></>
									)}
								</Dropdown.Menu>
							</Dropdown>
							{selectedMap.id != -1 ? (
								<>
									<Dropdown className={`btn-light d-flex align-items-center`}>
										<Dropdown.Toggle
											variant="light"
											className={`btn-light d-flex align-items-center p-2 ${styles.actionsBorder} ${styles.toggleButton}`}
										>
											<Trash width="20" height="20" />
										</Dropdown.Toggle>
										<Dropdown.Menu>
											<Dropdown.Item onClick={showDeleteItineraryModal}>
												Borrar itinerario actual
											</Dropdown.Item>

											<Dropdown.Item onClick={showDeleteVersionModal}>
												Borrar versión actual
											</Dropdown.Item>
										</Dropdown.Menu>
									</Dropdown>
									<Dropdown className={`btn-light d-flex align-items-center `}>
										<Dropdown.Toggle
											variant="light"
											className={`btn-light d-flex align-items-center p-2 ${styles.actionsBorder} ${styles.toggleButton}`}
										>
											<Pencil width="20" height="20" />
										</Dropdown.Toggle>
										<Dropdown.Menu>
											<Dropdown.Item onClick={editItinerary}>
												Editar itinerario actual
											</Dropdown.Item>
											<Dropdown.Item onClick={editVersion}>
												Editar versión actual
											</Dropdown.Item>
										</Dropdown.Menu>
									</Dropdown>
								</>
							) : (
								<></>
							)}

							<OverlayTrigger
								placement="bottom"
								overlay={PopoverInfo}
								trigger="focus"
							>
								<Button
									className={`btn-light d-flex align-items-center p-2 ${styles.actionsBorder}`}
									data-bs-container="body"
									data-bs-toggle="popover"
									data-bs-placement="top"
									data-bs-content="Top popover"
								>
									<InfoCircle width="20" height="20"></InfoCircle>
								</Button>
							</OverlayTrigger>

							<Button
								className={`d-flex align-items-center p-2 ${styles.actionsBorder}`}
								variant="danger"
							>
								<Bell width="20" height="20"></Bell>
							</Button>
						</Container>
						<Container
							fluid
							className={!expanded ? "d-flex col-sm-5" : "d-flex col-sm-5"}
						>
							<Dropdown
								role="menu"
								focusFirstItemOnShow={true}
								align={"end"}
								drop={"start"}
								autoClose={"outside"}
								className={styles.userSettings}
							>
								<Dropdown.Toggle
									as={UserToggle}
									id="dropdown-custom-components"
								>
									<div className="d-flex flex-row">
										<Container className="d-flex flex-column">
											<div>María García</div>
											<div>Moodle</div>
										</Container>
										<div className="mx-auto d-flex align-items-center">
											<Image
												alt="Imagen de perfil"
												src="/images/3373707.jpg"
												width={48}
												height={48}
												style={{
													borderRadius: 100 + "%",
													border: "2px solid white",
												}}
											></Image>
										</div>
									</div>
								</Dropdown.Toggle>
								<Dropdown.Menu as={UserMenu}>
									<UserSettings />
								</Dropdown.Menu>
							</Dropdown>
						</Container>
					</Nav>
				</Container>
				{selectedMap.id > -1 && (
					<div
						className={
							styles.mapContainer +
							" " +
							(reducedAnimations && styles.noAnimation)
						}
					>
						<div className={styles.mapText}>
							<SplitButton
								ref={selectVersionDOM}
								value={selectedVersion.id}
								title={versions.length > 0 ? selectedVersion.name : ""}
								onClick={openModalVersiones}
								variant="none"
							>
								{versions.map((version) => (
									<Dropdown.Item
										key={version.id}
										onClick={() => setSelectedVersion(version)}
										className={styles.caret}
									>
										{version.name}
									</Dropdown.Item>
								))}
							</SplitButton>
						</div>
						<div className={styles.mapTriangle}></div>
					</div>
				)}
			</Navbar>
			{selectedVersion ? (
				<Modal show={showModalVersions} onHide={closeModalVersiones}>
					<Modal.Header closeButton>
						<Modal.Title>
							Detalles de &quot;{selectedVersion.name}&quot;
						</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						Actualmente la versión seleccionada es &quot;
						<strong>{selectedVersion.name}</strong>&quot;, modificada por última
						vez <b>{selectedVersion.lastUpdate}</b>.
					</Modal.Body>
					<Modal.Footer>
						<Button variant="secondary" onClick={closeModalVersiones}>
							Cerrar
						</Button>
						<Button
							variant="success"
							onClick={() => {
								let nuevaVersion = selectedVersion;
								let p = prompt();
								if (p) {
									nuevaVersion.name = p.trim();
									updateVersion(nuevaVersion);
								}
								closeModalVersiones();
							}}
						>
							Editar nombre
						</Button>
						<Button variant="danger" onClick={closeModalVersiones}>
							Borrar
						</Button>
						<Button variant="primary" onClick={closeModalVersiones}>
							Crear desde existente
						</Button>
					</Modal.Footer>
				</Modal>
			) : (
				<></>
			)}
			<SimpleActionDialog
				showDialog={showModal}
				toggleDialog={toggleModal}
				title={modalTitle}
				body={modalBody}
				action=""
				cancel=""
				type="delete"
				callback={modalCallback}
			/>
		</header>
	);
}
const HeaderWithRefs = forwardRef(Header);
export default HeaderWithRefs;
