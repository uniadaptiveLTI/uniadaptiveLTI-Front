import React, { useCallback } from "react";
import ReactFlow, {
	addEdge,
	MiniMap,
	Controls,
	Background,
	useNodesState,
	useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";

const initialNodes = [
	{
		id: "1",
		type: "questionnaire",
		data: {
			label: "Inicio",
		},
		position: { x: 0, y: 0 },
	},
	{
		id: "2",
		data: {
			label: "Ejercicio",
		},
		position: { x: 100, y: -100 },
	},
	{
		id: "3",
		type: "output",
		data: {
			label: "No Ejercicio",
		},
		position: { x: 100, y: 100 },
	},
];

const initialEdges = [
	{ id: "e1-2", source: "2", target: "1", label: "Equisde" },
	{ id: "e1-3", source: "1", target: "3", animated: true },
];

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
			return "btn-info ";
		case "forum":
			return "purple";
		case "file":
			return "btn-primary ";
		case "folder":
			return "btn-warning ";
		case "url":
			return "cadetblue";
		//Moodle
		case "workshop":
			return "#15a935";
		case "inquery":
			return "btn-danger ";
		case "tag":
			return "#a91568";
		case "page":
			return "btn-secondary ";
		case "badge":
			return "btn-success ";
		//Sakai
		case "exam":
			return "btn-danger ";
		case "contents":
			return "#15a935";
		case "text":
			return "btn-secondary ";
		case "html":
			return "#a91568";
		//LTI
		case "start":
			return "btn-danger ";
		case "end":
			return "btn-danger ";
		case "fragment":
			return "darkblue";
		default:
			return "btn-warning ";
	}
};

const OverviewFlow = () => {
	const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
	const onConnect = useCallback(
		(params) => setEdges((eds) => addEdge(params, eds)),
		[]
	);

	// we are using a bit of a shortcut here to adjust the edge type
	// this could also be done with a custom edge for example
	const edgesWithUpdatedTypes = edges.map((edge) => {
		if (edge.sourceHandle) {
			const edgeType = nodes.find((node) => node.type === "custom").data
				.selects[edge.sourceHandle];
			edge.type = edgeType;
		}

		return edge;
	});

	return (
		<ReactFlow
			nodes={nodes}
			edges={edgesWithUpdatedTypes}
			onNodesChange={onNodesChange}
			onEdgesChange={onEdgesChange}
			onConnect={onConnect}
			onInit={onInit}
			fitView
			proOptions={{ hideAttribution: true }}
			attributionPosition="top-right"
			//nodeTypes={nodeTypes}
		>
			<MiniMap nodeColor={nodeColor} style={minimapStyle} zoomable pannable />
			<Controls />
			<Background color="#aaa" gap={16} />
		</ReactFlow>
	);
};

export default OverviewFlow;
