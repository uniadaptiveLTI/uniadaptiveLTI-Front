import React, {
	forwardRef,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import ReactFlow, {
	MiniMap,
	Controls,
	Background,
	useNodesState,
	useEdgesState,
	ControlButton,
	useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import ActionNode from "./flow/nodes/ActionNode.js";
import ElementNode from "./flow/nodes/ElementNode.js";
import {
	BlockInfoContext,
	ExpandedAsideContext,
	PlatformContext,
	SettingsContext,
} from "@components/pages/_app.js";
import FinalNode from "./flow/nodes/FinalNode.js";
import InitialNode from "./flow/nodes/InitialNode.js";
import FragmentNode from "./flow/nodes/FragmentNode.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faMap,
	faX,
	faFlagCheckered,
	faMagnifyingGlassPlus,
	faMagnifyingGlassMinus,
	faArrowsToDot,
	faLock,
	faLockOpen,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "react-bootstrap";
import {
	uniqueId,
	getNodeByNodeDOM,
	getNodesByNodesDOM,
	getUpdatedArrayById,
	addEventListeners,
	thereIsReservedNodesInArray,
	getNodeDOMById,
	getNodeById,
} from "./Utils.js";
import { toast } from "react-toastify";
import { useHotkeys } from "react-hotkeys-hook";
import ContextualMenu from "./flow/ContextualMenu.js";
import ConditionModal from "./flow/conditions/ConditionModal.js";

const minimapStyle = {
	height: 120,
};

const nodeTypes = {
	quiz: ElementNode,
	assign: ElementNode,
	forum: ElementNode,
	resource: ElementNode,
	folder: ElementNode,
	mail: ActionNode,
	addgroup: ActionNode,
	remgroup: ActionNode,
	url: ElementNode,
	// Moodle
	workshop: ElementNode,
	choice: ElementNode,
	label: ElementNode,
	page: ElementNode,
	badge: ActionNode,
	generic: ElementNode,
	// Sakai
	exam: ElementNode,
	contents: ElementNode,
	text: ElementNode,
	html: ElementNode,
	//LTI
	start: InitialNode,
	end: FinalNode,
	fragment: FragmentNode,
};

const OverviewFlow = ({ map }, ref) => {
	const { expandedAside, setExpandedAside } = useContext(ExpandedAsideContext);
	const { blockSelected, setBlockSelected } = useContext(BlockInfoContext);
	const { settings, setSettings } = useContext(SettingsContext);

	const parsedSettings = JSON.parse(settings);
	let { autoHideAside, snapping, snappingInFragment } = parsedSettings;

	//Flow States
	const reactFlowInstance = useReactFlow();
	const [newInitialNodes, setNewInitialNodes] = useState([]);
	const [newInitialEdges, setNewInitialEdges] = useState([]);
	const [minimap, setMinimap] = useState(true);
	const [interactive, setInteractive] = useState(true);
	const [snapToGrid, setSnapToGrid] = useState(true);
	const [deletedEdge, setDeletedEdge] = useState([]);

	//ContextMenu Ref, States, Constants
	const contextMenuDOM = useRef(null);
	const [showContextualMenu, setShowContextualMenu] = useState(false);
	const [cMX, setCMX] = useState(0);
	const [cMY, setCMY] = useState(0);
	const [contextMenuOrigin, setContextMenuOrigin] = useState("");
	const [cMContainsReservedNodes, setCMContainsReservedNodes] = useState(false);
	const [cMBlockData, setCMBlockData] = useState();
	const [relationStarter, setRelationStarter] = useState();
	const [copiedBlocks, setCopiedBlocks] = useState();
	const [currentMousePosition, setCurrentMousePosition] = useState({
		x: 0,
		y: 0,
	});

	useEffect(() => {
		addEventListeners(document.body, [
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
	}, []);

	//Conditions Modal
	const [showConditionsModal, setShowConditionsModal] = useState(false);

	const [nodes, setNodes, onNodesChange] = useNodesState(newInitialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(newInitialEdges);

	const draggedNodePosition = useRef(null);

	const reactFlowWrapper = useRef(null);

	const { platform } = useContext(PlatformContext);

	const CustomControls = () => {
		const toggleInteractive = () => setInteractive(!interactive);
		const toggleMinimap = () => setMinimap(!minimap);
		const centerToStart = () => {
			const startNode = reactFlowInstance
				.getNodes()
				.find((el) => el.type === "start");
			if (startNode) {
				const x = startNode.position.x + startNode.width / 2;
				const y = startNode.position.y + startNode.height / 2;
				reactFlowInstance.setCenter(
					startNode.position.x + startNode.width / 2,
					startNode.position.y + startNode.height / 2
				);
			}
		};
		const fitMap = () => {
			reactFlowInstance.fitView();
		};
		const zoomIn = () => {
			reactFlowInstance.zoomIn();
		};
		const zoomOut = () => {
			reactFlowInstance.zoomOut();
			console.log(reactFlowInstance);
		};

		return (
			<div className="react-flow__controls">
				<Button title="Zoom in" onClick={zoomIn} variant="light">
					<FontAwesomeIcon icon={faMagnifyingGlassPlus} />
				</Button>
				<Button title="Zoom out" onClick={zoomOut} variant="light">
					<FontAwesomeIcon icon={faMagnifyingGlassMinus} />
				</Button>
				<Button title="Fit map" onClick={fitMap} variant="light">
					<FontAwesomeIcon icon={faArrowsToDot} />
				</Button>
				<Button title="Move to start" onClick={centerToStart} variant="light">
					<FontAwesomeIcon icon={faFlagCheckered} />
				</Button>
				<Button
					title="Lock/unlock pan"
					onClick={toggleInteractive}
					variant="light"
				>
					<FontAwesomeIcon icon={interactive ? faLockOpen : faLock} />
				</Button>
				<Button title="Toggle Minimap" onClick={toggleMinimap} variant="light">
					{!minimap && <FontAwesomeIcon icon={faMap} />}
					{minimap && (
						<div
							style={{
								position: "relative",
								padding: "none",
								display: "flex",
								justifyContent: "center",
								alignItems: "center",
								width: "18px",
								height: "24px",
							}}
						>
							<FontAwesomeIcon
								icon={faX}
								style={{ position: "absolute", top: "4px" }}
								color="white"
							/>
							<FontAwesomeIcon icon={faMap} />
						</div>
					)}
				</Button>
			</div>
		);
	};

	const nodeColor = (node) => {
		//TODO: Add the rest
		switch (platform) {
			case "moodle":
				switch (node.type) {
					case "quiz":
						return "#5D63F6";
					case "assign":
						return "#5D63F6";
					case "forum":
						return "#11A676";
					case "resource":
						return "#A378FF";
					case "folder":
						return "#399BE2";
					case "url":
						return "#EB66A2";
					case "workshop":
						return "#A378FF";
					case "choice":
						return "#F7634D";
					case "label":
						return "#F7634D";
					case "page":
						return "#A378FF";
					case "badge":
						return "#11A676";
					case "mail":
						return "#399BE2";
					case "addgroup":
						return "#11A676";
					case "remgroup":
						return "#F7634D";
					case "generic":
						return "#11A676";
					//LTI
					case "start":
						return "#363638";
					case "end":
						return "#363638";
					case "fragment":
						return "#00008b";
					default:
						return "#11A676";
				}
			default: {
				switch (node.type) {
					//Moodle + Sakai
					case "quiz":
						return "#eb9408";
					case "assign":
						return "#0dcaf0";
					case "forum":
						return "#800080";
					case "resource":
						return "#0d6efd";
					case "folder":
						return "#ffc107";
					case "url":
						return "#5f9ea0";
					case "mail":
						return "#5f9ea0";
					case "addgroup":
						return "#198754";
					case "remgroup":
						return "#dc3545";
					//Moodle
					case "workshop":
						return "#15a935";
					case "choice":
						return "#dc3545";
					case "label":
						return "#a91568";
					case "page":
						return "#6c757d";
					case "badge":
						return "#198754";
					case "generic":
						return "#1f1e42";
					//Sakai
					case "exam":
						return "#dc3545";
					case "contents":
						return "#15a935";
					case "text":
						return "#6c757d";
					case "html":
						return "#a91568";
					//LTI
					case "start":
						return "#363638";
					case "end":
						return "#363638";
					case "fragment":
						return "#00008b";
					default:
						return "#ffc107";
				}
			}
		}
	};

	const onInit = (reactFlowInstance) => {
		console.log("Blockflow loaded:", reactFlowInstance);
	};

	const handleNodeDragStart = (event, node) => {
		setShowContextualMenu(false);

		if (snapping) {
			let inFragment = node.parentNode ? true : false;

			if (inFragment) {
				const nodeDOM = getNodeDOMById(node.id);
				nodeDOM.classList.add("insideFragment");
			}
			if (snappingInFragment) {
				setSnapToGrid(true);
			} else {
				setSnapToGrid(!inFragment);
			}
		} else {
			setSnapToGrid(false);
		}
	};

	const onSelectionDragStart = (event, nodes) => {
		setShowContextualMenu(false);
	};

	const onSelectionDragStop = (event, nodes) => {};

	const onNodeDragStop = (event, node) => {
		reactFlowInstance.setNodes(
			getUpdatedArrayById(node, reactFlowInstance.getNodes())
		);

		if (node.parentNode) {
			const parent = getNodeById(node.parentNode, reactFlowInstance);
			parent.data.innerNodes.map((innerNode) => {
				if (innerNode.id == node.id) {
					innerNode.position = node.position;
					return innerNode;
				} else {
					return innerNode;
				}
			});
		}

		setSnapToGrid(true);
	};

	const onPaneClick = () => {
		if (autoHideAside) {
			setExpandedAside(false);
		}
		setSnapToGrid(true);
	};

	const onNodeClick = (e, node) => {
		if (node.type == "start" || node.type == "end") {
			reactFlowInstance.setNodes(
				reactFlowInstance.getNodes().map((n) => {
					n.selected = false;
					return n;
				})
			);
		}
		setSnapToGrid(true);
	};

	const onConnect = (event) => {
		//FIXME: Node moves back to original position on connection
		const sourceNodeId = event.source.split("__")[0];
		const targetNodeId = event.target.split("__")[0];

		const sourceNode = map.find((node) => node.id === sourceNodeId);

		if (sourceNode) {
			if (Array.isArray(sourceNode.children)) {
				sourceNode.children.push(targetNodeId);
			} else {
				sourceNode.children = [targetNodeId];
			}
		}

		//FIXME: Check if line already drawn
		setEdges([
			...edges,
			{
				id: sourceNodeId + "-" + targetNodeId,
				source: sourceNodeId,
				target: targetNodeId,
			},
		]);

		reactFlowInstance.setNodes(
			getUpdatedArrayById({ ...sourceNode }, reactFlowInstance.getNodes())
		);
	};

	useEffect(() => {
		setNodes(newInitialNodes);
		setEdges(newInitialEdges);
	}, [newInitialNodes, newInitialEdges]);

	// Centers the map on a map change, if the map changed, based on the change of the id of the start block
	useEffect(() => {
		reactFlowInstance?.fitView();
	}, [[reactFlowInstance?.getNodes().find((n) => n.type == "start")][0]?.id]);

	const onNodesDelete = (nodes) => {
		setBlockSelected();
		deleteBlocks(nodes);
	};

	const onEdgesDelete = (nodes) => {
		setDeletedEdge(nodes[0]);
	};

	useEffect(() => {
		if (deletedEdge.id) {
			let updatedBlocksArray = reactFlowInstance.getNodes().slice();

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

			reactFlowInstance.setNodes(updatedBlocksArray);
		}
	}, [deletedEdge]);

	const onLoad = () => {};

	useEffect(() => {
		setNewInitialNodes(map);

		setNewInitialEdges(
			map?.flatMap((parent) => {
				if (parent.data.children) {
					return parent.data.children.map((child) => {
						return {
							id: `${parent.id}-${child}`,
							source: parent.id,
							target: child,
						};
					});
				} else {
					return [];
				}
			})
		);
	}, [map]);

	/*const onConnect = useCallback(
		(params) => setEdges((eds) => addEdge(params, eds)),
		[]
	);*/

	// we are using a bit of a shortcut here to adjust the edge type
	// this could also be done with a custom edge for example
	const edgesWithUpdatedTypes = edges
		? edges.map((edge) => {
				if (edge.sourceHandle) {
					const edgeType = nodes.find((node) => node.type === "custom").data
						.selects[edge.sourceHandle];
					edge.type = edgeType;
				}

				//FIXME: Does nothing
				if (edge.conditions != undefined) {
					for (let condition of cedge.conditions) {
						edge.label = "" + condition.operand + condition.objective;
					}
				}

				return edge;
		  })
		: edges;

	const onNodeContextMenu = (e, node) => {
		setShowContextualMenu(false);
		setCMContainsReservedNodes(false);
		const bounds = reactFlowWrapper.current?.getBoundingClientRect();
		e.preventDefault();
		setCMX(e.clientX - bounds.left);
		setCMY(e.clientY - bounds.top);
		let selectedCount = 0;
		const currentNodes = reactFlowInstance.getNodes();
		currentNodes.map((node) => (node.selected ? selectedCount++ : null));
		console.log(selectedCount);
		if (selectedCount <= 1) {
			setCMBlockData(node);
			if (node.type == "start" || node.type == "end") {
				setCMContainsReservedNodes(true);
			}
			setContextMenuOrigin("block");
		} else {
			const selectedNodes = currentNodes.filter(
				(node) => node.selected == true
			);
			setContextMenuOrigin("nodesselection");
			setCMBlockData(selectedNodes);
			setCMContainsReservedNodes(thereIsReservedNodesInArray(selectedNodes));
		}

		setShowContextualMenu(true);
	};

	const onPaneContextMenu = (e) => {
		setShowContextualMenu(false);
		setCMContainsReservedNodes(false);
		console.log(reactFlowInstance);
		const bounds = reactFlowWrapper.current?.getBoundingClientRect();
		e.preventDefault();
		setCMX(e.clientX - bounds.left);
		setCMY(e.clientY - bounds.top);
		setCMBlockData(undefined);
		setContextMenuOrigin("pane");
		setShowContextualMenu(true);
	};

	const onSelectionContextMenu = (e) => {
		setShowContextualMenu(false);
		setCMContainsReservedNodes(false);
		const bounds = reactFlowWrapper.current?.getBoundingClientRect();
		e.preventDefault();
		const selectedNodes = reactFlowInstance
			.getNodes()
			.filter((node) => node.selected == true);
		setCMX(e.clientX - bounds.left);
		setCMY(e.clientY - bounds.top);
		setContextMenuOrigin("nodesselection");

		console.log(selectedNodes, reactFlowInstance);
		setCMBlockData(selectedNodes);
		setCMContainsReservedNodes(thereIsReservedNodesInArray(selectedNodes));
		setShowContextualMenu(true);
	};

	const deleteBlocks = (blocks) => {
		if (!Array.isArray(blocks)) {
			const deletedBlockArray = reactFlowInstance
				.getNodes()
				.filter((b) => b.id !== blocks.id);
			const deletedRelatedChildrenArray = filterRelatedChildrenById(
				blocks.id,
				deletedBlockArray
			);
			const deleteRelatedConditionsArray = filterRelatedConditionsById(
				blocks.id,
				deletedRelatedChildrenArray
			);
			console.log(blocks.type);
			if (blocks.type == "fragment" && blocks.data.innerNodes.length > 0) {
				const withoutFragmentChildren = [
					...deleteBlocks(
						addFragmentChildrenFromFragment(blocks, deletedRelatedChildrenArray)
					),
				];
				//Delete fragment from finalMap, as its added back by the deleteBlocks function
				const withoutFragment = withoutFragmentChildren.filter(
					(b) => b.id !== blocks.id
				);
				reactFlowInstance.setNodes(withoutFragment);
			} else {
				reactFlowInstance.setNodes(deleteRelatedConditionsArray);
			}
			return deleteRelatedConditionsArray;
		} else {
			if (blocks.length > 0) {
				let updatedBlocksArray = reactFlowInstance.getNodes().slice();

				blocks.forEach((b) => {
					const id = b.id;

					updatedBlocksArray = updatedBlocksArray.filter((b) => b.id !== id);
					updatedBlocksArray = filterRelatedChildrenById(
						id,
						updatedBlocksArray
					);
					updatedBlocksArray = filterRelatedConditionsById(
						id,
						updatedBlocksArray
					);
				});

				reactFlowInstance.setNodes(updatedBlocksArray);
				return updatedBlocksArray;
			}
		}
	};

	/**
	 * Filters out children with the given id from an array of objects.
	 * @param {string} id - The id of the child to filter.
	 * @param {Object[]} arr - The array of objects to search for children.
	 * @returns {Object[]} - The updated array of objects with the specified child removed.
	 */
	const filterRelatedChildrenById = (id, arr) => {
		return arr.map((b) => {
			if (b.children?.includes(id)) {
				const updatedChildren = b.children.filter((childId) => childId !== id);
				return {
					...b,
					children: updatedChildren.length ? updatedChildren : undefined,
				};
			} else if (b.children?.length) {
				return { ...b, children: filterRelatedChildrenById(id, b.children) };
			} else {
				return b;
			}
		});
	};

	/**
	 * Filters out conditions with the given unlockId from an array of objects.
	 * @param {string} unlockId - The unlockId of the condition to filter.
	 * @param {Object[]} arr - The array of objects to search for conditions.
	 * @returns {Object[]} - The updated array of objects with the specified condition filtered.
	 */
	const filterRelatedConditionsById = (unlockId, arr) => {
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
					children: filterRelatedConditionsById(unlockId, b.children),
				};
			} else {
				return b;
			}
		});
	};

	const addFragmentChildrenFromFragment = (fragment, arr) => {
		const parentNode = fragment.id;
		const fragmentChildren = reactFlowInstance
			.getNodes()
			.filter((node) => node.parentNode == parentNode);
		const filteredArr = arr.filter((oNode) =>
			fragmentChildren.map((cNode) => cNode.id).includes(oNode.id)
		);
		return [...filteredArr, ...fragmentChildren];
	};

	//TODO: REVISAR
	useEffect(() => {
		if (cMBlockData && reactFlowInstance)
			if (!Array.isArray(cMBlockData)) {
				let newcurrentBlocksData = [...reactFlowInstance.getNodes()];
				newcurrentBlocksData[
					reactFlowInstance.getNodes().findIndex((b) => b.id == cMBlockData.id)
				] = cMBlockData;
				reactFlowInstance.setNodes(newcurrentBlocksData);
			} else {
				const newcurrentBlocksData = reactFlowInstance
					.getNodes()
					.map((block) => {
						const newBlock = cMBlockData.find((b) => b.id === block.id);
						return newBlock ? { ...block, ...newBlock } : block;
					});
				reactFlowInstance.setNodes(newcurrentBlocksData);
			}
	}, [cMBlockData]);

	const handleBlockCopy = (blockData = []) => {
		setShowContextualMenu(false);

		let blockDataSet;
		if (blockData.length == 1) {
			blockDataSet = new Set(blockData);
		} else {
			blockDataSet = new Set();
		}

		const selectedNodes = [
			...document.querySelectorAll(".react-flow__node.selected"),
		];

		for (const node of selectedNodes) {
			const id = node.dataset?.id;
			if (id) {
				const blockDataMap = new Map(
					reactFlowInstance.getNodes().map((block) => [block.id, block])
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
				blockData = getBlockByNodeDOM(
					selectedNodes[0],
					reactFlowInstance.getNodes()
				);
			}
			handleDeleteBlock(blockData);
		}
	};

	const createBlock = (blockData) => {
		//TODO: Block selector
		const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();

		const preferredPosition = contextMenuDOM
			? { x: currentMousePosition.x, y: currentMousePosition.y }
			: { x: cMX, y: cMY };

		let flowPos = reactFlowInstance.project({
			x: preferredPosition.x - reactFlowBounds.left,
			y: preferredPosition.y - reactFlowBounds.top,
		});

		const asideOffset = expandedAside
			? Math.floor(asideBounds.width / 125) * 125
			: 0;

		flowPos.x += asideOffset;

		let newBlockCreated;

		if (blockData) {
			if (blockData.type == "action") {
				//Doesn't check plataform as both Moodle and Sakai have this common action
				newBlockCreated = {
					id: uniqueId(),
					position: { x: flowPos.x, y: flowPos.y },
					type: "mail",
					data: {
						label: "Nuevo bloque de acción",
						children: undefined,
						order: 100,
						unit: 1,
					},
				};
			} else {
				//TODO: Check if ID already exists
				if (blockData.type == "emptyfragment") {
					newBlockCreated = {
						id: uniqueId(),
						position: { x: flowPos.x, y: flowPos.y },
						type: "fragment",
						style: { height: 68, width: 68 },
						data: {
							label: "Nuevo fragmento",
							innerNodes: [],
							expanded: false,
						},
					};
				} else {
					if (blockData.type != "fragment") {
						newBlockCreated = {
							...blockData,
							position: {
								x: blockData.position.x + asideOffset + flowPos.x,
								y: blockData.position.y + asideOffset + flowPos.y,
							},
						};
					} else {
						newBlockCreated = { ...blockData };
					}
				}
			}
		} else {
			if (platform == "moodle") {
				newBlockCreated = {
					id: uniqueId(),
					position: { x: flowPos.x, y: flowPos.y },
					type: "generic",
					data: {
						label: "Nuevo bloque",
						children: undefined,
						order: 100,
						unit: 1,
					},
				};
			} else {
				newBlockCreated = {
					id: uniqueId(),
					position: { x: flowPos.x, y: flowPos.y },
					type: "resource",
					data: {
						label: "Nuevo bloque",
						children: undefined,
						order: 100,
						unit: 1,
					},
				};
			}
		}

		setShowContextualMenu(false);

		if (Object.keys(newBlockCreated).length !== 0) {
			let newcurrentBlocksData = reactFlowInstance.getNodes();
			newcurrentBlocksData.push(newBlockCreated);
			reactFlowInstance.setNodes([...newcurrentBlocksData]);
			return newcurrentBlocksData;
		}
	};

	const createBlockBulk = (blockDataArray) => {
		const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();

		const preferredPosition = contextMenuDOM
			? { x: currentMousePosition.x, y: currentMousePosition.y }
			: { x: cMX, y: cMY };

		let flowPos = reactFlowInstance.project({
			x: preferredPosition.x - reactFlowBounds.left,
			y: preferredPosition.y - reactFlowBounds.top,
		});

		const asideOffset = expandedAside
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

		let newcurrentBlocksData = [...reactFlowInstance.getNodes(), ...newBlocks];
		reactFlowInstance.setNodes(newcurrentBlocksData);
	};

	const handleFragmentCreation = () => {
		const selectedNodes = reactFlowInstance
			.getNodes()
			.filter((node) => node.selected == true);

		//Delete the original nodes to put them after the fragment, so appear after the fragment and extendParent takes effect
		const filteredNodes = deleteBlocks(
			reactFlowInstance
				.getNodes()
				.filter((oNode) =>
					selectedNodes.map((pNode) => pNode.id).includes(oNode.id)
				)
		);

		let minX = Infinity;
		let minY = Infinity;
		let maxX = 0;
		let maxY = 0;
		const innerNodes = [];
		for (const node of selectedNodes) {
			minX = Math.min(minX, node.position.x);
			minY = Math.min(minY, node.position.y);
			maxX = Math.max(maxX, node.position.x);
			maxY = Math.max(maxY, node.position.y);
		}
		for (const node of selectedNodes) {
			innerNodes.push({
				id: node.id,
				position: { x: node.position.x - minX, y: node.position.y - minY },
			});
		}

		const newFragmentID = uniqueId();

		const newFragment = {
			id: newFragmentID,
			position: { x: minX, y: minY },
			type: "fragment",
			style: { height: maxY - minY + 68, width: maxX - minX + 68 },
			zIndex: -1,
			data: {
				label: "Nuevo Fragmento",
				innerNodes: innerNodes,
				expanded: true,
			},
		};

		const parentedNodes = selectedNodes.map((node) => {
			node.parentNode = newFragmentID;
			node.expandParent = true;
			return node;
		});

		console.log(filteredNodes);
		reactFlowInstance.setNodes([
			...filteredNodes,
			newFragment,
			...parentedNodes,
		]);
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
			blockDataArray.push(getNodeByNodeDOM(node, reactFlowInstance));
		}
		deleteBlocks(blockDataArray);
	};

	const handleNewRelation = (origin, end) => {
		const currentSelectionId =
			document.querySelectorAll(".react-flow__node.selected")[0]?.dataset.id ||
			undefined;

		end =
			end ||
			reactFlowInstance
				.getNodes()
				.find((block) => block.id === currentSelectionId);

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
				setRelationStarter();
				return;
			}

			const newBlocksData = [...reactFlowInstance.getNodes()];
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
			setRelationStarter();
			reactFlowInstance.setNodes(newBlocksData);
		} else {
			const starterBlock = reactFlowInstance
				.getNodes()
				.find((block) => block.id == currentSelectionId);

			setRelationStarter(starterBlock);

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

	const handleShow = () => {
		const selectedNodes = reactFlowInstance
			.getNodes()
			.filter((node) => node.selected == true);

		let newCMBlockData = undefined;
		if (selectedNodes.length == 1) {
			newCMBlockData = selectedNodes[0];
		}

		if (newCMBlockData || cMBlockData) {
			if (selectedNodes.length == 1) {
				setCMBlockData(newCMBlockData);
			}

			setShowConditionsModal(true);
			setShowContextualMenu(false);
		} else {
			toast("No se pueden editar las precondiciones de la selección actual", {
				hideProgressBar: false,
				autoClose: 4000,
				type: "error",
				position: "bottom-center",
				theme: "light",
			});
		}
	};

	useHotkeys("ctrl+c", () => {
		handleBlockCopy();
	});
	useHotkeys("shift+b", () => createBlock());
	useHotkeys("shift+alt+b", () => createBlock({ type: "action" }));
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
	useHotkeys("shift+r", () => handleNewRelation(relationStarter));
	useHotkeys("shift+f", () => {
		handleFragmentCreation();
	});
	useHotkeys("shift+e", () => {
		handleShow();
	});

	return (
		<div ref={reactFlowWrapper} style={{ height: "100%", width: "100%" }}>
			<ReactFlow
				ref={ref}
				nodes={nodes}
				edges={edgesWithUpdatedTypes}
				onNodeDragStart={handleNodeDragStart}
				onNodeDragStop={onNodeDragStop}
				onSelectionDragStart={onSelectionDragStart}
				onSelectionDragStop={onSelectionDragStop}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onNodesDelete={onNodesDelete}
				onEdgesDelete={onEdgesDelete}
				onNodeClick={onNodeClick}
				onPaneClick={onPaneClick}
				onConnect={onConnect}
				onInit={onInit}
				onLoad={onLoad}
				onMoveStart={() => setShowContextualMenu(false)}
				onNodeContextMenu={onNodeContextMenu}
				onPaneContextMenu={onPaneContextMenu}
				onSelectionContextMenu={onSelectionContextMenu}
				fitView
				proOptions={{ hideAttribution: true }}
				nodeTypes={nodeTypes}
				snapGrid={[125, 175]}
				//connectionLineComponent={}
				snapToGrid={snapToGrid}
				deleteKeyCode={["Backspace", "Delete", "d"]}
				multiSelectionKeyCode={["Shift"]}
				selectionKeyCode={["Shift"]}
				zoomOnDoubleClick={false}
				nodesDraggable={interactive}
				nodesConnectable={interactive}
				nodesFocusable={interactive}
				edgesFocusable={interactive}
				elementsSelectable={interactive}
			>
				{minimap && (
					<MiniMap
						nodeColor={nodeColor}
						style={minimapStyle}
						zoomable
						pannable
					/>
				)}

				<Background color="#aaa" gap={16} />
			</ReactFlow>
			<ContextualMenu
				ref={contextMenuDOM}
				showContextualMenu={showContextualMenu}
				blockData={cMBlockData}
				containsReservedNodes={cMContainsReservedNodes}
				relationStarter={relationStarter}
				setRelationStarter={setRelationStarter}
				setShowContextualMenu={setShowContextualMenu}
				setShowConditionsModal={setShowConditionsModal}
				x={cMX}
				y={cMY}
				contextMenuOrigin={contextMenuOrigin}
				createBlock={createBlock}
				handleFragmentCreation={handleFragmentCreation}
				handleBlockCopy={handleBlockCopy}
				handleBlockPaste={handleBlockPaste}
				handleNewRelation={handleNewRelation}
				handleBlockCut={handleBlockCut}
				handleDeleteBlock={handleDeleteBlock}
				handleDeleteBlockSelection={handleDeleteBlockSelection}
				handleShow={handleShow}
			/>
			<CustomControls />
			{showConditionsModal && (
				<ConditionModal
					blockData={cMBlockData}
					setBlockData={setCMBlockData}
					blocksData={reactFlowInstance.getNodes()}
					showConditionsModal={showConditionsModal}
					setShowConditionsModal={setShowConditionsModal}
				/>
			)}
		</div>
	);
};
const OverviewFlowWithRef = forwardRef(OverviewFlow);
OverviewFlowWithRef.displayName = "OverviewFlow";
export default OverviewFlowWithRef;
