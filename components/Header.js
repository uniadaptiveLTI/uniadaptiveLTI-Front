import styles from "@root/styles/Header.module.css";
import {
	useState,
	useContext,
	useEffect,
	forwardRef,
	useRef,
	useLayoutEffect,
} from "react";
import SimpleActionDialog from "@dialogs/SimpleActionDialog";
import SimpleMapSelector from "@dialogs/SimpleMapSelector";
import SimpleLessonSelector from "@dialogs/SimpleLessonSelector";
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
import { useReactFlow, useNodes } from "reactflow";
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
	NodeInfoContext,
	ExpandedAsideContext,
	MapInfoContext,
	VersionJsonContext,
	VersionInfoContext,
	PlatformContext,
	BlocksDataContext,
	MSGContext,
	SettingsContext,
	OnlineContext,
	MetaDataContext,
	ErrorListContext,
} from "@root/pages/_app";
import { toast } from "react-toastify";
import { notImplemented } from "@root/pages/_app";
import {
	base64Decode,
	base64Encode,
	capitalizeFirstLetter,
	uniqueId,
} from "@utils/Utils.js";
import { isNodeArrayEqual } from "@utils/Nodes";
import { errorListCheck } from "@utils/ErrorHandling";
import download from "downloadjs";
import { NodeTypes } from "@utils/TypeDefinitions";
import ExportModal from "@components/dialogs/ExportModal";
import { DevModeStatusContext } from "pages/_app";
import UserSettingsModal from "./dialogs/UserSettingsModal";
import { hasLessons } from "@utils/Platform";

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

