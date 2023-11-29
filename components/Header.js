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
	SplitButton,
	Form,
	Nav,
	Navbar,
	Modal,
	Popover,
	OverlayTrigger,
	Spinner,
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
	faTriangleExclamation,
	faFileExport,
	faArrowRightToBracket,
} from "@fortawesome/free-solid-svg-icons";
import {
	NodeInfoContext,
	ExpandedAsideContext,
	MapInfoContext,
	VersionJsonContext,
	VersionInfoContext,
	PlatformContext,
	BlocksDataContext,
	SettingsContext,
	OnlineContext,
	MetaDataContext,
	ErrorListContext,
	HeaderToEmptySelectorContext,
} from "/pages/_app";
import { toast } from "react-toastify";
import {
	base64Decode,
	base64Encode,
	capitalizeFirstLetter,
	orderByPropertyAlphabetically,
	uniqueId,
	getHTTPPrefix,
	saveVersion,
	fetchBackEnd,
	handleNameCollision,
} from "@utils/Utils.js";
import { isNodeArrayEqual } from "@utils/Nodes";
import { errorListCheck } from "@utils/ErrorHandling";
import download from "downloadjs";
import { NodeTypes } from "@utils/TypeDefinitions";
import ExportModal from "@components/dialogs/ExportModal";
import { DevModeStatusContext } from "pages/_app";
import UserSettingsModal from "./dialogs/UserSettingsModal";
import { hasLessons } from "@utils/Platform";
import {
	createNewMoodleMap,
	parseMoodleNode,
	parseMoodleBadges,
} from "@utils/Moodle";
import { createNewSakaiMap, parseSakaiNode } from "@utils/Sakai";

const DEFAULT_TOAST_SUCCESS = {
	hideProgressBar: false,
	autoClose: 2000,
	type: "success",
	position: "bottom-center",
};

const DEFAULT_TOAST_ERROR = {
	hideProgressBar: false,
	autoClose: 2000,
	type: "error",
	position: "bottom-center",
};

