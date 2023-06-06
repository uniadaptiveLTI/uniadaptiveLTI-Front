import { getNodeById } from "@utils/Nodes";
import { getByProperty } from "@utils/Utils";
import React, { useEffect, useState } from "react";
import {
	BaseEdge,
	EdgeLabelRenderer,
	getBezierPath,
	useNodes,
} from "reactflow";

const ConditionalEdge = ({
	id,
	source,
	target,
	sourceX,
	sourceY,
	targetX,
	targetY,
	sourcePosition,
	targetPosition,
	style = {},
}) => {
	const [edgePath, labelX, labelY] = getBezierPath({
		sourceX,
		sourceY,
		sourcePosition,
		targetX,
		targetY,
		targetPosition,
	});

	const rfNodes = useNodes();

	const getSelfCondition = () => {
		const targetNode = getNodeById(target, rfNodes);
		if (targetNode && targetNode.data && targetNode.data.conditions) {
			const conditions = targetNode.data.conditions;
			const flattenedConditions = conditions.conditions.flat(Infinity);
			const connectionCondition = getByProperty(
				"op",
				source,
				flattenedConditions
			)[0];
			if (connectionCondition) {
				const sourceNode = getNodeById(source, rfNodes);
				if (sourceNode && sourceNode.data && sourceNode.data.label) {
					return getReadableCondition(connectionCondition);
				}
			}
		}
	};

	const getReadableCondition = (condition) => {
		switch (condition.type) {
			case "qualification":
				if (condition.objective && condition.objective2) {
					return `>= ${condition.objective} y < ${condition.objective2} `;
				} else {
					if (condition.objective) {
						return `>= ${condition.objective}`;
					} else {
						return `< ${condition.objective2}`;
					}
				}
			case "completion":
				switch (condition.query) {
					case "notCompleted":
						return `Sin completar`;
					case "completedApproved":
						return `Aprobado`;
					case "completedFailed":
						return `Suspendido`;
				}
				break;
		}
	};

	const [label, setLabel] = useState(getSelfCondition());

	useEffect(() => {
		setLabel(getSelfCondition());
	}, [getNodeById(target, rfNodes)]);

	return (
		<>
			<BaseEdge path={edgePath} style={style} />
			{label && (
				<EdgeLabelRenderer>
					<div
						style={{
							position: "absolute",
							transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
							maxWidth: Math.max(sourceX - targetX, targetX - sourceX) + "px",
							fontSize: "0.7em",
							textAlign: "center",
							overflow: "hidden",
							padding: "0.5em",
							background: "var(--blockflow-edge-background)",
							color: "var(--blockflow-edge-font-color)",
							border: "var(--blockflow-edge-border)",
							borderRadius: "var(--blockflow-edge-border-radius)",
						}}
						className="nodrag nopan"
					>
						{label}
					</div>
				</EdgeLabelRenderer>
			)}
		</>
	);
};

export default ConditionalEdge;
