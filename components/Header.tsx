import styles from "/styles/Header.module.css";
import {
	useState,
	useContext,
	useEffect,
	forwardRef,
	useRef,
	useLayoutEffect,
	useId,
} from "react";
import SimpleActionDialog from "@components/dialogs/SimpleActionDialog";
import SimpleMapSelector from "@components/dialogs/SimpleMapSelector";
import SimpleLessonSelector from "@components/dialogs/SimpleLessonSelector";
import {
	Button,
	Container,
	Dropdown,
	Form,
	Nav,
	Navbar,
	Modal,
	Spinner,
	DropdownButton,
	OverlayTrigger,
	Tooltip,
} from "react-bootstrap";
import { useReactFlow, useNodes } from "reactflow";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faCircleQuestion,
	faCirclePlus,
	faPencil,
	faTrash,
	faFloppyDisk,
	faTriangleExclamation,
	faArrowRightToBracket,
	faEllipsisVertical,
} from "@fortawesome/free-solid-svg-icons";
import {
	EditedNodeContext,
	ExpandedAsideContext,
	MapInfoContext,
	CurrentVersionContext,
	BlocksDataContext,
	SettingsContext,
	OnlineContext,
	MetaDataContext,
	ErrorListContext,
	HeaderToEmptySelectorContext,
	DEFAULT_TOAST_ERROR,
	DEFAULT_TOAST_SUCCESS,
} from "pages/_app";
import { ToastOptions, toast } from "react-toastify";
import {
	base64Decode,
	base64Encode,
	capitalizeFirstLetter,
	uniqueId,
	saveVersion,
	handleNameCollision,
	saveVersions,
} from "@utils/Utils";
import { isNodeArrayEqual } from "@utils/Nodes";
import { errorListCheck } from "@utils/ErrorHandling";
import download from "downloadjs";
import { NodeDeclarations } from "@utils/TypeDefinitions";
import ExportModal from "@components/dialogs/ExportModal";
import UserSettingsModal from "./dialogs/UserSettingsModal";
import { Platforms, hasLessons } from "@utils/Platform";
import {
	createNewMoodleMap,
	parseMoodleNode,
	parseMoodleBadges,
} from "@utils/Moodle";
import { createNewSakaiMap, parseSakaiNode } from "@utils/Sakai";
import { EditedVersionContext, UserDataContext } from "pages/_app";
import { parseBool } from "../utils/Utils";
import ConfirmationModal from "./dialogs/ConfirmationModal";
import { IVersion } from "./interfaces/IVersion";
import LTIErrorMessage from "./messages/LTIErrors";
import { IMetaData } from "./interfaces/IMetaData";
import { INode } from "./interfaces/INode";
import getMap from "middleware/api/getMap";
import getVersions from "middleware/api/getVersions";
import getVersion from "middleware/api/getVersion";
import getModules from "middleware/api/getModules";
import { IMap } from "./interfaces/IMap";
import addVersion from "middleware/api/addVersion";
import deleteMapById from "middleware/api/deleteMapById";
import getSession from "middleware/api/getSession";
import deleteVersionById from "middleware/api/deleteVersionById";

