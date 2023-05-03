import styles from "@components/styles/Header.module.css";
import { useState, useContext, useEffect, forwardRef, useRef } from "react";
import SimpleActionDialog from "./dialogs/SimpleActionDialog";
import SimpleMapSelector from "./dialogs/SimpleMapSelector";
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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faBell,
	faCircleQuestion,
	faCirclePlus,
	faPencil,
	faTrash,
	faFloppyDisk,
} from "@fortawesome/free-solid-svg-icons";
import {
	BlockInfoContext,
	ExpandedContext,
	MapInfoContext,
	VersionJsonContext,
	VersionInfoContext,
	PlatformContext,
	BlocksDataContext,
	MSGContext,
	SettingsContext,
	OnlineContext,
} from "@components/pages/_app";
import { toast } from "react-toastify";
import { notImplemented } from "@components/pages/_app";
import { capitalizeFirstLetter, uniqueId } from "./Utils";

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
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [showMapSelectorModal, setShowMapSelectorModal] = useState(false);
	const [modalTitle, setModalTitle] = useState();
	const [modalBody, setModalBody] = useState();
	const [modalCallback, setModalCallback] = useState();
	const toggleDeleteModal = () => setShowDeleteModal(!showDeleteModal);
	const toggleMapSelectorModal = () =>
		setShowMapSelectorModal(!showMapSelectorModal);

	const closeModalVersiones = () => setShowModalVersions(false);
	const openModalVersiones = () => setShowModalVersions(true);

	const { platform, setPlatform } = useContext(PlatformContext);
	const { blockSelected, setBlockSelected } = useContext(BlockInfoContext);
	const { mapSelected, setMapSelected } = useContext(MapInfoContext);
	const { selectedEditVersion, setSelectedEditVersion } =
		useContext(VersionInfoContext);
	const { msg, setMSG } = useContext(MSGContext);

	const { versionJson, setVersionJson } = useContext(VersionJsonContext);

	const { expanded, setExpanded } = useContext(ExpandedContext);

	const { currentBlocksData, setCurrentBlocksData } =
		useContext(BlocksDataContext);
	const { isOffline } = useContext(OnlineContext);
	const { settings, setSettings } = useContext(SettingsContext);

	const parsedSettings = JSON.parse(settings);
	let { reducedAnimations } = parsedSettings;

	const selectMapDOM = useRef(null);
	const selectVersionDOM = useRef(null);

	const [versions, setVersions] = useState([]);

	const [loadedMaps, setLoadedMaps] = useState();
	const emptyMap = { id: -1, name: "Seleccionar un mapa" };
	const [maps, setMaps] = useState([emptyMap]);

	const [selectedVersion, setSelectedVersion] = useState();

	/**
	 * Updates the version of an object in an array of versions.
	 * @param {Object} newVersion - The new version object to update.
	 */
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
	}

	/**
	 * Handles a change in the selected map.
	 * @param {Event} e - The change event.
	 */
	function handleMapChange(e) {
		resetEdit();
		let id = Number(e.target.value);
		let selectedMap = [...maps].find((e) => e.id == id);
		setMapSelected(selectedMap);
		setVersions(selectedMap.versions);
		if (selectedMap.versions) {
			setSelectedVersion(selectedMap.versions[0]);
			setCurrentBlocksData(selectedMap.versions[0].blocksData);
		}
		if (selectedMap.id == -1) {
			setCurrentBlocksData();
		}
		resetMapSesion();
	}

	function resetMapSesion() {
		//Empty msgbox
		setMSG([]);
	}

	/**
	 * Changes the selected map to the "you need to select a map" message.
	 */
	function changeToMapSelection() {
		resetEdit();
		setMapSelected(getMapById(-1));
		setCurrentBlocksData();
		setMSG([]);
	}

	/**
	 * Handles the creation of a new map.
	 */
	const handleNewMap = (e, data) => {
		const uniqueId = () => parseInt(Date.now() * Math.random()).toString();
		const endId = uniqueId();
		const emptyNewMap = {
			id: maps.length,
			name: "Nuevo Mapa " + maps.length,
			versions: [
				{
					id: 0,
					name: "Última versión",
					lastUpdate: new Date().toLocaleDateString(),
					default: "true",
					blocksData: [
						{
							id: uniqueId(),
							x: 0,
							y: 0,
							type: "start",
							title: "Inicio",
							identation: 1,
						},
						{
							id: endId,
							x: 125,
							y: 0,
							type: "end",
							title: "Final",
							identation: 1,
						},
					],
				},
			],
		};
		const newMaps = [
			...maps,
			data
				? {
						...data,
						id: maps.length,
						name: "Nuevo Mapa " + maps.length,
				  }
				: emptyNewMap,
		];
		setMaps(newMaps);
		toast(`Mapa: "Nuevo Mapa ${maps.length}" creado`, defaultToastSuccess);
	};

	/**
	 * Handles the creation of a new version.
	 */
	const handleNewVersion = (e, data) => {
		const endId = uniqueId();
		const selectedMap = getMapById(selectMapDOM.current.value);
		const emptyNewVersion = {
			id: selectedMap.versions.length,
			name: "Nueva Versión " + selectedMap.versions.length,
			lastUpdate: new Date().toLocaleDateString(),
			default: "true",
			blocksData: [
				{
					id: uniqueId(),
					x: 0,
					y: 0,
					type: "start",
					title: "Inicio",
					identation: 1,
				},
				{
					id: endId,
					x: 125,
					y: 0,
					type: "end",
					title: "Final",
					identation: 1,
				},
			],
		};
		const newMapVersions = [
			...selectedMap.versions,
			data
				? {
						...data,
						id: uniqueId(),
						lastUpdate: new Date().toLocaleDateString(),
						name: "Nueva Versión " + selectedMap.versions.length,
						default: false,
				  }
				: emptyNewVersion,
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
	 * Adds a new version to a map with the given the version data and a map id.
	 * @param {Object} data - The data for the new version of the map.
	 * @param {string} mapId - The id of the map to create a new version for.
	 */
	const handleNewVersionIn = (data, mapId) => {
		const selectedMap = getMapById(mapId);
		const newMapVersions = [
			...selectedMap.versions,
			{
				...data,
				id: uniqueId(),
				lastUpdate: new Date().toLocaleDateString(),
				name: "Nueva Versión " + selectedMap.versions.length,
				default: false,
			},
		];

		let modifiedMap = selectedMap;
		modifiedMap.versions = newMapVersions;
		const mapIndex = maps.findIndex((m) => m.id == selectedMap.id);
		const newMaps = [...maps];
		newMaps[mapIndex] = modifiedMap;
		setMaps(newMaps);
		setVersions(modifiedMap.versions);
		setMapSelected(modifiedMap);
		setSelectedVersion(modifiedMap.versions[selectedMap.versions.length - 1]);
		setCurrentBlocksData(
			modifiedMap.versions[selectedMap.versions.length - 1].blocksData
		);
		toast(
			`Versión: "Nueva Versión ${modifiedMap.versions.length - 1}" creada`,
			defaultToastSuccess
		);
	};

	/**
	 * Handles the editing of an map.
	 */
	const editMap = () => {
		if (expanded != true) {
			setExpanded(true);
		}
		const mapId = selectMapDOM.current.value;
		setBlockSelected("");
		setSelectedEditVersion("");
		setMapSelected(getMapById(mapId));
	};

	/**
	 * Handles the editing of a version.
	 */
	const editVersion = () => {
		if (expanded != true) {
			setExpanded(true);
		}
		setBlockSelected("");
		setSelectedEditVersion(selectedVersion);
	};

	/**
	 * Shows a modal to confirm deletion of an map.
	 */
	const showDeleteMapModal = () => {
		setModalTitle(`¿Eliminar "${mapSelected.name}"?`);
		setModalBody(`¿Desea eliminar "${mapSelected.name}"?`);
		setModalCallback(() => deleteMap);
		setShowDeleteModal(true);
	};

	/**
	 * Handles the deletion of an map.
	 */
	const deleteMap = () => {
		const mapId = selectMapDOM.current.value;
		if (mapId != -1) {
			setMaps((map) => map.filter((map) => map.id !== parseInt(mapId)));
			toast(`Mapa eliminado con éxito.`, defaultToastSuccess);
			changeToMapSelection();
		} else {
			toast(`No puedes eliminar este mapa.`, defaultToastError);
		}
	};

	/**
	 * Shows a modal to confirm deletion of a version.
	 */
	const showDeleteVersionModal = () => {
		setModalTitle(`¿Eliminar "${selectedVersion.name}"?`);
		setModalBody(`¿Desea eliminar "${selectedVersion.name}"?`);
		setModalCallback(() => deleteVersion);
		setShowDeleteModal(true);
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

			const newMapVersions = mapSelected.versions.filter(
				(version) => version.id !== parseInt(versionId)
			);
			const modifiedMap = { ...mapSelected, versions: newMapVersions };
			const mapIndex = maps.findIndex((m) => m.id === mapSelected.id);
			const newMaps = [...maps];
			newMaps[mapIndex] = modifiedMap;
			setMaps(newMaps);
			setVersions(modifiedMap.versions);
			setCurrentBlocksData(firstVersion?.blocksData || versions[0]?.blocksData);
			toast(`Versión eliminada con éxito.`, defaultToastSuccess);
		} else {
			toast(`No puedes eliminar esta versión.`, defaultToastError);
		}
	};

	useEffect(() => {
		fetch("resources/dev.json")
			.then((response) => response.json())
			.then((data) => {
				setLoadedMaps(true);
				setMaps([emptyMap, ...data]);
			})
			.catch((e) => {
				toast(
					`No se pudieron obtener los datos desde la LMS.`,
					defaultToastError
				);
				console.error(
					"No se pudieron obtener los datos desde la LMS. Error: \n",
					e
				);
			});
	}, []);

	useEffect(() => {
		if (loadedMaps) {
			let newMap = [...maps];
			newMap[maps.findIndex((b) => b.id == mapSelected.id)] = mapSelected;
			setMaps(newMap);
		}
	}, [mapSelected]);

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
				<img
					onClick={() => setExpanded(!expanded)}
					src={process.env.SMALL_LOGO_PATH}
					alt="Mostrar menú lateral"
					className={styles.icon}
					width={40}
					height={40}
					style={{
						transition: "all 0.5s ease",
					}}
				/>
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
				Utilizaremos este botón para mostrar un tutorial de la herramienta LTI.
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
			role="button"
			tabIndex={0}
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

	const devPlataformChange = () => {
		if (platform == "moodle") {
			setPlatform("sakai");
		} else {
			setPlatform("moodle");
		}
	};

	return (
		<header ref={ref} className={styles.header}>
			<Navbar>
				<Container fluid>
					<Form
						className={
							!expanded
								? "d-flex px-2 col-2 col-sm-6 col-md-8"
								: "d-flex px-2 col-2 col-sm-6 col-md-8"
						}
						style={{ gap: "20px" }}
					>
						{!expanded && <CreateLogo />}
						<Form.Select
							ref={selectMapDOM}
							value={mapSelected.id}
							onChange={handleMapChange}
							disabled={isOffline || !loadedMaps}
							defaultValue={-1}
						>
							{loadedMaps &&
								maps.map((map) => (
									<option id={map.id} key={map.id} value={map.id}>
										{map.name}
									</option>
								))}
						</Form.Select>
					</Form>
					<Nav
						className={
							!expanded
								? "col-10 col-sm-6 col-md-4"
								: "col-10 col-sm-6 col-md-4"
						}
					>
						<Container
							fluid
							className={
								!expanded
									? "d-flex align-items-center justify-content-evenly col-sm-7"
									: "d-flex align-items-center justify-content-evenly col-sm-7"
							}
						>
							{/*FIXME: For any reason this Dropdown triggers an hydration error*/}
							<Dropdown className={`btn-light d-flex align-items-center`}>
								<Dropdown.Toggle
									variant="light"
									className={`btn-light d-flex align-items-center p-2 ${styles.actionsBorder} ${styles.toggleButton}`}
									disabled={isOffline || !loadedMaps}
								>
									<FontAwesomeIcon
										icon={faCirclePlus}
										style={{ height: "20px", width: "20px" }}
									/>
								</Dropdown.Toggle>
								<Dropdown.Menu>
									<Dropdown.Item onClick={handleNewMap}>
										Nuevo mapa vacío
									</Dropdown.Item>
									{mapSelected.id >= 0 && (
										<>
											<Dropdown.Item onClick={handleNewVersion}>
												Nueva versión vacía
											</Dropdown.Item>
											{/*<Dropdown.Item onClick={() => handleNewMap(mapSelected)}>
												Nuevo mapa desde el actual
											</Dropdown.Item>*/}
											<Dropdown.Item
												onClick={(e) => handleNewVersion(e, selectedVersion)}
											>
												Nueva versión desde la actual
											</Dropdown.Item>
											<Dropdown.Item
												onClick={() => setShowMapSelectorModal(true)}
											>
												Nueva versión desde la actual en...
											</Dropdown.Item>
										</>
									)}
								</Dropdown.Menu>
							</Dropdown>
							{mapSelected.id >= 0 && (
								<>
									<Dropdown className={`btn-light d-flex align-items-center`}>
										<Dropdown.Toggle
											variant="light"
											className={`btn-light d-flex align-items-center p-2 ${styles.actionsBorder} ${styles.toggleButton}`}
											disabled={isOffline || !loadedMaps}
										>
											<FontAwesomeIcon
												icon={faTrash}
												style={{ height: "20px", width: "20px" }}
											/>
										</Dropdown.Toggle>
										<Dropdown.Menu>
											<Dropdown.Item onClick={showDeleteMapModal}>
												Borrar mapa actual
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
											disabled={isOffline || !loadedMaps}
										>
											<FontAwesomeIcon
												icon={faPencil}
												style={{ height: "20px", width: "20px" }}
											/>
										</Dropdown.Toggle>
										<Dropdown.Menu>
											<Dropdown.Item onClick={editMap}>
												Editar mapa actual
											</Dropdown.Item>
											<Dropdown.Item onClick={editVersion}>
												Editar versión actual
											</Dropdown.Item>
										</Dropdown.Menu>
									</Dropdown>
									<Button
										className={`btn-light d-flex align-items-center p-2 ${styles.actionsBorder}`}
										disabled={isOffline || !loadedMaps}
										aria-label="Guardar versión actual"
										onClick={notImplemented}
									>
										<FontAwesomeIcon
											icon={faFloppyDisk}
											style={{ height: "20px", width: "20px" }}
										/>
									</Button>
								</>
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
									<FontAwesomeIcon
										icon={faCircleQuestion}
										style={{ height: "20px", width: "20px" }}
									/>
								</Button>
							</OverlayTrigger>

							<Button
								variant="dark"
								className={`d-flex align-items-center p-2 ${styles.actionsBorder} ${styles.error}`}
							>
								<FontAwesomeIcon
									icon={faBell}
									style={{ height: "20px", width: "20px" }}
								/>
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
											<div>{capitalizeFirstLetter(platform)}</div>
										</Container>
										<div className="mx-auto d-flex align-items-center">
											<Image
												alt="Imagen de perfil"
												src="/images/3373707.jpg"
												className={styles.userProfile}
												width={48}
												height={48}
												onClick={devPlataformChange}
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
				{mapSelected.id > -1 && (
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
								disabled={isOffline || !loadedMaps}
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
					</Modal.Footer>
				</Modal>
			) : (
				<></>
			)}
			<SimpleActionDialog
				showDialog={showDeleteModal}
				toggleDialog={toggleDeleteModal}
				title={modalTitle}
				body={modalBody}
				action=""
				cancel=""
				type="delete"
				callback={modalCallback}
			/>
			<SimpleMapSelector
				showDialog={showMapSelectorModal}
				toggleDialog={toggleMapSelectorModal}
				title={"Clonar versión a..."}
				maps={maps}
				callback={handleNewVersionIn}
				selectedVersion={selectedVersion}
			/>
		</header>
	);
}
const HeaderWithRefs = forwardRef(Header);
export default HeaderWithRefs;
