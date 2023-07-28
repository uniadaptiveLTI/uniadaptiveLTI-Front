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
		const edgePath = getBezierPath({
			sourceX,
			sourceY,
			targetX,
			targetY,
			sourcePosition,
			targetPosition,
		});

		// Animation properties
		const animationDuration = "0.5s";
		const animationDelay = "0.1s";

		const animatedStyle = {
			animation:
				clickedEdgeId === id
					? `fade-in ${animationDuration} linear ${animationDelay}`
					: "none",
			...style,
		};

		return (
			<>
				<path
					id={id}
					style={animatedStyle}
					className="react-flow__edge-path"
					d={edgePath}
					markerEnd={getMarkerEnd()}
					onClick={() => clickedEdgeId !== id && clickedEdgeId(id)}
				/>
				<path
					style={animatedStyle}
					className="react-flow__edge-path animated"
					d={edgePath}
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
						style={animatedStyle}
						onConnect={(params) => console.log("handle onConnect", params)}
					/>
				</g>
			</>
		);
	};

export default AnimatedEdge;
