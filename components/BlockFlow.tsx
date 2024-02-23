import React, {
	forwardRef,
	useCallback,
	useContext,
	useEffect,
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
	OnConnect,
	Edge,
	addEdge,
	OnNodesChange,
} from "reactflow";
import "reactflow/dist/style.css";
import {
	uniqueId,
	getUpdatedArrayById,
	addEventListeners,
	getByProperty,
	deduplicateById,
	updateBadgeConditions,
	capitalizeFirstLetter,
	clampNodesOrder,
	handleNameCollision,
} from "@utils/Utils";
import {
	getNodeDOMById,
	getNodeById,
	getChildrenNodesFromFragmentID,
	getParentsNode,
	getNodeTypeGradableType,
} from "@utils/Nodes";
import {
	EditedNodeContext,
	ErrorListContext,
	ExpandedAsideContext,
	SettingsContext,
	MetaDataContext,
	notImplemented,
	DEFAULT_TOAST_ERROR,
	LONG_TOAST_ERROR,
	DEFAULT_TOAST_INFO,
	EXTENDED_TOAST_ERROR,
	DEFAULT_TOAST_SUCCESS,
} from "pages/_app";
import { errorListCheck } from "@utils/ErrorHandling";
import { toast } from "react-toastify";
import { getAutomaticReusableStyles } from "@utils/Colors";
import { useHotkeys } from "react-hotkeys-hook";
import ContextualMenu from "@components/flow/contextualmenu/ContextualMenu";
import ConditionModalMoodle from "@components/flow/conditions/moodle/ConditionModalMoodle";
import RequisiteModalSakai from "@components/flow/conditions/sakai/RequisiteModalSakai";
import QualificationModal from "@components/flow/conditions/moodle/QualificationModal";
import { useKeyPress } from "reactflow";
import { getTypeStaticColor } from "@utils/NodeIcons";
import NodeSelector from "@components/dialogs/NodeSelector";
import CriteriaModal from "@components/flow/badges/CriteriaModal";
import {
	NodeDeclarations,
	RF_EDGE_TYPES,
	RF_NODE_TYPES,
	getElementNodeTypes,
} from "@utils/TypeDefinitions";
import { Platforms, isSupportedTypeInPlatform } from "@utils/Platform";
import CustomControls from "./flow/CustomControls";
import SimpleActionDialog from "./dialogs/SimpleActionDialog";
import {
	IActionNode,
	IElementNode,
	IFragmentNode,
	INode,
} from "./interfaces/INode";
import { IMoodleCompletionCondition } from "./interfaces/INodeConditionsMoodle";

const MINIMAP_STYLE = {
	height: 120,
};

const DELETE_KEY_CODES = ["Backspace", "Delete"];

