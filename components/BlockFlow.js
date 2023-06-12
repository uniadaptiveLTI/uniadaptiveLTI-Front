import React, {
	forwardRef,
	useContext,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import ReactFlow, {
	MiniMap,
	Background,
	useNodesState,
	useEdgesState,
	useNodesInitialized,
	SelectionMode,
	useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import ActionNode from "./flow/nodes/ActionNode.js";
import ElementNode from "./flow/nodes/ElementNode.js";
import {
	NodeInfoContext,
	ErrorListContext,
	ExpandedAsideContext,
	PlatformContext,
	SettingsContext,
	MetaDataContext,
	notImplemented,
} from "@root/pages/_app.js";
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
	getUpdatedArrayById,
	addEventListeners,
	getByProperty,
	deduplicateById,
} from "@utils/Utils";
import {
	getNodeByNodeDOM,
	thereIsReservedNodesInArray,
	getNodeDOMById,
	getNodeById,
	getChildrenNodesFromFragmentID,
} from "@utils/Nodes";
import { errorListCheck } from "@utils/ErrorHandling";
import { toast } from "react-toastify";
import { useHotkeys } from "react-hotkeys-hook";
import ContextualMenu from "@flow/ContextualMenu.js";
import ConditionModal from "@conditions/ConditionModal.js";
import { getTypeStaticColor } from "@utils/NodeIcons.js";
import NodeSelector from "@dialogs/NodeSelector.js";
import CriteriaModal from "@flow/badges/CriteriaModal.js";
import AnimatedEdge from "@edges/AnimatedEdge.js";
import ConditionalEdge from "@edges/ConditionalEdge";
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

const edgeTypes = {
	conditionalEdge: ConditionalEdge,
};

const OverviewFlow = ({ map }, ref) => {
	const validTypes = ["badge", "mail", "addgroup", "remgroup"];

	const { errorList, setErrorList } = useContext(ErrorListContext);
	const { expandedAside, setExpandedAside } = useContext(ExpandedAsideContext);
	const { setNodeSelected } = useContext(NodeInfoContext);
	const { settings } = useContext(SettingsContext);
	const { metaData } = useContext(MetaDataContext);
	const [clipboard, setClipboard] = useState(localStorage.getItem("clipboard"));
	const parsedSettings = JSON.parse(settings);
	const { autoHideAside, snapping, snappingInFragment } = parsedSettings;

	//Flow States
	const reactFlowInstance = useReactFlow();
	const [newInitialNodes, setNewInitialNodes] = useState([]);
	const [newInitialEdges, setNewInitialEdges] = useState([]);
	const [minimap, setMinimap] = useState(true);
	const [interactive, setInteractive] = useState(true);
	const [snapToGrid, setSnapToGrid] = useState(true);
	const [deletedEdge, setDeletedEdge] = useState([]);
	const [fragmentPassthrough, setFragmentPassthrough] = useState(false);
	const dragRef = useRef(null);
	const [target, setTarget] = useState(null);
	const [prevMap, setPrevMap] = useState();
	const nodesInitialized = useNodesInitialized();

	//ContextMenu Ref, States, Constants
	const contextMenuDOM = useRef(null);
	const [showContextualMenu, setShowContextualMenu] = useState(false);
	const [cMX, setCMX] = useState(0);
	const [cMY, setCMY] = useState(0);
	const [contextMenuOrigin, setContextMenuOrigin] = useState("");
	const [cMContainsReservedNodes, setCMContainsReservedNodes] = useState(false);
	const [cMBlockData, setCMBlockData] = useState();
	const [relationStarter, setRelationStarter] = useState();
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
	//NodeSelector
	const [showNodeSelector, setShowNodeSelector] = useState(false);
	const [nodeSelectorType, setNodeSelectorType] = useState(false);

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
					startNode.position.y + startNode.height / 2,
					{ duration: 800 }
				);
			}
		};
		const fitMap = () => {
			reactFlowInstance.fitView({ duration: 800 });
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

	const onInit = (reactFlowInstance) => {
		console.log("Blockflow loaded:", reactFlowInstance);
	};

	const onNodeDragStart = (event, node) => {
		setShowContextualMenu(false);
		dragRef.current = node;

		if (snapping) {
			if (node.parentNode) {
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
			}
		} else {
			setSnapToGrid(false);
		}
	};

	const onNodeDrag = (event, node) => {
		const centerX = node.position.x + node.width / 2;
		const centerY = node.position.y + node.height / 2;

		const targetNode = nodes.find(
			(n) =>
				centerX > n.position.x &&
				centerX < n.position.x + n.width &&
				centerY > n.position.y &&
				centerY < n.position.y + n.height &&
				n.id !== node.id
		);

		setTarget(targetNode);
	};

	const onSelectionDragStart = (event, nodes) => {
		setShowContextualMenu(false);
	};

	const onSelectionDragStop = (event, nodes) => {};

	const onNodeDragStop = (event, node) => {
		node.dragging = false;
		reactFlowInstance.setNodes(
			getUpdatedArrayById(node, reactFlowInstance.getNodes())
		);

		if (node.parentNode) {
			const parent = getNodeById(node.parentNode, reactFlowInstance.getNodes());
			parent.data.innerNodes.map((innerNode) => {
				if (innerNode.id == node.id) {
					innerNode.position = node.position;
					return innerNode;
				} else {
					return innerNode;
				}
			});
		}

		if (target?.type == "fragment") {
			if (target.data.expanded) {
				//Adds node to target fragment
				const relPos = {
					x: node.position.x - target.position.x,
					y: node.position.y - target.position.y,
				};
				const newInnerNode = { id: node.id, position: relPos };
				target.data.innerNodes = [...target.data.innerNodes, newInnerNode];

				node.position = relPos;
				node.parentNode = target.id;
				node.expandParent = true;

				reactFlowInstance.setNodes(
					getUpdatedArrayById(target, [
						...reactFlowInstance
							.getNodes()
							.filter((nodes) => nodes.id != node.id),
						node,
					])
				);
			}
		}

		setTarget(null);
		dragRef.current = null;
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
		const sourceNodeId = event.source.split("__")[0];
		const targetNodeId = event.target.split("__")[0];

		console.log(sourceNodeId);
		console.log(targetNodeId);

		const edgeFound = reactFlowInstance
			.getEdges()
			.find((node) => node.id === sourceNodeId + "-" + targetNodeId);

		if (!edgeFound) {
			console.log("NO EXISTE");
			const sourceNode = reactFlowInstance
				.getNodes()
				.find((nodes) => nodes.id == sourceNodeId);

			const targetNode = reactFlowInstance
				.getNodes()
				.find((nodes) => nodes.id == targetNodeId);

			if (sourceNode) {
				if (Array.isArray(sourceNode.data.children)) {
					sourceNode.data.children.push(targetNodeId);
				} else {
					sourceNode.data.children = [targetNodeId];
				}
			}

			if (targetNode) {
				const newCondition = {
					id: parseInt(Date.now() * Math.random()).toString(),
					type: "completion",
					op: sourceNode.id,
					query: "completed",
				};
				console.log(targetNode.data.conditions);
				if (!targetNode.data.conditions) {
					console.log("CONDICIONES SIN DEFINIR");
					targetNode.data.conditions = {
						type: "conditionsGroup",
						id: parseInt(Date.now() * Math.random()).toString(),
						op: "&",
						conditions: [newCondition],
					};
				} else {
					targetNode.data.conditions.conditions.push(newCondition);
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

			console.log(sourceNode);

			setNodes(
				getUpdatedArrayById(
					[sourceNode, targetNode],
					reactFlowInstance.getNodes()
				)
			);
		}
	};

	useEffect(() => {
		setNodes(newInitialNodes);
		setEdges(newInitialEdges);
	}, [newInitialNodes, newInitialEdges]);

	const onNodesDelete = (nodes) => {
		setNodeSelected();
		deleteBlocks(nodes);
	};

	function deleteConditionById(conditions, op) {
		for (let i = 0; i < conditions.length; i++) {
			const condition = conditions[i];
			if (condition.op === op) {
				conditions.splice(i, 1);
				if (conditions.length === 0) {
					conditions = undefined;
				}
				return true;
			} else if (condition.conditions) {
				if (deleteConditionById(condition.conditions, op)) {
					if (condition.conditions.length === 0) {
						condition.conditions = undefined;
					}
					return true;
				}
			}
		}
		return false;
	}

	const onEdgesDelete = (nodes) => {
		var blockNodeSource = reactFlowInstance
			?.getNodes()
			.find((obj) => obj.id === nodes[0].source);

		var blockNodeTarget = reactFlowInstance
			?.getNodes()
			.find((obj) => obj.id === nodes[0].target);

		console.log(blockNodeTarget.data);

		const updatedBlockNodeSource = { ...blockNodeSource };
		updatedBlockNodeSource.data.children =
			updatedBlockNodeSource.data.children.filter(
				(childId) => !childId.includes(blockNodeTarget.id)
			);

		blockNodeSource = updatedBlockNodeSource;

		deleteConditionById(
			blockNodeTarget.data.conditions.conditions,
			blockNodeSource.id
		);

		console.log(blockNodeTarget.data.conditions);

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

	const onLoad = () => {
		if (map != prevMap) {
			reactFlowInstance.fitView({ duration: 800 });
			setPrevMap(map);
		}
	};

	useEffect(() => {
		//Makes fragment children invsible if it isn't expanded, on load
		if (nodesInitialized)
			for (const node of map) {
				if (node.parentNode) {
					const parentFragment = getNodeById(
						node.parentNode,
						reactFlowInstance.getNodes()
					);
					if (!parentFragment.data.expanded) {
						getNodeDOMById(node.id).style.visibility = "hidden";
					}
				}
			}
	}, [nodesInitialized]);

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
				if (edge) {
					/*if (edge.sourceHandle) {
						const edgeType = nodes.find((node) => node.type === "custom").data
							.selects[edge.sourceHandle];
						edge.type = edgeType;
					}

					//FIXME: Does nothing
					if (edge.conditions != undefined) {
						for (let condition of cedge.conditions) {
							edge.label = "" + condition.operand + condition.objective;
						}
					}*/
					edge.type = "conditionalEdge";
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

	useEffect(() => {
		if (errorList) {
			console.log(errorList);
		}
	}, [errorList]);

	const deleteBlocks = (blocks) => {
		console.log(blocks);
		errorListCheck(blocks, errorList, setErrorList, true);

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

	const handleNodeCopy = (blockData = []) => {
		setShowContextualMenu(false);

		const selectedNodes = reactFlowInstance
			.getNodes()
			.filter((node) => node.selected == true);

		const blockDataSet = [];
		if (blockData.length == 1) {
			blockDataSet.push(...blockData);
		}

		const selected = deduplicateById([...blockDataSet, ...selectedNodes]);

		const childrenArray = [];
		selected.forEach((node) => {
			if (node.type == "fragment") {
				const fragmentID = node.id;
				const children = getChildrenNodesFromFragmentID(
					fragmentID,
					reactFlowInstance.getNodes()
				);
				childrenArray.push(...children);
			}
		});

		const completeSelection = deduplicateById([...childrenArray, ...selected]);

		const cleanedSelection = completeSelection.map((node) => {
			delete node.dragging;
			delete node.width;
			delete node.height;
			delete node.positionAbsolute;
			delete node.selected;
			if (node.data) {
				if (node.datalmsResource < 0) {
					delete node.lmsResource;
				}
			}
			return node;
		});

		const clipboardData = {
			instance_id: metaData.instance_id,
			course_id: metaData.course_id,
			platform: metaData.platform, //Redundant, just in case
			data: cleanedSelection,
		};

		localStorage.setItem("clipboard", JSON.stringify(clipboardData));

		if (cleanedSelection.length > 0) {
			toast("Se han copiado " + cleanedSelection.length + " bloque(s)", {
				hideProgressBar: false,
				autoClose: 2000,
				type: "info",
				position: "bottom-center",
				theme: "light",
			});
		}
	};

	const handleNodePaste = () => {
		const clipboardData = JSON.parse(localStorage.getItem("clipboard"));
		console.log(clipboardData);
		if (clipboardData && clipboardData.data && clipboardData.data.length > 0) {
			const copiedBlocks = clipboardData.data;
			const newBlocksToPaste = [...copiedBlocks];

			const originalIDs = newBlocksToPaste.map((block) => block.id);
			const newIDs = newBlocksToPaste.map((block) => uniqueId());
			const fragmentIDChanges = [];
			const originalX = newBlocksToPaste.map((block) => block.position.x);
			const originalY = newBlocksToPaste.map((block) => block.position.y);
			const firstOneInX = Math.min(...originalX);
			const firstOneInY = Math.min(...originalY);
			const newX = originalX.map((x) => -firstOneInX + x);
			const newY = originalY.map((y) => -firstOneInY + y);
			//FIXME: COPIADO DE FRAGMENTOS
			console.log(originalIDs);
			console.log(newIDs);
			const shouldEmptyResource = !(
				metaData.instance_id == clipboardData.instance_id &&
				metaData.course_id == clipboardData.course_id &&
				metaData.platform == clipboardData.platform
			);
			console.log(shouldEmptyResource);
			const newBlocks = newBlocksToPaste.map((block, index) => {
				let newID;
				let originalID;

				let filteredChildren = block.children
					?.map((child) => {
						newID = newIDs[originalIDs.indexOf(child)];
						originalID = child;
						return newID;
					})
					.filter((child) => child !== undefined);

				console.log(newID);
				console.log(originalID);

				return {
					...block,
					id: newIDs[index],
					position: { x: newX[index], y: newY[index] },
					data: {
						...block.data,
						children:
							filteredChildren?.length === 0 ? undefined : filteredChildren,
						conditions: undefined,
						lmsResource: shouldEmptyResource
							? undefined
							: block.data.lmsResource,
					},
				};
			});

			copiedBlocks.length <= 1
				? createBlock(newBlocks[0], newBlocks[0].x, newBlocks[0].y)
				: createBlockBulk(newBlocks);
		}
	};

	const handleNodeCut = (blockData = []) => {
		const selectedNodes = reactFlowInstance
			.getNodes()
			.filter((n) => n.selected == true);
		handleNodeCopy(blockData);
		if (selectedNodes.length > 1) {
			handleNodeSelectionDeletion();
		} else {
			if (selectedNodes.length == 1) {
				blockData = selectedNodes[0];
			}
			handleNodeDeletion(blockData);
		}
	};

	const createBlock = (blockData) => {
		//TODO: Block selector
		const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
		const aside = document.getElementById("aside");
		const asideBounds = aside ? aside?.getBoundingClientRect() : { width: 0 };

		const preferredPosition = contextMenuDOM
			? { x: cMX, y: cMY }
			: { x: currentMousePosition.x, y: currentMousePosition.y };

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
			if (blockData.data == undefined) {
				//If data isn't defined (Alternative blocks)
				if (blockData.type == "ActionNode") {
					//Doesn't check plataform as both Moodle and Sakai have this common action
					newBlockCreated = {
						id: uniqueId(),
						position: { x: flowPos.x, y: flowPos.y },
						type: "mail",
						data: {
							label: "Nuevo bloque de acción",
							children: undefined,
							order: 100,
							section: 1,
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
							newBlockCreated = { ...{ ...blockData } };
						}
					}
				}
			} else {
				//If data is defined (NodeSelector)
				newBlockCreated = {
					...blockData,
					position: { x: flowPos.x, y: flowPos.y },
				};
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
						section: 1,
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
						section: 1,
					},
				};
			}
		}

		errorListCheck(newBlockCreated, errorList, setErrorList, false);

		setShowContextualMenu(false);

		if (Object.keys(newBlockCreated).length !== 0) {
			let newcurrentBlocksData = reactFlowInstance.getNodes();
			newcurrentBlocksData.push(newBlockCreated);
			reactFlowInstance.setNodes([...newcurrentBlocksData]);
			if (!Object.keys(newBlockCreated).length > 1) {
				getNodeDOMById(newBlockCreated.id).focus();
			}
			return newcurrentBlocksData;
		}
	};

	const createBlockBulk = (clipboardData) => {
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
		const newBlocks = clipboardData.map((blockData) => {
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

		if (
			!selectedNodes.filter(
				(node) => node.type == "fragment" || node.parentNode != undefined
			).length > 0
		) {
			if (selectedNodes.length > 0) {
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

				reactFlowInstance.setNodes([
					...filteredNodes,
					newFragment,
					...parentedNodes,
				]);
			} else {
				//No blocks selected
				const bounds = document
					.getElementById("reactFlowWrapper")
					?.getBoundingClientRect();

				const viewPortCenter = reactFlowInstance.project({
					x: bounds.width / 2,
					y: bounds.height / 2,
				});

				const newFragment = {
					id: uniqueId(),
					position: viewPortCenter,
					type: "fragment",
					style: { height: 68, width: 68 },
					zIndex: -1,
					data: {
						label: "Nuevo Fragmento",
						innerNodes: [],
						expanded: true,
					},
				};

				reactFlowInstance.setNodes([
					newFragment,
					...reactFlowInstance.getNodes(),
				]);
			}
		} else {
			toast(
				"No se pueden crear fragmentos con fragmentos en su interior, o con bloques que formen parte de otro",
				{
					hideProgressBar: false,
					autoClose: 2000,
					type: "error",
					position: "bottom-center",
					theme: "light",
				}
			);
		}
	};

	const handleNodeDeletion = (blockData) => {
		setShowContextualMenu(false);
		setNodeSelected();
		deleteBlocks(blockData);
	};

	const handleNodeSelectionDeletion = () => {
		setShowContextualMenu(false);
		const selectedNodes = document.querySelectorAll(
			".react-flow__node.selected"
		);
		const clipboardData = [];
		for (let node of selectedNodes) {
			clipboardData.push(getNodeByNodeDOM(node, reactFlowInstance.getNodes()));
		}
		deleteBlocks(clipboardData);
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

	const handleShowNodeSelector = (type) => {
		setShowContextualMenu(false);
		setNodeSelectorType(type);
		setShowNodeSelector(true);
	};

	useEffect(() => {
		const fragments = getByProperty(
			"type",
			"fragment",
			reactFlowInstance.getNodes()
		).filter((fragment) => fragment.data.expanded == true);
		const fragmentDOMArray = [];
		fragments.map((fragment) =>
			fragmentDOMArray.push(getNodeDOMById(fragment.id))
		);
		if (fragmentPassthrough) {
			fragmentDOMArray.map((fragmentDOM) =>
				fragmentDOM.classList.add("passthrough")
			);
		} else {
			fragmentDOMArray.map((fragmentDOM) =>
				fragmentDOM.classList.remove("passthrough")
			);
		}
	}, [fragmentPassthrough]);

	useHotkeys("ctrl+c", () => {
		handleNodeCopy();
	});
	useHotkeys("ctrl+b", (e) => {
		//FIXME: POSITION
		e.preventDefault();
		setNodeSelectorType("ElementNode");
		setShowNodeSelector(true);
	});
	useHotkeys("ctrl+alt+b", (e) => {
		//FIXME: POSITION
		e.preventDefault();
		setNodeSelectorType("ActionNode");
		setShowNodeSelector(true);
	});
	useHotkeys("ctrl+v", () => handleNodePaste());
	useHotkeys("ctrl+x", () => handleNodeCut());
	useHotkeys("ctrl+z", () => {
		notImplemented("deshacer/rehacer");
		console.log("UNDO");
	});
	useHotkeys(["ctrl+shift+z", "ctrl+y"], (e) => {
		notImplemented("deshacer/rehacer");
		console.log("REDO");
	});
	useHotkeys("ctrl+r", (e) => {
		e.preventDefault();
		handleNewRelation(relationStarter);
	});
	useHotkeys("ctrl+f", (e) => {
		e.preventDefault();
		handleFragmentCreation();
	});
	useHotkeys("ctrl+e", (e) => {
		e.preventDefault();
		handleShow();
	});
	useHotkeys(
		"alt",
		() => {
			setFragmentPassthrough(true);
		},
		{ keydown: true, keyup: false }
	);
	useHotkeys(
		"alt",
		() => {
			setFragmentPassthrough(false);
		},
		{ keydown: false, keyup: true }
	);

	useEffect(() => {
		if (reactFlowInstance) {
			reactFlowInstance.fitView({ duration: 800 });
		}
	}, [nodesInitialized]);

	return (
		<div
			ref={reactFlowWrapper}
			id="reactFlowWrapper"
			style={{ height: "100%", width: "100%" }}
		>
			<ReactFlow
				ref={ref}
				nodes={nodes}
				edges={edgesWithUpdatedTypes}
				onNodeDragStart={onNodeDragStart}
				onNodeDrag={onNodeDrag}
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
				edgeTypes={edgeTypes}
				snapGrid={[125, 175]}
				//connectionLineComponent={}
				snapToGrid={snapToGrid}
				deleteKeyCode={["Backspace", "Delete"]}
				multiSelectionKeyCode={["Shift"]}
				selectionKeyCode={["Shift"]}
				zoomOnDoubleClick={false}
				nodesDraggable={interactive}
				nodesConnectable={interactive}
				nodesFocusable={interactive}
				edgesFocusable={interactive}
				elementsSelectable={interactive}
				selectionMode={SelectionMode.Partial}
				//onElementsRemove={setElements}
				//onElementClick={onElementClick}
			>
				{minimap && (
					<MiniMap
						nodeColor={(node) => getTypeStaticColor(node, platform)}
						style={minimapStyle}
						zoomable
						pannable
					/>
				)}

				<Background color="#aaa" gap={16} />
			</ReactFlow>
			{showContextualMenu && (
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
					handleShowNodeSelector={handleShowNodeSelector}
					handleFragmentCreation={handleFragmentCreation}
					handleNodeCopy={handleNodeCopy}
					handleNodePaste={handleNodePaste}
					handleNewRelation={handleNewRelation}
					handleNodeCut={handleNodeCut}
					handleNodeDeletion={handleNodeDeletion}
					handleNodeSelectionDeletion={handleNodeSelectionDeletion}
					handleShow={handleShow}
				/>
			)}
			<CustomControls />
			{showConditionsModal && (
				<>
					{!validTypes.includes(cMBlockData.type) ? (
						<ConditionModal
							blockData={cMBlockData}
							setBlockData={setCMBlockData}
							blocksData={reactFlowInstance.getNodes()}
							onEdgesDelete={onEdgesDelete}
							showConditionsModal={showConditionsModal}
							setShowConditionsModal={setShowConditionsModal}
						/>
					) : (
						<CriteriaModal
							blockData={cMBlockData}
							setBlockData={setCMBlockData}
							blocksData={reactFlowInstance.getNodes()}
							showConditionsModal={showConditionsModal}
							setShowConditionsModal={setShowConditionsModal}
						/>
					)}
					{/* Rest of your code */}
				</>
			)}
			{showNodeSelector && (
				<NodeSelector
					showDialog={showNodeSelector}
					toggleDialog={() => setShowNodeSelector(false)}
					type={nodeSelectorType}
					callback={createBlock}
				/>
			)}
		</div>
	);
};
const OverviewFlowWithRef = forwardRef(OverviewFlow);
OverviewFlowWithRef.displayName = "OverviewFlow";
export default OverviewFlowWithRef;
