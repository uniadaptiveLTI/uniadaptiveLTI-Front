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
import {
	uniqueId,
	getUpdatedArrayById,
	addEventListeners,
	getByProperty,
	deduplicateById,
	updateBadgeConditions,
} from "@utils/Utils";
import {
	getNodeByNodeDOM,
	thereIsReservedNodesInArray,
	getNodeDOMById,
	getNodeById,
	getChildrenNodesFromFragmentID,
	getParentsNode,
} from "@utils/Nodes";
import { errorListCheck } from "@utils/ErrorHandling";
import { toast } from "react-toastify";
import { useHotkeys } from "react-hotkeys-hook";
import ContextualMenu from "@flow/ContextualMenu.js";
import ConditionModal from "@conditions/ConditionModal.js";
import QualificationModal from "@conditions/QualificationModal.js";
import { getTypeStaticColor } from "@utils/NodeIcons.js";
import NodeSelector from "@dialogs/NodeSelector.js";
import CriteriaModal from "@flow/badges/CriteriaModal.js";
import AnimatedEdge from "@edges/AnimatedEdge.js";
import ConditionalEdge from "@edges/ConditionalEdge";
import { NodeTypes } from "@utils/TypeDefinitions.js";
import { isSupportedTypeInPlatform } from "@utils/Platform.js";
import CustomControls from "./flow/CustomControls.js";
const minimapStyle = {
	height: 120,
};

