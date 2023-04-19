import React, {
	forwardRef,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import ReactFlow, {
	addEdge,
	MiniMap,
	Controls,
	Background,
	useNodesState,
	useEdgesState,
	MarkerType,
	SmoothStepEdge,
	ControlButton,
} from "reactflow";
import { useHotkeys } from "react-hotkeys";
import "reactflow/dist/style.css";
import ActionNode from "./flow/nodes/ActionNode.js";
import ElementNode from "./flow/nodes/ElementNode.js";
import {
	BlockJsonContext,
	BlocksDataContext,
	VersionInfoContext,
} from "@components/pages/_app.js";
import FinalNode from "./flow/nodes/FinalNode.js";
import InitialNode from "./flow/nodes/InitialNode.js";
import { SaveFill, MapFill, XLg } from "react-bootstrap-icons";

const minimapStyle = {
	height: 120,
};

const onInit = (reactFlowInstance) =>
	console.log("flow loaded:", reactFlowInstance);

const nodeColor = (node) => {
	//TODO: Add the rest
	switch (node.type) {
		//Moodle + Sakai
		case "questionnaire":
			return "#eb9408";
		case "assignment":
			return "#0dcaf0";
		case "forum":
			return "#800080";
		case "file":
			return "#0d6efd";
		case "folder":
			return "#ffc107";
		case "url":
			return "#5f9ea0";
		//Moodle
		case "workshop":
			return "#15a935";
		case "inquery":
			return "#dc3545";
		case "tag":
			return "#a91568";
		case "page":
			return "#6c757d";
		case "badge":
			return "#198754";
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
};

const nodeTypes = {
	start: InitialNode,
	end: FinalNode,
	badge: ActionNode,
	questionnaire: ElementNode,
	assignment: ElementNode,
	forum: ElementNode,
	file: ElementNode,
	folder: ElementNode,
	url: ElementNode,
	// Moodle
	workshop: ElementNode,
	inquery: ElementNode,
	tag: ElementNode,
	page: ElementNode,
	// Sakai
	exam: ElementNode,
	contents: ElementNode,
	text: ElementNode,
	html: ElementNode,
};

const OverviewFlow = ({ map }, ref) => {
	const { blockJson, setBlockJson } = useContext(BlockJsonContext);

	const [newInitialNodes, setNewInitialNodes] = useState([]);
	const [newInitialEdges, setNewInitialEdges] = useState([]);
	const [minimap, setMinimap] = useState(true);

	const [nodes, setNodes, onNodesChange] = useNodesState(newInitialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(newInitialEdges);

	const draggedNodePosition = useRef(null);

	const toggleMinimap = () => setMinimap(!minimap);

	function CustomControls() {
		return (
			<Controls>
				<ControlButton title="Save">
					<SaveFill />
				</ControlButton>
				<ControlButton title="Toggle Minimap" onClick={toggleMinimap}>
					{!minimap && <MapFill />}
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
							<XLg style={{ position: "absolute", top: "0", color: "white" }} />
							<MapFill />
						</div>
					)}
				</ControlButton>
			</Controls>
		);
	}

	const handleNodeDragStart = (event, node) => {
		draggedNodePosition.current = node.position;
	};

	const onNodeDragStop = (event, node) => {
		if (
			draggedNodePosition.current &&
			(draggedNodePosition.current.x !== node.position.x ||
				draggedNodePosition.current.y !== node.position.y)
		) {
			setBlockJson({
				id: parseInt(node.id),
				x: node.position.x,
				y: node.position.y,
				type: node.type,
				title: node.data.label,
				children: node.children,
				identation: node.data.identation,
				conditions: node.data.conditions,
			});
		}
	};

	const onConnect = (event) => {
		const sourceNodeId = parseInt(event.source.split("__")[0]);
		const targetNodeId = parseInt(event.target.split("__")[0]);

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
		});
	};

	useEffect(() => {
		setNodes(newInitialNodes);
		setEdges(newInitialEdges);
	}, [newInitialNodes, newInitialEdges]);

	useEffect(() => {
		setNewInitialNodes(
			map.map((block) => ({
				id: block.id.toString(),
				type: block.type,
				data: {
					label: block.title,
					identation: block.identation,
				},
				position: { x: block.x, y: block.y },
				children: block.children,
			}))
		);

		setNewInitialEdges(
			map.flatMap((parent) => {
				if (parent.children) {
					return parent.children.map((child) => {
						return {
							id: `e${parent.id}-${child}`,
							source: parent.id.toString(),
							target: child.toString(),
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
		<ReactFlow
			ref={ref}
			nodes={nodes}
			edges={edgesWithUpdatedTypes}
			onNodeDragStart={handleNodeDragStart}
			onNodeDragStop={onNodeDragStop}
			onNodesChange={onNodesChange}
			onEdgesChange={onEdgesChange}
			onConnect={onConnect}
			onInit={onInit}
			fitView
			proOptions={{ hideAttribution: true }}
			nodeTypes={nodeTypes}
			snapGrid={[125, 125]}
			//connectionLineComponent={}
			snapToGrid={true}
			deleteKeyCode={"Delete"}
		>
			{minimap && (
				<MiniMap nodeColor={nodeColor} style={minimapStyle} zoomable pannable />
			)}
			<CustomControls />
			<Background color="#aaa" gap={16} />
		</ReactFlow>
	);
};
const OverviewFlowWithRef = forwardRef(OverviewFlow);
OverviewFlowWithRef.displayName = "OverviewFlow";
export default OverviewFlowWithRef;
