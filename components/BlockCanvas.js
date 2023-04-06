import styles from "@components/styles/BlockCanvas.module.css";

import {
	BlockJsonContext,
	BlockPositionContext,
	CreateBlockContext,
	DeleteBlockContext,
	DimensionsContext,
	ItineraryInfoContext,
	VersionInfoContext,
} from "@components/pages/_app";

import {
	useState,
	useContext,
	useEffect,
	useLayoutEffect,
	useRef,
} from "react";
import { Table, Modal, Button } from "react-bootstrap";
import {
	BlockInfoContext,
	ExpandedContext,
	SettingsContext,
} from "../pages/_app.js";

import BlockContextualMenu from "./BlockContextualMenu.js";
import BlockDiagram from "./BlockDiagram.js";
import BlockTable from "./BlockTable.js";

/**
 * Adds multiple event listeners to an element.
 * @param {Element} element - The element to add the event listeners to.
 * @param {Array} events - An array of event objects with the event type and listener function.
 */
function addEventListeners(element, events) {
	events.forEach(({ type, listener }) => {
		element.addEventListener(type, listener, false);
	});
}

const startBlock = {
	id: -2,
	x: 0,
	y: 0,
	type: "start",
	title: "Inicio",
	childs: [0],
	identation: 0,
};
const endBlock = {
	id: -1,
	x: 0,
	y: 0,
	type: "end",
	title: "Fin",
};