const nodeTypes = {
	addgroup: ActionNode,
	assign: ElementNode,
	folder: ElementNode,
	forum: ElementNode,
	mail: ActionNode,
	quiz: ElementNode,
	remgroup: ActionNode,
	resource: ElementNode,
	url: ElementNode,
	wiki: ElementNode,
	// Moodle
	badge: ActionNode,
	book: ElementNode,
	// chat: ElementNode,
	choice: ElementNode,
	// data: ElementNode,
	// feedback: ElementNode,
	generic: ElementNode,
	glossary: ElementNode,
	// h5pactivity: ElementNode,
	// imscp: ElementNode,
	label: ElementNode,
	lesson: ElementNode,
	// lti: ElementNode,
	page: ElementNode,
	// scorm: ElementNode,
	// survey: ElementNode,
	workshop: ElementNode,
	// Sakai
	exam: ElementNode,
	html: ElementNode,
	reflist: ElementNode,
	text: ElementNode,
	//LTI
	end: FinalNode,
	fragment: FragmentNode,
	start: InitialNode,
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
	const parsedSettings = JSON.parse(settings);
	const { metaData } = useContext(MetaDataContext);
	const [clipboard, setClipboard] = useState(localStorage.getItem("clipboard"));
	const { autoHideAside, snapping, snappingInFragment, reducedAnimations } =
		parsedSettings;

	const fitViewOptions = {
		duration: reducedAnimations ? 0 : 800,
		padding: 0.25,
	};

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
	const [ableToFitView, setAbleToFitView] = useState(true);

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
	const [showGradeConditionsModal, setShowGradeConditionsModal] =
		useState(false);

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

	/**
	 * Logs the ReactFlow instance when it is loaded.
	 * @param {ReactFlowInstance} reactFlowInstance - The ReactFlow instance.
	 */
	const onInit = (reactFlowInstance) => {
		console.log("Blockflow loaded:", reactFlowInstance);
	};

	/**
	 * Handles the start of a node drag event.
	 * @param {Event} event - The drag event.
	 * @param {Node} node - The node being dragged.
	 */
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

	/**
	 * Handles a node drag event.
	 * @param {Event} event - The drag event.
	 * @param {Node} node - The node being dragged.
	 */
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

	/**
	 * Handles the start of a selection drag event.
	 * @param {Event} event - The drag event.
	 * @param {Node[]} nodes - The nodes being dragged.
	 */
	const onSelectionDragStart = (event, nodes) => {
		setShowContextualMenu(false);
	};

	/**
	 * Handles the end of a selection drag event.
	 * @param {Event} event - The drag event.
	 * @param {Node[]} nodes - The nodes being dragged.
	 */
	const onSelectionDragStop = (event, nodes) => {};

	/**
	 * Handles the end of a node drag event.
	 * @param {Event} event - The drag event.
	 * @param {Node} node - The node being dragged.
	 */
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

	/**
	 * Handles a pane click event.
	 */
	const onPaneClick = () => {
		if (autoHideAside) {
			setExpandedAside(false);
		}
		setSnapToGrid(true);
	};

	/**
	 * Handles a node click event.
	 * @param {Event} e - The click event.
	 * @param {Node} node - The clicked node.
	 */
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

	/**
	 * Handles a connect event.
	 * @param {Event} event - The connect event.
	 */
	const onConnect = (event) => {
		const sourceNodeId = event.source.split("__")[0];
		const targetNodeId = event.target.split("__")[0];

		if (sourceNodeId != targetNodeId) {
			const edgeFound = reactFlowInstance
				.getEdges()
				.find((node) => node.id === sourceNodeId + "-" + targetNodeId);

			if (!edgeFound) {
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

				if (
					targetNode &&
					sourceNode.type != "start" &&
					sourceNode.type != "end"
				) {
					if (!validTypes.includes(targetNode.type)) {
						const newCondition = {
							id: parseInt(Date.now() * Math.random()).toString(),
							type: "completion",
							cm: sourceNode.id,
							showc: true,
							e: 1,
						};

						if (!targetNode.data.c) {
							targetNode.data.c = {
								type: "conditionsGroup",
								id: parseInt(Date.now() * Math.random()).toString(),
								op: "&",
								showc: true,
								c: [newCondition],
							};
						} else {
							targetNode.data.c.c.push(newCondition);
						}
					} else {
						if (!targetNode.data.c) {
							targetNode.data.c = {
								type: "conditionsGroup",
								id: parseInt(Date.now() * Math.random()).toString(),
								op: "&",
								showc: true,
							};
						}

						console.log(targetNode.data);

						const conditions = targetNode.data.c?.c;

						if (conditions) {
							const conditionExists = conditions.find(
								(condition) => condition.type === "completion"
							);

							if (conditionExists) {
								const newConditionAppend = {
									id: sourceNode.id,
								};
								conditionExists.activityList.push(newConditionAppend);
							} else {
								const newCondition = {
									id: parseInt(Date.now() * Math.random()).toString(),
									type: "completion",
									activityList: [
										{
											id: sourceNode.id,
										},
									],
									op: "&",
									query: "completed",
								};

								targetNode.data.c.c.push(newCondition);
							}
						} else {
							const newCondition = {
								id: parseInt(Date.now() * Math.random()).toString(),
								type: "completion",
								activityList: [
									{
										id: sourceNode.id,
									},
								],
								op: "&",
								query: "completed",
							};

							targetNode.data.c.c = [newCondition];
						}
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
		}
	};

	useEffect(() => {
		setNodes(newInitialNodes);
		setEdges(newInitialEdges);
	}, [newInitialNodes, newInitialEdges]);

	/**
	 * Handles the deletion of nodes.
	 * @param {Node[]} nodes - The nodes being deleted.
	 */
	const onNodesDelete = (nodes) => {
		console.log(nodes);
		setNodeSelected();
		deleteBlocks(nodes);
	};

	/**
	 * Deletes a condition by its ID.
	 * @param {Condition[]} conditions - The conditions to search through.
	 * @param {string} op - The ID of the condition to delete.
	 * @returns {boolean} Whether or not the condition was deleted.
	 */
	function deleteConditionById(conditions, op) {
		if (conditions) {
			for (let i = 0; i < conditions.length; i++) {
				const condition = conditions[i];
				if (condition.cm === op) {
					conditions.splice(i, 1);
					if (conditions.length === 0) {
						conditions = undefined;
					}
					return true;
				} else if (condition.c) {
					if (deleteConditionById(condition.c, op)) {
						if (condition.c.length === 0) {
							condition.c = undefined;
						}
						return true;
					}
				}
			}
			return false;
		} else {
			return false;
		}
	}

	/**
	 * Handles the deletion of edges.
	 * @param {Edge[]} edges - The edges being deleted.
	 */
	const onEdgesDelete = (edges) => {
		for (let i = 0; i < edges.length; i++) {
			var blockNodeSource = reactFlowInstance
				?.getNodes()
				.find((obj) => obj.id === edges[i].source);

			var blockNodeTarget = reactFlowInstance
				?.getNodes()
				.find((obj) => obj.id === edges[i].target);

			const updatedBlockNodeSource = { ...blockNodeSource };
			updatedBlockNodeSource.data.children =
				updatedBlockNodeSource.data.children.filter(
					(childId) => !childId.includes(blockNodeTarget.id)
				);

			blockNodeSource = updatedBlockNodeSource;

			if (blockNodeTarget.data.c) {
				if (!validTypes.includes(blockNodeTarget.type)) {
					deleteConditionById(blockNodeTarget.data.c.c, blockNodeSource.id);
				} else {
					updateBadgeConditions(blockNodeTarget, blockNodeSource);
				}
			}

			setDeletedEdge(edges[i]);
		}
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

					if (blockNodeDelete.c) {
						blockNodeDelete.c = blockNodeDelete.c.filter(
							(condition) => condition.unlockId !== deletedEdge.target
						);
						if (blockNodeDelete.c.length === 0) blockNodeDelete.c = undefined;
					}
					updatedBlocksArray = updatedBlocksArray.map((obj) =>
						obj.id === blockNodeDelete.id ? blockNodeDelete : obj
					);
				}
			}
			reactFlowInstance.setNodes(updatedBlocksArray);
		}
	}, [deletedEdge]);

	/**
	 * Handles the loading of the map.
	 */
	const onLoad = () => {
		if (map != prevMap) {
			reactFlowInstance.fitView(fitViewOptions);
			setPrevMap(map);
		}
	};

	useEffect(() => {
		//Makes fragment children invsible if it isn't expanded, on load
		if (nodesInitialized) {
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
			if (reactFlowInstance && ableToFitView) {
				reactFlowInstance.fitView(fitViewOptions);
				setAbleToFitView(false);
			}
		}
	}, [nodesInitialized]);

	useEffect(() => {
		setAbleToFitView(true);
	}, [map]);

	useEffect(() => {
		const filteredMap = map.map((node) => {
			return isSupportedTypeInPlatform(platform, node.type)
				? node
				: { ...node, type: "generic" };
		});
		setNewInitialNodes(filteredMap);

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
					edge.type = "conditionalEdge";
					if (edge.target) {
						const targetNode = getNodeById(
							edge.target,
							reactFlowInstance.getNodes()
						);
						const actionNodes = NodeTypes.map((declaration) => {
							if (declaration.nodeType == "ActionNode") return declaration.type;
						});
						if (targetNode)
							if (actionNodes.includes(targetNode.type)) {
								if (targetNode.data.c) {
									if (Array.isArray(targetNode.data.c.c)) {
										targetNode.data.c.c.forEach((condition) => {
											if (condition.type == "completed") {
												if (condition.op == "|") {
													edge.animated = true;
												}
											}
										});
									}
								}
							}
					}
				}
				return edge;
		  })
		: edges;

	/**
	 * Handles a node context menu event.
	 * @param {Event} e - The context menu event.
	 * @param {Node} node - The node for which the context menu is being opened.
	 */
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

	/**
	 * Handles a pane context menu event.
	 * @param {Event} e - The context menu event.
	 */
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

	/**
	 * Handles a selection context menu event.
	 * @param {Event} e - The context menu event.
	 */
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

	/**
	 * Deletes blocks and updates their parents and children.
	 * @param {Node[]} blocks - The blocks to delete.
	 */
	const deleteBlocks = (blocks) => {
		// Array of blocks that its children or conditions are being updated
		var updatedBlocks = [];

		//For each fragment in the selection, adds its children.
		blocks.forEach((block) => {
			if (block.type == "fragment") {
				const innerNodes = block.data.innerNodes;
				innerNodes.forEach((node) => {
					const rfNode = reactFlowInstance
						.getNodes()
						.find((onode) => onode.id == node.id);
					if (rfNode) {
						blocks.push(rfNode);
					}
				});
			}
		});

		// Iteration of the blocks to delete
		for (let i = 0; i < blocks.length; i++) {
			// Get method to retreive the parents nodes from a block
			const parentsNode = getParentsNode(
				reactFlowInstance.getNodes(),
				blocks[i].id
			);

			// Iteration of the parents nodes
			for (let j = 0; j < parentsNode.length; j++) {
				// Condition to check if one of the parents it isn't being deleted
				if (!blocks.some((block) => block.id === parentsNode[j].id)) {
					// Find method to check if the parent is already edited
					const foundParentNode = updatedBlocks.find(
						(block) => block.id === parentsNode[j].id
					);

					// Condition to check if the parent is already edited
					if (foundParentNode) {
						// Constant that updates the existing parent
						const updatedNode = {
							...foundParentNode,
							data: {
								...foundParentNode.data,
								children: foundParentNode.data.children.filter(
									(childId) => !childId.includes(blocks[i].id)
								),
							},
						};

						// Map method to update the array of the blocks updated
						const updatedBlocksArray = updatedBlocks.map((block) =>
							block.id === parentsNode[j].id ? updatedNode : block
						);

						updatedBlocks = updatedBlocksArray;
					} else {
						// Filter method to update the children
						parentsNode[j].data.children = parentsNode[j].data.children.filter(
							(childId) => !childId.includes(blocks[i].id)
						);

						// Push method to store the updated node
						updatedBlocks.push(parentsNode[j]);
					}
				}
			}

			var nodeArray = reactFlowInstance.getNodes();

			// Filter method to retrieve only the nodes that are the children of a block
			if (blocks[i].data.children) {
				const childrenNodes = nodeArray.filter((node) =>
					blocks[i].data.children.includes(node.id.toString())
				);

				// Iteration of the children nodes
				for (var k = 0; k < childrenNodes.length; k++) {
					// Find method to check if the children is already edited
					const foundChildrenNode = updatedBlocks.find(
						(block) => block.id === childrenNodes[k].id
					);

					// Condition to check if the children is already edited
					if (foundChildrenNode) {
						if (!validTypes.includes(foundChildrenNode.type)) {
							// Delete method that updates the conditions of the children node edited
							deleteConditionById(foundChildrenNode.data?.c?.c, blocks[i].id);
						} else {
							updateBadgeConditions(foundChildrenNode, blocks[i]);
						}
					} else {
						if (!validTypes.includes(childrenNodes[k].type)) {
							// Delete method that updates the conditions of the children node
							deleteConditionById(childrenNodes[k].data?.c?.c, blocks[i].id);
						} else {
							updateBadgeConditions(childrenNodes[k], blocks[i]);
						}

						// Push method to store the updated node
						updatedBlocks.push(childrenNodes[k]);
					}
				}
			}
		}

		// Update method to update the full array of nodes with the updated nodes
		let updatedNodeArray = getUpdatedArrayById(
			updatedBlocks,
			reactFlowInstance.getNodes()
		);

		// Iteration to delete the nodes from the full array of nodes
		for (let i = 0; i < blocks.length; i++) {
			updatedNodeArray = updatedNodeArray.filter(
				(node) => node.id !== blocks[i].id
			);
		}

		// Set method to update the full array of nodes
		reactFlowInstance.setNodes(updatedNodeArray);

		// Check method for errors
		errorListCheck(blocks, errorList, setErrorList, true);
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
			console.log(b);
			if (b.data?.c?.length) {
				const updatedConditions = b.data.c.filter(
					(condition) => condition.unlockId !== unlockId
				);
				return {
					...b,
					data: {
						c: updatedConditions.length ? updatedConditions : undefined,
					},
				};
			} else if (b.data?.children?.length) {
				return {
					...b,
					data: {
						...b.data,
						children: filterRelatedConditionsById(unlockId, b.data.children),
					},
				};
			} else {
				return b;
			}
		});
	};

	/**
	 * Adds the children of a fragment to an array.
	 * @param {Node} fragment - The fragment whose children should be added.
	 * @param {Node[]} arr - The array to which the children should be added.
	 * @returns {Node[]} The updated array with the children added.
	 */
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

	/**
	 * Handles the copying of nodes.
	 * @param {Node[]} [blockData=[]] - The nodes to copy.
	 */
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

	/**
	 * Handles the pasting of nodes.
	 */
	const handleNodePaste = () => {
		const clipboardData = JSON.parse(localStorage.getItem("clipboard"));
		console.log(clipboardData);
		if (clipboardData && clipboardData.data && clipboardData.data.length > 0) {
			const copiedBlocks = clipboardData.data;
			const newBlocksToPaste = [...copiedBlocks];

			const originalIDs = newBlocksToPaste.map((block) => block.id);
			const newIDs = newBlocksToPaste.map(() => uniqueId());
			const originalX = newBlocksToPaste.map((block) => block.position.x);
			const originalY = newBlocksToPaste.map((block) => block.position.y);
			const firstOneInX = Math.min(...originalX);
			const firstOneInY = Math.min(...originalY);
			const newX = originalX.map((x) => -firstOneInX + x);
			const newY = originalY.map((y) => -firstOneInY + y);
			//FIXME: FRAGMENT PASTING REMOVES CONDITIONS BETWEEN CHILDREN
			console.log(originalIDs);
			console.log(newIDs);
			const shouldEmptyResource = !(
				metaData.instance_id == clipboardData.instance_id &&
				metaData.course_id == clipboardData.course_id &&
				metaData.platform == clipboardData.platform
			);
			const newBlocks = newBlocksToPaste.map((block, index) => {
				let newID;
				let originalID;

				console.log(block);

				let filteredChildren = block.children
					?.map((child) => {
						newID = newIDs[originalIDs.indexOf(child)];
						originalID = child;
						return newID;
					})
					.filter((child) => child !== undefined);

				//(Fragment) Adds the new parent to the children
				if (block.parentNode) {
					const parentIndex = originalIDs.findIndex(
						(id) => id == block.parentNode
					);
					block.parentNode = newIDs[parentIndex];
				}
				return {
					...block,
					id: newIDs[index],
					position: { x: newX[index], y: newY[index] },
					data: {
						...block.data,
						children:
							filteredChildren?.length === 0 ? undefined : filteredChildren,
						c: undefined,
						lmsResource: shouldEmptyResource
							? undefined
							: block.data.lmsResource,
					},
				};
			});
			if (copiedBlocks.length <= 1) {
				createBlock(newBlocks[0], newBlocks[0].x, newBlocks[0].y);
			} else {
				const addToInnerNodes = (blocks) => {
					const innerNodes = blocks.filter((block) => block.parentNode);

					innerNodes.map((innerNode) => {
						const currentIDIndex = newIDs.findIndex((id) => id == innerNode.id);
						const oldID = originalIDs[currentIDIndex];
						const currentParent = blocks.find(
							(block) => block.id == innerNode.parentNode
						);
						const storedIdIndex = currentParent.data.innerNodes.findIndex(
							(innerNode) => innerNode.id == oldID
						);
						currentParent.data.innerNodes[storedIdIndex].id = innerNode.id;
					});

					const outerNodes = blocks.filter((block) => !block.parentNode);

					return [...outerNodes, ...innerNodes];
				};
				createBlockBulk(addToInnerNodes(newBlocks));
			}
		}
	};

	/**
	 * Handles the cutting of nodes.
	 * @param {Node[]} [blockData=[]] - The nodes to cut.
	 */
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

	/**
	 * Creates a new block.
	 * @param {Node} [blockData] - The data for the new block.
	 * @returns {Node[]} The updated array of nodes with the new block added.
	 */
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

	/**
	 * Creates multiple new blocks.
	 * @param {Node[]} clipboardData - The data for the new blocks.
	 */
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

	/**
	 * Handles the creation of a new fragment.
	 */
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

	/**
	 * Handles the deletion of a single node.
	 * @param {Node} blockData - The node to delete.
	 */
	const handleNodeDeletion = (blockData) => {
		setShowContextualMenu(false);
		setNodeSelected();
		deleteBlocks([blockData]);
	};

	/**
	 * Handles the deletion of multiple selected nodes.
	 */
	const handleNodeSelectionDeletion = () => {
		setShowContextualMenu(false);
		const selectedNodes = document.querySelectorAll(
			".react-flow__node.selected"
		);
		const clipboardData = [];
		for (let node of selectedNodes) {
			clipboardData.push(getNodeByNodeDOM(node, reactFlowInstance.getNodes()));
		}

		console.log(clipboardData);
		deleteBlocks(clipboardData);
	};

	/**
	 * Handles the creation of a new relation between two nodes.
	 * @param {Node} origin - The origin node of the relation.
	 * @param {Node} end - The end node of the relation.
	 */
	const handleNewRelation = (origin, end) => {
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

			const newNodesData = reactFlowInstance.getNodes();
			const oI = newNodesData.findIndex((node) => node.id == origin.id);
			if (newNodesData[oI].data.children) {
				const alreadyAChildren = newNodesData[oI].data.children.includes(
					end.id
				);
				if (!alreadyAChildren) {
					if (newNodesData[oI].data.children) {
						newNodesData[oI].data.children.push(end.id);
					} else {
						newNodesData[oI].data.children.push(end.id);
					}
				} else {
					toast("La relación ya existe, no se ha creado.", {
						hideProgressBar: false,
						autoClose: 2000,
						type: "warning",
						position: "bottom-center",
						theme: "light",
					});
				}
			} else {
				newNodesData[oI].data.children.push(end.id);
			}
			setRelationStarter();
			reactFlowInstance.setNodes(newNodesData);
			if (origin.type != "start" && origin.type != "end") {
				if (!validTypes.includes(end.type)) {
					const newCondition = {
						id: parseInt(Date.now() * Math.random()).toString(),
						type: "completion",
						cm: origin.id,
						query: "completed",
					};

					if (!end.data.c) {
						end.data.c = {
							type: "conditionsGroup",
							id: parseInt(Date.now() * Math.random()).toString(),
							op: "&",
							c: [newCondition],
						};
					} else {
						end.data.c.c.push(newCondition);
					}
				} else {
					const conditions = end.data.c?.c;

					let conditionExists = false;

					if (conditions != undefined) {
						conditionExists = conditions.find(
							(condition) => condition.type === "completion"
						);
					}

					if (conditionExists) {
						const newConditionAppend = {
							id: origin.id,
							name: origin.data.label,
						};
						conditionExists.activityList.push(newConditionAppend);
					} else {
						const newCondition = {
							id: parseInt(Date.now() * Math.random()).toString(),
							type: "completion",
							activityList: [
								{
									id: origin.id,
									name: origin.data.label,
								},
							],
							op: "&",
							query: "completed",
						};

						if (!end.data.c) {
							end.data.c = {
								type: "conditionsGroup",
								id: parseInt(Date.now() * Math.random()).toString(),
								op: "&",
								c: [newCondition],
							};
						} else {
							end.data.c.c.push(newCondition);
						}
					}
				}
			}
			setEdges([
				...edges,
				{
					id: origin.id + "-" + end.id,
					source: origin.id,
					target: end.id,
				},
			]);
		} else {
			const selectedBlocks = reactFlowInstance
				.getNodes()
				.filter((block) => block.selected == true);
			if (selectedBlocks.length == 1) {
				if (relationStarter == undefined) {
					setRelationStarter(selectedBlocks[0]);

					toast("Iniciando relación...", {
						hideProgressBar: false,
						autoClose: 2000,
						type: "info",
						position: "bottom-center",
						theme: "light",
					});
				} else {
					toast("Finalizando relación...", {
						hideProgressBar: false,
						autoClose: 2000,
						type: "info",
						position: "bottom-center",
						theme: "light",
					});
					handleNewRelation(relationStarter, selectedBlocks[0]);
				}
			} else {
				toast("Selección inválida", {
					hideProgressBar: false,
					autoClose: 2000,
					type: "error",
					position: "bottom-center",
					theme: "light",
				});
			}
		}
	};

	/**
	 * Handles the showing of a modal.
	 * @param {string} modal - The modal to show.
	 */
	const handleShow = (modal) => {
		const selectedNodes = reactFlowInstance
			.getNodes()
			.filter((node) => node.selected == true);

		let newCMBlockData = undefined;
		if (selectedNodes.length == 1 && cMBlockData == undefined) {
			newCMBlockData = selectedNodes[0];
		}

		if (newCMBlockData || cMBlockData) {
			if (selectedNodes.length == 1 && cMBlockData == undefined) {
				setCMBlockData(newCMBlockData);
			}

			if (modal == "conditions") setShowConditionsModal(true);
			if (modal == "grades") setShowGradeConditionsModal(true);

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

	/**
	 * Handles the showing of the node selector.
	 * @param {string} type - The type of node selector to show.
	 */
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
		handleShow("conditions");
	});
	useHotkeys("ctrl+alt+e", (e) => {
		e.preventDefault();
		handleShow("grades");
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
				snapGrid={[125, 275]}
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
					setShowGradeConditionsModal={setShowGradeConditionsModal}
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
							onEdgesDelete={onEdgesDelete}
							showConditionsModal={showConditionsModal}
							setShowConditionsModal={setShowConditionsModal}
						/>
					)}
				</>
			)}
			{showGradeConditionsModal && (
				<>
					{!validTypes.includes(cMBlockData.type) && (
						<QualificationModal
							blockData={cMBlockData}
							setBlockData={setCMBlockData}
							blocksData={reactFlowInstance.getNodes()}
							onEdgesDelete={onEdgesDelete}
							showConditionsModal={showGradeConditionsModal}
							setShowConditionsModal={setShowGradeConditionsModal}
						/>
					)}
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
			<CustomControls
				reactFlowInstance={reactFlowInstance}
				minimap={minimap}
				setMinimap={setMinimap}
				interactive={interactive}
				setInteractive={setInteractive}
				fitViewOptions={fitViewOptions}
			></CustomControls>
		</div>
	);
};
const OverviewFlowWithRef = forwardRef(OverviewFlow);
OverviewFlowWithRef.displayName = "OverviewFlow";
export default OverviewFlowWithRef;
