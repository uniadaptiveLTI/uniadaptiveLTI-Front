import { getNodeById } from "@utils/Nodes";
import { getByProperty, transformDate } from "@utils/Utils";
import React, { useEffect, useState } from "react";
import {
	BaseEdge,
	EdgeLabelRenderer,
	getBezierPath,
	useNodes,
	useEdges,
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
	animated,
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
	const rfEdges = useEdges();
	const [lineType, setLineType] = useState("and");
	const [animatedLine, setAnimatedLine] = useState(false);

	useEffect(() => {
		const shouldAnimate = lineType == "or" ? true : false;
		setAnimatedLine(lineType == "or" ? true : false);
		animated = shouldAnimate;
		rfEdges.find((edge) => edge.id == id).animated = shouldAnimate;
	}, [lineType]);

	// FIXME: GET ALL CHILDREN AND SHOW ONLY 2 CONDITIONS MAX
	const getSelfCondition = () => {
		const targetNode = getNodeById(target, rfNodes);
		const sourceNode = getNodeById(source, rfNodes);

		if (targetNode && targetNode.data && targetNode.data.c) {
			const conditions = targetNode.data.c;
			const condition = findConditionById(sourceNode.id, conditions.c);
			const parentCondition = findParent(conditions, condition?.id);
			if (condition) {
				const sourceNode = getNodeById(source, rfNodes);
				if (sourceNode && sourceNode.data && sourceNode.data.label) {
					return getReadableCondition(condition);
				}
			}
		}
	};

	const getReadableCondition = (condition) => {
		switch (condition.type) {
			case "grade":
				if (condition.min && condition.max) {
					return `>= ${condition.min} y < ${condition.max} `;
				} else {
					if (condition.min) {
						return `>= ${condition.min}`;
					} else {
						return `< ${condition.max}`;
					}
				}
			case "completion":
				if (condition.e) {
					switch (condition.e) {
						case 1:
							return `Completado`;
						case 2:
							return `Aprobado`;
						case 3:
							return `Suspendido`;
					}
				} else if (condition.activityList) {
					//TODO: CHANGE THIS
					const sourceNode = getNodeById(source, rfNodes);
					const matchingCondition = condition.activityList.find(
						(node) => node.id === sourceNode.id
					);

					switch (condition.op) {
						case "|":
							if (lineType != "or") setLineType("or");

						case "&":
							if (lineType != "and") setLineType("and");
					}

					if (matchingCondition.date) {
						return (
							<>
								Completado antes del <br></br>{" "}
								{transformDate(matchingCondition.date)}
								<br />
							</>
						);
					} else {
						return `Completado`;
					}
				} else {
					return `Sin completar`;
				}
				break;
		}
	};

	function findConditionById(id, conditions) {
		if (!conditions) {
			return null;
		}

		const foundCondition = conditions.find((condition) => condition.cm === id);
		if (foundCondition) {
			return foundCondition;
		} else {
			const foundActionCondition = conditions.find((condition) =>
				Array.isArray(condition.activityList)
			);
			if (foundActionCondition) return foundActionCondition;
		}

		for (const condition of conditions) {
			if (condition.c) {
				const innerCondition = findConditionById(id, condition.c);
				if (innerCondition) {
					return innerCondition;
				}
			}
		}

		return null;
	}

	function findParent(jsonObj, id) {
		if (jsonObj.id === id) {
			return null;
		}

		if (jsonObj.c) {
			for (let child of jsonObj.c) {
				if (child.id === id) {
					return jsonObj;
				} else if (child.type === "conditionsGroup") {
					const parent = findParent(child, id);
					if (parent) {
						return parent;
					}
				}
			}
		}

		return null;
	}

	function findChildren(jsonObj, id, excludedId) {
		let children = [];

		if (jsonObj.c) {
			for (let child of jsonObj.c) {
				if (child.id === id) {
					continue; // Skip the child with the given ID
				}
				if (child.type === "conditionsGroup") {
					const foundChildren = findChildren(child, id, excludedId);
					if (foundChildren.length > 0) {
						children = children.concat(foundChildren); // Found children in the child's subtree
					}
				}
				children.push(child); // Add the child to the result
			}
		}

		return children;
	}

	const getSelfWidth = () => {
		if (Math.max(sourceY - targetY, targetY - sourceY) < 200) {
			return Math.max(sourceX - targetX, targetX - sourceX) + "px";
		} else {
			return "100%";
		}
	};

	const [label, setLabel] = useState(getSelfCondition());

	const [width, setWidth] = useState(getSelfWidth());

	useEffect(() => {
		setLabel(getSelfCondition());
	}, [getNodeById(target, rfNodes)]);

	useEffect(() => {
		setWidth(getSelfWidth);
	}, [getNodeById(source, rfNodes), getNodeById(target, rfNodes)]);

	return (
		<>
			<BaseEdge path={edgePath} style={style} />
			{label && (
				<EdgeLabelRenderer>
					<div
						style={{
							position: "absolute",
							transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
							maxWidth: width,
							fontSize: "0.7em",
							textAlign: "center",
							overflow: "hidden",
							padding: "0.5em",
							background: "var(--blockflow-edge-background)",
							color: "var(--blockflow-edge-font-color)",
							border: "var(--blockflow-edge-border)",
							borderRadius: "var(--blockflow-edge-border-radius)",
							whiteSpace: "nowrap",
							textOverflow: "ellipsis",
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
