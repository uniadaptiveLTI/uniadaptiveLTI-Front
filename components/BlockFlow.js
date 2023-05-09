import React, {
	forwardRef,
	useContext,
	useEffect,
	useRef,
	useState,
	useCallback,
} from "react";
import ReactFlow, {
	MiniMap,
	Controls,
	Background,
	useNodesState,
	useEdgesState,
	ControlButton,
} from "reactflow";
import "reactflow/dist/style.css";
import ActionNode from "./flow/nodes/ActionNode.js";
import ElementNode from "./flow/nodes/ElementNode.js";
import {
	BlockInfoContext,
	BlocksDataContext,
	DeleteEdgeContext,
	ExpandedAsideContext,
	PlatformContext,
	ReactFlowInstanceContext,
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
import { PaneContextMenuPositionContext } from "./BlockCanvas.js";
import { Button } from "react-bootstrap";
import { getBlockById, getNodeById, getUpdatedArrayById } from "./Utils.js";

const minimapStyle = {
	height: 120,
};

const nodeTypes = {
	badge: ActionNode,
	quiz: ElementNode,
	assign: ElementNode,
	forum: ElementNode,
	resource: ElementNode,
	folder: ElementNode,
	url: ElementNode,
	// Moodle
	workshop: ElementNode,
	choice: ElementNode,
	label: ElementNode,
	page: ElementNode,
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

const OverviewFlow = ({ map, deleteBlocks, setShowContextualMenu }, ref) => {
	const { deletedEdge, setDeletedEdge } = useContext(DeleteEdgeContext);
	const { expandedAside, setExpandedAside } = useContext(ExpandedAsideContext);
	const { paneContextMenuPosition, setPaneContextMenuPosition } = useContext(
		PaneContextMenuPositionContext
	);
	const { currentBlocksData, setCurrentBlocksData } =
		useContext(BlocksDataContext);
	const { blockSelected, setBlockSelected } = useContext(BlockInfoContext);
	const { reactFlowInstance, setReactFlowInstance } = useContext(
		ReactFlowInstanceContext
	);
	const { settings, setSettings } = useContext(SettingsContext);

	const parsedSettings = JSON.parse(settings);
	let { autoHideAside } = parsedSettings;

	const [newInitialNodes, setNewInitialNodes] = useState([]);
	const [newInitialEdges, setNewInitialEdges] = useState([]);
	const [minimap, setMinimap] = useState(true);
	const [interactive, setInteractive] = useState(true);
	const [snapToGrid, setSnapToGrid] = useState(true);

	const [nodes, setNodes, onNodesChange] = useNodesState(newInitialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(newInitialEdges);

	const draggedNodePosition = useRef(null);
	const draggedNodesPosition = useRef(null);

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
			<div
				className="react-flow__controls"
				style={{
					position: "absolute",
					bottom: "5px",
					left: "5px",
					display: "flex",
					flexDirection: "column",
				}}
			>
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
		setReactFlowInstance(reactFlowInstance);
	};

	const handleNodeDragStart = (event, node) => {
		setShowContextualMenu(false);
		let inFragment = false;
		if (node.parentNode != undefined) {
			inFragment = true;
		}
		setSnapToGrid(!inFragment);
		draggedNodePosition.current = node.position;
	};

	const onSelectionDragStart = (event, nodes) => {
		setShowContextualMenu(false);
		draggedNodesPosition.current = nodes[0].position;
	};

	const onSelectionDragStop = (event, nodes) => {
		if (
			draggedNodesPosition.current &&
			(draggedNodesPosition.current.x !== nodes[0].position.x ||
				draggedNodesPosition.current.y !== nodes[0].position.y)
		) {
			//FIXME:LOOK IF NECESSARY
			const selectionBlock = nodes.map((b) => ({
				b,
			}));
			reactFlowInstance.setNodes(
				getUpdatedArrayById(selectionBlock, reactFlowInstance.getNodes())
			);
		}
	};

	const onNodeDragStop = (event, node) => {
		if (node) {
			if (
				draggedNodePosition.current.x !== node.position.x ||
				draggedNodePosition.current.y !== node.position.y
			) {
				reactFlowInstance.setNodes(
					getUpdatedArrayById(node, reactFlowInstance.getNodes())
				);
				setSnapToGrid(true);
			}
		}
	};

	const onPaneClick = () => {
		if (autoHideAside) {
			setExpandedAside(false);
		}
		setSnapToGrid(true);
	};

	const onConnect = (event) => {
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

		setCurrentBlocksData(
			getUpdatedArrayById({ ...sourceNode }, currentBlocksData)
		);

		//FIXME:
		setEdges([
			...edges,
			{
				id: sourceNodeId + "-" + targetNodeId,
				source: sourceNodeId,
				target: targetNodeId,
			},
		]);

		console.log(sourceNode);
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

	const onLoad = () => {};

	useEffect(() => {
		setNewInitialNodes(
			map?.map((block) => ({
				...block,
				extent: block.parent ? "parent" : undefined,
				//draggable: block.parent ? false : true,
			}))
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
				onNodeClick={() => setSnapToGrid(true)}
				onPaneClick={onPaneClick}
				onConnect={onConnect}
				onInit={onInit}
				onLoad={onLoad}
				onMoveStart={() => setShowContextualMenu(false)}
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
			<CustomControls />
		</div>
	);
};
const OverviewFlowWithRef = forwardRef(OverviewFlow);
OverviewFlowWithRef.displayName = "OverviewFlow";
export default OverviewFlowWithRef;
