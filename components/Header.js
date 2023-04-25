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
	OnlineContext,
} from "@components/pages/_app";
import { toast } from "react-toastify";
import { notImplemented } from "@components/pages/_app";
import { uniqueId } from "./Utils";

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
	const { isOffline } = useContext(OnlineContext);
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
			name: "Física Grupo-A",
			versions: [
				{
					id: 0,
					name: "Última versión",
					lastUpdate: "20/05/2023",
					default: "true",
					blocksData: [
						{
							id: "dev-2A1",
							x: 0,
							y: 0,
							type: "start",
							title: "Inicio",
							children: ["dev0A1"],
							identation: 1,
						},
						{
							id: "dev-1A1",
							x: 2000,
							y: 0,
							type: "end",
							title: "Final",
							identation: 1,
						},
						{
							id: "dev0A1",
							x: 125,
							y: 0,
							type: "file",
							title: "Objetivos del curso",
							children: ["dev1A1"],
							identation: 1,
							order: 1,
							unit: 1,
						},
						{
							id: "dev1A1",
							x: 250,
							y: 0,
							type: "questionnaire",
							title: "Aerodinámica",
							conditions: [
								{
									type: "qualification",
									operand: ">=",
									objective: 5,
									unlockId: "dev2A1",
								},
								{
									type: "qualification",
									operand: ">=",
									objective: 5,
									unlockId: "dev3A1",
								},
								{
									type: "qualification",
									operand: "<",
									objective: 5,
									unlockId: "dev9A1",
								},
							],
							children: ["dev2A1", "dev3A1", "dev9A1"],
							identation: 2,
							order: 2,
							unit: 1,
						},
						{
							id: "dev2A1",
							x: 375,
							y: -175,
							type: "badge",
							title: "Conocimiento",
							identation: 2,
						},
						{
							id: "dev3A1",
							x: 500,
							y: 0,
							type: "url",
							title: "Web de Aerodinámica Avanzada",
							children: ["dev4A1"],
							identation: 2,
							order: 3,
							unit: 1,
						},
						{
							id: "dev4A1",
							x: 625,
							y: 0,
							type: "assignment",
							title: "Ejercicios de la Web",
							children: ["dev5A1", "dev6A1"],
							conditions: [
								{
									type: "qualification",
									operand: ">=",
									objective: 5,
									unlockId: "dev5A1",
								},
								{
									type: "qualification",
									operand: "<",
									objective: 5,
									unlockId: "dev6A1",
								},
							],
							identation: 2,
							order: 4,
							unit: 1,
						},
						{
							id: "dev5A1",
							x: 1000,
							y: 0,
							type: "questionnaire",
							title: "Física de fluidos",
							children: ["dev7A1", "dev8A1", "dev13A1"],
							identation: 1,
							order: 9,
							unit: 2,
						},
						{
							id: "dev6A1",
							x: 875,
							y: 175,
							type: "assignment",
							title: "Ejercicios de ampliación",
							children: ["dev5A1"],
							identation: 3,
							order: 8,
							unit: 1,
						},
						{
							id: "dev7A1",
							x: 1750,
							y: -175,
							type: "badge",
							title: "Mecánica de fluidos",
							identation: 1,
						},
						{
							id: "dev8A1",
							x: 1875,
							y: 0,
							type: "page",
							title: "Física cuantica",
							children: ["dev-1A1"],
							identation: 1,
							order: 14,
							unit: 3,
						},
						{
							id: "dev9A1",
							x: 375,
							y: 350,
							type: "folder",
							title: "Aerodínamica, refuerzo",
							children: ["dev10A1"],
							identation: 2,
							order: 5,
							unit: 1,
						},
						{
							id: "dev10A1",
							x: 500,
							y: 350,
							type: "questionnaire",
							title: "Aerodínamica, refuerzo",
							children: ["dev11A1", "dev12A1", "dev5A1"],
							conditions: [
								{
									type: "qualification",
									operand: ">=",
									objective: 5,
									unlockId: "dev5A1",
								},
								{
									type: "qualification",
									operand: ">=",
									objective: 5,
									unlockId: "dev11A1",
								},
								{
									type: "qualification",
									operand: "<",
									objective: 5,
									unlockId: "dev12A1",
								},
							],
							identation: 2,
							order: 6,
							unit: 1,
						},
						{
							id: "dev11A1",
							x: 625,
							y: 175,
							type: "badge",
							title: "Recuperación",
							identation: 3,
						},
						{
							id: "dev12A1",
							x: 625,
							y: 525,
							type: "assignment",
							title: "Trabajo de recuperación",
							children: ["dev6A1"],
							identation: 3,
							order: 7,
							unit: 1,
						},
						{
							id: "dev13A1",
							x: 1125,
							y: 175,
							type: "page",
							title: "Ayuda física de fluidos",
							children: ["dev14A1"],
							identation: 3,
							order: 10,
							unit: 2,
						},
						{
							id: "dev14A1",
							x: 1250,
							y: 175,
							type: "forum",
							title: "Preguntas fluidos",
							children: ["dev15A1"],
							identation: 3,
							order: 11,
							unit: 2,
						},
						{
							id: "dev15A1",
							x: 1375,
							y: 175,
							type: "questionnaire",
							title: "Recuperación fluidos",
							children: ["dev7A1", "dev8A1", "dev16A1"],
							conditions: [
								{
									type: "qualification",
									operand: ">=",
									objective: 5,
									unlockId: "dev7A1",
								},
								{
									type: "qualification",
									operand: ">=",
									objective: 5,
									unlockId: "dev8A1",
								},
								{
									type: "qualification",
									operand: "<",
									objective: 5,
									unlockId: "dev16A1",
								},
							],
							identation: 3,
							order: 12,
							unit: 2,
						},
						{
							id: "dev16A1",
							x: 1500,
							y: 350,
							type: "assignment",
							title: "Trabajo de recuperación",
							children: ["dev7A1", "dev8A1"],
							identation: 4,
							order: 13,
							unit: 2,
						},
					],
				},
				{
					id: 1,
					name: "Prueba 2",
					lastUpdate: "08/04/2023",
					default: "false",
					blocksData: [
						{
							id: "dev-2A2",
							x: 0,
							y: 0,
							type: "start",
							title: "Inicio",
							children: ["dev-1A2"],
							identation: 1,
						},
						{
							id: "dev-1A2",
							x: 125,
							y: 0,
							type: "end",
							title: "Final",
							identation: 1,
						},
					],
				},
			],
		},
		{
			id: 2,
			name: "Ejemplos de UNIAdaptive",
			versions: [
				{
					id: 0,
					name: "Última versión",
					lastUpdate: "20/05/2023",
					default: "true",
					blocksData: [
						{
							id: "dev-2B1",
							x: 0,
							y: 175,
							type: "start",
							title: "Inicio",
							children: ["dev0B1"],
							identation: 1,
						},
						{
							id: "dev-1B1",
							x: 1000,
							y: 525,
							type: "end",
							title: "Final",
							identation: 1,
						},
						{
							id: "dev0B1",
							x: 125,
							y: 175,
							type: "file",
							title: "Ecuaciones",
							children: ["dev1B1"],
							identation: 1,
							order: 1,
							unit: 1,
						},
						{
							id: "dev1B1",
							x: 250,
							y: 175,
							type: "questionnaire",
							title: "Examen Tema 1",
							conditions: [
								{
									type: "qualification",
									operand: ">",
									objective: 8,
									unlockId: "dev2B1",
								},
							],
							children: ["dev2B1", "dev4B1"],
							identation: 2,
							order: 2,
							unit: 1,
						},
						{
							id: "dev2B1",
							x: 375,
							y: 0,
							type: "folder",
							title: "Ecuaciones",
							children: ["dev3B1"],
							identation: 2,
							order: 3,
							unit: 1,
						},
						{
							id: "dev3B1",
							x: 500,
							y: 0,
							type: "badge",
							title: "Insignia Ecuaciones",
							identation: 2,
						},
						{
							id: "dev4B1",
							x: 375,
							y: 350,
							type: "url",
							title: "Web raices cuadradas",
							children: ["dev5B1"],
							identation: 1,
							order: 4,
							unit: 1,
						},
						{
							id: "dev5B1",
							x: 500,
							y: 350,
							type: "forum",
							title: "Foro de discusión",
							children: ["dev6B1"],
							identation: 2,
							order: 5,
							unit: 1,
						},
						{
							id: "dev6B1",
							x: 625,
							y: 350,
							type: "questionnaire",
							title: "Cuestionario de raices",
							children: ["dev7B1", "dev8B1"],
							identation: 1,
							order: 6,
							unit: 2,
						},
						{
							id: "dev7B1",
							x: 750,
							y: 175,
							type: "assignment",
							title: "Ejercicio de raices",
							identation: 1,
							order: 7,
							unit: 2,
						},
						{
							id: "dev8B1",
							x: 750,
							y: 525,
							type: "choice",
							title: "Preguntas sobre raices",
							children: ["dev9B1"],
							identation: 1,
							order: 8,
							unit: 2,
						},
						{
							id: "dev9B1",
							x: 875,
							y: 525,
							type: "page",
							title: "Web informativa",
							children: ["dev-1B1"],
							identation: 2,
							order: 9,
							unit: 3,
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
							id: "dev-2B2",
							x: 0,
							y: 700,
							type: "start",
							title: "Inicio",
							children: ["dev0B2"],
							identation: 1,
						},
						{
							id: "dev-1B2",
							x: 1000,
							y: 700,
							type: "end",
							title: "Final",
							identation: 1,
						},
						{
							id: "dev0B2",
							x: 125,
							y: 700,
							type: "file",
							title: "Ecuaciones",
							children: ["dev1B2"],
							identation: 1,
							order: 1,
							unit: 1,
						},
						{
							id: "dev1B2",
							x: 250,
							y: 700,
							type: "questionnaire",
							title: "Examen Tema 1",
							conditions: [
								{
									type: "qualification",
									operand: ">",
									objective: 8,
									unlockId: "dev2B2",
								},
							],
							children: ["dev2B2", "dev5B2"],
							identation: 2,
							order: 2,
							unit: 1,
						},
						{
							id: "dev2B2",
							x: 375,
							y: 525,
							type: "folder",
							title: "Carpeta Ecuaciones",
							children: ["dev10B2", "dev11B2"],
							identation: 2,
							order: 3,
							unit: 1,
						},
						{
							id: "dev5B2",
							x: 375,
							y: 1050,
							type: "questionnaire",
							title: "Cuestionario de raices",
							children: ["dev6B2", "dev7B2"],
							identation: 1,
							order: 8,
							unit: 2,
						},
						{
							id: "dev6B2",
							x: 625,
							y: 875,
							type: "assignment",
							title: "Ejercicio de raices",
							children: ["dev-1B2"],
							identation: 1,
							order: 9,
							unit: 2,
						},
						{
							id: "dev7B2",
							x: 625,
							y: 1225,
							type: "choice",
							title: "Preguntas y respuestas",
							children: ["dev40B2", "dev41B2"],
							identation: 1,
							order: 10,
							unit: 2,
						},
						{
							id: "dev10B2",
							x: 500,
							y: 350,
							type: "folder",
							title: "Carpeta Ecuaciones 2",
							children: ["dev12B2", "dev13B2"],
							identation: 2,
							order: 4,
							unit: 1,
						},
						{
							id: "dev11B2",
							x: 500,
							y: 700,
							type: "folder",
							title: "Carpeta Ecuaciones 3",
							identation: 2,
							order: 5,
							unit: 1,
						},
						{
							id: "dev12B2",
							x: 625,
							y: 175,
							type: "folder",
							title: "Insignia Ecuaciones 4",
							identation: 2,
							order: 6,
							unit: 1,
						},
						{
							id: "dev13B2",
							x: 625,
							y: 525,
							type: "folder",
							title: "Carpeta Ecuaciones 5",
							identation: 2,
							order: 7,
							unit: 1,
						},
						{
							id: "dev40B2",
							x: 750,
							y: 1050,
							type: "page",
							title: "Web informativa 2",
							identation: 2,
							order: 11,
							unit: 2,
						},
						{
							id: "dev41B2",
							x: 750,
							y: 1400,
							type: "page",
							title: "Web informativa 3",
							identation: 2,
							order: 12,
							unit: 2,
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
							id: "dev-2B3",
							x: 0,
							y: 175,
							type: "start",
							title: "Inicio",
							children: ["dev0B3"],
							identation: 1,
						},
						{
							id: "dev-1B3",
							x: 1500,
							y: 525,
							type: "end",
							title: "Final",
							identation: 1,
						},
						{
							id: "dev0B3",
							x: 125,
							y: 175,
							type: "file",
							title: "Ecuaciones",
							children: ["dev1B3"],
							identation: 1,
							order: 1,
							unit: 1,
						},
						{
							id: "dev1B3",
							x: 250,
							y: 175,
							type: "questionnaire",
							title: "Examen Tema 1",
							conditions: [
								{
									type: "qualification",
									operand: ">",
									objective: 8,
									unlockId: "dev2B3",
								},
							],
							children: ["dev2B3", "dev3B3"],
							identation: 2,
							order: 2,
							unit: 1,
						},
						{
							id: "dev2B3",
							x: 375,
							y: 0,
							type: "folder",
							title: "Carpeta Ecuaciones",
							identation: 2,
							order: 3,
							unit: 1,
						},
						{
							id: "dev3B3",
							x: 375,
							y: 350,
							type: "url",
							title: "Web raices cuadradas",
							children: ["dev4B3"],
							identation: 1,
							order: 4,
							unit: 1,
						},
						{
							id: "dev4B3",
							x: 500,
							y: 350,
							type: "forum",
							title: "Foro de discusión",
							children: ["dev5B3"],
							identation: 2,
							order: 5,
							unit: 1,
						},
						{
							id: "dev5B3",
							x: 625,
							y: 350,
							type: "questionnaire",
							title: "Cuestionario de raices",
							children: ["dev6B3", "dev7B3"],
							identation: 1,
							order: 6,
							unit: 1,
						},
						{
							id: "dev6B3",
							x: 750,
							y: 0,
							type: "assignment",
							title: "Ejercicio de raices",
							identation: 1,
							order: 7,
							unit: 1,
						},
						{
							id: "dev7B3",
							x: 750,
							y: 350,
							type: "choice",
							title: "Preguntas de Matemáticas",
							children: ["dev8B3"],
							identation: 1,
							order: 8,
							unit: 1,
						},
						{
							id: "dev8B3",
							x: 875,
							y: 525,
							type: "page",
							title: "Web informativa",
							children: ["dev40B3", "dev41B3"],
							identation: 2,
							order: 9,
							unit: 1,
						},
						{
							id: "dev40B3",
							x: 1000,
							y: 875,
							type: "page",
							title: "Web informativa 2",
							identation: 2,
							order: 10,
							unit: 2,
						},
						{
							id: "dev41B3",
							x: 1000,
							y: 525,
							type: "page",
							title: "Web informativa 3",
							children: ["dev44B3", "dev45B3"],
							identation: 2,
							order: 11,
							unit: 2,
						},
						{
							id: "dev44B3",
							x: 1125,
							y: 525,
							type: "page",
							title: "Web informativa 6",
							children: ["dev46B3", "dev47B3"],
							identation: 2,
							order: 12,
							unit: 2,
						},
						{
							id: "dev45B3",
							x: 1125,
							y: 875,
							type: "page",
							title: "Web informativa 7",
							identation: 2,
							order: 13,
							unit: 2,
						},
						{
							id: "dev46B3",
							x: 1250,
							y: 525,
							type: "page",
							title: "Web informativa 8",
							children: ["dev48B3", "dev49B3"],
							identation: 2,
							order: 14,
							unit: 2,
						},
						{
							id: "dev47B3",
							x: 1250,
							y: 875,
							type: "page",
							title: "Web informativa 9",
							identation: 2,
							order: 15,
							unit: 2,
						},
						{
							id: "dev48B3",
							x: 1375,
							y: 525,
							type: "page",
							title: "Web informativa 10",
							children: ["dev-1B3"],
							identation: 2,
							order: 16,
							unit: 2,
						},
						{
							id: "dev49B3",
							x: 1375,
							y: 875,
							type: "page",
							title: "Web informativa 11",
							identation: 2,
							order: 17,
							unit: 2,
						},
					],
				},
			],
		},
		{
			id: 3,
			name: "Itinerario vacío",
			versions: [
				{
					id: 0,
					name: "Última versión",
					lastUpdate: "20/05/2023",
					default: "true",
					blocksData: [
						{
							id: "dev-2C1",
							x: 0,
							y: 0,
							type: "start",
							title: "Inicio",
							children: ["dev-1C1"],
							identation: 1,
						},
						{
							id: "dev-1C1",
							x: 125,
							y: 0,
							type: "end",
							title: "Final",
							identation: 1,
						},
					],
				},
				{
					id: 1,
					name: "Versión vacía",
					lastUpdate: "05/03/2023",
					default: "false",
					blocksData: [
						{
							id: "dev-2C2",
							x: 0,
							y: 0,
							type: "start",
							title: "Inicio",
							children: ["dev-1C2"],
							identation: 1,
						},
						{
							id: "dev-1C2",
							x: 125,
							y: 0,
							type: "end",
							title: "Final",
							identation: 1,
						},
					],
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
		const uniqueId = () => parseInt(Date.now() * Math.random()).toString();
		const endId = uniqueId();
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
						blocksData: [
							{
								id: uniqueId(),
								x: 0,
								y: 0,
								type: "start",
								title: "Inicio",
								children: [endId],
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
		const endId = uniqueId();
		const newMapVersions = [
			...selectedMap.versions,
			{
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
						children: [endId],
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
							disabled={isOffline}
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
									disabled={isOffline}
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
											disabled={isOffline}
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
											disabled={isOffline}
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
									<Button
										className={`btn-light d-flex align-items-center p-2 ${styles.actionsBorder}`}
										disabled={isOffline}
										aria-label="Guardar versión actual"
									>
										<Image
											src={"/icons/save.svg"}
											width="20"
											height="20"
											style={{ transform: "scale(1.15)" }}
											onClick={notImplemented}
											alt=""
											//TODO: onClick
										></Image>
									</Button>
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
								disabled={isOffline}
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
