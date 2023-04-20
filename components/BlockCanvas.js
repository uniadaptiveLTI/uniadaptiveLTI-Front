import styles from "@components/styles/BlockCanvas.module.css";

import {
	BlockJsonContext,
	BlocksDataContext,
	CreateBlockContext,
	DeleteBlockContext,
	ItineraryInfoContext,
	VersionInfoContext,
} from "@components/pages/_app";

import {
	useState,
	useContext,
	useEffect,
	useLayoutEffect,
	createContext,
	useRef,
} from "react";
import {
	BlockInfoContext,
	ExpandedContext,
	SettingsContext,
	MainDOMContext,
} from "../pages/_app.js";

import BlockContextualMenu from "./BlockContextualMenu.js";
import BlockFlow from "./BlockFlow.js";

export const BlockOriginContext = createContext();

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
	children: [0],
	title: "Inicio",
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
	const [nodeSelected, setNodeSelected] = useState(0);
	const [cMBlockData, setCMBlockData] = useState({});
	const [blockOrigin, setBlockOrigin] = useState();

	//Refs
	const canvasRef = useRef();
	const contextMenuDOM = useRef(null);
	const blockFlowDOM = useRef(null);

	//This will be given by the back
	const [blocksData, setBlocksData] = useState(currentBlocksData);

	useLayoutEffect(() => {
		setBlocksData(currentBlocksData);
	}, [currentBlocksData]);

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

	const [deletedBlocksArray, setDeletedBlocksArray] = useState([]);

	useEffect(() => {
		if (Object.keys(createdBlock).length !== 0) {
			let newBlocksData = [...blocksData];
			newBlocksData.push(createdBlock);
			setBlocksData(newBlocksData);
		}
	}, [createdBlock]);

	useEffect(() => {
		console.log(deletedBlock);
		if (!Array.isArray(deletedBlock)) {
			const deletedBlockArray = blocksData.filter(
				(b) => b.id !== deletedBlock.id
			);
			const deletedRelatedChildrenArray = deleteRelatedChildrenById(
				deletedBlock.id,
				deletedBlockArray
			);

			const deleteRelatedConditionsArray = deleteRelatedConditionsById(
				deletedBlock.id,
				deletedRelatedChildrenArray
			);

			setBlocksData(deleteRelatedConditionsArray);
		} else {
			if (deletedBlock.length > 0) {
				let updatedBlocksArray = blocksData.slice();

				deletedBlock.forEach((b) => {
					const id = parseInt(b.id);

					updatedBlocksArray = updatedBlocksArray.filter((b) => b.id !== id);
					updatedBlocksArray = deleteRelatedChildrenById(
						id,
						updatedBlocksArray
					);
					updatedBlocksArray = deleteRelatedConditionsById(
						id,
						updatedBlocksArray
					);
				});

				console.log(updatedBlocksArray);

				setBlocksData(updatedBlocksArray);
			}
		}
	}, [deletedBlock]);

	const deleteRelatedChildrenById = (id, arr) => {
		return arr.map((b) => {
			if (b.children?.includes(id)) {
				const updatedChildren = b.children.filter((childId) => childId !== id);
				return {
					...b,
					children: updatedChildren.length ? updatedChildren : undefined,
				};
			} else if (b.children?.length) {
				return { ...b, children: deleteRelatedChildrenById(id, b.children) };
			} else {
				return b;
			}
		});
	};

	const deleteRelatedConditionsById = (unlockId, arr) => {
		return arr.map((b) => {
			if (b.conditions?.length) {
				const updatedConditions = b.conditions.filter(
					(condition) => condition.unlockId !== unlockId
				);
				return {
					...b,
					conditions: updatedConditions.length ? updatedConditions : undefined,
				};
			} else if (b.children?.length) {
				return {
					...b,
					children: deleteRelatedConditionsById(unlockId, b.children),
				};
			} else {
				return b;
			}
		});
	};

	useEffect(() => {
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
	});

	useLayoutEffect(() => {
		console.log(blocksData);
		blocksDataRef.current = blocksData;
	}, [expanded, settings, blocksData]);

	/**
	 * Handles the context menu position, positioning it.
	 * @param {Event} e
	 */
	function handleContextMenu(e) {
		setShowContextualMenu(false);
		const selectedBlock = e.target;
		const bF = blockFlowDOM.current;
		if (bF) {
			if (bF.contains(e.target)) {
				if (e.target.classList.contains("block")) {
					const reactFlowBounds = bF.getBoundingClientRect();
					if (selectedBlock) {
						e.preventDefault();
						setCMX(e.clientX);
						setCMY(e.clientY);
						setNodeSelected(true);
						let block = blocksDataRef.current.find(
							(e) => e.id == selectedBlock.id
						);
						setCMBlockData(block);
						setShowContextualMenu(true);
					}
				} else if (e.target.classList.contains("react-flow__pane")) {
					if (selectedBlock) {
						e.preventDefault();
						setCMX(e.clientX);
						setCMY(e.clientY);
						setNodeSelected(false);
						let block = blocksDataRef.current.find(
							(e) => e.id == selectedBlock.id
						);
						setCMBlockData(block);
						setShowContextualMenu(true);
					}
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
				<BlockOriginContext.Provider value={{ blockOrigin, setBlockOrigin }}>
					<BlockFlow ref={blockFlowDOM} map={blocksData}></BlockFlow>
					{showContextualMenu && (
						<BlockContextualMenu
							ref={contextMenuDOM}
							blockData={cMBlockData}
							blocksData={blocksData}
							setBlocksData={setBlocksData}
							setShowContextualMenu={setShowContextualMenu}
							x={cMX}
							y={cMY}
							nodeSelected={nodeSelected}
						/>
					)}
				</BlockOriginContext.Provider>
			</DeleteBlockContext.Provider>
		</CreateBlockContext.Provider>
	);
}
