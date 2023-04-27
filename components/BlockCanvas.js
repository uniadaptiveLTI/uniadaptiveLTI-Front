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

import BlockContextualMenu from "./BlockContextualMenu.js";
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

export default function BlockCanvas() {
	const { blockJson, setBlockJson } = useContext(BlockJsonContext);
	const { expanded, setExpanded } = useContext(ExpandedContext);
	const { settings, setSettings } = useContext(SettingsContext);
	const { mainDOM } = useContext(MainDOMContext);
	const { currentBlocksData, setCurrentBlocksData } =
		useContext(BlocksDataContext);

	const { mapSelected, setMapSelected } = useContext(MapInfoContext);
	const { selectedEditVersion, setSelectedEditVersion } =
		useContext(VersionInfoContext);

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
	const [blockOrigin, setBlockOrigin] = useState();

	//Refs
	const canvasRef = useRef();
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
			let newcurrentBlocksData = [...currentBlocksData];
			newcurrentBlocksData[
				currentBlocksData.findIndex((b) => b.id == blockJson.id)
			] = blockJson;
			setCurrentBlocksData(newcurrentBlocksData);
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
						setContextMenuOrigin("block");
						setShowContextualMenu(true);
					}
				} else if (e.target.classList.contains("react-flow__pane")) {
					if (selectedBlock) {
						e.preventDefault();
						setCMX(e.clientX - bounds.left);
						setCMY(e.clientY - bounds.top);
						let block = currentBlocksDataRef.current.find(
							(e) => e.id == selectedBlock.id
						);
						setCMBlockData(block);
						setContextMenuOrigin("pane");
						setShowContextualMenu(true);
					}
				} else if (
					e.target.classList.contains("react-flow__nodesselection-rect") ||
					(e.target.classList.contains("block") &&
						document.getElementsByClassName("selected").length > 1)
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
						></BlockFlow>
						{showContextualMenu && (
							<BlockContextualMenu
								ref={contextMenuDOM}
								blockData={cMBlockData}
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
								showConditionsModal={showConditionsModal}
								setShowConditionsModal={setShowConditionsModal}
							/>
						)}
					</PaneContextMenuPositionContext.Provider>
				</BlockOriginContext.Provider>
			</DeleteEdgeContext.Provider>
		</CreateBlockContext.Provider>
	);
}
