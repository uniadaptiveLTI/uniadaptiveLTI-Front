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
	EditedNodeContext,
	ErrorListContext,
	ExpandedAsideContext,
	SettingsContext,
	MetaDataContext,
	notImplemented,
} from "pages/_app.tsx";
import FragmentNode from "./flow/nodes/FragmentNode.js";
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
	getNodeByNodeDOM,
	getNodeDOMById,
	getNodeById,
	getChildrenNodesFromFragmentID,
	getParentsNode,
	getNodeTypeGradableType,
} from "@utils/Nodes";
import { errorListCheck } from "@utils/ErrorHandling";
import { toast } from "react-toastify";
import { getAutomaticReusableStyles } from "@utils/Colors";
import { useHotkeys } from "react-hotkeys-hook";
import ContextualMenu from "@components/flow/ContextualMenu.js";
import ConditionModalMoodle from "@components/flow/conditions/moodle/ConditionModalMoodle.js";
import RequisiteModalSakai from "@components/flow/conditions/sakai/RequisiteModalSakai";
import QualificationModal from "@components/flow/conditions/moodle/QualificationModal.js";
import { useKeyPress } from "reactflow";
import { getTypeStaticColor } from "@utils/NodeIcons.js";
import NodeSelector from "@components/dialogs/NodeSelector.js";
import CriteriaModal from "@components/flow/badges/CriteriaModal.js";
import ConditionalEdge from "@components/flow/edges/ConditionalEdge";
import { NodeTypes } from "@utils/TypeDefinitions.js";
import { isSupportedTypeInPlatform } from "@utils/Platform.js";
import CustomControls from "./flow/CustomControls.js";
import SimpleActionDialog from "./dialogs/SimpleActionDialog.js";

const MINIMAP_STYLE = {
	height: 120,
};

const DELETE_KEY_CODES = ["Backspace", "Delete"];

const NODE_TYPES = {
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
	fragment: FragmentNode,
};

const EDGE_TYPES = {
	conditionalEdge: ConditionalEdge,
};

