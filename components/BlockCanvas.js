import styles from "@components/styles/BlockCanvas.module.css";

import {
	BlockJsonContext,
	BlocksDataContext,
	DeleteEdgeContext,
	ReactFlowInstanceContext,
	PlatformContext,
	BlockInfoContext,
	notImplemented,
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
	ExpandedContext,
	SettingsContext,
	MainDOMContext,
} from "../pages/_app.js";

import BlockContextualMenu from "./ContextualMenu.js";
import ConditionModal from "./flow/conditions/ConditionModal.js";
import BlockFlow from "./BlockFlow.js";
import { toast } from "react-toastify";
import { useHotkeys } from "react-hotkeys-hook";
import { uniqueId } from "./Utils.js";

export const BlockOriginContext = createContext();
export const PaneContextMenuPositionContext = createContext();
export const CopiedBlocksContext = createContext();

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

const reservedBlocksTypes = ["start", "end"];

/**
 * Checks if there are any reserved blocks in an array of DOM elements
 * @param {HTMLElement[]} blockArray - An array of DOM elements
 * @returns {boolean} True if there is at least one reserved block, false otherwise
 */
export function thereIsReservedBlocksInArray(blockArray) {
	// Get the CSS selectors for the reserved block types
	let classes = getReservedBlockNodesFromTypes();
	// Join the selectors with a comma
	let matchString = classes.join(", ");
	// Check if any element in the array matches any of the selectors
	const isReserved = blockArray.some((dom) =>
		dom.matches(":is(" + matchString + ")")
	);
	return isReserved;
}

/**
 * Converts an array of reserved block types to an array of CSS selectors
 * @returns {string[]} An array of CSS selectors for the reserved block types
 */
function getReservedBlockNodesFromTypes() {
	// Prefix each type with the class name "react-flow__node-"
	const nodes = reservedBlocksTypes.map((type) => "react-flow__node-" + type);
	// Add a dot before each selector
	const classes = nodes.map((node) => "." + node);
	return classes;
}

