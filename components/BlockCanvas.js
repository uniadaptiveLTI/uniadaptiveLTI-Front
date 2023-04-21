import styles from "@components/styles/BlockCanvas.module.css";

import {
	BlockJsonContext,
	BlocksDataContext,
	CreateBlockContext,
	DeleteBlockContext,
	DeleteEdgeContext,
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
export const PaneContextMenuPositionContext = createContext();

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
	const [paneContextMenuPosition, setPaneContextMenuPosition] = useState({
		x: 0,
		y: 0,
	});

	//Context Menu
	const [cMX, setCMX] = useState(0);
	const [cMY, setCMY] = useState(0);
	const [contextMenuOrigin, setContextMenuOrigin] = useState("");
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
		if (!Array.isArray(blockJson)) {
			let newBlocksData = [...blocksData];
			newBlocksData[blocksData.findIndex((b) => b.id == blockJson.id)] =
				blockJson;
			setBlocksData(newBlocksData);
		} else {
			const newBlocksData = blocksData.map((block) => {
				const newBlock = blockJson.find((b) => b.id === block.id);
				return newBlock ? { ...block, ...newBlock } : block;
			});
			setBlocksData(newBlocksData);
		}
	}, [blockJson]);

	const [createdBlock, setCreatedBlock] = useState([]);
	const [deletedEdge, setDeletedEdge] = useState([]);

	useEffect(() => {
		if (Object.keys(createdBlock).length !== 0) {
			let newBlocksData = [...blocksData];
			newBlocksData.push(createdBlock);
			setBlocksData(newBlocksData);
		}
	}, [createdBlock]);

	useEffect(() => {
		if (deletedEdge.id) {
			let updatedBlocksArray = blocksData.slice();

			const blockNodeDelete = updatedBlocksArray.find(
				(obj) => obj.id === deletedEdge.source
			);

			if (blockNodeDelete) {
				blockNodeDelete.children = blockNodeDelete.children.filter(
					(child) => child !== deletedEdge.target
				);

				if (blockNodeDelete.children.length === 0)
					blockNodeDelete.children = undefined;

				if (blockNodeDelete.conditions) {
					blockNodeDelete.conditions = blockNodeDelete.conditions.filter(
						(condition) => condition.unlockId !== deletedEdge.target
					);
					if (blockNodeDelete.conditions.length === 0)
						blockNodeDelete.conditions = undefined;
				}
			}

			updatedBlocksArray = updatedBlocksArray.map((obj) =>
				obj.id === blockNodeDelete.id ? blockNodeDelete : obj
			);

			setBlocksData(updatedBlocksArray);
		}
	}, [deletedEdge]);

	const deleteBlocks = (blocks) => {
		if (!Array.isArray(blocks)) {
			const deletedBlockArray = blocksData.filter((b) => b.id !== blocks.id);
			const deletedRelatedChildrenArray = deleteRelatedChildrenById(
				blocks.id,
				deletedBlockArray
			);

			const deleteRelatedConditionsArray = deleteRelatedConditionsById(
				blocks.id,
				deletedRelatedChildrenArray
			);

			setBlocksData(deleteRelatedConditionsArray);
		} else {
			if (blocks.length > 0) {
				let updatedBlocksArray = blocksData.slice();

				blocks.forEach((b) => {
					const id = b.id;

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

				setBlocksData(updatedBlocksArray);
			}
		}
	};

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

	/*const deleteRelatedConditionsBySourceAndTarget = (source, target, arr) => {
		const match = arr.find((obj) => obj.id === source);

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
					children: deleteRelatedConditionsBySourceAndTarget(
						unlockId,
						b.children
					),
				};
			} else {
				return b;
			}
		});
	};*/

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
		const bounds = bF.getBoundingClientRect();
		if (bF) {
			if (bF.contains(e.target)) {
				if (e.target.classList.contains("block")) {
					if (selectedBlock) {
						e.preventDefault();
						setCMX(e.clientX - bounds.left);
						setCMY(e.clientY - bounds.top);
						let block = blocksDataRef.current.find(
							(e) => e.id == selectedBlock.id
						);
						setCMBlockData(block);
						setContextMenuOrigin("block");
						setShowContextualMenu(true);
					}
				} else if (e.target.classList.contains("react-flow__pane")) {
					if (selectedBlock) {
						e.preventDefault();
						setCMX(e.clientX - bounds.left);
						setCMY(e.clientY - bounds.top);
						let block = blocksDataRef.current.find(
							(e) => e.id == selectedBlock.id
						);
						setCMBlockData(block);
						setContextMenuOrigin("pane");
						setShowContextualMenu(true);
					}
				} else if (
					e.target.classList.contains("react-flow__nodesselection-rect")
				) {
					e.preventDefault();
					setCMX(e.clientX - bounds.left);
					setCMY(e.clientY - bounds.top);
					setContextMenuOrigin("nodesselection");
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
			<DeleteEdgeContext.Provider value={{ deletedEdge, setDeletedEdge }}>
				<BlockOriginContext.Provider value={{ blockOrigin, setBlockOrigin }}>
					<PaneContextMenuPositionContext.Provider
						value={{ paneContextMenuPosition, setPaneContextMenuPosition }}
					>
						<BlockFlow
							ref={blockFlowDOM}
							map={blocksData}
							deleteBlocks={deleteBlocks}
						></BlockFlow>
						{showContextualMenu && (
							<BlockContextualMenu
								ref={contextMenuDOM}
								blockData={cMBlockData}
								blocksData={blocksData}
								setBlocksData={setBlocksData}
								setShowContextualMenu={setShowContextualMenu}
								x={cMX}
								y={cMY}
								contextMenuOrigin={contextMenuOrigin}
								deleteBlocks={deleteBlocks}
							/>
						)}
					</PaneContextMenuPositionContext.Provider>
				</BlockOriginContext.Provider>
			</DeleteEdgeContext.Provider>
		</CreateBlockContext.Provider>
	);
}