const OverviewFlow = ({ map }, ref) => {
	const validTypes = ["badge", "mail", "addgroup", "remgroup"];

	const { errorList, setErrorList } = useContext(ErrorListContext);
	const { expandedAside, setExpandedAside } = useContext(ExpandedAsideContext);
	const { setNodeSelected } = useContext(EditedNodeContext);
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
	const [fragmentPassthrough, setFragmentPassthrough] = useState(false);
	const dragRef = useRef(null);
	const [target, setTarget] = useState(null);
	const [prevMap, setPrevMap] = useState();
	const nodesInitialized = useNodesInitialized();
	const [ableToFitView, setAbleToFitView] = useState(true);

	//ContextMenu Ref, States, Constants
	const contextMenuDOM = useRef(null);
	const confirmDeletionModalCallbackRef = useRef(null);
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

	//NodeSelector
	const [showNodeSelector, setShowNodeSelector] = useState(false);
	const [nodeSelectorType, setNodeSelectorType] = useState(false);

	const [nodes, setNodes, onNodesChange] = useNodesState(newInitialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(newInitialEdges);

	const draggedNodePosition = useRef(null);

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

	const getSelectedNodes = (nodeArray = reactFlowInstance.getNodes()) => {
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
		setSnapToGrid(true);
	};

	/**
	 * Handles a connect event.
	 * @param {Event} event - The connect event.
	 */
	const onConnect = (event) => {
		const sourceNodeId = event.source.split("__")[0];
		const targetNodeId = event.target.split("__")[0];

		let allowLineCreation = true;

		if (sourceNodeId != targetNodeId) {
			const edgeFound = reactFlowInstance
				.getEdges()
				.find((node) => node.id === sourceNodeId + "-" + targetNodeId);

			if (edgeFound) allowLineCreation = false;

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
				if (allowLineCreation) {
					switch (metaData.platform) {
						case "moodle":
							const blockData = getNodeById(
								sourceNodeId,
								reactFlowInstance.getNodes()
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
											method: "&",
											showc: true,
											criteriatype: 0,
										};
									}

									const conditions = targetNode.data.c?.params;

									if (conditions) {
										const conditionExists = conditions.find(
											(condition) => condition.type === "completion"
										);

										if (conditionExists) {
											const newConditionAppend = {
												id: sourceNode.id,
											};

											conditionExists.params.push(newConditionAppend);
										} else {
											const newCondition = {
												id: parseInt(Date.now() * Math.random()).toString(),
												type: "completion",
												params: [
													{
														id: sourceNode.id,
													},
												],
												method: "&",
												criteriatype: 1,
											};

											targetNode.data.c.params.push(newCondition);
										}
									} else {
										const newCondition = {
											id: parseInt(Date.now() * Math.random()).toString(),
											type: "completion",
											criteriatype: 1,
											params: [
												{
													id: sourceNode.id,
												},
											],
											method: "&",
										};

										targetNode.data.c.params = [newCondition];
									}
								}
							} else {
								allowLineCreation = false;
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

							if (targetNode.type === "badge") {
								if (sourceNode.data.g && !sourceNode.data.g.hasToBeQualified) {
									sourceNode.data.g.hasToBeQualified = true;
								}
							}

							break;
						case "sakai":
							if (!targetNode.data.gradeRequisites) {
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
							break;
					}
				}
			}

			if (allowLineCreation) {
				setEdges([
					...edges,
					{
						id: sourceNodeId + "-" + targetNodeId,
						source: sourceNodeId,
						target: targetNodeId,
					},
				]);

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

	//-- DELETION LOGIC --
	useEffect(() => {
		if (deletePressed) {
			const selectedNodes = getSelectedNodes();
			const selectedEdges = getSelectedEdges();
			deleteElements(selectedNodes, selectedEdges);
		}
	}, [deletePressed]);

	/**
	 * Handles the deletion of edges.
	 * @param {Edge[]} edges - The edges being deleted.
	 */
	const onEdgesDelete = (edges) => {
		// Get a copy of the current nodes
		let updatedBlocksArray = reactFlowInstance.getNodes().slice();

		// Loop through each edge to be deleted
		edges.map((edge) => {
			// Find the source and target nodes for the current edge
			var blockNodeSource = updatedBlocksArray.find(
				(obj) => obj.id === edge.source
			);
			var blockNodeTarget = updatedBlocksArray.find(
				(obj) => obj.id === edge.target
			);

			// If the source node exists and has children, update its children by removing the target node
			if (blockNodeSource && blockNodeSource.data.children) {
				blockNodeSource.data.children = blockNodeSource.data.children.filter(
					(childId) => !childId.includes(blockNodeTarget.id)
				);
			}

			// If the target node exists and has a condition, update it based on its type
			if (blockNodeTarget) {
				switch (metaData.platform) {
					case "moodle":
						if (blockNodeTarget.data.c) {
							if (!validTypes.includes(blockNodeTarget.type)) {
								if (blockNodeSource?.id)
									deleteConditionById(
										blockNodeTarget.data.c.c,
										blockNodeSource.id
									);
							} else {
								updateBadgeConditions(blockNodeTarget, blockNodeSource);
							}
						}
						break;

					case "sakai":
						const gradeRequisites = blockNodeTarget.data?.gradeRequisites;

						if (gradeRequisites && gradeRequisites?.subConditions.length >= 1) {
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
			if (NODE_DELETED && NODE_DELETED.children) {
				NODE_DELETED.children = NODE_DELETED.children.filter(
					(child) => child !== edge.target
				);

				if (NODE_DELETED.children.length === 0) {
					NODE_DELETED.children = undefined;
				}
			}
		});

		// Update the nodes and edges in the reactFlowInstance
		reactFlowInstance.setNodes(updatedBlocksArray);
		reactFlowInstance.setEdges(
			reactFlowInstance
				.getEdges()
				.filter((edge) => !edges.map((e) => e.id).includes(edge.id))
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
	const deleteBlocks = (blocks) => {
		//Close Aside
		setExpandedAside(false);
		// Array of blocks that its children or conditions are being updated
		let updatedNodes = [];

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
		blocks.map((block) => {
			// Get method to retreive the parents nodes from a block
			const PARENTS_NODE = getParentsNode(
				reactFlowInstance.getNodes(),
				block.id
			);

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

			let nodeArray = reactFlowInstance.getNodes();

			// Filter method to retrieve only the nodes that are the children of a block
			if (block.data) {
				if (block.data.children != undefined) {
					const CHILDREN_NODES = nodeArray.filter((node) =>
						block.data.children.includes(node.id.toString())
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
								case "moodle":
									if (!validTypes.includes(foundChildrenNode.type)) {
										// Delete method that updates the conditions of the children node edited
										deleteConditionById(foundChildrenNode.data?.c?.c, block.id);
									} else {
										updateBadgeConditions(foundChildrenNode, block);
									}
									break;
								case "sakai":
									filterConditionsByParentId(
										foundChildrenNode.data.gradeRequisites.subConditions,
										block.id
									);
									break;
							}
						} else {
							switch (metaData.platform) {
								case "moodle":
									if (!validTypes.includes(childrenNode.type)) {
										// Delete method that updates the conditions of the children node
										deleteConditionById(childrenNode.data?.c?.c, block.id);
									} else {
										updateBadgeConditions(childrenNode, block);
									}
									break;
								case "sakai":
									filterConditionsByParentId(
										childrenNode.data.gradeRequisites.subConditions,
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
		let updatedNodeArray = getUpdatedArrayById(
			updatedNodes,
			reactFlowInstance.getNodes()
		);

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
		reactFlowInstance.setNodes(FINAL_NODE_ARRAY);

		// Check method for errors
		errorListCheck(blocks, errorList, setErrorList, true);

		//Reordering
		const finalReorderedNodeArray = getUpdatedArrayById(
			clampNodesOrder(FINAL_NODE_ARRAY, metaData.platform),
			FINAL_NODE_ARRAY
		);

		setRelationStarter(); //Empties relation memory in case the deleted block was used
		return finalReorderedNodeArray;
	};

	const deleteElements = (nodes, edges, force = false) => {
		let continueDeletion = true;

		const getRelatedNodes = (nodes) => {
			const childrenNodes = nodes.flatMap((node) =>
				getByProperty("parentNode", node.id, reactFlowInstance.getNodes())
			);
			return childrenNodes;
		};
		const allNodes = [...nodes, ...getRelatedNodes(nodes)];

		if (force == false && metaData.platform === "moodle") {
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
				deleteBlocks(nodes);
			}
		}
	};

	/**
	 * Handles the deletion of nodes.
	 * @param {Node[]} nodes - The nodes being deleted.
	 */
	const onNodesDelete = (nodes) => {
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
						const TARGET_NODE = getNodeById(
							edge.target,
							reactFlowInstance.getNodes()
						);
						const ACTION_NODES = NodeTypes.map((declaration) => {
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
		const currentNodes = reactFlowInstance.getNodes();
		currentNodes.map((node) => (node.selected ? selectedCount++ : null));
		if (selectedCount <= 1) {
			setCMBlockData(node);
			setContextMenuOrigin("block");
		} else {
			const selectedNodes = getSelectedNodes(currentNodes);
			setContextMenuOrigin("nodesselection");
			setCMBlockData(selectedNodes);
			setCMContainsReservedNodes(``);
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
		setCMContainsReservedNodes();
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
		const FRAGMENT_CHILDREN = reactFlowInstance
			.getNodes()
			.filter((node) => node.parentNode == PARENT_NODE);
		const FILTERED_CHILDREN_ARRAY = arr.filter((oNode) =>
			FRAGMENT_CHILDREN.map((cNode) => cNode.id).includes(oNode.id)
		);
		return [...FILTERED_CHILDREN_ARRAY, ...FRAGMENT_CHILDREN];
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
	const handleNodeCopy = (blockData = [], lmsResource = false) => {
		setShowContextualMenu(false);

		const selectedNodes = getSelectedNodes();

		const blockDataSet = [];
		if (blockData.length == 1) {
			blockDataSet.push(...blockData);
		}

		const SELECTED = deduplicateById([...blockDataSet, ...selectedNodes]);

		const CHILDREN_ARRAY = [];
		SELECTED.forEach((node) => {
			if (node.type == "fragment") {
				const fragmentID = node.id;
				const children = getChildrenNodesFromFragmentID(
					fragmentID,
					reactFlowInstance.getNodes()
				);
				CHILDREN_ARRAY.push(...children);
			}
		});

		const COMPLETE_SELECTION = deduplicateById([
			...CHILDREN_ARRAY,
			...SELECTED,
		]);

		const CLEANED_SELECTION = COMPLETE_SELECTION.map((node) => {
			delete node.dragging;
			delete node.width;
			delete node.height;
			delete node.positionAbsolute;
			delete node.selected;
			if (!lmsResource && node.data) {
				if (node.datalmsResource < 0) {
					delete node.lmsResource;
				}
			}
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
				{
					hideProgressBar: false,
					autoClose: 2000,
					type: "info",
					position: "bottom-center",
					theme: "light",
				}
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
						reactFlowInstance
							.getNodes()
							.some((node) => node.data.lmsResource == block.data.lmsResource)
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
							reactFlowInstance.getNodes().map((node) => node?.data?.label),
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
				createBlock(newBlocks[0], newBlocks[0].x, newBlocks[0].y);
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
	 * @param {Node[]} [blockData=[]] - The nodes to cut.
	 */
	const handleNodeCut = (blockData = []) => {
		const SELECTED_NODES = reactFlowInstance
			.getNodes()
			.filter((n) => n.selected == true);
		handleNodeCopy(blockData, true);
		if (SELECTED_NODES.length > 1) {
			handleNodeSelectionDeletion(SELECTED_NODES);
		} else {
			if (SELECTED_NODES.length == 1) {
				blockData = SELECTED_NODES[0];
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
									x: blockData.position.x + ASIDE_OFFSET + flowPos.x,
									y: blockData.position.y + ASIDE_OFFSET + flowPos.y,
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
		console.info(`❓ New block created: `, newBlockCreated);
		errorListCheck(newBlockCreated, errorList, setErrorList);

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
		const REACTFLOW_BOUNDS = reactFlowWrapper.current?.getBoundingClientRect();

		const PREFERRED_POSITION = contextMenuDOM
			? { x: currentMousePosition.x, y: currentMousePosition.y }
			: { x: cMX, y: cMY };

		let flowPos = reactFlowInstance.project({
			x: PREFERRED_POSITION.x - REACTFLOW_BOUNDS.left,
			y: PREFERRED_POSITION.y - REACTFLOW_BOUNDS.top,
		});

		const ASIDE_OFFSET = expandedAside
			? Math.floor(asideBounds.width / 125) * 125
			: 0;

		flowPos.x += ASIDE_OFFSET;
		const NEW_BLOCKS = clipboardData.map((blockData) => {
			return {
				...blockData,
				x: blockData.x + ASIDE_OFFSET + flowPos.x,
				y: blockData.y + ASIDE_OFFSET + flowPos.y,
				data: { ...blockData.data, order: Infinity },
			};
		});
		setShowContextualMenu(false);

		let newcurrentBlocksData = [...reactFlowInstance.getNodes(), ...NEW_BLOCKS];
		const FINAL_CURRENT_BLOCKSDATA = getUpdatedArrayById(
			clampNodesOrder(newcurrentBlocksData, platform),
			newcurrentBlocksData
		);

		errorListCheck(FINAL_CURRENT_BLOCKSDATA, errorList, setErrorList, false);

		reactFlowInstance.setNodes(FINAL_CURRENT_BLOCKSDATA);
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
			!SELECTED_NODES.filter(
				(node) => node.type == "fragment" || node.parentNode != undefined
			).length > 0
		) {
			if (SELECTED_NODES.length > 0) {
				console.log(
					SELECTED_NODES.map((node) =>
						getNodeById(node.id, reactFlowInstance.getNodes())
					)
				);

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

				const NEW_FRAGMENT = {
					id: NEW_FRAGMENT_ID,
					position: { x: minX, y: minY },
					type: "fragment",
					style: { height: maxY - minY + 68, width: maxX - minX + 68 },
					zIndex: -1,
					data: {
						label: "Nuevo Fragmento",
						innerNodes: INNER_NODES,
						expanded: true,
					},
				};

				const PRESENTED_NODES = SELECTED_NODES.map((node) => {
					node.parentNode = NEW_FRAGMENT_ID;
					node.expandParent = true;
					return JSON.parse(JSON.stringify(node));
				});

				// Get the nodes to preserve the conditions for
				const EXTERNAL_CHILDREN_NODES = JSON.parse(
					JSON.stringify(
						getExternalChildren(
							PRESENTED_NODES,
							reactFlowInstance
								.getNodes()
								.filter(
									(oNode) =>
										!SELECTED_NODES.map((pNode) => pNode.id).includes(oNode.id)
								)
						)
					)
				);

				//Delete the original nodes to put them after the fragment, so appear after the fragment and extendParent takes effect
				const FILTERED_NODES = deleteBlocks(
					reactFlowInstance
						.getNodes()
						.filter((oNode) =>
							SELECTED_NODES.map((pNode) => pNode.id).includes(oNode.id)
						)
				);

				reactFlowInstance.setNodes([
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

				const NEW_FRAGMENT = {
					id: uniqueId(),
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

				reactFlowInstance.setNodes([
					NEW_FRAGMENT,
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
		deleteElements([blockData], []);
	};

	/**
	 * Handles the deletion of multiple selected nodes.
	 */
	const handleNodeSelectionDeletion = () => {
		setShowContextualMenu(false);
		const SELECTED_NODES = getSelectedNodes();
		deleteElements(SELECTED_NODES, []);
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
			const CURRENT_GRADABLE_TYPE = getNodeTypeGradableType(origin, platform);

			if (
				platform != "moodle" ||
				(platform == "moodle" &&
					((CURRENT_GRADABLE_TYPE == "simple" && origin.data.g?.hasToBeSeen) ||
						(CURRENT_GRADABLE_TYPE != "simple" &&
							origin.data.g?.hasConditions)))
			) {
				const NEW_NODES_DATA = reactFlowInstance.getNodes();
				const ORIGINAL_INDEX = NEW_NODES_DATA.findIndex(
					(node) => node.id == origin.id
				);
				if (NEW_NODES_DATA[ORIGINAL_INDEX].data.children) {
					const IS_ALREADY_A_CHILDREN = NEW_NODES_DATA[
						ORIGINAL_INDEX
					].data.children.includes(end.id);
					if (!IS_ALREADY_A_CHILDREN) {
						if (NEW_NODES_DATA[ORIGINAL_INDEX].data.children) {
							NEW_NODES_DATA[ORIGINAL_INDEX].data.children.push(end.id);
						} else {
							NEW_NODES_DATA[ORIGINAL_INDEX].data.children.push(end.id);
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
					NEW_NODES_DATA[ORIGINAL_INDEX].data.children.push(end.id);
				}
				setRelationStarter();
				reactFlowInstance.setNodes(NEW_NODES_DATA);
				if (!validTypes.includes(end.type)) {
					const NEW_CONDITION = {
						id: parseInt(Date.now() * Math.random()).toString(),
						type: "completion",
						cm: origin.id,
						e: 1,
					};

					if (!end.data.c) {
						end.data.c = {
							type: "conditionsGroup",
							id: parseInt(Date.now() * Math.random()).toString(),
							op: "&",
							c: [NEW_CONDITION],
						};
					} else {
						end.data.c.c.push(NEW_CONDITION);
					}
				} else {
					const CONDITIONS = end.data.c?.c;

					let conditionExists = false;

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
								c: [NEW_CONDITION],
							};
						} else {
							end.data.c.c.push(NEW_CONDITION);
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
			const SELECTED_BLOCKS = reactFlowInstance
				.getNodes()
				.filter((block) => block.selected == true);
			if (SELECTED_BLOCKS.length == 1) {
				if (relationStarter == undefined) {
					setRelationStarter(SELECTED_BLOCKS[0]);

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
					handleNewRelation(relationStarter, SELECTED_BLOCKS[0]);
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
		console.info(`❓ Showing modal: `, modal);
		const SELECTED_NODES = getSelectedNodes();

		let newCMBlockData = undefined;
		if (SELECTED_NODES.length == 1 && cMBlockData == undefined) {
			newCMBlockData = SELECTED_NODES[0];
		}

		if (newCMBlockData || cMBlockData) {
			if (SELECTED_NODES.length == 1 && cMBlockData == undefined) {
				setCMBlockData(newCMBlockData);
			}

			if (metaData.platform == "moodle") {
				if (modal == "conditions") setShowConditionsModal(true);
				if (modal == "grades") setShowGradeConditionsModal(true);
			} else if (metaData.platform == "sakai") {
				if (modal == "requisites") setShowRequisitesModal(true);
			}

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
		const FRAGMENT_NODES = getByProperty(
			"type",
			"fragment",
			reactFlowInstance.getNodes()
		).filter((fragment) => fragment.data.expanded == true);
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
				nodeTypes={NODE_TYPES}
				edgeTypes={EDGE_TYPES}
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
			{showConditionsModal && metaData.platform == "moodle" && (
				<>
					{!validTypes.includes(cMBlockData.type) ? (
						<ConditionModalMoodle
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
			{showGradeConditionsModal && metaData.platform == "moodle" && (
				<>
					{!validTypes.includes(cMBlockData.type) && (
						<QualificationModal
							blockData={cMBlockData}
							onEdgesDelete={onEdgesDelete}
							showConditionsModal={showGradeConditionsModal}
							setShowConditionsModal={setShowGradeConditionsModal}
						/>
					)}
				</>
			)}

			{showRequisitesModal && metaData.platform == "sakai" && (
				<RequisiteModalSakai
					blockData={cMBlockData}
					setBlockData={setCMBlockData}
					blocksData={reactFlowInstance.getNodes()}
					onEdgesDelete={onEdgesDelete}
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
