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
import { useReactFlow } from "reactflow";
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
	ExpandedAsideContext,
	MapInfoContext,
	VersionJsonContext,
	VersionInfoContext,
	PlatformContext,
	BlocksDataContext,
	MSGContext,
	SettingsContext,
	OnlineContext,
	UnitContext,
} from "@components/pages/_app";
import { toast } from "react-toastify";
import { notImplemented } from "@components/pages/_app";
import { capitalizeFirstLetter, isBlockArrayEqual, uniqueId } from "./Utils";
import download from "downloadjs";

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
	const selectMapDOM = useRef(null);
	const selectVersionDOM = useRef(null);
	const [versions, setVersions] = useState([]);

	const [loadedUserData, setLoadedUserData] = useState();
	const [loadedMetaData, setLoadedMetaData] = useState();
	const [loadedMaps, setLoadedMaps] = useState();
	const emptyMap = { id: -1, name: "Seleccionar un mapa" };
	const [maps, setMaps] = useState([emptyMap]);
	const [metaData, setMetaData] = useState({});
	const [userData, setUserData] = useState({});

	const [selectedVersion, setSelectedVersion] = useState();
	const fileImportDOM = useRef(null);
	const [saveButtonColor, setSaveButtonColor] = useState();

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
	const { units, setUnits } = useContext(UnitContext);

	const { versionJson, setVersionJson } = useContext(VersionJsonContext);

	const { expandedAside, setExpandedAside } = useContext(ExpandedAsideContext);

	const { reactFlowInstance } = useReactFlow();
	const { currentBlocksData, setCurrentBlocksData } =
		useContext(BlocksDataContext);
	const { isOffline } = useContext(OnlineContext);
	const { settings, setSettings } = useContext(SettingsContext);

	const parsedSettings = JSON.parse(settings);
	let { reducedAnimations } = parsedSettings;

	useEffect(() => {
		if (process.env.DEV_MODE) globalThis.rf = reactFlowInstance;
	}, []);

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
			console.log(selectedMap.versions[0].blocksData);
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
							position: { x: 0, y: 0 },
							type: "start",
							selectable: false,
							deletable: false,
							data: {
								label: "Inicio",
							},
						},
						{
							id: uniqueId(),
							position: { x: 125, y: 0 },
							type: "end",
							selectable: false,
							deletable: false,
							data: {
								label: "Final",
							},
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
		const selectedMap = getMapById(selectMapDOM.current.value);
		const emptyNewVersion = {
			id: selectedMap.versions.length,
			name: "Nueva Versión " + selectedMap.versions.length,
			lastUpdate: new Date().toLocaleDateString(),
			default: "true",
			blocksData: [
				{
					id: uniqueId(),
					position: { x: 0, y: 0 },
					type: "start",
					selectable: false,
					deletable: false,
					data: {
						label: "Inicio",
					},
				},
				{
					id: uniqueId(),
					position: { x: 125, y: 0 },
					type: "end",
					selectable: false,
					deletable: false,
					data: {
						label: "Final",
					},
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
		if (expandedAside != true) {
			setExpandedAside(true);
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
		if (expandedAside != true) {
			setExpandedAside(true);
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
			currentBlocksData(firstVersion?.blocksData || versions[0]?.blocksData);
			toast(`Versión eliminada con éxito.`, defaultToastSuccess);
		} else {
			toast(`No puedes eliminar esta versión.`, defaultToastError);
		}
	};

	const handleBlockDataExport = () => {
		download(
			encodeURIComponent(JSON.stringify(reactFlowInstance.getNodes())),
			`${mapSelected.name}-${selectedVersion.name}-${new Date()
				.toLocaleDateString()
				.replaceAll("/", "-")}.json`,
			"application/json"
		);
		setShowModalVersions(false);
	};

	const handleBlockDataImport = () => {
		fileImportDOM.current.click();
	};

	const handleImportedData = (e) => {
		let file = e.target.files[0];
		let reader = new FileReader();
		reader.onload = function (e) {
			let output = e.target.result;
			//FIXME: File verification
			const jsonBlockData = JSON.parse(decodeURIComponent(output));
			setCurrentBlocksData(jsonBlockData);
			//displayContents(output);
		};

		reader.readAsText(file);
	};

	useEffect(() => {
		try {
			fetch("resources/devmaps.json")
				.then((response) => response.json())
				.then((data) => {
					setMaps([emptyMap, ...data]);
					setLoadedMaps(true);
				})
				.catch((e) => {
					const error = new Error(
						"No se pudieron obtener los datos del curso desde el LMS."
					);
					error.log = e;
					throw error;
				});
			fetch("resources/devmeta.json")
				.then((response) => response.json())
				.then((data) => {
					setPlatform(data.platform);
					setMetaData({ ...data, courseSource: process.env.BACK_URL });
					setUnits(data.units);
					setLoadedMetaData(true);
				})
				.catch((e) => {
					const error = new Error(
						"No se pudieron obtener los metadatos del curso desde el LMS."
					);
					error.log = e;
					throw error;
				});
			fetch("resources/devuser.json")
				.then((response) => response.json())
				.then((data) => {
					setUserData(data);
					setLoadedUserData(true);
				})
				.catch((e) => {
					const error = new Error(
						"No se pudieron obtener los datos del usuario desde el LMS."
					);
					error.log = e;
					throw error;
				});
		} catch (e) {
			toast(e, defaultToastError);
			console.error(e, e.log);
		}
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
	}, [selectedVersion, reactFlowInstance]);

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

	//Gets if the nodes and the loaded version are different
	useEffect(() => {
		if (reactFlowInstance && currentBlocksData) {
			const rfNodes = [...reactFlowInstance?.getNodes()].map((e) => {
				delete e.height;
				delete e.width;
				delete e.positionAbsolute;
				delete e.dragging;
				delete e.selected;
				delete e["Symbol(internals)"];
				delete e.x; //FIXME: Find where these symbols are assignated
				delete e.y;
				return e;
			});
			if (rfNodes.length > 0) {
				if (isBlockArrayEqual(rfNodes, currentBlocksData)) {
					setSaveButtonColor(styles.primary);
				} else {
					setSaveButtonColor(styles.warning);
				}
			} else {
				setSaveButtonColor();
			}
		} else {
			setSaveButtonColor();
		}
	}, [reactFlowInstance?.getNodes()]); //TODO: Make it respond to node movement

	/**
	 * A React component that renders a logo.
	 * @returns {JSX.Element} A JSX element representing the logo.
	 */
	function CreateLogo() {
		return (
			<div className="mx-auto d-flex align-items-center" role="button">
				<img
					onClick={() => setExpandedAside(!expandedAside)}
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
							!expandedAside
								? "d-flex px-2 col-2 col-sm-6 col-md-8"
								: "d-flex px-2 col-2 col-sm-6 col-md-8"
						}
						style={{ gap: "20px" }}
					>
						{!expandedAside && <CreateLogo />}
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
							!expandedAside
								? "col-10 col-sm-6 col-md-4"
								: "col-10 col-sm-6 col-md-4"
						}
					>
						<Container
							fluid
							className={
								!expandedAside
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
											className={`btn-light d-flex align-items-center p-2 ${styles.actionButtons} ${styles.toggleButton}`}
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
											className={`btn-light d-flex align-items-center p-2 ${styles.actionButtons} ${styles.toggleButton}`}
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
									{/*FIXME: COLOR, remove variant*/}
									<Button
										className={` d-flex align-items-center p-2 ${styles.actionButtons} ${saveButtonColor}`}
										disabled={isOffline || !loadedMaps}
										variant="light"
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
									className={`btn-light d-flex align-items-center p-2 ${styles.actionButtons}`}
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
								className={`d-flex align-items-center p-2 ${styles.actionButtons} ${styles.error}`}
							>
								<FontAwesomeIcon
									icon={faBell}
									style={{ height: "20px", width: "20px" }}
								/>
							</Button>
						</Container>
						<Container
							fluid
							className={!expandedAside ? "d-flex col-sm-5" : "d-flex col-sm-5"}
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
											<div>
												{loadedUserData
													? userData.name + " " + userData.lastname
													: "Cargando..."}
											</div>
											<div>
												{loadedMetaData && capitalizeFirstLetter(platform)}
											</div>
										</Container>
										<div className="mx-auto d-flex align-items-center">
											{loadedUserData && userData.profileURL && (
												<Image
													alt="Imagen de perfil"
													src={userData.profileURL}
													className={styles.userProfile}
													width={48}
													height={48}
													onClick={
														process.env.DEV_MODE ? devPlataformChange : null
													}
												></Image>
											)}
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
						{process.env.DEV_MODE && (
							<>
								<br />
								<div
									style={{
										overflow: "auto",
									}}
								>
									<details>
										<summary>
											<b>Version -&gt; JSON:</b>
										</summary>
										<code
											style={{
												whiteSpace: "pre",
												fontFamily: "monospace",
											}}
										>
											{JSON.stringify(
												reactFlowInstance?.getNodes(),
												null,
												"\t"
											)}
										</code>
									</details>
								</div>
							</>
						)}
					</Modal.Body>
					<Modal.Footer>
						<Button variant="primary" onClick={handleBlockDataImport}>
							Importar...
						</Button>
						<Button variant="success" onClick={handleBlockDataExport}>
							Exportar
						</Button>
						<Button variant="secondary" onClick={closeModalVersiones}>
							Cerrar
						</Button>
						<input
							style={{ display: "none" }}
							type="file"
							ref={fileImportDOM}
							accept="application/json"
							onChange={handleImportedData}
						/>
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
