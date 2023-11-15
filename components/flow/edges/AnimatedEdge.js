import React from "react";
import { Handle, getBezierPath, getMarkerEnd } from "reactflow";

const AnimatedEdge =
	(clickedEdgeId) =>
	({
		id,
		sourceX,
		sourceY,
		targetX,
		targetY,
		sourcePosition,
		targetPosition,
		style = {},
	}) => {
		const EDGE_PATH = getBezierPath({
			sourceX,
			sourceY,
			targetX,
			targetY,
			sourcePosition,
			targetPosition,
		});

		// Animation properties
		const ANIMATION_DURATION = "0.5s";
		const ANIMATION_DELAY = "0.1s";

		const ANIMATED_STYLE = {
			animation:
				clickedEdgeId === id
					? `fade-in ${ANIMATION_DURATION} linear ${ANIMATION_DELAY}`
					: "none",
			...style,
		};

		return (
			<>
				<path
					id={id}
					style={ANIMATED_STYLE}
					className="react-flow__edge-path"
					d={EDGE_PATH}
					markerEnd={getMarkerEnd()}
					onClick={() => clickedEdgeId !== id && clickedEdgeId(id)}
				/>
				<path
					style={ANIMATED_STYLE}
					className="react-flow__edge-path animated"
					d={EDGE_PATH}
					markerEnd={getMarkerEnd()}
					onClick={() => clickedEdgeId !== id && clickedEdgeId(id)}
				/>
				<g>
					<circle
						cx={targetX}
						cy={targetY}
						r={10}
						fill="transparent"
						stroke="transparent"
					/>
					<Handle
						type="target"
						position={targetPosition}
						style={ANIMATED_STYLE}
					/>
				</g>
			</>
		);
	};

export default AnimatedEdge;