function Header({ LTISettings }, ref) {
	const { devModeStatus } = useContext(DevModeStatusContext);
	const { errorList, setErrorList } = useContext(ErrorListContext);
	const rfNodes = useNodes();
	const [showModalVersions, setShowModalVersions] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [showMapSelectorModal, setShowMapSelectorModal] = useState(false);
	const [showExportModal, setShowExportModal] = useState(false);
	const [showUserSettingsModal, setShowUserSettingsModal] = useState(false);
	const [showLessonSelector, setShowLessonSelector] = useState(false);
	const selectMapDOM = useRef(null);
	const selectVersionDOM = useRef(null);
	const [versions, setVersions] = useState([]);
	const [lastMapCreated, setLastMapCreated] = useState();
	const [lastVersionCreated, setLastVersionCreated] = useState();

	const [loadedUserData, setLoadedUserData] = useState();
	const [loadedMetaData, setLoadedMetaData] = useState();
	const [loadedMaps, setLoadedMaps] = useState();
	const emptyMap = { id: -1, name: "Seleccionar un mapa" };
	const [maps, setMaps] = useState([emptyMap]);
	const { metaData, setMetaData } = useContext(MetaDataContext);
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
	const toggleExportModal = () => setShowExportModal(!showExportModal);
	const toggleUserSettingsModal = () =>
		setShowUserSettingsModal(!showUserSettingsModal);

	const closeModalVersions = () => setShowModalVersions(false);
	const openModalVersions = () => setShowModalVersions(true);

	const { platform, setPlatform } = useContext(PlatformContext);
	const { nodeSelected, setNodeSelected } = useContext(NodeInfoContext);
	const { mapSelected, setMapSelected } = useContext(MapInfoContext);
	const { editVersionSelected, setEditVersionSelected } =
		useContext(VersionInfoContext);
	const { msg, setMSG } = useContext(MSGContext);

	const { versionJson, setVersionJson } = useContext(VersionJsonContext);

	const { expandedAside, setExpandedAside } = useContext(ExpandedAsideContext);

	const reactFlowInstance = useReactFlow();
	const { currentBlocksData, setCurrentBlocksData } =
		useContext(BlocksDataContext);
	const { isOffline } = useContext(OnlineContext);
	const { settings, setSettings } = useContext(SettingsContext);

	const parsedSettings = JSON.parse(settings);
	let { reducedAnimations } = parsedSettings;
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
		setNodeSelected("");
		setEditVersionSelected("");
	}

	/**
	 * Handles a change in the selected map.
	 * @param {Event} e - The change event or an id.
	 */
	function handleMapChange(e) {
		resetEdit();
		let id;
		if (isNaN(e)) {
			id = Number(e.target.value);
		} else {
			id = e;
		}
		let selectedMap = [...maps].find((m) => m.id == id);
		if (selectedMap) {
			setMapSelected(selectedMap);

			if (selectedMap.versions) {
				setVersions(selectedMap.versions);
				setSelectedVersion(selectedMap.versions[0]);
				setCurrentBlocksData(selectedMap.versions[0].blocksData);
			}
			if (selectedMap.id == -1) {
				changeToMapSelection();
			}
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
		const emptyNewMap = {
			id: uniqueId(),
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
							deletable: false,
							data: {
								label: "Entrada",
							},
						},
						{
							id: uniqueId(),
							position: { x: 125, y: 0 },
							type: "end",
							deletable: false,
							data: {
								label: "Salida",
							},
						},
					],
				},
			],
		};
		console.log(emptyNewMap);
		const encodedNewMap = encodeURIComponent(emptyNewMap);
		// console.log(response);

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
		setLastMapCreated(emptyNewMap.id);
		toast(`Mapa: "Nuevo Mapa ${maps.length}" creado`, defaultToastSuccess);
	};

	const handleImportedMap = async (lesson) => {
		const uniqueId = () => parseInt(Date.now() * Math.random()).toString();
		try {
			const encodedCourse = encodeURIComponent(metaData.course_id);

			const response = await fetch(
				lesson != undefined
					? `http://${LTISettings.back_url}/lti/get_modules?course=${encodedCourse}&course=${encodedCourse}&session=${encodeSessionId}&lesson=${lesson}`
					: `http://${LTISettings.back_url}/lti/get_modules?course=${encodedCourse}&course=${encodedCourse}&session=${encodeSessionId}`
			);

			if (!response.ok) {
				toast(
					`Ha ocurrido un error durante la importación del mapa`,
					defaultToastError
				);
				throw new Error("Request failed");
			}
			const data = await response.json();

			console.log("JSON RECIBIDO: ", data);

			let newX = 125;
			let newY = 0;
			const validTypes = [];
			NodeTypes.map((node) => validTypes.push(node.type));
			const nodes = [];
			data.map((node) => {
				if (validTypes.includes(node.modname)) {
					const newNode = {};
					newNode.id = "" + uniqueId();
					newNode.type = node.modname;
					newNode.position = { x: newX, y: newY };
					newNode.data = {
						label: node.name,
						indent: node.indent,
						section: node.section,
						children: [],
						order: node.order,
						lmsResource: node.id,
						lmsVisibility: node.visible,
					};

					newX += 125;
					nodes.push(newNode);
				}
			});
			console.log("JSON FILTRADO Y ADAPTADO: ", nodes);

			const platformNewMap = {
				id: maps.length,
				name:
					lesson != undefined
						? `Mapa importado desde ${
								metaData.lessons.find((lesson) => lesson.id == lesson).name
						  } (${maps.length})`
						: `Mapa importado desde ${metaData.name} (${maps.length})`,
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
								deletable: false,
								data: {
									label: "Entrada",
								},
							},
							...nodes,
							{
								id: uniqueId(),
								position: { x: newX, y: 0 },
								type: "end",
								deletable: false,
								data: {
									label: "Salida",
								},
							},
						],
					},
				],
			};

			const newMaps = [...maps, platformNewMap];

			console.log("JSON CONVERTIDO EN UN MAPA: ", platformNewMap);

			setMaps(newMaps);
			setLastMapCreated(platformNewMap.id);
			toast(`Mapa: ${platformNewMap.name} creado`, defaultToastSuccess);
		} catch (e) {
			toast(
				`Ha ocurrido un error durante la importación del mapa`,
				defaultToastError
			);
			throw new Error("Request failed");
		}
	};

	const handleImportedMapFromLesson = () => {
		setShowLessonSelector(true);
	};

	/**
	 * Handles the creation of a new version.
	 */
	const handleNewVersion = (e, data) => {
		const selectedMap = getMapById(selectMapDOM.current.value);
		const emptyNewVersion = {
			id: uniqueId(),
			name: "Nueva Versión " + selectedMap.versions.length,
			lastUpdate: new Date().toLocaleDateString(),
			default: "true",
			blocksData: [
				{
					id: uniqueId(),
					position: { x: 0, y: 0 },
					type: "start",
					deletable: false,
					data: {
						label: "Entrada",
					},
				},
				{
					id: uniqueId(),
					position: { x: 125, y: 0 },
					type: "end",
					deletable: false,
					data: {
						label: "Salida",
					},
				},
			],
		};

		const newFullVersion = data
			? {
					...data,
					id: uniqueId(),
					lastUpdate: new Date().toLocaleDateString(),
					name: "Nueva Versión " + selectedMap.versions.length,
					default: false,
			  }
			: emptyNewVersion;

		const newMapVersions = [...selectedMap.versions, newFullVersion];
		let modifiedMap = selectedMap;
		modifiedMap.versions = newMapVersions;
		const mapIndex = maps.findIndex((m) => m.id == selectedMap.id);
		const newMaps = [...maps];
		newMaps[mapIndex] = selectedMap;
		setMaps(newMaps);
		setVersions(modifiedMap.versions);
		setLastVersionCreated(newFullVersion);
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
		setNodeSelected("");
		setEditVersionSelected("");
		setMapSelected(getMapById(mapId));
	};

	/**
	 * Handles the editing of a version.
	 */
	const editVersion = () => {
		if (expandedAside != true) {
			setExpandedAside(true);
		}
		setNodeSelected("");
		setEditVersionSelected(selectedVersion);
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
			base64Encode(
				JSON.stringify({
					instance_id: metaData.instance_id,
					course_id: metaData.course_id,
					platform: metaData.platform,
					data: rfNodes,
				})
			),
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
			const jsonObject = JSON.parse(base64Decode(output));
			if (
				jsonObject.instance_id == metaData.instance_id &&
				jsonObject.course_id == metaData.course_id &&
				jsonObject.platform == platform
			) {
				setCurrentBlocksData(jsonObject.data);
			} else {
				const jsonCleanedBlockData = jsonObject.data.map((node) => {
					node.data = {
						...node.data,
						children: undefined,
						conditions: undefined,
						section: 0, //TODO: Test in sakai
					};
				});
			}

			//displayContents(output);
		};

		reader.readAsText(file);
	};

	useLayoutEffect(() => {
		//Get resources
		try {
			if (LTISettings.debugging.dev_files) {
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
						setMetaData({
							...data,
							back_url: LTISettings.back_url,
						});
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
			} else {
				fetch(`http://${LTISettings.back_url}/lti/get_session`)
					.then((response) => response.json())
					.then((data) => {
						console.log("DATOS DEL LMS: ", data);
						// Usuario
						setUserData(data[0]);
						setLoadedUserData(true);

						//Metadata
						setPlatform(data[1].platform);
						setMetaData({
							...data[1],
							back_url: LTISettings.back_url,
						}); //FIXME: This should be the course website in moodle
						setLoadedMetaData(true);

						//Maps
						setMaps([emptyMap, ...data[2].maps]);
						setLoadedMaps(true);
					})
					.catch((e) => {
						const error = new Error(
							"No se pudieron obtener los datos del curso desde el LMS."
						);
						error.log = e;
						throw error;
					});
			}
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
		if (lastMapCreated != undefined) handleMapChange(lastMapCreated);
	}, [lastMapCreated]);

	useEffect(() => {
		if (lastVersionCreated != undefined) setSelectedVersion(lastVersionCreated);
	}, [lastVersionCreated]);

	useEffect(() => {
		if (selectedVersion) {
			if (selectedVersion.id != versionJson.id) {
				resetEdit();
				errorListCheck(
					selectedVersion.blocksData,
					errorList,
					setErrorList,
					false
				);
				//console.log(selectedVersion.blocksData);
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
				if (isNodeArrayEqual(rfNodes, currentBlocksData)) {
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
					src={LTISettings.branding.small_logo_path}
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

	async function saveVersion() {
		//Cleaning node data
		const cleanedNodes = rfNodes.map((node) => {
			const nodeCopy = { ...node };
			delete nodeCopy.height;
			delete nodeCopy.width;
			delete nodeCopy.positionAbsolute;
			delete nodeCopy.dragging;
			delete nodeCopy.selected;
			delete nodeCopy.targetPosition;
			return nodeCopy;
		});
		try {
			const saveData = {
				instance_id: metaData.instance_id,
				course_id: metaData.course_id,
				platform: platform,
				user_id: userData.user_id,
				map: {
					id: mapSelected.id,
					name: mapSelected.name,
					versions: {
						...selectedVersion,
						lastUpdate: new Date().toLocaleString("es-ES"),
						blocksData: cleanedNodes,
					},
				},
			};
			const response = await fetch(
				`http://${LTISettings.back_url}/lti/store_version`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ saveData }),
				}
			);
			console.log(response);
		} catch (e) {}
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

	const handleToUserSettings = (key) => {
		if (key == undefined || key == "Enter" || key == "NumpadEnter") {
			setShowUserSettingsModal(true);
		}
	};

	return (
		<header ref={ref} className={styles.header}>
			<Navbar>
				<Container fluid className="flex-column flex-sm-row">
					<Form
						className={
							!expandedAside
								? "d-flex px-2 col-2 col-sm-6 col-md-8 col-12 flex-column flex-sm-row"
								: "d-flex px-2 col-2 col-sm-6 col-md-8 col-12 flex-column flex-sm-row"
						}
						style={{ gap: "20px" }}
					>
						{!expandedAside && <CreateLogo />}
						<div style={{ flexGrow: 1 }}>
							{metaData && (
								<span>
									Mapas del curso:{" "}
									<a
										href={
											metaData.return_url.startsWith("http")
												? metaData.return_url
												: "https://" + metaData.return_url
										}
										target="_blank"
									>
										{metaData.name}
									</a>
								</span>
							)}
							<Form.Select
								ref={selectMapDOM}
								value={mapSelected.id}
								onChange={handleMapChange}
								disabled={isOffline || !loadedMaps}
								defaultValue={-1}
								className="mb-2 mb-sm-0"
							>
								{loadedMaps &&
									maps.map((map) => (
										<option id={map.id} key={map.id} value={map.id}>
											{map.name}
										</option>
									))}
							</Form.Select>
						</div>
					</Form>
					<Nav
						className={
							!expandedAside
								? "col-10 col-sm-6 col-md-4 col-12"
								: "col-10 col-sm-6 col-md-4 col-12"
						}
					>
						<Container
							fluid
							className={
								"d-flex align-items-center justify-content-evenly col-sm-7 flex-wrap"
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
									{!hasLessons(platform) && (
										<Dropdown.Item onClick={() => handleImportedMap()}>
											Nuevo mapa desde {capitalizeFirstLetter(platform)}
										</Dropdown.Item>
									)}
									{hasLessons(platform) && (
										<Dropdown.Item onClick={handleImportedMapFromLesson}>
											Nuevo mapa desde {capitalizeFirstLetter(platform)}...
										</Dropdown.Item>
									)}
									{mapSelected.id >= 0 && (
										<>
											<Dropdown.Item onClick={handleNewVersion}>
												Nueva versión vacía
											</Dropdown.Item>
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
										onClick={saveVersion}
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
								className={`d-flex align-items-center p-2 ${
									styles.actionButtons
								} ${errorList?.length > 0 ? styles.error : styles.success}`}
								onClick={() => {
									if (mapSelected && mapSelected.id > -1)
										setShowExportModal(true);
								}}
							>
								<FontAwesomeIcon
									icon={faBell}
									style={{ height: "20px", width: "20px" }}
								/>
							</Button>
						</Container>
						<Container
							fluid
							className={
								(!expandedAside ? "d-flex col-sm-5" : "d-flex col-sm-5") +
								" justify-content-center"
							}
						>
							<div
								className="d-flex flex-row"
								role="button"
								onClick={() => handleToUserSettings()}
								onKeyUp={(e) => handleToUserSettings(e.code)}
								tabIndex={0}
							>
								<Container className="d-flex flex-column">
									<div>{loadedUserData ? userData.name : "Cargando..."}</div>
									<div>{loadedMetaData && capitalizeFirstLetter(platform)}</div>
								</Container>
								<div className="mx-auto d-flex align-items-center">
									{loadedUserData && userData.profile_url && (
										<img
											alt="Imagen de perfil"
											src={userData.profile_url}
											className={styles.userProfile}
											width={48}
											height={48}
										></img>
									)}
								</div>
							</div>
						</Container>
					</Nav>
				</Container>
				{mapSelected.id > -1 && versions.length > 0 && (
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
								title={selectedVersion.name}
								onClick={openModalVersions}
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
				<Modal show={showModalVersions} onHide={closeModalVersions}>
					<Modal.Header closeButton>
						<Modal.Title>
							Detalles de &quot;{selectedVersion.name}&quot;
						</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						Actualmente la versión seleccionada es &quot;
						<strong>{selectedVersion.name}</strong>&quot;, modificada por última
						vez <b>{selectedVersion.lastUpdate}</b>.
						{devModeStatus && (
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
											{JSON.stringify(rfNodes, null, "\t")}
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
						<Button variant="secondary" onClick={closeModalVersions}>
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
			{showDeleteModal && (
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
			)}
			{showMapSelectorModal && (
				<SimpleMapSelector
					showDialog={showMapSelectorModal}
					toggleDialog={toggleMapSelectorModal}
					title={"Clonar versión a..."}
					maps={maps}
					callback={handleNewVersionIn}
					selectedVersion={selectedVersion}
					action={"Importar"}
				/>
			)}
			{showLessonSelector && (
				<SimpleLessonSelector
					showDialog={showLessonSelector}
					setShowDialog={setShowLessonSelector}
					callback={handleImportedMap}
					lessons={metaData.lessons}
					action={"Importar"}
				/>
			)}
			{showExportModal && (
				<ExportModal
					showDialog={showExportModal}
					toggleDialog={toggleExportModal}
					metadata={metaData}
					userdata={userData}
					errorList={errorList}
					callback={() => {
						alert("TEST");
					}}
				/>
			)}
			{showUserSettingsModal && (
				<UserSettingsModal
					showDialog={showUserSettingsModal}
					setShowDialog={setShowUserSettingsModal}
					LTISettings={LTISettings}
				/>
			)}
		</header>
	);
}
const HeaderWithRefs = forwardRef(Header);
export default HeaderWithRefs;