export default function BlockCanvas() {
	const { blockJson, setBlockJson } = useContext(BlockJsonContext);
	const { expanded, setExpanded } = useContext(ExpandedContext);
	const { settings, setSettings } = useContext(SettingsContext);
	const { blockSelected, setBlockSelected } = useContext(BlockInfoContext);
	const { reactFlowInstance, setReactFlowInstance } = useContext(
		ReactFlowInstanceContext
	);
	const { mainDOM } = useContext(MainDOMContext);
	const { currentBlocksData, setCurrentBlocksData } =
		useContext(BlocksDataContext);
	const { platform } = useContext(PlatformContext);

	const [showContextualMenu, setShowContextualMenu] = useState(false);
	const [showConditionsModal, setShowConditionsModal] = useState(false);

	const [paneContextMenuPosition, setPaneContextMenuPosition] = useState({
		x: 0,
		y: 0,
	});

	//Context Menu
	const [cMX, setCMX] = useState(0);
	const [cMY, setCMY] = useState(0);
	const [contextMenuOrigin, setContextMenuOrigin] = useState("");
	const [cMBlockData, setCMBlockData] = useState({});
	const [cMContainsReservedNodes, setCMContainsReservedNodes] = useState(false);
	const [blockOrigin, setBlockOrigin] = useState();
	const [copiedBlocks, setCopiedBlocks] = useState();
	const [currentMousePosition, setCurrentMousePosition] = useState({
		x: 0,
		y: 0,
	});

	//Refs
	const contextMenuDOM = useRef(null);
	const blockFlowDOM = useRef(null);

	//This will be given by the back

	const currentBlocksDataRef = useRef(currentBlocksData);

	/** Client-side */

	useHotkeys("ctrl+c", () => {
		handleBlockCopy();
	});
	useHotkeys("shift+b", () => createBlock());
	useHotkeys("ctrl+v", () => handleBlockPaste());
	useHotkeys("ctrl+x", () => handleBlockCut());
	useHotkeys("ctrl+z", () => {
		notImplemented("deshacer/rehacer");
		console.log("UNDO");
	});
	useHotkeys(["ctrl+shift+z", "ctrl+y"], () => {
		notImplemented("deshacer/rehacer");
		console.log("REDO");
	});
	useHotkeys("shift+r", () => handleNewRelation(blockOrigin));
	useHotkeys("shift+f", () => {
		notImplemented("creación de fragmentos");
		console.log("CREATE_FRAGMENT");
	});
	useHotkeys("shift+e", () => {
		notImplemented("edición de precondiciones");
		console.log("EDIT_PRECONDITIONS");
	});

	useEffect(() => {
		if (cMBlockData)
			if (!Array.isArray(cMBlockData)) {
				let newcurrentBlocksData = [...currentBlocksData];
				newcurrentBlocksData[
					currentBlocksData.findIndex((b) => b.id == cMBlockData.id)
				] = cMBlockData;
				setCurrentBlocksData(newcurrentBlocksData);
			} else {
				const newcurrentBlocksData = currentBlocksData.map((block) => {
					const newBlock = cMBlockData.find((b) => b.id === block.id);
					return newBlock ? { ...block, ...newBlock } : block;
				});
				setCurrentBlocksData(newcurrentBlocksData);
			}
	}, [cMBlockData]);

	useEffect(() => {
		if (!Array.isArray(blockJson)) {
			if (currentBlocksData) {
				let newcurrentBlocksData = [...currentBlocksData];
				newcurrentBlocksData[
					currentBlocksData.findIndex((b) => b.id == blockJson.id)
				] = blockJson;
				setCurrentBlocksData(newcurrentBlocksData);
			}
		} else {
			const newcurrentBlocksData = currentBlocksData.map((block) => {
				const newBlock = blockJson.find((b) => b.id === block.id);
				return newBlock ? { ...block, ...newBlock } : block;
			});
			setCurrentBlocksData(newcurrentBlocksData);
		}
	}, [blockJson]);

	const [deletedEdge, setDeletedEdge] = useState([]);

	useEffect(() => {
		if (deletedEdge.id) {
			let updatedBlocksArray = currentBlocksData.slice();

			const blockNodeDelete = updatedBlocksArray.find(
				(obj) => obj.id === deletedEdge.source
			);

			if (blockNodeDelete) {
				if (blockNodeDelete.children) {
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
					updatedBlocksArray = updatedBlocksArray.map((obj) =>
						obj.id === blockNodeDelete.id ? blockNodeDelete : obj
					);
				}
			}

			setCurrentBlocksData(updatedBlocksArray);
		}
	}, [deletedEdge]);

	const deleteBlocks = (blocks) => {
		if (!Array.isArray(blocks)) {
			const deletedBlockArray = currentBlocksData.filter(
				(b) => b.id !== blocks.id
			);
			const deletedRelatedChildrenArray = deleteRelatedChildrenById(
				blocks.id,
				deletedBlockArray
			);

			const deleteRelatedConditionsArray = deleteRelatedConditionsById(
				blocks.id,
				deletedRelatedChildrenArray
			);

			setCurrentBlocksData(deleteRelatedConditionsArray);
		} else {
			if (blocks.length > 0) {
				let updatedBlocksArray = currentBlocksData.slice();

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

				setCurrentBlocksData(updatedBlocksArray);
			}
		}
	};

	/**
	 * Deletes children with the given id from an array of objects.
	 * @param {string} id - The id of the child to delete.
	 * @param {Object[]} arr - The array of objects to search for children.
	 * @returns {Object[]} - The updated array of objects with the specified child removed.
	 */
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

	/**
	 * Deletes conditions with the given unlockId from an array of objects.
	 * @param {string} unlockId - The unlockId of the condition to delete.
	 * @param {Object[]} arr - The array of objects to search for conditions.
	 * @returns {Object[]} - The updated array of objects with the specified condition removed.
	 */
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
			{
				type: "mousemove",
				listener: (e) => {
					setCurrentMousePosition({ x: e.clientX, y: e.clientY });
				},
			},
		]);
	});

	useLayoutEffect(() => {
		currentBlocksDataRef.current = currentBlocksData;
	}, [expanded, settings, currentBlocksData]);

	/**
	 * Handles the context menu position, positioning it.
	 * @param {Event} e
	 */
	function handleContextMenu(e) {
		setShowContextualMenu(false);
		const selectedBlock = e.target;
		const bF = blockFlowDOM.current;
		const bounds = bF?.getBoundingClientRect();
		if (bF) {
			if (bF.contains(e.target)) {
				setCMContainsReservedNodes(false);
				if (
					e.target.classList.contains("block") &&
					document.getElementsByClassName("selected").length <= 1
				) {
					if (selectedBlock) {
						e.preventDefault();
						setCMX(e.clientX - bounds.left);
						setCMY(e.clientY - bounds.top);
						let block = currentBlocksDataRef.current.find(
							(e) => e.id == selectedBlock.id
						);
						setCMBlockData(block);
						if (block.type == "start" || block.type == "end") {
							setCMContainsReservedNodes(true);
						}
						setContextMenuOrigin("block");
						setShowContextualMenu(true);
					}
				} else if (e.target.classList.contains("react-flow__pane")) {
					e.preventDefault();
					setCMX(e.clientX - bounds.left);
					setCMY(e.clientY - bounds.top);
					setCMBlockData(undefined);
					setContextMenuOrigin("pane");
					setShowContextualMenu(true);
				} else if (
					e.target.classList.contains("react-flow__nodesselection-rect") ||
					(e.target.classList.contains("block") &&
						document.getElementsByClassName("selected").length > 1)
				) {
					e.preventDefault();
					setCMX(e.clientX - bounds.left);
					setCMY(e.clientY - bounds.top);
					setContextMenuOrigin("nodesselection");
					setCMContainsReservedNodes(
						thereIsReservedBlocksInArray([
							...document.querySelectorAll(".react-flow__node.selected"),
						])
					);
					setShowContextualMenu(true);
				}
			}
		}
	}

	const handleClose = () => {
		setShowConditionsModal(false);
	};

	const handleBlockCopy = (blockData = []) => {
		setShowContextualMenu(false);

		let blockDataSet = new Set(blockData);
		if (blockData.length > 0) {
			blockDataSet = new Set(blockData);
		} else {
			blockDataSet = new Set();
		}

		const selectedNodes = document.querySelectorAll(
			".react-flow__node.selected"
		);

		for (const node of selectedNodes) {
			const id = node.dataset?.id;
			if (id) {
				const blockDataMap = new Map(
					currentBlocksData.map((block) => [block.id, block])
				);
				const block = blockDataMap.get(id);
				if (block) {
					blockDataSet.add(block);
				}
			}
		}
		const blockDataArray = [...blockDataSet];

		if (blockDataArray.length > 0) {
			setCopiedBlocks(blockDataArray);

			toast("Se han copiado " + blockDataArray.length + " bloque(s)", {
				hideProgressBar: false,
				autoClose: 2000,
				type: "info",
				position: "bottom-center",
				theme: "light",
			});
		}
	};

	const handleBlockPaste = () => {
		if (copiedBlocks && copiedBlocks.length > 0) {
			const newBlocksToPaste = [...copiedBlocks];

			const originalIDs = newBlocksToPaste.map((block) => block.id);

			const newIDs = newBlocksToPaste.map((block) => uniqueId());
			const originalX = newBlocksToPaste.map((block) => block.x);
			const originalY = newBlocksToPaste.map((block) => block.y);
			const firstOneInX = Math.min(...originalX);
			const firstOneInY = Math.min(...originalY);
			const newX = originalX.map((x) => -firstOneInX + x);
			const newY = originalY.map((y) => -firstOneInY + y);
			const newBlocks = newBlocksToPaste.map((block, index) => {
				let filteredChildren = block.children
					?.map((child) => newIDs[originalIDs.indexOf(child)])
					.filter((child) => child !== undefined);
				return {
					...block,
					id: newIDs[index],
					x: newX[index],
					y: newY[index],
					children:
						filteredChildren?.length === 0 ? undefined : filteredChildren,
					conditions: undefined,
				};
			});

			copiedBlocks.length <= 1
				? createBlock(newBlocks[0], newBlocks[0].x, newBlocks[0].y)
				: createBlockBulk(newBlocks);
		}
	};

	const handleBlockCut = (blockData = []) => {
		const selectedNodes = document.querySelectorAll(
			".react-flow__node.selected"
		);
		handleBlockCopy(blockData);
		if (selectedNodes.length > 1) {
			handleDeleteBlockSelection();
		} else {
			if (selectedNodes.length == 1) {
				blockData = getBlockByNode(selectedNodes[0]);
			}
			handleDeleteBlock(blockData);
		}
	};

	const asideBounds = expanded
		? document.getElementsByTagName("aside")[0]?.getBoundingClientRect()
		: 0;

	const createBlock = (blockData, posX, posY) => {
		//TODO: Block selector
		const reactFlowBounds = blockFlowDOM.current?.getBoundingClientRect();

		const preferredPosition = contextMenuDOM
			? { x: currentMousePosition.x, y: currentMousePosition.y }
			: { x: cMX, y: cMY };

		let flowPos = reactFlowInstance.project({
			x: preferredPosition.x - reactFlowBounds.left,
			y: preferredPosition.y - reactFlowBounds.top,
		});

		const asideOffset = expanded
			? Math.floor(asideBounds.width / 125) * 125
			: 0;

		flowPos.x += asideOffset;

		let newBlockCreated;

		if (blockData) {
			//TODO: Check if ID already exists
			newBlockCreated = {
				...blockData,
				x: posX ? posX + asideOffset + flowPos.x : flowPos.x,
				y: posY ? posY + asideOffset + flowPos.y : flowPos.y,
			};
		} else {
			if (platform == "moodle") {
				newBlockCreated = {
					id: uniqueId(),
					x: flowPos.x,
					y: flowPos.y,
					type: "generic",
					title: "Nuevo bloque",
					children: undefined,
					order: 100,
					unit: 1,
				};
			} else {
				newBlockCreated = {
					id: uniqueId(),
					x: flowPos.x,
					y: flowPos.y,
					type: "resource",
					title: "Nuevo bloque",
					children: undefined,
					order: 100,
					unit: 1,
				};
			}
		}

		setShowContextualMenu(false);

		if (Object.keys(newBlockCreated).length !== 0) {
			let newcurrentBlocksData = [...currentBlocksData];
			newcurrentBlocksData.push(newBlockCreated);
			setCurrentBlocksData(newcurrentBlocksData);
		}
	};

	const createBlockBulk = (blockDataArray) => {
		const reactFlowBounds = blockFlowDOM.current?.getBoundingClientRect();

		const preferredPosition = contextMenuDOM
			? { x: currentMousePosition.x, y: currentMousePosition.y }
			: { x: cMX, y: cMY };

		let flowPos = reactFlowInstance.project({
			x: preferredPosition.x - reactFlowBounds.left,
			y: preferredPosition.y - reactFlowBounds.top,
		});

		const asideOffset = expanded
			? Math.floor(asideBounds.width / 125) * 125
			: 0;

		flowPos.x += asideOffset;
		const newBlocks = blockDataArray.map((blockData) => {
			return {
				...blockData,
				x: blockData.x + asideOffset + flowPos.x,
				y: blockData.y + asideOffset + flowPos.y,
			};
		});
		setShowContextualMenu(false);

		let newcurrentBlocksData = [...currentBlocksData, ...newBlocks];
		setCurrentBlocksData(newcurrentBlocksData);
	};

	const handleDeleteBlock = (blockData) => {
		setShowContextualMenu(false);
		setBlockSelected();
		deleteBlocks(blockData);
	};

	const handleDeleteBlockSelection = () => {
		setShowContextualMenu(false);
		const selectedNodes = document.querySelectorAll(
			".react-flow__node.selected"
		);
		const blockDataArray = [];
		for (let node of selectedNodes) {
			blockDataArray.push(getBlockByNode(node));
		}
		deleteBlocks(blockDataArray);
	};

	const handleNewRelation = (origin, end) => {
		const currentSelectionId =
			document.querySelectorAll(".react-flow__node.selected")[0]?.dataset.id ||
			undefined;

		end =
			end || currentBlocksData.find((block) => block.id === currentSelectionId);

		setShowContextualMenu(false);

		if (origin && end) {
			if (origin.id == end.id) {
				toast("Relación cancelada", {
					hideProgressBar: false,
					autoClose: 2000,
					type: "info",
					position: "bottom-center",
					theme: "light",
				});
				setBlockOrigin();
				return;
			}

			const newBlocksData = [...currentBlocksData];
			const bI = newBlocksData.findIndex((block) => block.id == origin.id);
			if (newBlocksData[bI].children) {
				const alreadyAChildren = newBlocksData[bI].children.includes(end.id);
				if (!alreadyAChildren) {
					if (newBlocksData[bI].children) {
						newBlocksData[bI].children.push(end.id);
					} else {
						newBlocksData[bI].children = [end.id];
					}
				} else {
					toast("Esta relación ya existe", {
						hideProgressBar: false,
						autoClose: 2000,
						type: "info",
						position: "bottom-center",
						theme: "light",
					});
				}
			} else {
				newBlocksData[bI].children = [end.id];
			}
			setBlockOrigin();
			setCurrentBlocksData(newBlocksData);
		} else {
			const starterBlock = currentBlocksData.find(
				(block) => block.id == currentSelectionId
			);

			setBlockOrigin(starterBlock);

			if (starterBlock) {
				toast("Iniciando relación", {
					hideProgressBar: false,
					autoClose: 2000,
					type: "info",
					position: "bottom-center",
					theme: "light",
				});
			}
		}
	};

	const getBlockById = (id) => {
		return currentBlocksData.find((block) => block.id == id);
	};

	const getBlockByNode = (node) => {
		return currentBlocksData.find((block) => block.id == node.dataset.id);
	};

	const getBlocksByNodes = (nodes) => {
		const blockArray = [];
		nodes.forEach((node) => {
			const block = getBlockByNode(node);
			if (block) {
				blockArray.push(block);
			}
		});
		return blockArray;
	};

	return (
		<DeleteEdgeContext.Provider value={{ deletedEdge, setDeletedEdge }}>
			<BlockOriginContext.Provider value={{ blockOrigin, setBlockOrigin }}>
				<PaneContextMenuPositionContext.Provider
					value={{ paneContextMenuPosition, setPaneContextMenuPosition }}
				>
					<CopiedBlocksContext.Provider
						value={{ copiedBlocks, setCopiedBlocks }}
					>
						<BlockFlow
							ref={blockFlowDOM}
							map={currentBlocksData}
							deleteBlocks={deleteBlocks}
							setShowContextualMenu={setShowContextualMenu}
						></BlockFlow>

						<BlockContextualMenu
							ref={contextMenuDOM}
							showContextualMenu={showContextualMenu}
							blockData={cMBlockData}
							containsReservedNodes={cMContainsReservedNodes}
							setShowContextualMenu={setShowContextualMenu}
							setShowConditionsModal={setShowConditionsModal}
							x={cMX}
							y={cMY}
							contextMenuOrigin={contextMenuOrigin}
							createBlock={createBlock}
							handleBlockCopy={handleBlockCopy}
							handleBlockPaste={handleBlockPaste}
							handleNewRelation={handleNewRelation}
							handleBlockCut={handleBlockCut}
							handleDeleteBlock={handleDeleteBlock}
							handleDeleteBlockSelection={handleDeleteBlockSelection}
						/>
						{showConditionsModal && (
							<ConditionModal
								blockData={cMBlockData}
								setBlockData={setCMBlockData}
								blocksData={currentBlocksData}
								showConditionsModal={showConditionsModal}
								setShowConditionsModal={setShowConditionsModal}
								setBlockJson={setBlockJson}
							/>
						)}
					</CopiedBlocksContext.Provider>
				</PaneContextMenuPositionContext.Provider>
			</BlockOriginContext.Provider>
		</DeleteEdgeContext.Provider>
	);
}