const OverviewFlow = ({ map }, ref) => {
	const { errorList, setErrorList } = useContext(ErrorListContext);
	const { expandedAside, setExpandedAside } = useContext(ExpandedAsideContext);
	const { setNodeSelected } = useContext(EditedNodeContext);
	const { settings } = useContext(SettingsContext);
	const parsedSettings = JSON.parse(settings);
	const { metaData } = useContext(MetaDataContext);
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
	const [fragmentPassthrough, setFragmentPassthrough] = useState(false);
	const dragRef = useRef(null);
	const [target, setTarget] = useState(null);
	const [prevMap, setPrevMap] = useState();
	const nodesInitialized = useNodesInitialized();
	const [ableToFitView, setAbleToFitView] = useState(true);
	const [conditionEdgeView, setConditionEdgeView] = useState();

	//ContextMenu Ref, States, Constants
	const contextMenuDOM = useRef(null);
	const confirmDeletionModalCallbackRef = useRef(null);
	const [showContextualMenu, setShowContextualMenu] = useState<boolean>();
	const [cMX, setCMX] = useState(0);
	const [cMY, setCMY] = useState(0);
	const [contextMenuOrigin, setContextMenuOrigin] = useState("");
	const [cMContainsReservedNodes, setCMContainsReservedNodes] = useState(false);
	const [cMBlockData, setCMBlockData] = useState<INode | Array<INode>>();
	const [relationStarter, setRelationStarter] = useState<INode>();
	const [currentMousePosition, setCurrentMousePosition] = useState({
		x: 0,
		y: 0,
	});

	const [showConfirmDeletionModal, setShowConfirmDeletionModal] =
		useState(false);

	const [showConditionsModal, setShowConditionsModal] = useState(false);
	const [showGradeConditionsModal, setShowGradeConditionsModal] =
		useState(false);

	const [showRequisitesModal, setShowRequisitesModal] = useState(false);

	const deletePressed = useKeyPress(DELETE_KEY_CODES);
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

	function findConditionById(id, conditions) {
		if (!conditions) {
			return null;
		}

		const FOUND_CONDITION = conditions.find((condition) => condition.cm === id);

		if (FOUND_CONDITION) {
			return FOUND_CONDITION;
		} else {
			const FOUND_ACTION_CONDITION = conditions.find(
				(condition) => condition.type === "completion"
			);

			if (FOUND_ACTION_CONDITION) return FOUND_ACTION_CONDITION;
		}

		for (const CONDITION of conditions) {
			if (CONDITION.c) {
				const INNER_CONDITION = findConditionById(id, CONDITION.c);
				if (INNER_CONDITION) {
					return INNER_CONDITION;
				}
			}
		}

		return null;
	}

	function findConditionByParentId(subConditions, blockNodeId) {
		for (const SUBCONDITION of subConditions) {
			const FOUND_CONDITION = SUBCONDITION.subConditions?.find((condition) => {
				return condition.itemId === blockNodeId;
			});
			if (FOUND_CONDITION) {
				return FOUND_CONDITION;
			}
		}

		return null;
	}

	//NodeSelector
	const [showNodeSelector, setShowNodeSelector] = useState<boolean>(false);
	const [nodeSelectorType, setNodeSelectorType] = useState("");

	const [nodes, setNodes, onNodesChange] = useNodesState(newInitialNodes) as [
		Array<INode>,
		Function,
		OnNodesChange
	];
	const [edges, setEdges, onEdgesChange] = useEdgesState(newInitialEdges);

	const reactFlowWrapper = useRef(null);

	/**
	 * Logs the ReactFlow instance when it is loaded.
	 * @param {ReactFlowInstance} reactFlowInstance - The ReactFlow instance.
	 */
	const onInit = (reactFlowInstance) => {
		console.info(`🗺️ Blockflow loaded: `, reactFlowInstance);
	};

	const getSelectedEdges = (edgeArray = reactFlowInstance.getEdges()) => {
		return edgeArray.filter((edge) => edge.selected == true);
	};

	const getSelectedNodes = (
		nodeArray = reactFlowInstance.getNodes() as Array<INode>
	) => {
		return nodeArray.filter((node) => node.selected == true);
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
		const NODE_CENTER_X = node.position.x + node.width / 2;
		const NODE_CENTER_Y = node.position.y + node.height / 2;

		const targetNode = nodes.find(
			(n) =>
				NODE_CENTER_X > n.position.x &&
				NODE_CENTER_X < n.position.x + n.width &&
				NODE_CENTER_Y > n.position.y &&
				NODE_CENTER_Y < n.position.y + n.height &&
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
			getUpdatedArrayById(node, reactFlowInstance.getNodes()) as Array<INode>
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

		if (target?.type == "fragment" && node.type != "fragment") {
			console.log(node);
			if (target.data.expanded && node.parentNode == undefined) {
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
					]) as Array<INode>
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
		setSnapToGrid(true);
	};

	/**
	 * Handles a connect event.
	 * @param {Event} event - The connect event.
	 */
	const onConnect: OnConnect = (event) => {
		const sourceNodeId = event.source;
		const targetNodeId = event.target;

		let allowLineCreation = true;

		console.log("onConnect");

		if (sourceNodeId != targetNodeId) {
			console.log(sourceNodeId + "-" + targetNodeId);

			console.log("found:", reactFlowInstance.getEdges());
			console.log(
				"sourceFound",
				reactFlowInstance.getNodes().find((nodes) => nodes.id == sourceNodeId)
			);
			console.log(
				"targetFound",
				reactFlowInstance.getNodes().find((nodes) => nodes.id == targetNodeId)
			);

			const edgeFound = reactFlowInstance
				.getEdges()
				.find((node) => node.id === sourceNodeId + "-" + targetNodeId);

			if (edgeFound) allowLineCreation = false;

			const sourceNode = reactFlowInstance
				.getNodes()
				.find((nodes) => nodes.id == sourceNodeId) as INode;

			const targetNode = reactFlowInstance
				.getNodes()
				.find((nodes) => nodes.id == targetNodeId) as INode;

			if (sourceNode) {
				if ("children" in sourceNode.data) {
					sourceNode.data.children.push(targetNodeId);
				}
			}

			if (targetNode) {
				if (allowLineCreation) {
					switch (metaData.platform) {
						case Platforms.Moodle:
							const blockData = getNodeById(
								sourceNodeId,
								reactFlowInstance.getNodes() as Array<INode>
							);

							const currentGradableType = getNodeTypeGradableType(
								blockData,
								metaData.platform
							);

							if (
								currentGradableType &&
								blockData.data.g &&
								((blockData.data.g.hasConditions &&
									currentGradableType != "simple") ||
									(blockData.data.g.hasToBeSeen &&
										currentGradableType == "simple"))
							) {
								if (
									getElementNodeTypes().some(
										(node) => node.type === targetNode.type
									)
								) {
									// Just Element Nodes
									if (Platforms.Moodle) {
										const newCondition: IMoodleCompletionCondition = {
											id: uniqueId(),
											type: "completion",
											cm: sourceNode.id,
											showc: true,
											e: 1,
										};

										if (
											!("c" in targetNode.data)
										) {
											targetNode.data.c = {
												type: "conditionsGroup",
												id: uniqueId(),
												op: "&",
												showc: true,
												c: [newCondition],
											};
										} else {
											if ("c" in targetNode.data.c) {
												targetNode.data.c.c.push(newCondition);
											} else if ("params" in targetNode.data.c) {
												targetNode.data.c.params.push(newCondition);
											}
										}
									}
								} else {
									// Just Action Nodes
									if (
										!("c" in targetNode.data) ||
										(Array.isArray(targetNode.data.c) && targetNode.data.c.length <= 0)
									) {
										//If C is an empty array, add the conditions group
										targetNode.data.c = {
											type: "conditionsGroup",
											id: uniqueId(),
											method: "&",
											showc: true,
											criteriatype: 0,
											params: [],
										};
									}

									if ("c" in targetNode.data) {
										const existingConditions =
											(targetNode as IActionNode).data.c?.params || [];

										const newConditions: IActionNode["data"]["c"]["params"] =
											existingConditions;

										if (newConditions) {
											const conditionExists = newConditions.find(
												(condition) => condition.type === "completion"
											);

											if (conditionExists) {
												const newConditionAppend = {
													id: sourceNode.id,
												};

												conditionExists.params.push(newConditionAppend);
											} else {
												const newCondition = {
													id: uniqueId(),
													type: "completion",
													params: [
														{
															id: sourceNode.id,
														},
													],
													method: "&",
													criteriatype: 1,
												};

												(targetNode as IActionNode).data.c.params.push(
													newCondition
												);
											}
										}
									}
								}
							} else {
								allowLineCreation = false;
								toast(
									"El recurso no puede ser finalizado. Compruebe los ajustes de finalización.",
									LONG_TOAST_ERROR
								);
							}

							if (
								targetNode.type === "badge" &&
								"g" in sourceNode.data &&
								"hasToBeQualified" in sourceNode.data.g
							) {
								if (sourceNode.data.g && !sourceNode.data.g.hasToBeQualified) {
									sourceNode.data.g.hasToBeQualified = true;
								}
							}

							break;
						case Platforms.Sakai:
							if (
								"section" in targetNode.data &&
								!targetNode.data.gradeRequisites
							) {
								targetNode.data.gradeRequisites = {
									type: "ROOT",
									siteId: metaData.course_id,
									itemId: targetNodeId,
									itemType: targetNode.type,
									toolId: "sakai.lessonbuildertool",
									operator: "AND",
									subConditions: [
										{
											type: "PARENT",
											siteId: metaData.course_id,
											toolId: "sakai.conditions",
											operator: "AND",
											subConditions: [],
										},
										{
											type: "PARENT",
											siteId: metaData.course_id,
											toolId: "sakai.conditions",
											operator: "OR",
											subConditions: [],
										},
									],
								};
							}
							if ("section" in targetNode.data) {
								const gradeRequisites = targetNode.data.gradeRequisites;

								const subRootAnd = gradeRequisites.subConditions.find(
									(set) => set.type === "PARENT" && set.operator === "AND"
								);

								subRootAnd.subConditions.push({
									type: "SCORE",
									siteId: metaData.course_id,
									itemId: sourceNodeId,
									itemType: sourceNode.type,
									toolId: "sakai.lessonbuildertool",
									argument: 5,
									operator: "GREATER_THAN",
								});
							}

							break;
					}
				}
			}

			if (allowLineCreation) {
				if ("children" in sourceNode.data)
					sourceNode.data.children.push(targetNode.id);

				setNodes(
					getUpdatedArrayById(
						[sourceNode, targetNode],
						reactFlowInstance.getNodes()
					)
				);

				setEdges([
					...reactFlowInstance.getEdges(),
					{
						id: sourceNodeId + "-" + targetNodeId,
						source: sourceNodeId,
						target: targetNodeId,
					},
				]);

				/*reactFlowInstance.addEdges({
					id: sourceNodeId + "-" + targetNodeId,
					source: sourceNodeId,
					target: targetNodeId,
				} as Edge);*/
			}
		}
	};

	useEffect(() => {
		setNodes(newInitialNodes);
		setEdges(newInitialEdges);
	}, [newInitialNodes, newInitialEdges]);

	//-- DELETION LOGIC --
	useEffect(() => {
		if (deletePressed) {
			const selectedNodes = getSelectedNodes();
			const selectedEdges = getSelectedEdges();
			deleteElements(selectedNodes as unknown as Array<Node>, selectedEdges);
		}
	}, [deletePressed]);

	/**
	 * Handles the deletion of edges.
	 * @param {Edge[]} edgesToDelete - The edges being deleted.
	 */
	const onEdgesDelete = (edgesToDelete: Array<Edge>) => {
		// Get a copy of the current nodes
		let updatedBlocksArray = reactFlowInstance
			.getNodes()
			.slice() as Array<INode>;

		// Loop through each edge to be deleted
		edgesToDelete.map((edge) => {
			// Find the source and target nodes for the current edge
			var blockNodeSource = updatedBlocksArray.find(
				(obj) => obj.id === edge.source
			);
			var blockNodeTarget = updatedBlocksArray.find(
				(obj) => obj.id === edge.target
			);

			// If the source node exists and has children, update its children by removing the target node
			if (blockNodeSource && "children" in blockNodeSource.data) {
				blockNodeSource.data.children = blockNodeSource.data.children.filter(
					(childId) => !childId.includes(blockNodeTarget.id)
				);
			}

			// If the target node exists and has a condition, update it based on its type
			if (blockNodeTarget) {
				switch (metaData.platform) {
					case Platforms.Moodle:
						if ("c" in blockNodeTarget.data && blockNodeTarget.data.c) {
							if (
								getElementNodeTypes().some(
									(node) => node.type === blockNodeTarget.type
								)
							) {
								if (blockNodeSource?.id)
									if ("c" in blockNodeTarget.data.c) {
										deleteConditionById(
											blockNodeTarget.data.c.c,
											blockNodeSource.id
										);
									}
							} else {
								updateBadgeConditions(
									blockNodeTarget as IActionNode,
									blockNodeSource
								);
							}
						}
						break;

					case Platforms.Sakai:
						const gradeRequisites =
							"section" in blockNodeTarget.data
								? blockNodeTarget.data.gradeRequisites
								: undefined;

						if (
							gradeRequisites &&
							"subConditions" in gradeRequisites &&
							gradeRequisites?.subConditions.length >= 1
						) {
							filterConditionsByParentId(
								gradeRequisites.subConditions,
								blockNodeSource.id
							);
						}
				}
			}

			// Find the node to be deleted in the updated blocks array
			const NODE_DELETED = updatedBlocksArray.find(
				(obj) => obj.id === edge.source
			);

			// If the node to be deleted exists and has children, update its children and conditions
			if (
				NODE_DELETED &&
				"children" in NODE_DELETED.data &&
				NODE_DELETED.data.children
			) {
				NODE_DELETED.data.children = NODE_DELETED.data.children.filter(
					(child) => child !== edge.target
				);

				if (NODE_DELETED.data.children.length === 0) {
					NODE_DELETED.data.children = [];
				}
			}
		});

		// Update the nodes and edges in the reactFlowInstance
		setNodes(updatedBlocksArray);
		setEdges(
			edges.filter((edge) => !edgesToDelete.map((e) => e.id).includes(edge.id))
		);
	};

	function filterConditionsByParentId(subConditions, blockNodeId) {
		subConditions.forEach((subCondition) => {
			subCondition.subConditions = subCondition.subConditions?.filter(
				(condition) => {
					return !(condition.itemId === blockNodeId);
				}
			);
		});
	}

	/**
	 * Deletes blocks and updates their parents and children.
	 * @param {Node[]} blocks - The blocks to delete.
	 * @returns {Node[]} - The array with the blocks removed.
	 */
	const deleteBlocks = (blocks, showMessage = false) => {
		//Close Aside
		setExpandedAside(false);
		// Array of blocks that its children or conditions are being updated
		let updatedNodes = [];

		//For each fragment in the selection, adds its children.
		blocks.forEach((block) => {
			if (block.type == "fragment") {
				const innerNodes = block.data.innerNodes;
				innerNodes.forEach((node) => {
					const rfNode = nodes.find((onode) => onode.id == node.id);
					if (rfNode) {
						blocks.push(rfNode);
					}
				});
			}
		});

		// Iteration of the blocks to delete
		blocks.map((block) => {
			// Get method to retreive the parents nodes from a block
			const PARENTS_NODE = getParentsNode(nodes, block.id);

			// Iteration of the parents nodes
			PARENTS_NODE.map((parentNode) => {
				// Condition to check if one of the parents it isn't being deleted
				if (!blocks.some((block) => block.id === parentNode.id)) {
					// Find method to check if the parent is already edited
					const FOUND_PARENT_NODE = updatedNodes.find(
						(block) => block.id === parentNode.id
					);

					// Condition to check if the parent is already edited
					if (FOUND_PARENT_NODE) {
						// Constant that updates the existing parent
						const UPDATED_NODE = {
							...FOUND_PARENT_NODE,
							data: {
								...FOUND_PARENT_NODE.data,
								children: FOUND_PARENT_NODE.data.children.filter(
									(childId) => !childId.includes(block.id)
								),
							},
						};

						// Map method to update the array of the blocks updated
						const UPDATED_NODE_ARRAY = updatedNodes.map((block) =>
							block.id === parentNode.id ? UPDATED_NODE : block
						);

						updatedNodes = UPDATED_NODE_ARRAY;
					} else {
						// Filter method to update the children
						parentNode.data.children = parentNode.data.children.filter(
							(childId) => !childId.includes(block.id)
						);

						// Push method to store the updated node
						updatedNodes.push(parentNode);
					}
				}
			});

			let nodeArray = nodes;

			// Filter method to retrieve only the nodes that are the children of a block
			if (block.data) {
				if (block.data.children != undefined) {
					const CHILDREN_NODES = nodeArray.filter((node) =>
						block.data.children.includes(node.id)
					);

					// Iteration of the children nodes
					CHILDREN_NODES.map((childrenNode) => {
						// Find method to check if the children is already edited
						const foundChildrenNode = updatedNodes.find(
							(block) => block.id === childrenNode.id
						);

						// Condition to check if the children is already edited
						if (foundChildrenNode) {
							switch (metaData.platform) {
								case Platforms.Moodle:
									if (
										getElementNodeTypes().some(
											(node) => node.type === foundChildrenNode.type
										)
									) {
										// Delete method that updates the conditions of the children node edited
										deleteConditionById(foundChildrenNode.data?.c?.c, block.id);
									} else {
										updateBadgeConditions(foundChildrenNode, block);
									}
									break;
								case Platforms.Sakai:
									filterConditionsByParentId(
										foundChildrenNode.data.g.subConditions,
										block.id
									);
									break;
							}
						} else {
							switch (metaData.platform) {
								case Platforms.Moodle:
									if (
										"c" in childrenNode.data &&
										getElementNodeTypes().some(
											(node) => node.type === childrenNode.type
										)
									) {
										// Delete method that updates the conditions of the children node
										if ("c" in childrenNode.data.c)
											deleteConditionById(childrenNode.data.c?.c, block.id);
									} else {
										updateBadgeConditions(childrenNode as IActionNode, block);
									}
									break;
								case Platforms.Sakai:
									if (
										"g" in childrenNode.data &&
										"subConditions" in childrenNode.data.g
									)
										filterConditionsByParentId(
											childrenNode.data.g.subConditions,
											block.id
										);
									break;
							}

							// Push method to store the updated node
							updatedNodes.push(childrenNode);
						}
					});
				}
			}
		});

		// Update method to update the full array of nodes with the updated nodes
		let updatedNodeArray = getUpdatedArrayById(updatedNodes, nodes);

		// Iteration to delete the nodes from the full array of nodes
		blocks.map((block) => {
			updatedNodeArray = updatedNodeArray.filter(
				(node) => node.id !== block.id
			);
		});

		//Clamp nodes order to avoid gaps
		const FINAL_NODE_ARRAY = getUpdatedArrayById(
			clampNodesOrder(updatedNodeArray, metaData.platform),
			updatedNodeArray
		);

		// Set method to update the full array of nodes
		setNodes(FINAL_NODE_ARRAY);
		if (showMessage)
			toast(
				"Se han eliminado los bloques seleccionados en el mapa (no se modificarán los módulos originales del curso)",
				DEFAULT_TOAST_SUCCESS
			);

		// Check method for errors
		errorListCheck(blocks, errorList, setErrorList, true);

		//Reordering
		const finalReorderedNodeArray = getUpdatedArrayById(
			clampNodesOrder(FINAL_NODE_ARRAY, metaData.platform),
			FINAL_NODE_ARRAY
		);

		setRelationStarter(undefined); //Empties relation memory in case the deleted block was used
		return finalReorderedNodeArray;
	};

	const deleteElements = (
		nodes: Array<Node>,
		edges: Array<Edge>,
		force: boolean = false
	) => {
		let continueDeletion = true;

		const getRelatedNodes = (relatedNodes) => {
			const childrenNodes = relatedNodes.flatMap((node) =>
				getByProperty("parentNode", node.id, nodes)
			);
			return childrenNodes;
		};
		const allNodes = [...nodes, ...getRelatedNodes(nodes)];

		if (force == false && metaData.platform === Platforms.Moodle) {
			if (
				allNodes.filter((node) =>
					metaData.grades.includes(node.data?.lmsResource)
				).length > 0
			) {
				continueDeletion = false;
				confirmDeletionModalCallbackRef.current = () =>
					deleteElements(allNodes, edges, true);
				setShowConfirmDeletionModal(true);
			}
		}

		if (continueDeletion) {
			if (edges.length > 0) {
				onEdgesDelete(edges);
			}
			if (nodes.length > 0) {
				deleteBlocks(nodes, true);
			}
		}
	};

	/**
	 * Handles the deletion of nodes.
	 * @param {Node[]} nodes - The nodes being deleted.
	 */
	const onNodesDelete = (nodes) => {
		setNodeSelected(undefined);
		deleteBlocks(nodes, true);
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

	function findEdgeConditionBySourceId(conditions, op) {
		for (let i = 0; i < conditions.length; i++) {
			const condition = conditions[i];
			console.log(condition);

			if (condition.cm === op) {
				return condition;
			} else if (condition.hasOwnProperty("c") && Array.isArray(condition.c)) {
				const nestedResult = findEdgeConditionBySourceId(condition.c, op);

				if (nestedResult) {
					return nestedResult;
				}
			}
		}
	}

	function findEdgeBadgeConditionBySourceId(conditions, op) {
		let foundCondition = conditions.find(
			(condition) =>
				condition.type === "completion" &&
				condition.params &&
				condition.params.length >= 1 &&
				condition.params.some((node) => node.id === op)
		);

		if (foundCondition) {
			return foundCondition;
		} else {
			return undefined;
		}
	}

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
					const parentFragment = getNodeById(node.parentNode, nodes);
					if (!parentFragment?.data?.expanded) {
						const fragment = getNodeDOMById(node.id);
						if (fragment) fragment.style.visibility = "hidden";
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
		const FILTERED_MAP = map.map((node) => {
			return isSupportedTypeInPlatform(metaData.platform, node.type)
				? node
				: isSupportedTypeInPlatform(metaData.platform, "generic")
				? { ...node, type: "generic", data: { ...node.data } }
				: null;
		});

		setNewInitialNodes(
			clampNodesOrder(
				FILTERED_MAP.filter((i) => i != null),
				metaData.platform
			)
		);

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

	// we are using a bit of a shortcut here to adjust the edge type
	// this could also be done with a custom edge for example
	const edgesWithUpdatedTypes = edges
		? edges.map((edge) => {
				if (edge) {
					edge.type = "conditionalEdge";

					if (edge.target) {
						const TARGET_NODE = getNodeById(edge.target, nodes);
						const ACTION_NODES = NodeDeclarations.map((declaration) => {
							if (declaration.nodeType == "ActionNode") return declaration.type;
						});
						if (TARGET_NODE)
							if (ACTION_NODES.includes(TARGET_NODE.type)) {
								if (TARGET_NODE.data.c) {
									if (Array.isArray(TARGET_NODE.data.c.c)) {
										TARGET_NODE.data.c.c.forEach((condition) => {
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
		const currentNodes = nodes as Array<INode>;
		currentNodes.map((node) => (node.selected ? selectedCount++ : null));
		if (selectedCount <= 1) {
			console.log(node);
			setCMBlockData(node);
			setContextMenuOrigin("block");
		} else {
			const selectedNodes = getSelectedNodes(currentNodes);
			setContextMenuOrigin("nodesselection");
			setCMBlockData(selectedNodes);
			setCMContainsReservedNodes(false);
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
		const bounds = reactFlowWrapper.current?.getBoundingClientRect();
		e.preventDefault();
		setCMX(e.clientX - bounds.left);
		setCMY(e.clientY - bounds.top);
		setCMBlockData(undefined);
		setContextMenuOrigin("pane");
		setShowContextualMenu(true);
		console.log(reactFlowInstance);
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
		const selectedNodes = getSelectedNodes();
		setCMX(e.clientX - bounds.left);
		setCMY(e.clientY - bounds.top);
		setContextMenuOrigin("nodesselection");

		console.log(selectedNodes, reactFlowInstance);
		setCMBlockData(selectedNodes);
		setCMContainsReservedNodes(undefined);
		setShowContextualMenu(true);
	};

	/**
	 * Filters out children with the given id from an array of objects.
	 * @param {string} id - The id of the child to filter.
	 * @param {Object[]} arr - The array of objects to search for children.
	 * @returns {Object[]} - The updated array of objects with the specified child removed.
	 */
	const filterRelatedChildrenById = (id, arr) => {
		return arr.map((node) => {
			if (node.children?.includes(id)) {
				const UPDATED_CHILDREN = node.children.filter(
					(childId) => childId !== id
				);
				return {
					...node,
					children: UPDATED_CHILDREN.length ? UPDATED_CHILDREN : undefined,
				};
			} else if (node.children?.length) {
				return {
					...node,
					children: filterRelatedChildrenById(id, node.children),
				};
			} else {
				return node;
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
		return arr.map((node) => {
			if (node.data?.c?.length) {
				const UPDATED_CONDITIONS = node.data.c.filter(
					(condition) => condition.unlockId !== unlockId
				);
				return {
					...node,
					data: {
						c: UPDATED_CONDITIONS.length ? UPDATED_CONDITIONS : undefined,
					},
				};
			} else if (node.data?.children?.length) {
				return {
					...node,
					data: {
						...node.data,
						children: filterRelatedConditionsById(unlockId, node.data.children),
					},
				};
			} else {
				return node;
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
		const PARENT_NODE = fragment.id;
		const FRAGMENT_CHILDREN = nodes.filter(
			(node) => node.parentNode == PARENT_NODE
		);
		const FILTERED_CHILDREN_ARRAY = arr.filter((oNode) =>
			FRAGMENT_CHILDREN.map((cNode) => cNode.id).includes(oNode.id)
		);
		return [...FILTERED_CHILDREN_ARRAY, ...FRAGMENT_CHILDREN];
	};

	//TODO: REVISAR
	useEffect(() => {
		if (cMBlockData && reactFlowInstance)
			if (!Array.isArray(cMBlockData)) {
				let newcurrentBlocksData = [...nodes];
				newcurrentBlocksData[nodes.findIndex((b) => b.id == cMBlockData.id)] =
					cMBlockData;
				setNodes(newcurrentBlocksData);
			} else {
				const newcurrentBlocksData = reactFlowInstance
					.getNodes()
					.map((block) => {
						const newBlock = cMBlockData.find((b) => b.id === block.id);
						return newBlock ? { ...block, ...newBlock } : block;
					});
				setNodes(newcurrentBlocksData);
			}
	}, [cMBlockData]);

	/**
	 * Handles the copying of nodes.
	 * @param {Node[]} [blockData=[]] - The nodes to copy.
	 */
	const handleNodeCopy = (blockData = [], lmsResource = false) => {
		setShowContextualMenu(false);

		const selectedNodes = getSelectedNodes();

		const blockDataSet = [];
		if (blockData.length == 1) {
			blockDataSet.push(...blockData);
		}

		const SELECTED = deduplicateById([
			...blockDataSet,
			...selectedNodes,
		]) as Array<INode>;

		const CHILDREN_ARRAY = [];
		SELECTED.forEach((node) => {
			if (node.type == "fragment") {
				const fragmentID = node.id;
				const children = getChildrenNodesFromFragmentID(fragmentID, nodes);
				CHILDREN_ARRAY.push(...children);
			}
		});

		const COMPLETE_SELECTION = deduplicateById([
			...CHILDREN_ARRAY,
			...SELECTED,
		]);

		const CLEANED_SELECTION = COMPLETE_SELECTION.map((node: INode) => {
			delete node.dragging;
			delete node.width;
			delete node.height;
			delete node.positionAbsolute;
			delete node.selected;
			//TODO: CHECK IF NEEDED
			/*if (!lmsResource && node.data) {
				if (Number(node.data.lmsResource) < 1 || node.data.lmsResource == "") {
					delete node.data.lmsResource;
				}
			}*/
			return node;
		});

		const CLIPBOARD_DATA = {
			instance_id: metaData.instance_id,
			course_id: metaData.course_id,
			platform: metaData.platform, //Redundant, just in case
			data: CLEANED_SELECTION,
			type: !lmsResource ? "copy" : "cut",
		};

		localStorage.setItem("clipboard", JSON.stringify(CLIPBOARD_DATA));

		console.info(`❓ New clipboard data:`, CLIPBOARD_DATA);

		if (CLEANED_SELECTION.length > 0) {
			toast(
				"Se han copiado " + CLEANED_SELECTION.length + " bloque(s) abstractos",
				DEFAULT_TOAST_INFO
			);
		}
	};

	/**
	 * Handles the pasting of nodes.
	 */
	const handleNodePaste = () => {
		const CLIPBOARD_DATA = JSON.parse(localStorage.getItem("clipboard"));
		if (
			CLIPBOARD_DATA &&
			CLIPBOARD_DATA.data &&
			CLIPBOARD_DATA.data.length > 0
		) {
			const COPIED_BLOCKS = CLIPBOARD_DATA.data;
			const NEW_BLOCKS_TO_PASTE = [...COPIED_BLOCKS];
			const ORIGINAL_ID_ARRAY = NEW_BLOCKS_TO_PASTE.map((block) => block.id);
			const NEW_ID_ARRAY = NEW_BLOCKS_TO_PASTE.map(() => uniqueId());
			const ORIGINAL_X_ARRAY = NEW_BLOCKS_TO_PASTE.map(
				(block) => block.position.x
			);
			const ORIGINAL_Y_ARRAY = NEW_BLOCKS_TO_PASTE.map(
				(block) => block.position.y
			);
			const LOWER_X = Math.min(...ORIGINAL_X_ARRAY);
			const LOWER_Y = Math.min(...ORIGINAL_Y_ARRAY);
			const NEW_X_ARRAY = ORIGINAL_X_ARRAY.map((x) => -LOWER_X + x);
			const NEY_Y_ARRAY = ORIGINAL_Y_ARRAY.map((y) => -LOWER_Y + y);
			//TODO: FRAGMENT PASTING CONSERVING CONDITIONS BETWEEN CHILDREN
			const SHOULD_EMPTY_RESOURCE = !(
				metaData.instance_id == CLIPBOARD_DATA.instance_id &&
				metaData.course_id == CLIPBOARD_DATA.course_id &&
				metaData.platform == CLIPBOARD_DATA.platform
			);
			const newBlocks = NEW_BLOCKS_TO_PASTE.map((block, index) => {
				let newID;
				let originalID;

				let filteredChildren = block.children
					?.map((child) => {
						newID = NEW_ID_ARRAY[ORIGINAL_ID_ARRAY.indexOf(child)];
						originalID = child;
						return newID;
					})
					.filter((child) => child !== undefined);

				//(Fragment) Adds the new parent to the children
				if (block.parentNode) {
					const parentIndex = ORIGINAL_ID_ARRAY.findIndex(
						(id) => id == block.parentNode
					);
					block.parentNode = NEW_ID_ARRAY[parentIndex];
				}

				let newLmsResource;

				if (
					CLIPBOARD_DATA.type == "copy" ||
					(CLIPBOARD_DATA.type == "cut" && SHOULD_EMPTY_RESOURCE)
				) {
					newLmsResource = undefined;
				} else {
					if (
						(nodes as Array<INode>).some(
							(node) => node.data.lmsResource == block.data.lmsResource
						)
					) {
						newLmsResource = undefined;
					} else {
						newLmsResource = block.data.lmsResource;
					}
				}

				return {
					...block,
					id: NEW_ID_ARRAY[index],
					position: { x: NEW_X_ARRAY[index], y: NEY_Y_ARRAY[index] },
					data: {
						...block.data,
						label: handleNameCollision(
							block.data.label,
							(nodes as Array<INode>).map((node) => node?.data?.label),
							false,
							"("
						),
						children: !filteredChildren ? [] : filteredChildren,
						c: undefined,
						lmsResource: newLmsResource,
					},
				};
			});

			if (COPIED_BLOCKS.length <= 1) {
				createBlock(newBlocks[0]);
			} else {
				const addToInnerNodes = (blocks) => {
					//Updates innerNodes with the new IDs
					const INNER_NODES = blocks.filter((block) => block.parentNode);

					INNER_NODES.map((innerNode) => {
						const CURRENT_ID_INDEX = NEW_ID_ARRAY.findIndex(
							(id) => id == innerNode.id
						);
						const OLD_ID = ORIGINAL_ID_ARRAY[CURRENT_ID_INDEX];
						const CURRENT_PARENT = blocks.find(
							(block) => block.id == innerNode.parentNode
						);
						const STORED_ID_INDEX = CURRENT_PARENT.data.innerNodes.findIndex(
							(innerNode) => innerNode.id == OLD_ID
						);
						CURRENT_PARENT.data.innerNodes[STORED_ID_INDEX].id = innerNode.id;
					});

					const OUTER_NODES = blocks.filter((block) => !block.parentNode);

					return [...OUTER_NODES, ...INNER_NODES]; //This order is needed for it to render correctly
				};
				createBlockBulk(addToInnerNodes(newBlocks));
			}
		}
	};

	/**
	 * Handles the cutting of nodes.
	 * @param {Array<INode>} [blockData=[]] - The nodes to cut.
	 */
	const handleNodeCut = (blockData: Array<INode> = []) => {
		const SELECTED_NODES = getSelectedNodes(nodes as Array<INode>);
		handleNodeCopy(blockData, true);
		if (SELECTED_NODES.length > 1) {
			handleNodeSelectionDeletion();
		} else {
			if (SELECTED_NODES.length == 1) {
				blockData = [SELECTED_NODES[0]];
			}
			handleNodeDeletion(blockData);
		}
	};

	/**
	 * Creates a new block.
	 * @param {INode} [blockData] - The data for the new block.
	 * @returns {Node[]} The updated array of nodes with the new block added.
	 */
	const createBlock = (blockData: INode) => {
		//TODO: Block selector
		const REACTFLOW_BOUNDS = reactFlowWrapper.current?.getBoundingClientRect();
		const ASIDE_DOM = document.getElementById("aside");
		const ASIDE_BOUNDS = ASIDE_DOM
			? ASIDE_DOM?.getBoundingClientRect()
			: { width: 0 };

		const PREFERRED_POSSITION = contextMenuDOM
			? { x: cMX, y: cMY }
			: { x: currentMousePosition.x, y: currentMousePosition.y };

		let flowPos = reactFlowInstance.project({
			x: PREFERRED_POSSITION.x - REACTFLOW_BOUNDS.left,
			y: PREFERRED_POSSITION.y - REACTFLOW_BOUNDS.top,
		});

		const ASIDE_OFFSET = expandedAside
			? Math.floor(ASIDE_BOUNDS.width / 125) * 125
			: 0;

		flowPos.x += ASIDE_OFFSET;

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
							height: 68,
							width: 68,
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
									x: blockData.position.x + ASIDE_OFFSET + flowPos.x,
									y: blockData.position.y + ASIDE_OFFSET + flowPos.y,
								},
							};
						} else {
							newBlockCreated = { ...{ ...blockData, height: 68, width: 68 } };
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
			if (metaData.platform == Platforms.Moodle) {
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
		console.info(`❓ New block created: `, newBlockCreated);
		errorListCheck(newBlockCreated, errorList, setErrorList);

		setShowContextualMenu(false);

		if (Object.keys(newBlockCreated).length !== 0) {
			let newcurrentBlocksData = nodes;
			newcurrentBlocksData.push(newBlockCreated);
			setNodes([...newcurrentBlocksData]);
			if (newBlockCreated != undefined) {
				//getNodeDOMById(newBlockCreated.id).focus(); FIXME: Stopped working, accesibility issue ?
			}
			return newcurrentBlocksData;
		}
	};

	/**
	 * Creates multiple new blocks.
	 * @param {Node[]} clipboardData - The data for the new blocks.
	 */
	const createBlockBulk = (clipboardData: Array<INode>) => {
		const REACTFLOW_BOUNDS = reactFlowWrapper.current?.getBoundingClientRect();

		const PREFERRED_POSITION = contextMenuDOM
			? { x: currentMousePosition.x, y: currentMousePosition.y }
			: { x: cMX, y: cMY };

		let flowPos = reactFlowInstance.project({
			x: PREFERRED_POSITION.x - REACTFLOW_BOUNDS.left,
			y: PREFERRED_POSITION.y - REACTFLOW_BOUNDS.top,
		});

		//FIXME: Replace asideBounds using reactflow project
		const ASIDE_OFFSET = expandedAside
			? Math.floor(asideBounds.width / 125) * 125
			: 0;

		flowPos.x += ASIDE_OFFSET;
		const NEW_BLOCKS = clipboardData.map((blockData) => {
			return {
				...blockData,
				x: blockData.position.x + ASIDE_OFFSET + flowPos.x,
				y: blockData.position.y + ASIDE_OFFSET + flowPos.y,
				data: { ...blockData.data, order: Infinity },
			};
		});
		setShowContextualMenu(false);

		let newcurrentBlocksData = [...nodes, ...NEW_BLOCKS];
		const FINAL_CURRENT_BLOCKSDATA = getUpdatedArrayById(
			clampNodesOrder(newcurrentBlocksData, metaData.platform),
			newcurrentBlocksData
		);

		errorListCheck(FINAL_CURRENT_BLOCKSDATA, errorList, setErrorList, false);

		setNodes(FINAL_CURRENT_BLOCKSDATA);
	};

	/**
	 * Handles the creation of a new fragment.
	 */
	const handleFragmentCreation = () => {
		setShowContextualMenu(false);
		const SELECTED_NODES = getSelectedNodes();

		function getExternalChildren(nodesInside, nodesOutside) {
			// Get all children from nodesInside
			let children = nodesInside.flatMap(
				(nodeInside) => nodeInside.children || []
			);

			// Filter nodesOutside based on children
			let result = nodesOutside.filter((nodeOutside) =>
				children.includes(nodeOutside.id)
			);

			return result;
		}

		if (
			SELECTED_NODES.filter(
				(node) => node.type == "fragment" || node.parentNode != undefined
			).length < 1
		) {
			if (SELECTED_NODES.length > 0) {
				console.log(SELECTED_NODES.map((node) => getNodeById(node.id, nodes)));

				let minX = Infinity;
				let minY = Infinity;
				let maxX = 0;
				let maxY = 0;
				const INNER_NODES = [];
				for (const node of SELECTED_NODES) {
					minX = Math.min(minX, node.position.x);
					minY = Math.min(minY, node.position.y);
					maxX = Math.max(maxX, node.position.x);
					maxY = Math.max(maxY, node.position.y);
				}
				for (const NODE of SELECTED_NODES) {
					INNER_NODES.push({
						id: NODE.id,
						position: { x: NODE.position.x - minX, y: NODE.position.y - minY },
					});
				}

				const NEW_FRAGMENT_ID = uniqueId();
				const finalHeight = maxY - minY + 68;
				const finalWidth = maxX - minX + 68;

				const NEW_FRAGMENT = {
					id: NEW_FRAGMENT_ID,
					position: { x: minX, y: minY },
					type: "fragment",
					height: finalHeight,
					width: finalWidth,
					style: { height: finalHeight, width: finalWidth },
					zIndex: -1,
					data: {
						label: "Nuevo Fragmento",
						innerNodes: INNER_NODES,
						expanded: true,
					},
				};

				const PRESENTED_NODES = SELECTED_NODES.map((node) => {
					node.parentNode = String(NEW_FRAGMENT_ID);
					node.expandParent = true;
					return JSON.parse(JSON.stringify(node));
				});

				// Get the nodes to preserve the conditions for
				const EXTERNAL_CHILDREN_NODES = JSON.parse(
					JSON.stringify(
						getExternalChildren(
							PRESENTED_NODES,
							nodes.filter(
								(oNode) =>
									!SELECTED_NODES.map((pNode) => pNode.id).includes(oNode.id)
							)
						)
					)
				);

				//Delete the original nodes to put them after the fragment, so appear after the fragment and extendParent takes effect
				const FILTERED_NODES = deleteBlocks(
					nodes.filter((oNode) =>
						SELECTED_NODES.map((pNode) => pNode.id).includes(oNode.id)
					),
					false
				);

				console.log(
					...FILTERED_NODES,
					...EXTERNAL_CHILDREN_NODES,
					NEW_FRAGMENT,
					...PRESENTED_NODES
				);

				setNodes([
					...FILTERED_NODES,
					...EXTERNAL_CHILDREN_NODES,
					NEW_FRAGMENT,
					...PRESENTED_NODES,
				]);
			} else {
				//No blocks selected
				const BOUNDS = document
					.getElementById("reactFlowWrapper")
					?.getBoundingClientRect();

				const VIEWPORT_CENTER = reactFlowInstance.project({
					x: BOUNDS.width / 2,
					y: BOUNDS.height / 2,
				});

				const NEW_FRAGMENT: IFragmentNode = {
					id: String(uniqueId()),
					position: VIEWPORT_CENTER,
					type: "fragment",
					style: { height: 68, width: 68 },
					zIndex: -1,
					data: {
						label: "Nuevo Fragmento",
						innerNodes: [],
						expanded: true,
					},
				};

				setNodes([NEW_FRAGMENT, ...nodes]);
			}
		} else {
			toast(
				"No se pueden crear fragmentos con fragmentos en su interior, o con bloques que formen parte de otro",
				DEFAULT_TOAST_ERROR
			);
		}
	};

	/**
	 * Handles the deletion of a single node.
	 * @param {Node} blockData - The node to delete.
	 */
	const handleNodeDeletion = (blockData) => {
		setShowContextualMenu(false);
		setNodeSelected(undefined);
		deleteElements([blockData], []);
	};

	/**
	 * Handles the deletion of multiple selected nodes.
	 */
	const handleNodeSelectionDeletion = () => {
		setShowContextualMenu(false);
		const SELECTED_NODES = getSelectedNodes() as Array<INode>;
		deleteElements(SELECTED_NODES as unknown as Array<Node>, []);
	};

	/**
	 * Handles the creation of a new relation between two nodes.
	 * @param {Node} origin - The origin node of the relation.
	 * @param {Node} end - The end node of the relation.
	 */
	const handleNewRelation = (origin, end?) => {
		setShowContextualMenu(false);

		if (origin && end) {
			if (origin.id == end.id) {
				toast("Relación cancelada", DEFAULT_TOAST_INFO);
				setRelationStarter(undefined);
				return;
			}
			const CURRENT_GRADABLE_TYPE = getNodeTypeGradableType(
				origin,
				metaData.platform
			);

			if (
				metaData.platform != Platforms.Moodle ||
				(metaData.platform == Platforms.Moodle &&
					((CURRENT_GRADABLE_TYPE == "simple" && origin.data.g?.hasToBeSeen) ||
						(CURRENT_GRADABLE_TYPE != "simple" &&
							origin.data.g?.hasConditions)))
			) {
				const NEW_NODES_DATA = nodes;
				const ORIGINAL_INDEX = NEW_NODES_DATA.findIndex(
					(node) => node.id == origin.id
				);
				const ORIGINAL_NODE = NEW_NODES_DATA[ORIGINAL_INDEX];
				if ("children" in ORIGINAL_NODE.data && ORIGINAL_NODE.data.children) {
					const IS_ALREADY_A_CHILDREN = ORIGINAL_NODE.data.children.includes(
						end.id
					);
					if (!IS_ALREADY_A_CHILDREN) {
						ORIGINAL_NODE.data.children.push(end.id);
					} else {
						toast("La relación ya existe, no se ha creado.", {
							hideProgressBar: false,
							autoClose: 2000,
							type: "warning",
							position: "bottom-center",
							theme: "light",
						});
					}
				} else if ("children" in ORIGINAL_NODE.data) {
					ORIGINAL_NODE.data.children = [end.id];
				}

				setRelationStarter(undefined);
				setNodes(NEW_NODES_DATA);
				if (getElementNodeTypes().some((node) => node.type === end.type)) {
					const NEW_CONDITION = {
						id: String(Date.now() * Math.random()),
						type: "completion",
						cm: origin.id,
						e: 1,
					};

					if (!end.data.c) {
						end.data.c = {
							type: "conditionsGroup",
							id: String(Date.now() * Math.random()),
							op: "&",
							c: [NEW_CONDITION],
						};
					} else {
						end.data.c.c.push(NEW_CONDITION);
					}
				} else {
					const CONDITIONS = end.data.c?.c;

					let conditionExists = undefined;

					if (CONDITIONS != undefined) {
						conditionExists = CONDITIONS.find(
							(condition) => condition.type === "completion"
						);
					}

					if (conditionExists) {
						const NEW_CONDITION_TO_APPEND = {
							id: origin.id,
							name: origin.data.label,
						};
						conditionExists.activityList.push(NEW_CONDITION_TO_APPEND);
					} else {
						const NEW_CONDITION = {
							id: String(Date.now() * Math.random()),
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
								id: String(Date.now() * Math.random()),
								op: "&",
								c: [NEW_CONDITION],
							};
						} else {
							end.data.c.c.push(NEW_CONDITION);
						}
					}
				}
				addEdge(
					{
						id: origin.id + "-" + end.id,
						source: origin.id,
						target: end.id,
					} as Edge,
					edges
				);
			} else {
				toast(
					"El recurso no puede ser finalizado. Compruebe los ajustes de finalización.",
					{
						hideProgressBar: false,
						autoClose: 6000,
						type: "error",
						position: "bottom-center",
						theme: "light",
					}
				);
			}
		} else {
			const SELECTED_BLOCKS = nodes.filter(
				(block) => block.selected == true
			) as Array<INode>;
			if (SELECTED_BLOCKS.length == 1) {
				if (relationStarter == undefined) {
					setRelationStarter(SELECTED_BLOCKS[0]);

					toast("Iniciando relación...", DEFAULT_TOAST_INFO);
				} else {
					toast("Finalizando relación...", DEFAULT_TOAST_INFO);
					handleNewRelation(relationStarter, SELECTED_BLOCKS[0]);
				}
			} else {
				toast("Selección inválida", DEFAULT_TOAST_ERROR);
			}
		}
	};

	const onEdgeClick = (e, edge) => {
		if (e.detail === 2) {
			let updatedBlocksArray = reactFlowInstance.getNodes().slice();

			var SOURCE_NODE = updatedBlocksArray.find(
				(obj) => obj.id === edge.source
			) as INode;
			var TARGET_NODE = updatedBlocksArray.find(
				(obj) => obj.id === edge.target
			) as INode;

			let CONDITION;

			const ACTION_NODES = NodeDeclarations.map((declaration) => {
				if (declaration.nodeType == "ActionNode") return declaration.type;
			}) as Array<IActionNode["type"]>;

			setCMBlockData(TARGET_NODE);

			if (metaData.platform == Platforms.Moodle) {
				if (!ACTION_NODES.includes(TARGET_NODE.type)) {
					const CONDITIONS = TARGET_NODE.data.c as IElementNode["data"]["c"];
					if ("c" in CONDITIONS) {
						CONDITION = findConditionById(SOURCE_NODE.id, CONDITIONS.c);
					}
				} else {
					const CONDITIONS = TARGET_NODE.data.c as IActionNode["data"]["c"];
					CONDITION = findConditionById(SOURCE_NODE.id, CONDITIONS.params);
				}

				handleShow(TARGET_NODE.id, "conditions", CONDITION);
			} else {
				if ("gradeRequisites" in TARGET_NODE.data) {
					CONDITION = findConditionByParentId(
						TARGET_NODE.data.gradeRequisites.subConditions,
						SOURCE_NODE.id
					);

					handleShow(TARGET_NODE.id, "requisites", CONDITION);
				}
			}
		}
	};
	/**
	 * Handles the showing of a modal.
	 * @param {String} nodeId
	 * @param {string} modal - The modal to show.
	 * @param {string} condition - The condition. FIXME:
	 */
	const handleShow = (nodeId, modal, condition?) => {
		console.log("CONDITION ", condition);
		console.info(`❓ Showing modal: `, modal);
		const SELECTED_NODES = getSelectedNodes();

		let newCMBlockData = getNodeById(nodeId, reactFlowInstance.getNodes());
		console.log(newCMBlockData);
		if (newCMBlockData || cMBlockData) {
			if (SELECTED_NODES.length == 1 && cMBlockData == undefined) {
				setCMBlockData(newCMBlockData);
			}

			if (metaData.platform == Platforms.Moodle) {
				if (modal == "conditions") setShowConditionsModal(true);
				if (modal == "grades") setShowGradeConditionsModal(true);
			} else if (metaData.platform == Platforms.Sakai) {
				if (modal == "requisites") setShowRequisitesModal(true);
			}

			if (condition) {
				setConditionEdgeView(condition);
			}

			setShowContextualMenu(false);
		} else {
			toast(
				"No se pueden editar las precondiciones de la selección actual",
				EXTENDED_TOAST_ERROR
			);
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
		const FRAGMENT_NODES = getByProperty("type", "fragment", nodes).filter(
			(fragment: IFragmentNode) => fragment.data.expanded == true
		) as Array<IFragmentNode>;
		const FRAGMENT_DOM_ARRAY = [];
		FRAGMENT_NODES.map((fragment) =>
			FRAGMENT_DOM_ARRAY.push(getNodeDOMById(fragment.id))
		);
		if (fragmentPassthrough) {
			FRAGMENT_DOM_ARRAY.map((fragmentDOM) =>
				fragmentDOM.classList.add("passthrough")
			);
		} else {
			FRAGMENT_DOM_ARRAY.map((fragmentDOM) =>
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
	/*useHotkeys("ctrl+z", () => {
		notImplemented("deshacer/rehacer");
		console.log("UNDO");
	});
	useHotkeys(["ctrl+shift+z", "ctrl+y"], (e) => {
		notImplemented("deshacer/rehacer");
		console.log("REDO");
	});*/
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
		const SELECTED_NODES = getSelectedNodes();

		if (SELECTED_NODES.length > 1) {
			toast(
				"No se pueden editar las condiciones de multiples nodos",
				DEFAULT_TOAST_ERROR
			);
		} else {
			handleShow(SELECTED_NODES[0].id, "conditions");
		}
	});
	useHotkeys("ctrl+alt+e", (e) => {
		e.preventDefault();
		const SELECTED_NODES = getSelectedNodes();

		if (SELECTED_NODES.length > 1) {
			toast(
				"No se pueden editar las condiciones de multiples nodos",
				DEFAULT_TOAST_ERROR
			);
		} else {
			handleShow(SELECTED_NODES[0].id, "grades");
		}
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
				onNodeDoubleClick={(e, node) => {
					if (node.type != "fragment") {
						setNodeSelected(node as INode);
						setExpandedAside(true);
					}
				}}
				onEdgeClick={onEdgeClick}
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
				nodeTypes={RF_NODE_TYPES}
				edgeTypes={RF_EDGE_TYPES}
				snapGrid={[125, 275]}
				snapToGrid={snapToGrid}
				deleteKeyCode={[]}
				multiSelectionKeyCode={["Shift"]}
				selectionKeyCode={["Shift"]}
				zoomOnDoubleClick={false}
				nodesDraggable={interactive}
				nodesConnectable={interactive}
				nodesFocusable={interactive}
				edgesFocusable={interactive}
				elementsSelectable={interactive}
				selectionMode={SelectionMode.Partial}
			>
				{minimap && (
					<MiniMap
						nodeColor={(node) => getTypeStaticColor(node, metaData.platform)}
						style={MINIMAP_STYLE}
						zoomable
						pannable
					/>
				)}

				<Background color="#aaa" gap={16} />
			</ReactFlow>
			{showContextualMenu && (
				<ContextualMenu
					ref={contextMenuDOM}
					blockData={cMBlockData}
					containsReservedNodes={cMContainsReservedNodes}
					relationStarter={relationStarter}
					setRelationStarter={setRelationStarter}
					setShowContextualMenu={setShowContextualMenu}
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
			{showConditionsModal && metaData.platform == Platforms.Moodle && (
				<>
					{"type" in cMBlockData &&
					getElementNodeTypes().some(
						(node) => node.type === cMBlockData.type
					) ? (
						<ConditionModalMoodle
							blockData={cMBlockData}
							setBlockData={setCMBlockData}
							blocksData={nodes}
							onEdgesDelete={onEdgesDelete}
							showConditionsModal={showConditionsModal}
							setShowConditionsModal={setShowConditionsModal}
							conditionEdgeView={conditionEdgeView}
							setConditionEdgeView={setConditionEdgeView}
						/>
					) : (
						<CriteriaModal
							blockData={cMBlockData}
							setBlockData={setCMBlockData}
							blocksData={nodes}
							onEdgesDelete={onEdgesDelete}
							showConditionsModal={showConditionsModal}
							setShowConditionsModal={setShowConditionsModal}
							conditionEdgeView={conditionEdgeView}
							setConditionEdgeView={setConditionEdgeView}
						/>
					)}
				</>
			)}
			{showGradeConditionsModal && metaData.platform == Platforms.Moodle && (
				<>
					{cMBlockData &&
						"type" in cMBlockData &&
						getElementNodeTypes().some(
							(node) => node.type === cMBlockData.type
						) && (
							<QualificationModal
								blockData={cMBlockData}
								showConditionsModal={showGradeConditionsModal}
								setShowConditionsModal={setShowGradeConditionsModal}
							/>
						)}
				</>
			)}

			{showRequisitesModal && metaData.platform == Platforms.Sakai && (
				<RequisiteModalSakai
					blockData={cMBlockData}
					setBlockData={setCMBlockData}
					blocksData={nodes}
					onEdgesDelete={onEdgesDelete}
					conditionEdgeView={conditionEdgeView}
					setConditionEdgeView={setConditionEdgeView}
					showRequisitesModal={showRequisitesModal}
					setShowRequisitesModal={setShowRequisitesModal}
				></RequisiteModalSakai>
			)}

			{showNodeSelector && (
				<NodeSelector
					showDialog={showNodeSelector}
					toggleDialog={() => setShowNodeSelector(false)}
					type={nodeSelectorType}
					callback={createBlock}
				/>
			)}
			{showConfirmDeletionModal && (
				<SimpleActionDialog
					showDialog={showConfirmDeletionModal}
					toggleDialog={() => {
						setShowConfirmDeletionModal(!showConfirmDeletionModal);
					}}
					title={"Borrado de bloque con calificaciones"}
					type={"delete"}
					body={
						<>
							<p>
								<b>La selección actual contiene</b>, como mínimo,{" "}
								<b>un bloque con calificaciones</b> en{" "}
								{capitalizeFirstLetter(metaData.platform)}.
							</p>
							<p>¿Estás seguro de querer continuar?</p>
							<p
								style={{
									...getAutomaticReusableStyles("warning", true, true, false),
									padding: "6px",
								}}
							>
								(Al confirmar el borrado, se borrarán todos los bloques
								seleccionados, <b>sin excepción</b>.)
							</p>
						</>
					}
					action={"Confirmar borrado"}
					callback={confirmDeletionModalCallbackRef.current}
				></SimpleActionDialog>
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