function Header({ LTISettings }, ref) {
	const { devModeStatus } = useContext(DevModeStatusContext);
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
	const rfNodes = useNodes();
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

	const [loadedUserData, setLoadedUserData] = useState();
	const [loadedMetaData, setLoadedMetaData] = useState();
	const EMPTY_MAP = { id: -1, name: "Seleccionar un mapa" };
	const [loadedMaps, setLoadedMaps] = useState(false);
	const { metaData, setMetaData } = useContext(MetaDataContext);
	const [userData, setUserData] = useState({});

	const [selectedVersion, setSelectedVersion] = useState();
	const fileImportDOM = useRef(null);
	const [saveButtonColor, setSaveButtonColor] = useState("light");

	const [modalTitle, setModalTitle] = useState();
	const [modalBody, setModalBody] = useState();
	const [modalCallback, setModalCallback] = useState();
	const toggleDeleteModal = () => setShowDeleteModal(!showDeleteModal);
	const toggleMapSelectorModal = () =>
		setShowMapSelectorModal(!showMapSelectorModal);
	const toggleExportModal = () => setShowExportModal(!showExportModal);
	const toggleUserSettingsModal = () =>
		setShowUserSettingsModal(!showUserSettingsModal);

	const [saving, setSaving] = useState(false);

	const closeModalVersions = () => setShowModalVersions(false);
	const openModalVersions = () => setShowModalVersions(true);

	const { platform, setPlatform } = useContext(PlatformContext);
	const { nodeSelected, setNodeSelected } = useContext(NodeInfoContext);
	const { mapSelected, setMapSelected } = useContext(MapInfoContext);
	const { editVersionSelected, setEditVersionSelected } =
		useContext(VersionInfoContext);

	const { versionJson, setVersionJson } = useContext(VersionJsonContext);

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
		setNodeSelected("");
		setEditVersionSelected("");
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

			if (selectedMap.versions) {
				if (!LTISettings.debugging.dev_files) {
					try {
						const RESPONSE = await fetchBackEnd(
							LTISettings,
							sessionStorage.getItem("token"),
							"api/lti/get_version",
							"POST",
							{ version_id: selectedMap.versions[0].id }
						);

						const data = RESPONSE.data;

						if (!data.invalid) {
							setVersions(selectedMap.versions);
							setSelectedVersion(selectedMap.versions[0]);
							setCurrentBlocksData(data.blocks_data);
						} else {
							setVersions(selectedMap.versions);
							setSelectedVersion(selectedMap.versions[0]);
							setCurrentBlocksData(selectedMap.versions[0].blocksData);
						}
					} catch (error) {
						console.error("Error:", error);
					}
				} else {
					setVersions(selectedMap.versions);
					setSelectedVersion(selectedMap.versions[0]);
					setCurrentBlocksData(selectedMap.versions[0].blocksData);
				}
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
		setCurrentBlocksData();
	}

	/**
	 * Handles the creation of a new map.
	 */
	const handleNewMap = (e, data, localMaps = maps) => {
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
					default: "true",
					blocksData: new Array(),
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

		const NEW_MAPS = [...localMaps, data ? NEW_MAP : EMPTY_NEW_MAP];

		console.info(`🗺️ New map added: `, data ? NEW_MAP : EMPTY_NEW_MAP);

		setMaps(NEW_MAPS);
		setLastMapCreated(EMPTY_NEW_MAP.id);
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
	};

	const handleImportedMap = async (
		lesson,
		localMetaData = metaData,
		localMaps = maps
	) => {
		const EMPTY_NEW_VERSION = [];

		let data;
		if (!LTISettings.debugging.dev_files) {
			const response = await fetchBackEnd(
				LTISettings,
				sessionStorage.getItem("token"),
				"api/lti/get_modules",
				"POST",
				{ lesson: lesson }
			);

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
			switch (platform) {
				case "moodle":
					endpointJson = "devmoodleimport.json";
					break;
				case "sakai":
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
		NodeTypes.map((node) => VALID_TYPES.push(node.type));
		const NODES = [];

		const IS_EMPTY_MAP = data.length < 1;

		if (!IS_EMPTY_MAP) {
			data.map((node) => {
				switch (platform) {
					case "moodle":
						NODES.push(parseMoodleNode(node, newX, newY));
						newX += 125;
						break;
					case "sakai":
						parseSakaiNode(NODES, node, newX, newY, VALID_TYPES);
						newX += 125;
						break;
				}
			});
		} else {
			data = EMPTY_NEW_VERSION;
		}

		//Bring badges
		switch (platform) {
			case "moodle":
				localMetaData.badges.map((badge) => {
					nodes.push(parseMoodleBadges(badge, newX, newY, nodes));
					newX += 125;
				});
				break;
			case "sakai":
				break;
		}

		let platformNewMap;
		if (platform == "moodle") {
			platformNewMap = createNewMoodleMap(NODES, localMetaData, localMaps);
		} else {
			platformNewMap = createNewSakaiMap(
				NODES,
				lesson,
				localMetaData,
				localMaps
			);
		}

		const newMaps = [...localMaps, platformNewMap];

		console.info(`🗺️ New map added: `, platformNewMap);

		setMaps(newMaps);
		setLastMapCreated(platformNewMap.id);
		toast(`Mapa: ${platformNewMap.name} creado`, DEFAULT_TOAST_SUCCESS);
		setMapCount((prev) => prev + 1);
		// } catch (e) {
		// 	// toast(
		// 	// 	`Ha ocurrido un error durante la importación del mapa`,
		// 	// 	defaultToastError
		// 	// );
		// 	// throw new Error("Request failed");
		// }
	};

	const handleImportedMapFromLesson = () => {
		setShowLessonSelector(true);
	};

	/**
	 * Handles the creation of a new version.
	 */
	const handleNewVersion = (e, data) => {
		const SELECTED_MAP = getMapById(selectMapDOM.current.value);
		let FINAL_NAME = handleNameCollision(
			"Nueva Versión",
			SELECTED_MAP.versions.map((version) => version.name),
			true,
			"("
		);
		const EMPTY_NEW_VERSION = {
			id: uniqueId(),
			name: FINAL_NAME,
			lastUpdate: new Date().toLocaleDateString(),
			default: "true",
			blocksData: new Array(),
		};

		const NEW_FULL_VERSION = data
			? {
					...data,
					id: uniqueId(),
					lastUpdate: new Date().toLocaleDateString(),
					name: FINAL_NAME,
					default: false,
			  }
			: EMPTY_NEW_VERSION;

		const NEW_MAP_VERSIONS = [...SELECTED_MAP.versions, NEW_FULL_VERSION];
		let modifiedMap = SELECTED_MAP;
		modifiedMap.versions = NEW_MAP_VERSIONS;
		const MAP_INDEX = maps.findIndex((m) => m.id == SELECTED_MAP.id);
		const NEW_MAPS = [...maps];
		NEW_MAPS[MAP_INDEX] = SELECTED_MAP;
		setMaps(NEW_MAPS);
		setVersions(modifiedMap.versions);
		setLastVersionCreated(NEW_FULL_VERSION);
		toast(`Versión: ${FINAL_NAME} creada`, DEFAULT_TOAST_SUCCESS);
	};

	/**
	 * Adds a new version to a map with the given the version data and a map id.
	 * @param {Object} data - The data for the new version of the map.
	 * @param {string} mapId - The id of the map to create a new version for.
	 */
	const handleNewVersionIn = (data, mapId) => {
		const SELECTED_MAP = getMapById(mapId);
		let finalName = handleNameCollision(
			"Nueva Versión",
			SELECTED_MAP.versions.map((version) => version.name),
			true,
			"("
		);
		const NEW_MAP_VERSIONS = [
			...SELECTED_MAP.versions,
			{
				...data,
				id: uniqueId(),
				lastUpdate: new Date().toLocaleDateString(),
				name: finalName,
				default: false,
			},
		];

		let modifiedMap = SELECTED_MAP;
		modifiedMap.versions = NEW_MAP_VERSIONS;
		const MAP_INDEX = maps.findIndex((m) => m.id == SELECTED_MAP.id);
		const NEW_MAPS = [...maps];
		NEW_MAPS[MAP_INDEX] = modifiedMap;
		setMaps(NEW_MAPS);
		setVersions(modifiedMap.versions);
		setMapSelected(modifiedMap);
		setSelectedVersion(modifiedMap.versions[SELECTED_MAP.versions.length - 1]);
		setCurrentBlocksData(
			modifiedMap.versions[SELECTED_MAP.versions.length - 1].blocksData
		);

		toast(`Versión: ${finalName} creada`, DEFAULT_TOAST_SUCCESS);
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
	const deleteMap = async () => {
		const MAP_ID = selectMapDOM.current.value;
		if (MAP_ID != -1) {
			if (!LTISettings.debugging.dev_files) {
				try {
					const RESPONSE = await fetchBackEnd(
						LTISettings,
						sessionStorage.getItem("token"),
						"api/lti/delete_map_by_id",
						"POST",
						{ id: Number(MAP_ID) }
					);

					if (RESPONSE) {
						if (!RESPONSE.ok) {
							throw `Ha ocurrido un error.`;
						} else {
							//FIXME: Load map "shell"
							setLoadedMaps(false);
							const RESPONSE = await fetchBackEnd(
								LTISettings,
								sessionStorage.getItem("token"),
								"api/lti/get_session",
								"POST"
							);
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
			if (!LTISettings.debugging.dev_files) {
				try {
					const response = await fetchBackEnd(
						LTISettings,
						sessionStorage.getItem("token"),
						"api/lti/delete_version_by_id",
						"POST",
						{ id: Number(VERSION_ID) }
					);
					if (response) {
						if (!response.ok) {
							throw `Ha ocurrido un error.`;
						} else {
							//FIXME: Load map "shell"
							// setLoadedMaps(false);
							// fetch(
							//	`${getHTTPPrefix()}//${LTISettings.back_url}/lti/get_session`
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
							setCurrentBlocksData(
								FIRST_VERSION?.blocksData || versions[0]?.blocksData
							);
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
				setCurrentBlocksData(
					FIRST_VERSION?.blocksData || versions[0]?.blocksData
				);
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
					platform: platform,
					data: rfNodes,
				})
			),
			`${mapSelected.name}-${selectedVersion.name}-${capitalizeFirstLetter(
				platform
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
			//FIXME: File verification
			const jsonObject = JSON.parse(base64Decode(output));
			if (
				jsonObject.instance_id == metaData.instance_id &&
				jsonObject.course_id == metaData.course_id &&
				jsonObject.platform == platform
			) {
				setCurrentBlocksData(jsonObject.data);
				errorListCheck(jsonObject.data, errorList, setErrorList, false);
				toast("Importado con éxito.", {
					type: "success",
					autoClose: 2000,
					position: "bottom-center",
				});
			} else {
				if (jsonObject.platform == platform) {
					toast("Plataforma compatible, importación parcial.", {
						type: "warning",
						autoClose: 2000,
						position: "bottom-center",
					});
					const JSON_CLEANED_BLOCKDATA = jsonObject.data.map((node) => {
						node.data = {
							...node.data,
							children: undefined,
							c: undefined,
							g: undefined,
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
						const MAPS = [EMPTY_MAP, ...data];
						setMaps(MAPS);
						setLoadedMaps(true);
						setMapCount(MAPS.length);
					})
					.catch((e) => {
						const ERROR = new Error(
							"No se pudieron obtener los datos del curso desde los archivos locales."
						);
						ERROR.log = e;
						throw ERROR;
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
						const ERROR = new Error(
							"No se pudieron obtener los metadatos del curso desde los archivos locales."
						);
						ERROR.log = e;
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
							"No se pudieron obtener los datos del usuario desde los archivos locales."
						);
						ERROR.log = e;
						throw ERROR;
					});
			} else {
				const loadResources = async (token) => {
					try {
						const RESPONSE = await fetchBackEnd(
							LTISettings,
							token,
							"api/lti/get_session",
							"POST"
						);
						if (RESPONSE && RESPONSE.ok) {
							const DATA = RESPONSE.data;

							console.log("LMS DATA: ", DATA);
							// Usuario
							setUserData(DATA[0]);
							setLoadedUserData(true);

							//Metadata
							setPlatform(DATA[1].platform);
							setMetaData({
								...DATA[1],
								back_url: LTISettings.back_url,
							}); //FIXME: This should be the course website in moodle
							setLoadedMetaData(true);

							//Maps
							const MAPS = [EMPTY_MAP, ...DATA[2].maps];
							setMaps(MAPS);
							setMapCount(MAPS.length);
							setLoadedMaps(true);
						} else {
							alert(
								`Error: No se puede obtener una sesión válida para el curso con los identificadores actuales. ¿Ha expirado la sesión?. Vuelva a alanzar la herramienta desde el gestor de contenido. Cerrando.`
							);
							//window.close(); //TODO: DO THIS BETTER
						}
					} catch (e) {
						toast("No se puede conectar con el servidor.", {
							hideProgressBar: false,
							autoClose: 4000,
							type: "error",
							position: "bottom-center",
							theme: "light",
						});
					}
				};

				const PARAMS = new URLSearchParams(window.location.href.split("?")[1]);
				const TOKEN = PARAMS.get("token");
				let newUrl = window.location.href.split("?")[0];
				window.history.replaceState({}, document.title, newUrl);
				if (TOKEN) {
					//if there is a token in the url
					sessionStorage.setItem("token", TOKEN);
					loadResources(TOKEN);
				} else {
					//if there isn't a token in the url
					let attempts = 0;
					const MAX_ATTEMPTS = 20;
					const INTERVAL = setInterval(() => {
						const STORED_TOKEN = sessionStorage.getItem("token");
						if (STORED_TOKEN == undefined) {
							if (attempts < MAX_ATTEMPTS) {
								attempts++;
							} else {
								if (!LTISettings.debugging.dev_files) {
									alert(
										`Error: Interfaz lanzada sin identificador de sesión apropiado. Vuelva a lanzar la herramienta desde el gestor de contenido. Cerrando.`
									);
									window.close();
								}
								clearInterval(INTERVAL);
							}
						} else {
							loadResources(STORED_TOKEN);
							clearInterval(INTERVAL);
						}
					}, 100);
				}
			}
		} catch (e) {
			toast(e, DEFAULT_TOAST_ERROR);
			console.error(`❌ Error: `, e, e.log);
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
				setCurrentBlocksData(selectedVersion.blocksData);
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
		if (REACTFLOW_INSTANCE && currentBlocksData) {
			const REACTFLOW_NODES = [...REACTFLOW_INSTANCE?.getNodes()].map((e) => {
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

	function enableSaving(boolean) {
		setSaving(boolean);
		saveButtonRef.current.disabled = boolean;
	}

	const saveActualVersion = async () => {
		try {
			enableSaving(true);
			await saveVersion(
				rfNodes,
				metaData,
				platform,
				userData,
				mapSelected,
				selectedVersion,
				LTISettings,
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
		setMapNames(
			maps.map((map) => {
				return { id: map.id, name: map.name };
			})
		);
	}, [mapCount]);

	useEffect(() => {
		setAllowUseStatus(!(isOffline || !loadedMaps));
	}, [isOffline, loadedMaps]);
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

							{mapSelected.id >= 0 && (
								<Button
									variant={
										errorList && errorList.length >= 1 ? "warning" : "success"
									}
									className={`d-flex align-items-center p-2 position-relative ${styles.actionButtonsDynamic}`}
									onClick={() => {
										if (mapSelected && mapSelected.id > -1)
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
											src={
												userData.profile_url == "default"
													? "/images/default_image.png"
													: userData.profile_url
											} //Used if the LMS does not support profile images.
											className={styles.userProfile}
											width={48}
											height={48}
											style={
												devModeStatus
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
													platform: platform,
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
		</header>
	);
}
const HeaderWithRefs = forwardRef(Header);
export default HeaderWithRefs;
