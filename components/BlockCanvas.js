import styles from "@components/styles/BlockCanvas.module.css";

import {
	BlockJsonContext,
	BlockPositionContext,
	BlocksDataContext,
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
	MainDOMContext,
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
	const { mainDOM } = useContext(MainDOMContext);
	const { currentBlocksData, setCurrentBlocksData } =
		useContext(BlocksDataContext);

	const { itinerarySelected, setItinerarySelected } =
		useContext(ItineraryInfoContext);
	const { selectedEditVersion, setSelectedEditVersion } =
		useContext(VersionInfoContext);

	const [showContextualMenu, setShowContextualMenu] = useState(false);

	//Context Menu
	const [cMX, setCMX] = useState(0);
	const [cMY, setCMY] = useState(0);
	const [cMBlockData, setCMBlockData] = useState({});

	//Refs
	const canvasRef = useRef();
	const contextMenuDOM = useRef(null);
	const blockTableDOM = useRef(null);
	const blockCanvasArrowsDOM = useRef(null);

	//This will be given by the back
	const [blocksData, setBlocksData] = useState(
		[startBlock, endBlock].concat(currentBlocksData || [])
	);

	useLayoutEffect(() => {
		setBlocksData([startBlock, endBlock].concat(currentBlocksData || []));
	}, [currentBlocksData]);

	const blocksDataRef = useRef(blocksData);

	/** Client-side */
	const [dimensions, setDimensions] = useState();
	const [blockPositions, setBlockPositions] = useState([]);

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

	useEffect(() => {
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

	const verticalOffset = 80; //Margin-top of BlockTable.
	const horizontalOffset = 25; //Margin-left of BlockTable.

	useEffect(() => {
		const blockCanvasArrows = blockCanvasArrowsDOM.current;
		Object.assign(blockCanvasArrows.style, {
			width: blockTableDOM.current.clientWidth + horizontalOffset + "px",
			height: blockTableDOM.current.clientHeight + verticalOffset + "px",
		});
	}, [blockTableDOM.current, handleResize]);

	/**
	 * Handles the resize event and updates the dimensions of the block canvas and arrows.
	 */
	function handleResize() {
		const bT = blockTableDOM.current;
		const blockCanvasArrows = blockCanvasArrowsDOM.current;

		if (bT && mainDOM && blockCanvasArrows) {
			let { width, height, left, top } = bT.getBoundingClientRect();
			width += horizontalOffset;
			height += verticalOffset;

			setBlockPositions([]);
			setDimensions(
				JSON.stringify({
					width: window.innerWidth,
					height: window.innerHeight,
					blockCanvasOffsetX: left,
					blockCanvasOffsetY: top,
					blockCanvasScrollX: mainDOM.current.scrollLeft,
					blockCanvasScrollY: mainDOM.current.scrollTop,
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
