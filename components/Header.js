import styles from "@components/styles/Header.module.css";
import { useState, useContext, useEffect, forwardRef, useRef } from "react";
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
} from "@components/pages/_app";
import { toast } from "react-toastify";

function Header({ closeBtn }, ref) {
	const [showModalVersiones, setShowModalVersiones] = useState(false);

	const closeModalVersiones = () => setShowModalVersiones(false);
	const openModalVersiones = () => setShowModalVersiones(true);

	const { platform, setPlatform } = useContext(PlatformContext);
	const { blockSelected, setBlockSelected } = useContext(BlockInfoContext);
	const { itinerarySelected, setItinerarySelected } =
		useContext(ItineraryInfoContext);
	const { selectedEditVersion, setSelectedEditVersion } =
		useContext(VersionInfoContext);

	const { versionJson, setVersionJson } = useContext(VersionJsonContext);

	const { expanded, setExpanded } = useContext(ExpandedContext);

	const selectItineraryDOM = useRef(null);
	const selectVersionDOM = useRef(null);

	const [versiones, setVersiones] = useState([
		{
			id: 0,
			name: "Última versión",
			lastUpdate: "20/05/2023",
			default: "true",
		},
		{ id: 1, name: "Prueba 1", lastUpdate: "08/04/2023", default: "false" },
		{ id: 2, name: "Versión 1", lastUpdate: "15/04/2023", default: "false" },
		{
			id: 3,
			name: "Versión final",
			lastUpdate: "19/04/2023",
			default: "false",
		},
		{
			id: 4,
			name: "Versión final final de verdad, en serio esta vez DEFINITIVO",
			lastUpdate: "18/05/2023",
			default: "false",
		},
	]);

	const ningunMapa = { id: -1, name: "Seleccionar un itinerario" };
	const [mapas, setMapas] = useState([
		ningunMapa,
		{
			id: 1,
			name: "Matemáticas 4ºESO",
		},
		{
			id: 2,
			name: "Lengua 3ºESO",
		},
		{
			id: 3,
			name: "Informática 1ºBachillerato",
		},
	]);

	const [selectedMapa, setSelectedMapa] = useState(getMapById(-1));

	const [selectedVersion, setSelectedVersion] = useState(versiones[0]);

	const { map, setMap } = useContext(MapContext);

	function updateVersion(nuevaVersion) {
		setVersiones((prevVersiones) => {
			return prevVersiones.map((version) => {
				if (version.id === nuevaVersion.id) {
					return { ...version, ...nuevaVersion };
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
		return mapas.find((m) => m.id == id);
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
		let mapaAsociado = [...mapas].find((e) => e.id == id);
		setSelectedMapa(mapaAsociado);
		id > -1 ? setMap(mapaAsociado) : setMap("");
	}

	/**
	 * Handles the creation of a new itinerary.
	 */
	const handleNewItinerary = () => {
		const newMapa = [
			...mapas,
			{ id: mapas.length, name: "Nuevo Itinerario " + mapas.length },
		];
		setMapas(newMapa);
		toast(`Itinerario: "Nuevo Itinerario ${mapas.length}" creado`, {
			hideProgressBar: false,
			autoClose: 2000,
			type: "success",
			position: "bottom-center",
		});
	};

	/**
	 * Handles the creation of a new version.
	 */
	const handleNewVersion = () => {
		const newVersion = [
			...versiones,
			{
				id: versiones.length,
				name: "Nueva Versión " + versiones.length,
				lastUpdate: "10/11/2024",
				default: "true",
			},
		];
		setVersiones(newVersion);
		toast(`Versión: "Nueva Versión ${mapas.length}" creada`, {
			hideProgressBar: false,
			autoClose: 2000,
			type: "success",
			position: "bottom-center",
		});
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

	/**
	 * Handles the deletion of an itinerary.
	 */
	const deleteItinerary = () => {
		const itineraryId = selectItineraryDOM.current.value;
		setMapas((mapas) =>
			mapas.filter((mapa) => mapa.id !== parseInt(itineraryId))
		);
	};

	/**
	 * Handles the deletion of a version.
	 */
	const deleteVersion = () => {
		const versionId = selectedVersion.id;
		setVersiones((versiones) =>
			versiones.filter((version) => version.id !== parseInt(versionId))
		);

		const firstVersion = versiones.find(
			(version) => version.id !== parseInt(versionId)
		);
		setSelectedVersion(firstVersion || versiones[0] || null);
	};

	useEffect(() => {
		let newMap = [...mapas];
		newMap[mapas.findIndex((b) => b.id == map.id)] = map;
		setMapas(newMap);
	}, [map]);

	useEffect(() => {
		if (selectedVersion.id != versionJson.id) {
			resetEdit();
		}
	}, [selectedVersion]);

	useEffect(() => {
		let newVersion = [...versiones];
		newVersion[versiones.findIndex((b) => b.id == versionJson.id)] =
			versionJson;
		setVersiones(newVersion);

		if (selectedVersion.id == versionJson.id) {
			setSelectedVersion(versionJson);
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
					style={{ position: "absolute", right: "0px" }}
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
							value={selectedMapa.id}
							onChange={handleMapChange}
						>
							{mapas.map((mapa) => (
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
									{selectedMapa.id != -1 ? (
										<Dropdown.Item onClick={handleNewVersion}>
											Crear nueva versión
										</Dropdown.Item>
									) : (
										<></>
									)}
								</Dropdown.Menu>
							</Dropdown>

							<Dropdown className={`btn-light d-flex align-items-center`}>
								<Dropdown.Toggle
									variant="light"
									className={`btn-light d-flex align-items-center p-2 ${styles.actionsBorder} ${styles.toggleButton}`}
								>
									<Trash width="20" height="20" />
								</Dropdown.Toggle>
								<Dropdown.Menu>
									<Dropdown.Item onClick={deleteItinerary}>
										Borrar itinerario actual
									</Dropdown.Item>
									{selectedMapa.id != -1 ? (
										<Dropdown.Item onClick={deleteVersion}>
											Borrar versión actual
										</Dropdown.Item>
									) : (
										<></>
									)}
								</Dropdown.Menu>
							</Dropdown>

							{selectedMapa.id != -1 ? (
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
											<div>Ana López</div>
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
				{selectedMapa.id > -1 && (
					<div className={styles.mapContainer}>
						<div className={styles.mapText}>
							<SplitButton
								ref={selectVersionDOM}
								value={selectedVersion.id}
								title={versiones.length > 0 ? selectedVersion.name : ""}
								onClick={openModalVersiones}
								variant="none"
							>
								{versiones.map((version) => (
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
			<Modal show={showModalVersiones} onHide={closeModalVersiones}>
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
		</header>
	);
}
const HeaderWithRefs = forwardRef(Header);
export default HeaderWithRefs;
