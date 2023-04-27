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
import { useHotkeys } from "react-hotkeys";
import "reactflow/dist/style.css";
import ActionNode from "./flow/nodes/ActionNode.js";
import ElementNode from "./flow/nodes/ElementNode.js";
import {
	BlockInfoContext,
	BlockJsonContext,
	DeleteEdgeContext,
	ExpandedContext,
	PlatformContext,
	ReactFlowInstanceContext,
	SettingsContext,
} from "@components/pages/_app.js";
import FinalNode from "./flow/nodes/FinalNode.js";
import InitialNode from "./flow/nodes/InitialNode.js";
import FragmentNode from "./flow/nodes/InitialNode.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMap, faX } from "@fortawesome/free-solid-svg-icons";
import { PaneContextMenuPositionContext } from "./BlockCanvas.js";

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

const OverviewFlow = ({ map, deleteBlocks }, ref) => {
	const { blockJson, setBlockJson } = useContext(BlockJsonContext);
	const { deletedEdge, setDeletedEdge } = useContext(DeleteEdgeContext);
	const { expanded, setExpanded } = useContext(ExpandedContext);
	const { paneContextMenuPosition, setPaneContextMenuPosition } = useContext(
		PaneContextMenuPositionContext
	);
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

	const [nodes, setNodes, onNodesChange] = useNodesState(newInitialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(newInitialEdges);

	const draggedNodePosition = useRef(null);
	const draggedNodesPosition = useRef(null);

	const reactFlowWrapper = useRef(null);

	const { platform } = useContext(PlatformContext);

	const toggleMinimap = () => setMinimap(!minimap);

	function CustomControls() {
		return (
			<Controls>
				<ControlButton title="Toggle Minimap" onClick={toggleMinimap}>
					{!minimap && <FontAwesomeIcon icon={faMap} />}
					{minimap && (
						<div
							style={{
								position: "relative",
								padding: "none",
								display: "flex",
								justifyContent: "center",
								alignItems: "center",
							}}
						>
							<FontAwesomeIcon
								icon={faX}
								style={{ position: "absolute", top: "0" }}
							/>
							<FontAwesomeIcon icon={faMap} />
						</div>
					)}
				</ControlButton>
			</Controls>
		);
	}

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
					default:
						return "#11A676";
				}
				break;
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
		draggedNodePosition.current = node.position;
	};

	const onSelectionDragStart = (event, nodes) => {
		draggedNodesPosition.current = nodes[0].position;
	};

	const onSelectionDragStop = (event, nodes) => {
		if (
			draggedNodesPosition.current &&
			(draggedNodesPosition.current.x !== nodes[0].position.x ||
				draggedNodesPosition.current.y !== nodes[0].position.y)
		) {
			const selectionBlockJson = nodes.map((b) => ({
				id: b.id,
				x: b.position.x,
				y: b.position.y,
				type: b.type,
				title: b.data.label,
				children: b.data.children,
				identation: b.data.identation,
				conditions: b.data.conditions,
				order: b.data.order,
				unit: b.data.unit,
			}));
			setBlockJson(selectionBlockJson);
		}
	};

	const onNodeDragStop = (event, node) => {
		if (node) {
			if (
				draggedNodePosition.current.x !== node.position.x ||
				draggedNodePosition.current.y !== node.position.y
			) {
				setBlockJson({
					id: node.id,
					x: node.position.x,
					y: node.position.y,
					type: node.type,
					title: node.data.label,
					children: node.data.children,
					identation: node.data.identation,
					conditions: node.data.conditions,
					order: node.data.order,
					unit: node.data.unit,
				});
			}
		}
	};

	const onPaneClick = () => {
		if (autoHideAside) {
			setExpanded(false);
		}
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

		setBlockJson({
			id: sourceNode.id,
			x: sourceNode.x,
			y: sourceNode.y,
			type: sourceNode.type,
			title: sourceNode.title,
			children: sourceNode.children,
			identation: sourceNode.identation,
			order: sourceNode.order,
			unit: sourceNode.unit,
		});
	};

	useEffect(() => {
		setNodes(newInitialNodes);
		setEdges(newInitialEdges);
	}, [newInitialNodes, newInitialEdges]);

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
			map.map((block) => ({
				id: block.id,
				type: block.type,
				data: {
					label: block.title,
					identation: block.identation,
					children: block.children,
					conditions: block.conditions,
					order: block.order,
					unit: block.unit,
				},
				position: { x: block.x, y: block.y },
			}))
		);

		setNewInitialEdges(
			map.flatMap((parent) => {
				if (parent.children) {
					return parent.children.map((child) => {
						return {
							id: `e${parent.id}-${child}`,
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
	const edgesWithUpdatedTypes = edges.map((edge) => {
		if (edge.sourceHandle) {
			const edgeType = nodes.find((node) => node.type === "custom").data
				.selects[edge.sourceHandle];
			edge.type = edgeType;
		}

		if (edge.conditions != undefined) {
			for (let condition of cedge.conditions) {
				edge.label = "" + condition.operand + condition.objective;
			}
		}

		return edge;
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
				onPaneClick={onPaneClick}
				onConnect={onConnect}
				onInit={onInit}
				onLoad={onLoad}
				fitView
				proOptions={{ hideAttribution: true }}
				nodeTypes={nodeTypes}
				snapGrid={[125, 175]}
				//connectionLineComponent={}
				snapToGrid={true}
				deleteKeyCode={["Backspace", "Delete", "d"]}
				multiSelectionKeyCode={["Shift"]}
				selectionKeyCode={["Shift"]}
			>
				{minimap && (
					<MiniMap
						nodeColor={nodeColor}
						style={minimapStyle}
						zoomable
						pannable
					/>
				)}
				<CustomControls />
				<Background color="#aaa" gap={16} />
			</ReactFlow>
		</div>
	);
};
const OverviewFlowWithRef = forwardRef(OverviewFlow);
OverviewFlowWithRef.displayName = "OverviewFlow";
export default OverviewFlowWithRef;
