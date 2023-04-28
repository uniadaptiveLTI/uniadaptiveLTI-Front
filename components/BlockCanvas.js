import styles from "@components/styles/BlockCanvas.module.css";

import {
	BlockJsonContext,
	BlocksDataContext,
	CreateBlockContext,
	DeleteBlockContext,
	DeleteEdgeContext,
	MapInfoContext,
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

import BlockContextualMenu from "./ContextualMenu.js";
import ConditionModal from "./flow/conditions/ConditionModal.js";
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
	const { mainDOM } = useContext(MainDOMContext);
	const { currentBlocksData, setCurrentBlocksData } =
		useContext(BlocksDataContext);

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

	//Refs
	const contextMenuDOM = useRef(null);
	const blockFlowDOM = useRef(null);

	//This will be given by the back

	useLayoutEffect(() => {
		setCurrentBlocksData(currentBlocksData);
	}, [currentBlocksData]);

	const currentBlocksDataRef = useRef(currentBlocksData);

	/** Client-side */

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

	const [createdBlock, setCreatedBlock] = useState([]);
	const [deletedEdge, setDeletedEdge] = useState([]);

	useEffect(() => {
		if (Object.keys(createdBlock).length !== 0) {
			let newcurrentBlocksData = [...currentBlocksData];
			newcurrentBlocksData.push(createdBlock);
			setCurrentBlocksData(newcurrentBlocksData);
		}
	}, [createdBlock]);

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
					console.log(
						thereIsReservedBlocksInArray([
							...document.querySelectorAll(".react-flow__node.selected"),
						])
					);
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

	return (
		<CreateBlockContext.Provider value={{ createdBlock, setCreatedBlock }}>
			<DeleteEdgeContext.Provider value={{ deletedEdge, setDeletedEdge }}>
				<BlockOriginContext.Provider value={{ blockOrigin, setBlockOrigin }}>
					<PaneContextMenuPositionContext.Provider
						value={{ paneContextMenuPosition, setPaneContextMenuPosition }}
					>
						<BlockFlow
							ref={blockFlowDOM}
							map={currentBlocksData}
							deleteBlocks={deleteBlocks}
							setShowContextualMenu={setShowContextualMenu}
						></BlockFlow>
						{showContextualMenu && (
							<BlockContextualMenu
								ref={contextMenuDOM}
								blockData={cMBlockData}
								containsReservedNodes={cMContainsReservedNodes}
								blocksData={currentBlocksData}
								setBlocksData={setCurrentBlocksData}
								setShowContextualMenu={setShowContextualMenu}
								setShowConditionsModal={setShowConditionsModal}
								x={cMX}
								y={cMY}
								contextMenuOrigin={contextMenuOrigin}
								blockFlowDOM={blockFlowDOM}
								deleteBlocks={deleteBlocks}
							/>
						)}
						{showConditionsModal && (
							<ConditionModal
								blockData={cMBlockData}
								setCMBlockData={setCMBlockData}
								blocksData={currentBlocksData}
								showConditionsModal={showConditionsModal}
								setShowConditionsModal={setShowConditionsModal}
								setBlockJson={setBlockJson}
							/>
						)}
					</PaneContextMenuPositionContext.Provider>
				</BlockOriginContext.Provider>
			</DeleteEdgeContext.Provider>
		</CreateBlockContext.Provider>
	);
}