function Header({ LTISettings }, ref) {
	const { errorList, setErrorList } = useContext(ErrorListContext);
	const {
		mapCount,
		setMapCount,
		setMapNames,
		setAllowUseStatus,
		maps,
		setMaps,
		setFuncCreateMap,
		setFuncImportMap,
		setFuncImportMapFromLesson,
		setFuncMapChange,
	} = useContext(HeaderToEmptySelectorContext);
	const rfNodes = useNodes() as Array<INode>;
	const [showModalVersions, setShowModalVersions] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [showMapSelectorModal, setShowMapSelectorModal] = useState(false);
	const [showExportModal, setShowExportModal] = useState(false);
	const [showUserSettingsModal, setShowUserSettingsModal] = useState(false);
	const [showLessonSelector, setShowLessonSelector] = useState(false);
	const selectMapDOM = useRef(null);
	const selectVersionDOM = useRef(null);
	const saveButtonRef = useRef(null);
	const [versions, setVersions] = useState([]);
	const [lastMapCreated, setLastMapCreated] = useState();
	const [lastVersionCreated, setLastVersionCreated] = useState();

	const [loadedUserData, setLoadedUserData] = useState(false);
	const [loadedMetaData, setLoadedMetaData] = useState(false);
	const EMPTY_MAP = { id: -1, name: "Seleccionar un mapa", versions: [] };
	const [loadedMaps, setLoadedMaps] = useState(false);
	const { metaData, setMetaData } = useContext(MetaDataContext);
	const { userData, setUserData } = useContext(UserDataContext);
	const [selectedVersion, setSelectedVersion] = useState<IVersion>();
	const fileImportDOM = useRef(null);
	const [saveButtonColor, setSaveButtonColor] = useState("light");
	const [showDropdown, setShowDropdown] = useState(false);

	const [modalTitle, setModalTitle] = useState("");
	const [modalBody, setModalBody] = useState("");
	const [modalCallback, setModalCallback] = useState(() => {});
	const toggleDeleteModal = () => setShowDeleteModal(!showDeleteModal);
	const toggleMapSelectorModal = () =>
		setShowMapSelectorModal(!showMapSelectorModal);
	const toggleExportModal = () => setShowExportModal(!showExportModal);
	const toggleUserSettingsModal = () =>
		setShowUserSettingsModal(!showUserSettingsModal);

	const [saving, setSaving] = useState(false);

	const closeModalVersions = () => setShowModalVersions(false);
	const openModalVersions = () => setShowModalVersions(true);

	const { nodeSelected, setNodeSelected } = useContext(EditedNodeContext);
	const { mapSelected, setMapSelected } = useContext(MapInfoContext);
	const { editVersionSelected, setEditVersionSelected } =
		useContext(EditedVersionContext);

	const { versionJson, setVersionJson } = useContext(CurrentVersionContext);

	const { expandedAside, setExpandedAside } = useContext(ExpandedAsideContext);

	const REACTFLOW_INSTANCE = useReactFlow();
	const { currentBlocksData, setCurrentBlocksData } =
		useContext(BlocksDataContext);
	const { isOffline } = useContext(OnlineContext);
	const { settings, setSettings } = useContext(SettingsContext);
	const ccId = useId();

	const PARSED_SETTINGS = JSON.parse(settings);

	let { reducedAnimations } = PARSED_SETTINGS;
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
		setNodeSelected(undefined);
		setEditVersionSelected(undefined);
	}

	/**
	 * Handles a change in the selected map.
	 * @param {Event} e - The change event or an id.
	 */
	async function handleMapChange(e) {
		resetEdit();
		setErrorList([]);
		let id;
		if (isNaN(e)) {
			id = Number(e.target.value);
		} else {
			id = e;
		}

		let selectedMap = [...maps].find((m) => m.id == id);
		if (selectedMap) {
			setMapSelected(selectedMap);

			if (!parseBool(process.env.NEXT_PUBLIC_DEV_FILES)) {
				if (selectedMap.id != -1) {
					try {
						const MAP_RESPONSE = await getMap(selectedMap.id);
						if (MAP_RESPONSE.ok == true) {
							const MAP_DATA = MAP_RESPONSE.data;
							const VERSIONS_RESPONSE = await getVersions(MAP_DATA.created_id);
							if (VERSIONS_RESPONSE.ok) {
								const VERSIONS_DATA = VERSIONS_RESPONSE.data;
								const VERSION_RESPONSE = await getVersion({
									version_id: VERSIONS_DATA[0].id,
								});
								setVersions(VERSIONS_DATA);
								if (VERSION_RESPONSE.ok) {
									setSelectedVersion(VERSION_RESPONSE.data as IVersion);
								} else {
									console.error("Error, datos de version inválido");
								}
							} else {
								console.error("Error, datos de versiones inválidos");
							}
						} else {
							console.error("Error, datos de mapa inválidos");
						}
					} catch (error) {
						console.error("Error:", error);
					}
				} else {
					changeToMapSelection();
				}
			} else {
				setVersions(selectedMap.versions);

				setSelectedVersion(
					selectedMap.versions != undefined
						? (selectedMap.versions[0] as IVersion)
						: undefined
				);
			}
			if (selectedMap.id == -1) {
				changeToMapSelection();
			}
		}
	}

	/**
	 * Changes the selected map to the "you need to select a map" message.
	 */
	function changeToMapSelection() {
		resetEdit();
		setMapSelected(getMapById(-1));
		setCurrentBlocksData(undefined);
	}

	/**
	 * Handles the creation of a new map.
	 */
	const handleNewMap = async (
		data = undefined,
		localMetaData = metaData,
		localUserData = userData,
		localMaps = maps
	) => {
		const EMPTY_NEW_MAP = {
			id: uniqueId(),
			name: handleNameCollision(
				"Nuevo Mapa",
				localMaps.map((map) => map.name),
				true,
				"("
			),
			versions: [
				{
					id: uniqueId(),
					name: "Primera versión",
					lastUpdate: new Date().toLocaleDateString(),
					default: false,
					blocks_data: new Array(),
				},
			],
		};

		const NEW_MAP = {
			...data,
			id: uniqueId(),
			name: handleNameCollision(
				"Nuevo Mapa",
				localMaps.map((map) => map.name),
				true,
				"("
			),
		};

		try {
			if (!parseBool(process.env.NEXT_PUBLIC_DEV_FILES)) {
				await saveVersions(
					data ? NEW_MAP.versions : EMPTY_NEW_MAP.versions,
					localMetaData,
					localMetaData.platform,
					localUserData,
					data ? NEW_MAP : EMPTY_NEW_MAP,
					DEFAULT_TOAST_SUCCESS,
					DEFAULT_TOAST_ERROR,
					toast,
					enableSaving,
					undefined
				);
			}

			const NEW_MAPS = [...localMaps, data ? NEW_MAP : EMPTY_NEW_MAP];

			console.info(`🗺️ New map added: `, data ? NEW_MAP : EMPTY_NEW_MAP);

			setMaps(NEW_MAPS);
			setLastMapCreated(data ? NEW_MAP.id : EMPTY_NEW_MAP.id);
			toast(
				`Mapa: ${handleNameCollision(
					"Nuevo Mapa",
					localMaps.map((map) => map.name),
					true,
					"("
				)} creado`,
				DEFAULT_TOAST_SUCCESS
			);
			setMapCount((prev) => prev + 1);
		} catch (error) {
			toast(`No se ha podido crear el mapa`, DEFAULT_TOAST_ERROR);
		}
	};

	const handleImportedMap = async (
		lesson?: number | undefined,
		localMetaData: IMetaData = metaData,
		localUserData = userData,
		localMaps = maps
	) => {
		const EMPTY_NEW_VERSION = [];

		let data;
		if (!parseBool(process.env.NEXT_PUBLIC_DEV_FILES)) {
			const response = await getModules(lesson);

			if (!response.ok) {
				toast(
					`Ha ocurrido un error durante la importación del mapa`,
					DEFAULT_TOAST_ERROR
				);
				throw new Error("Request failed");
			}
			data = response.data;
		} else {
			let endpointJson = null;
			switch (metaData.platform) {
				case Platforms.Moodle:
					endpointJson = "devmoodleimport.json";
					break;
				case Platforms.Sakai:
					endpointJson = "devsakaiimport.json";
			}

			const RESPONSE = await fetch(`resources/${endpointJson}`);

			if (RESPONSE) {
				data = await RESPONSE.json();
			}
		}
		console.info(`❓ JSON:`, data);

		let newX = 125;
		let newY = 0;
		const VALID_TYPES = [];
		NodeDeclarations.map((node) => VALID_TYPES.push(node.type));
		const NODES = [];

		const IS_EMPTY_MAP = data.length < 1;

		if (!IS_EMPTY_MAP) {
			data.map((node) => {
				switch (localMetaData.platform) {
					case Platforms.Moodle:
						NODES.push(parseMoodleNode(node, newX, newY));
						newX += 125;
						break;
					case Platforms.Sakai:
						parseSakaiNode(NODES, node, newX, newY, VALID_TYPES);
						newX += 125;
						break;
				}
			});
		} else {
			data = EMPTY_NEW_VERSION;
		}

		//Bring badges
		switch (localMetaData.platform) {
			case Platforms.Moodle:
				localMetaData.badges.map((badge) => {
					NODES.push(parseMoodleBadges(badge, newX, newY, NODES));
					newX += 125;
				});
				break;
			case Platforms.Sakai:
				break;
		}

		let platformNewMap;
		if (localMetaData.platform == Platforms.Moodle) {
			platformNewMap = createNewMoodleMap(NODES, localMetaData, localMaps);
		} else {
			platformNewMap = createNewSakaiMap(
				NODES,
				lesson,
				localMetaData,
				localMaps
			);
		}
		if (!parseBool(process.env.NEXT_PUBLIC_DEV_FILES))
			await saveVersions(
				platformNewMap.versions,
				localMetaData,
				localMetaData.platform,
				localUserData,
				platformNewMap,
				DEFAULT_TOAST_SUCCESS,
				DEFAULT_TOAST_ERROR,
				toast,
				enableSaving,
				undefined
			);

		const newMaps = [...localMaps, platformNewMap];

		console.info(`🗺️ New map added: `, platformNewMap);

		setMaps(newMaps);
		setLastMapCreated(platformNewMap.id);
		toast(`Mapa: ${platformNewMap.name} creado`, DEFAULT_TOAST_SUCCESS);
		setMapCount((prev) => prev + 1);
	};

	const handleImportedMapFromLesson = () => {
		setShowLessonSelector(true);
	};

	/**
	 * Handles the creation of a new version.
	 */
	///AQUI
	const handleNewVersion = (data?) => {
		const SELECTED_MAP = getMapById(selectMapDOM.current.value);

		handleNewVersionIn(data, SELECTED_MAP.id);
	};

	/**
	 * Adds a new version to a map with the given the version data and a map id.
	 * @param data - The data for the new version of the map.
	 * @param mapId - The id of the map to create a new version for.
	 */
	const handleNewVersionIn = async (data: IVersion, mapId: IMap["id"]) => {
		const SELECTED_MAP = getMapById(mapId);
		let finalName = handleNameCollision(
			"Nueva Versión",
			SELECTED_MAP.versions.map((version) => version.name),
			true,
			"("
		);

		const NEW_VERSION = data
			? {
					...data,
					id: Number(uniqueId()),
					lastUpdate: new Date().toLocaleDateString(),
					name: finalName,
					default: false,
			  }
			: {
					blocks_data: [],
					id: Number(uniqueId()),
					lastUpdate: new Date().toLocaleDateString(),
					name: finalName,
					default: false,
			  };

		if (!process.env.NEXT_PUBLIC_DEV_FILES) {
			const ADDVERSION_RESPONSE = await addVersion(
				SELECTED_MAP.id,
				NEW_VERSION
			);

			if (!ADDVERSION_RESPONSE.ok) {
				toast(
					`Ha ocurrido un error durante la creación del mapa`,
					DEFAULT_TOAST_ERROR
				);
				throw new Error("Request failed");
			} else {
				const VERSIONS_RESPONSE = await getVersions(SELECTED_MAP.id);

				if (!VERSIONS_RESPONSE.ok) {
					toast(
						`Ha ocurrido un error durante la carga del mapa`,
						DEFAULT_TOAST_ERROR
					);
					throw new Error("Request failed");
				} else {
					setVersions(VERSIONS_RESPONSE.data);

					const VERSION_RESPONSE = await getVersion({
						version_id: VERSIONS_RESPONSE.data[0].id,
					});

					if (!VERSION_RESPONSE.ok) {
						toast(
							`Ha ocurrido un error durante la carga del mapa`,
							DEFAULT_TOAST_ERROR
						);
						throw new Error("Request failed");
					} else {
						setSelectedVersion(VERSION_RESPONSE.data);
						setCurrentBlocksData(VERSION_RESPONSE.data.blocks_data);
					}

					setMapSelected(SELECTED_MAP);
					toast(`Versión: ${finalName} creada`, DEFAULT_TOAST_SUCCESS);
				}
			}
		} else {
			setVersions([...SELECTED_MAP.versions, NEW_VERSION]);
			setSelectedVersion(NEW_VERSION);
			if (NEW_VERSION.blocks_data)
				setCurrentBlocksData(NEW_VERSION.blocks_data);
			setMapSelected(SELECTED_MAP);
			toast(`Versión: ${finalName} creada`, DEFAULT_TOAST_SUCCESS);
		}
	};

	/**
	 * Handles the editing of an map.
	 */
	const editMap = () => {
		if (expandedAside != true) {
			setExpandedAside(true);
		}
		const mapId = selectMapDOM.current.value;
		setNodeSelected(undefined);
		setEditVersionSelected(undefined);
		setMapSelected(getMapById(mapId));
	};

	/**
	 * Handles the editing of a version.
	 */
	const editVersion = () => {
		if (expandedAside != true) {
			setExpandedAside(true);
		}
		setNodeSelected(undefined);
		setEditVersionSelected(selectedVersion);
	};

	/**
	 * Shows a modal to confirm deletion of an map.
	 */
	const showDeleteMapModal = () => {
		setModalTitle(`¿Eliminar "${mapSelected.name}"?`);
		setModalBody(`¿Desea eliminar "${mapSelected.name}"?`);
		setModalCallback(() => deleteMap());
		setShowDeleteModal(true);
	};

	/**
	 * Handles the deletion of an map.
	 */
	const deleteMap = async () => {
		const MAP_ID = selectMapDOM.current.value;
		if (MAP_ID != -1) {
			if (!parseBool(process.env.NEXT_PUBLIC_DEV_FILES)) {
				try {
					const RESPONSE = await deleteMapById(MAP_ID);

					if (RESPONSE) {
						if (!RESPONSE.ok) {
							throw `Ha ocurrido un error.`;
						} else {
							//FIXME: Load map "shell"
							setLoadedMaps(false);
							const RESPONSE = await getSession();
							const DATA = RESPONSE.data;
							const MAPS = [EMPTY_MAP, ...DATA[2].maps];
							setMaps(MAPS);
							setMapCount(MAPS.length);
							setLoadedMaps(true);
							changeToMapSelection();
							toast(`Mapa eliminado con éxito.`, DEFAULT_TOAST_SUCCESS);
						}
					} else {
						throw `Ha ocurrido un error.`;
					}
				} catch (e) {
					toast(`Ha ocurrido un error.`, DEFAULT_TOAST_ERROR);
				}
			} else {
				setMaps((prevMaps) => prevMaps.filter((map) => map.id != MAP_ID));
				toast(`Mapa eliminado con éxito.`, DEFAULT_TOAST_SUCCESS);
				changeToMapSelection();
				setMapCount((prev) => prev - 1);
			}
		} else {
			toast(`No puedes eliminar este mapa.`, DEFAULT_TOAST_ERROR);
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
	const deleteVersion = async () => {
		const VERSION_ID = selectedVersion.id;
		const MAP_ID = selectMapDOM.current.value;
		const VERSION_COUNT = maps.find((map) => map.id == MAP_ID).versions.length;
		if (VERSION_COUNT > 1) {
			if (!parseBool(process.env.NEXT_PUBLIC_DEV_FILES)) {
				try {
					const RESPONSE = await deleteVersionById(VERSION_ID);

					if (RESPONSE) {
						if (!RESPONSE.ok) {
							throw `Ha ocurrido un error.`;
						} else {
							//FIXME: Load map "shell"
							// setLoadedMaps(false);
							// fetch(
							//	`${getHTTPPrefix()}//${process.env.NEXT_PUBLIC_BACK_URL}/lti/get_session`
							//)
							// 	.then((response) => response.json())
							// 	.then((data) => {
							// 		const maps = [emptyMap, ...data[2].maps];
							// 		setMaps(maps);
							// 		setMapCount(maps.length);
							// 		setLoadedMaps(true);
							// 	});
							setVersions((versions) =>
								versions.filter((version) => version.id != VERSION_ID)
							);

							const FIRST_VERSION = versions.find(
								(version) => version.id != VERSION_ID
							);
							setSelectedVersion(FIRST_VERSION || versions[0] || null);

							const NEW_MAP_VERSIONS = mapSelected.versions.filter(
								(version) => version.id != VERSION_ID
							);
							const MODIFIED_MAP = {
								...mapSelected,
								versions: NEW_MAP_VERSIONS,
							};
							const MAP_INDEX = maps.findIndex((m) => m.id === mapSelected.id);
							const NEW_MAPS = [...maps];
							NEW_MAPS[MAP_INDEX] = MODIFIED_MAP;
							setMaps(NEW_MAPS);
							setVersions(MODIFIED_MAP.versions);
							toast(`Versión eliminada con éxito.`, DEFAULT_TOAST_SUCCESS);
						}
					} else {
						throw `Ha ocurrido un error.`;
					}
				} catch (e) {
					toast(`Ha ocurrido un error.`, DEFAULT_TOAST_ERROR);
				}
			} else {
				setVersions((versions) =>
					versions.filter((version) => version.id != VERSION_ID)
				);

				const FIRST_VERSION = versions.find(
					(version) => version.id != VERSION_ID
				);
				setSelectedVersion(FIRST_VERSION || versions[0] || null);

				const NEW_MAP_VERSIONS = mapSelected.versions.filter(
					(version) => version.id != VERSION_ID
				);
				const MODIFIED_MAP = { ...mapSelected, versions: NEW_MAP_VERSIONS };
				const MAP_INDEX = maps.findIndex((m) => m.id === mapSelected.id);
				const NEW_MAPS = [...maps];
				NEW_MAPS[MAP_INDEX] = MODIFIED_MAP;
				setMaps(NEW_MAPS);
				setVersions(MODIFIED_MAP.versions);
				toast(`Versión eliminada con éxito.`, DEFAULT_TOAST_SUCCESS);
			}
		} else {
			toast(`No puedes eliminar esta versión.`, DEFAULT_TOAST_ERROR);
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
			`${mapSelected.name}-${selectedVersion.name}-${capitalizeFirstLetter(
				metaData.platform
			)}-${new Date().toLocaleDateString().replaceAll("/", "-")}.json`,
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
			// Check if output is a string before decoding
			if (typeof output === "string") {
				const jsonObject = JSON.parse(base64Decode(output));

				if (
					jsonObject.instance_id == metaData.instance_id &&
					jsonObject.course_id == metaData.course_id &&
					jsonObject.platform == metaData.platform
				) {
					errorListCheck(jsonObject.data, errorList, setErrorList, false);
					toast("Importado con éxito.", {
						type: "success",
						autoClose: 2000,
						position: "bottom-center",
					});
				} else {
					if (jsonObject.platform == metaData.platform) {
						toast("Plataforma compatible, importación parcial.", {
							type: "warning",
							autoClose: 2000,
							position: "bottom-center",
						});
						const JSON_CLEANED_BLOCKDATA = jsonObject.data.map((node) => {
							node.data = {
								...node.data,
								children: node.data.children,
								c: node.data.c,
								g: node.data.g,
								lmsResource: undefined,
								section: 0,
								order: 0,
								indent: 0,
							};
							return node;
						});
						setCurrentBlocksData(JSON_CLEANED_BLOCKDATA);
						errorListCheck(
							JSON_CLEANED_BLOCKDATA,
							errorList,
							setErrorList,
							false
						);
					} else {
						toast("No se puede importar, datos incompatibles.", {
							type: "error",
							autoClose: 2000,
							position: "bottom-center",
						});
					}
				}
			}
		};

		reader.readAsText(file);
	};

	useLayoutEffect(() => {
		//Get resources
		try {
			if (parseBool(process.env.NEXT_PUBLIC_DEV_FILES)) {
				fetch("resources/devmaps.json")
					.then((response) => response.json())
					.then((data) => {
						const MAPS = [EMPTY_MAP, ...data];
						setMaps(MAPS);
						setLoadedMaps(true);
						setMapCount(MAPS.length);
					})
					.catch((e) => {
						const ERROR = new Error(
							"No se pudieron obtener los datos del curso desde los archivos locales.",
							{ cause: e }
						);
						throw ERROR;
					});
				fetch("resources/devmeta.json")
					.then((response) => response.json())
					.then((data) => {
						setMetaData({
							...data,
							back_url: process.env.NEXT_PUBLIC_BACK_URL,
						});
						setLoadedMetaData(true);
					})
					.catch((e) => {
						const ERROR = new Error(
							"No se pudieron obtener los datos del curso desde los archivos locales.",
							{ cause: e }
						);
						throw ERROR;
					});
				fetch("resources/devuser.json")
					.then((response) => response.json())
					.then((data) => {
						setUserData(data);
						setLoadedUserData(true);
					})
					.catch((e) => {
						const ERROR = new Error(
							"No se pudieron obtener los datos del usuario desde los archivos locales.",
							{ cause: e }
						);
						throw ERROR;
					});
			} else {
				const loadResources = async () => {
					try {
						const RESPONSE = await getSession();
						if (RESPONSE && RESPONSE.ok) {
							const DATA = RESPONSE.data;

							console.log("LMS DATA: ", DATA);
							// Userdata
							setUserData(DATA[0]);
							setLoadedUserData(true);

							//Metadata
							setMetaData({
								...DATA[1],
								back_url: process.env.NEXT_PUBLIC_BACK_URL,
							});
							setLoadedMetaData(true);

							//Maps
							const MAPS: Array<IMap> = [EMPTY_MAP, ...DATA[2]];
							setMaps(MAPS);
							setMapCount(MAPS.length);
							setLoadedMaps(true);
						} else {
							handleConfirmationShow();
						}
					} catch (e) {
						toast("No se puede conectar con el servidor.", DEFAULT_TOAST_ERROR);
					}
				};

				loadResources();
			}
		} catch (e) {
			toast(e, DEFAULT_TOAST_ERROR);
			console.error(`❌ Error: `, e, e.log);
		}
	}, []);

	useEffect(() => {
		if (loadedMaps) {
			let newMaps = [...maps];
			newMaps[maps.findIndex((b) => b.id == mapSelected.id)] = mapSelected;
			setMaps(newMaps);
		}
	}, [mapSelected]);

	useEffect(() => {
		if (lastMapCreated != undefined) handleMapChange(lastMapCreated);
		setLastMapCreated(undefined);
	}, [lastMapCreated]);

	useEffect(() => {
		if (lastVersionCreated != undefined) setSelectedVersion(lastVersionCreated);
		setLastVersionCreated(undefined);
	}, [lastVersionCreated]);

	useEffect(() => {
		if (selectedVersion) {
			if (selectedVersion.id) {
				resetEdit();
				errorListCheck(
					selectedVersion.blocks_data,
					errorList,
					setErrorList,
					false
				);
				setCurrentBlocksData(selectedVersion.blocks_data);
			}
		}
	}, [selectedVersion]);

	useEffect(() => {
		if (versions && versionJson) {
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
		if (REACTFLOW_INSTANCE && currentBlocksData) {
			const REACTFLOW_NODES = JSON.parse(
				JSON.stringify(REACTFLOW_INSTANCE?.getNodes())
			).map((e: any) => {
				delete e.height;
				delete e.width;
				delete e.positionAbsolute;
				delete e.dragging;
				delete e.selected;
				delete e["Symbol(internals)"];
				delete e.x;
				delete e.y;
				return e;
			});
			if (REACTFLOW_NODES.length > 0) {
				if (isNodeArrayEqual(REACTFLOW_NODES, currentBlocksData)) {
					setSaveButtonColor("success");
				} else {
					setSaveButtonColor("warning");
				}
			} else {
				setSaveButtonColor("success");
			}
		} else {
			setSaveButtonColor("light");
		}
	}, [REACTFLOW_INSTANCE?.getNodes()]); //TODO: Make it respond to node movement

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

	interface UserToggleProps {
		children: JSX.Element;
		onClick: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
	}
	/**
	 * A React component that renders a user toggle.
	 * @param {Object} props - The component's props.
	 * @param {JSX.Element} props.children - The component's children.
	 * @param {function} props.onClick - The onClick event handler.
	 * @param {Object} ref - A React ref to access the DOM element of the component.
	 * @returns {JSX.Element} A JSX element representing the user toggle.
	 */
	const UserToggle = forwardRef<HTMLAnchorElement, UserToggleProps>(
		({ children, onClick }, ref) => (
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
		)
	);

	UserToggle.displayName = "UserToggle";

	interface UserMenuProps {
		children: JSX.Element;
		style: React.CSSProperties;
		className: string;
		"aria-labelledby": string;
	}

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
	const UserMenu = forwardRef<HTMLDivElement, UserMenuProps>(
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

	const handleToUserSettings = (key = undefined) => {
		if (key == undefined || key == "Enter" || key == "NumpadEnter") {
			setShowUserSettingsModal(true);
		}
	};

	function enableSaving(boolean) {
		setSaving(boolean);
		if (saveButtonRef.current) {
			saveButtonRef.current.disabled = boolean;
		}
	}

	const saveActualVersion = async () => {
		try {
			enableSaving(true);
			await saveVersion(
				rfNodes,
				metaData,
				metaData.platform,
				userData,
				mapSelected,
				selectedVersion,
				DEFAULT_TOAST_SUCCESS,
				DEFAULT_TOAST_ERROR,
				toast,
				enableSaving,
				undefined
			);
		} catch (error) {
			console.error(`❌ Error: `, error);
		}
	};

	useEffect(() => {
		setFuncCreateMap(() => handleNewMap);
		setFuncImportMap(() => handleImportedMap);
		setFuncImportMapFromLesson(() => handleImportedMapFromLesson);
	}, []);

	useEffect(() => {
		setMapNames(maps.map((map) => map.name));
	}, [mapCount]);

	useEffect(() => {
		setAllowUseStatus(!(isOffline || !loadedMaps));
	}, [isOffline, loadedMaps]);

	const [confirmationShow, setConfirmationShow] = useState(false);
	const handleConfirmationClose = () => setConfirmationShow(false);
	const handleConfirmationShow = () => setConfirmationShow(true);

	async function fetchVersion(versionId) {
		if (!parseBool(process.env.NEXT_PUBLIC_DEV_FILES)) {
			try {
				const VERSION_RESPONSE = await getVersion({ created_id: versionId });
				if (VERSION_RESPONSE.ok) {
					setCurrentBlocksData(VERSION_RESPONSE.data.blocks_data);
				} else {
					console.error("Error, datos de version inválidos");
				}
			} catch (error) {
				console.error("Error, datos de version inválidos");
			}
		}
	}

	useEffect(() => {
		if (selectedVersion != undefined) {
			fetchVersion(selectedVersion.id);
		}
	}, [selectedVersion]);

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
								value={mapSelected?.id || -1}
								onChange={handleMapChange}
								disabled={isOffline || !loadedMaps}
								className="mb-2 mb-sm-0"
							>
								{loadedMaps &&
									maps.map((map) => (
										<option id={String(map.id)} key={map.id} value={map.id}>
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
							{/*FIXME: This Dropdown triggers an hydration error*/}
							<Dropdown className={`btn-light d-flex align-items-center`}>
								<Dropdown.Toggle
									id={useId()}
									variant="light"
									className={`btn-light d-flex align-items-center p-2 ${styles.actionButtons} ${styles.toggleButton}`}
									disabled={isOffline || !loadedMaps}
								>
									<FontAwesomeIcon
										icon={faCirclePlus}
										style={{ height: "20px", width: "20px" }}
									/>
								</Dropdown.Toggle>
								<Dropdown.Menu>
									<Dropdown.Item onClick={() => handleNewMap()}>
										Nuevo mapa vacío
									</Dropdown.Item>
									{metaData != undefined && !hasLessons(metaData.platform) && (
										<Dropdown.Item onClick={() => handleImportedMap()}>
											Nuevo mapa desde{" "}
											{capitalizeFirstLetter(metaData.platform)}
										</Dropdown.Item>
									)}
									{metaData != undefined && hasLessons(metaData.platform) && (
										<Dropdown.Item onClick={handleImportedMapFromLesson}>
											Nuevo mapa desde{" "}
											{capitalizeFirstLetter(metaData.platform)}...
										</Dropdown.Item>
									)}
									{mapSelected?.id != -1 && (
										<>
											<Dropdown.Item onClick={() => handleNewVersion()}>
												Nueva versión vacía
											</Dropdown.Item>
											<Dropdown.Item
												onClick={() =>
													handleNewVersion({
														...selectedVersion,
														blocks_data: REACTFLOW_INSTANCE.getNodes(),
													})
												}
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
							{mapSelected?.id != -1 && (
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
									<Button
										ref={saveButtonRef}
										className={` d-flex align-items-center p-2 ${styles.actionButtonsDynamic}`}
										disabled={isOffline || !loadedMaps}
										variant={saveButtonColor}
										aria-label="Guardar versión actual"
										onClick={saveActualVersion}
									>
										{saving && (
											<Spinner
												as="span"
												animation="border"
												size="sm"
												role="status"
												aria-hidden="true"
											/>
										)}
										{!saving && (
											<FontAwesomeIcon
												icon={faFloppyDisk}
												style={{ height: "20px", width: "20px" }}
											/>
										)}
									</Button>
								</>
							)}

							<Button
								variant="light"
								className={`btn-light d-flex align-items-center p-2 ${styles.actionButtons}`}
								onClick={() =>
									window.open(
										"https://docs.google.com/document/d/1mbLlx_1A9a-6aNAb8n_amQxxwZocZeawbat_Bs152Sw",
										"_blank"
									)
								}
							>
								<FontAwesomeIcon
									icon={faCircleQuestion}
									style={{ height: "20px", width: "20px" }}
								/>
							</Button>

							{mapSelected?.id != -1 && (
								<Button
									variant={
										errorList && errorList.length >= 1 ? "warning" : "success"
									}
									className={`d-flex align-items-center p-2 position-relative ${styles.actionButtonsDynamic}`}
									onClick={() => {
										setShowExportModal(true);
									}}
								>
									{errorList && errorList.length >= 1 && (
										<span className="d-flex gap-1 position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
											<FontAwesomeIcon icon={faTriangleExclamation} />
										</span>
									)}
									<FontAwesomeIcon
										icon={faArrowRightToBracket}
										style={{ height: "20px", width: "20px" }}
									/>
								</Button>
							)}
						</Container>
						<Container
							fluid
							className={
								(!expandedAside ? "d-flex col-sm-5" : "d-flex col-sm-5") +
								" justify-content-center"
							}
						>
							<OverlayTrigger
								placement="bottom"
								overlay={
									<Tooltip>
										Podrá manipular sus ajustes de usuario desde el menú
										interno.
										{loadedUserData && metaData.platform_name && (
											<>
												<hr />
												{`Plataforma: ${capitalizeFirstLetter(
													metaData.platform
												)}`}
											</>
										)}
									</Tooltip>
								}
								trigger={["hover", "focus"]}
							>
								<Button
									className="d-flex flex-row"
									variant="light"
									onClick={() => handleToUserSettings()}
								>
									<Container className="d-flex flex-column">
										<div>{loadedUserData ? userData.name : "Cargando..."}</div>
										<div>
											{loadedMetaData &&
												(metaData.platform_name
													? capitalizeFirstLetter(metaData.platform_name)
													: capitalizeFirstLetter(metaData.platform))}
										</div>
									</Container>
									<div className="mx-auto d-flex align-items-center">
										{loadedUserData && userData.profile_url && (
											<img
												alt="Imagen de perfil"
												src={
													userData.profile_url == "default"
														? "/images/default_image.png"
														: userData.profile_url
												} //Used if the LMS does not support profile images.
												className={styles.userProfile}
												width={48}
												height={48}
												style={
													parseBool(process.env.NEXT_PUBLIC_DEV_MODE)
														? {
																background: `var(--dev-background-color)`,
																padding: "0.30rem",
																scale: "1.2",
														  }
														: null
												}
											></img>
										)}
									</div>
								</Button>
							</OverlayTrigger>
						</Container>
					</Nav>
				</Container>
				{mapSelected?.id != -1 && versions.length > 0 && (
					<div
						className={
							styles.mapContainer +
							" " +
							(reducedAnimations && styles.noAnimation)
						}
					>
						<div className={styles.mapText}>
							<DropdownButton
								ref={selectVersionDOM}
								variant="light"
								title={selectedVersion.name}
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
							</DropdownButton>
							<Button
								onClick={openModalVersions}
								variant="light"
								disabled={isOffline || !loadedMaps}
								onMouseLeave={() => setShowDropdown(false)}
							>
								<FontAwesomeIcon icon={faEllipsisVertical} />
							</Button>
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
						{parseBool(process.env.NEXT_PUBLIC_DEV_MODE) && (
							<>
								<br />
								<div
									style={{
										overflow: "auto",
									}}
								>
									<details style={{ background: "#111213" }}>
										<summary style={{ background: "#ddd" }}>
											<b>Versión -&gt; JSON:</b>
										</summary>
										<code
											style={{
												whiteSpace: "pre",
												fontFamily: "monospace",
												fontSize: "12px",
												tabSize: 4,
												color: "#7cdcde",
											}}
										>
											{JSON.stringify(
												{
													instance_id: metaData.instance_id,
													course_id: metaData.course_id,
													platform: metaData.platform,
													data: rfNodes,
												},
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
					errorList={errorList}
					metaData={metaData}
					userData={userData}
					mapName={mapSelected.name}
					LTISettings={LTISettings}
					selectedVersion={selectedVersion}
				/>
			)}
			{showUserSettingsModal && (
				<UserSettingsModal
					showDialog={showUserSettingsModal}
					setShowDialog={setShowUserSettingsModal}
					LTISettings={LTISettings}
				/>
			)}
			<ConfirmationModal
				show={confirmationShow}
				handleClose={handleConfirmationClose}
				title="Error"
				message={<LTIErrorMessage error={"ERROR_INVALID_TOKEN"} />}
				confirm="Cerrar"
				callbackConfirm={() => window.close()}
			/>
		</header>
	);
}
const HeaderWithRefs = forwardRef(Header);
export default HeaderWithRefs;