export default function BlockCanvas() {
	const { blockSelected, setBlockSelected } = useContext(BlockInfoContext);
	const { blockJson, setBlockJson } = useContext(BlockJsonContext);
	const { expanded, setExpanded } = useContext(ExpandedContext);
	const { settings, setSettings } = useContext(SettingsContext);

	const { itinerarySelected, setItinerarySelected } =
		useContext(ItineraryInfoContext);
	const { selectedEditVersion, setSelectedEditVersion } =
		useContext(VersionInfoContext);

	const [showContextualMenu, setShowContextualMenu] = useState(false);

	//Context Menu coordenadas
	const [cMX, setCMX] = useState(0);
	const [cMY, setCMY] = useState(0);
	const [cMBlockData, setCMBlockData] = useState({});

	//Referencias
	const contextMenuDOM = useRef(null);
	const blockTableDOM = useRef(null);
	const blockCanvasArrowsDOM = useRef(null);

	//La unidad se añadiría dínamicamente calculandolo de la identación
	const [blocksData, setBlocksData] = useState([
		startBlock,
		endBlock,
		{
			id: 0,
			x: 1,
			y: 1,
			type: "file",
			title: "Ecuaciones",
			children: [1],
			identation: 1,
		},
		{
			id: 1,
			x: 2,
			y: 1,
			type: "questionnaire",
			title: "Examen Tema 1",
			conditions: [
				{ type: "qualification", operand: ">", objective: 8, unlocks: 2 },
			],
			children: [2, 3],
			identation: 2,
		},
		{
			id: 2,
			x: 3,
			y: 0,
			type: "folder",
			title: "Insignia Ecuaciones",
			identation: 2,
		},
		{
			id: 3,
			x: 3,
			y: 3,
			type: "url",
			title: "Web raices cuadradas",
			children: [4],
			identation: 1,
		},
		{
			id: 4,
			x: 4,
			y: 3,
			type: "forum",
			title: "Foro de discusión",
			children: [5],
			identation: 2,
		},
		{
			id: 5,
			x: 5,
			y: 3,
			type: "questionnaire",
			title: "Cuestionario de raices",
			children: [6, 7],
			identation: 1,
		},
		{
			id: 6,
			x: 6,
			y: 2,
			type: "assignment",
			title: "Ejercicio de raices",
			identation: 1,
		},
		{
			id: 7,
			x: 6,
			y: 4,
			type: "fragment",
			title: "Tema 2 Matemáticas",
			children: [8],
			identation: 1,
		},
		{
			id: 8,
			x: 7,
			y: 4,
			type: "page",
			title: "Web informativa",
			children: [-1],
			identation: 2,
		},
	]);

	const blocksDataRef = useRef(blocksData);

	/** Client-side */

	useEffect(() => {
		let newBlocksData = [...blocksData];
		newBlocksData[blocksData.findIndex((b) => b.id == blockJson.id)] =
			blockJson;
		setBlocksData(newBlocksData);
	}, [blockJson]);

	const [createdBlock, setCreatedBlock] = useState([]);
	const [deletedBlock, setDeletedBlock] = useState([]);

	useEffect(() => {
		if (Object.keys(createdBlock).length !== 0) {
			let newBlocksData = [...blocksData];
			newBlocksData.push(createdBlock);
			setBlocksData(newBlocksData);
			handleResize();
		}
		cMBlockData.children = [createdBlock.id];
	}, [createdBlock]);

	useEffect(() => {
		const filteredBlocksData = blocksData.filter(
			(b) => b.id !== cMBlockData.id
		);
		setBlocksData(filteredBlocksData);
	}, [deletedBlock]);

	const [dimensions, setDimensions] = useState();
	const [blockPositions, setBlockPositions] = useState([]);

	useLayoutEffect(() => {
		handleResize();
		addEventListeners(window, [
			{ type: "resize", listener: handleResize },
			{ type: "zoom", listener: handleResize },
		]);
		addEventListeners(document.body, [
			{ type: "contextmenu", listener: handleContextMenu },
			{
				type: "click",
				listener: (e) => {
					let cM = contextMenuDOM.current;
					if (cM && !cM.contains(e.target)) {
						setShowContextualMenu(false);
					}
				},
			},
			{
				type: "keydown",
				listener: (e) => {
					if (e.key == "Escape") {
						setShowContextualMenu(false);
					}
				},
			},
		]);
		document
			.getElementById("main")
			.addEventListener("scroll", handleResize, false);
	}, []);

	useLayoutEffect(() => {
		blocksDataRef.current = blocksData;
	}, [expanded, settings, blocksData]);

	useEffect(() => {
		handleResize();
	}, [expanded, settings, blocksData]);

	/**
	 * Handles the resize event and updates the dimensions of the block canvas and arrows.
	 */
	function handleResize() {
		const bT = blockTableDOM.current;
		const blockCanvasArrows = blockCanvasArrowsDOM.current;
		const verticalOffset = 80; //Margin-top of BlockTable.
		const horizontalOffset = 25; //Margin-left of BlockTable.
		const mainDOM = document.getElementById("main");
		if (bT && mainDOM && blockCanvasArrows) {
			let { width, height, left, top } = bT.getBoundingClientRect();
			width += horizontalOffset;
			height += verticalOffset;
			Object.assign(blockCanvasArrows.style, {
				width: width + "px",
				height: height + "px",
			});
			setBlockPositions([]);
			setDimensions(
				JSON.stringify({
					width: window.innerWidth,
					height: window.innerHeight,
					blockCanvasWidth: width,
					blockCanvasHeight: height,
					blockCanvasOffsetX: left,
					blockCanvasOffsetY: top,
					blockCanvasScrollX: mainDOM.scrollLeft,
					blockCanvasScrollY: mainDOM.scrollTop,
				})
			);
		}
	}

	/**
	 * Handles the context menu position, positioning it.
	 * @param {Event} e
	 */
	function handleContextMenu(e) {
		setShowContextualMenu(false);
		const selectedBlock = e.target;
		const bT = blockTableDOM.current;
		if (bT) {
			if (bT.contains(e.target) && e.target.tagName == "BUTTON") {
				if (selectedBlock) {
					e.preventDefault();
					setCMX(e.clientX);
					setCMY(e.clientY);

					let block = blocksDataRef.current.find(
						(e) => e.id == selectedBlock.id
					);
					setCMBlockData(block);
					setShowContextualMenu(true);
				}
			}
		}
	}

	/*
	function updateBlockData(nuevoBloque) {
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

	function blockAdd(block) {
		let newBlocksData = [...blocksData];
		newBlocksData.push(block);
		setBlocksData(newBlocksData);
	}
	**/

	return (
		<CreateBlockContext.Provider value={{ createdBlock, setCreatedBlock }}>
			<DeleteBlockContext.Provider value={{ deletedBlock, setDeletedBlock }}>
				<DimensionsContext.Provider value={{ dimensions, setDimensions }}>
					<BlockPositionContext.Provider
						value={{ blockPositions, setBlockPositions }}
					>
						<BlockTable blocksData={blocksData} ref={blockTableDOM} />
						<BlockDiagram
							ref={blockCanvasArrowsDOM}
							blockPositions={blockPositions}
							blocksData={blocksDataRef.current}
							className={styles.svg}
						></BlockDiagram>
						{showContextualMenu && (
							<BlockContextualMenu
								ref={contextMenuDOM}
								blockData={cMBlockData}
								blocksData={blocksData}
								setBlocksData={setBlocksData}
								setShowContextualMenu={setShowContextualMenu}
								x={cMX}
								y={cMY}
								dimensions={dimensions}
							/>
						)}
					</BlockPositionContext.Provider>
				</DimensionsContext.Provider>
			</DeleteBlockContext.Provider>
		</CreateBlockContext.Provider>
	);
}
