import { getNodeById } from "@utils/Nodes";
import { Platforms } from "@utils/Platform";
import { getByProperty, parseDate } from "@utils/Utils";
import { MetaDataContext } from "pages/_app";
import React, { useEffect, useState } from "react";
import { useContext } from "react";
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
	const { metaData } = useContext(MetaDataContext);
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

	useEffect(() => {
		const SHOULD_ANIMATE = lineType == "or" ? true : false;
		setAnimatedLine(lineType == "or" ? true : false);
		animated = SHOULD_ANIMATE;
		rfEdges.find((edge) => edge.id == id).animated = SHOULD_ANIMATE;
	}, [lineType]);

	// FIXME: GET ALL CHILDREN AND SHOW ONLY 2 CONDITIONS MAX
	const getSelfCondition = () => {
		const TARGET_NODE = getNodeById(target, rfNodes);
		const SOURCE_NODE = getNodeById(source, rfNodes);
		//console.log(targetNode, sourceNode);

		switch (metaData.platform) {
			case Platforms.Moodle:
				if (TARGET_NODE && TARGET_NODE.data && TARGET_NODE.data.c) {
					const CONDITIONS = TARGET_NODE.data.c;
					let condition = undefined;
					if (TARGET_NODE.type !== "badge") {
						condition = findConditionById(SOURCE_NODE.id, CONDITIONS.c);
					} else {
						condition = findConditionById(SOURCE_NODE.id, CONDITIONS.params);
					}

					if (condition) {
						if (SOURCE_NODE && SOURCE_NODE.data && SOURCE_NODE.data.label) {
							return getReadableCondition(condition, source);
						}
					}
				}
				break;
			case Platforms.Sakai:
				if (SOURCE_NODE && TARGET_NODE && TARGET_NODE.data.g) {
					const CONDITION = findConditionByParentId(
						TARGET_NODE.data.g.subConditions,
						SOURCE_NODE.id
					);

					return getReadableCondition(CONDITION, source);
				}
				break;
		}
	};
	const getReadableCondition = (condition, source) => {
		switch (condition?.type) {
			case "grade":
				switch (metaData.platform) {
					case Platforms.Moodle:
						if (condition.min && condition.max) {
							return `>= ${condition.min} y < ${condition.max} `;
						} else {
							if (condition.min) {
								return `>= ${condition.min}`;
							} else {
								return `< ${condition.max}`;
							}
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
				} else if (condition.params) {
					//TODO: CHANGE THIS
					const SOURCE_NODE = getNodeById(source, rfNodes);
					const MATCHING_CONDITION = condition.params.find(
						(node) => node.id === SOURCE_NODE.id
					);

					if (MATCHING_CONDITION) {
						switch (condition.op) {
							case "|":
								if (lineType != "OR") setLineType("OR");

							case "&":
								if (lineType != "AND") setLineType("AND");
						}

						if (MATCHING_CONDITION?.date) {
							return `Completado antes del
							${parseDate(MATCHING_CONDITION.date)}`;
						} else {
							return `Completado`;
						}
					} else {
						return `Completado`;
					}
				} else {
					return `Sin completar`;
				}
				break;
			case "SCORE":
			case Platforms.Sakai:
				switch (condition.operator) {
					case "SMALLER_THAN":
						return `< ${condition.argument}`;
					case "SMALLER_THAN_OR_EQUAL_TO":
						return `<= ${condition.argument}`;
					case "EQUAL_TO":
						return `= ${condition.argument}`;
					case "GREATER_THAN_OR_EQUAL_TO":
						return `>= ${condition.argument}`;
					case "GREATER_THAN":
						return `> ${condition.argument}`;
				}
		}
	};

	function findConditionById(id, conditions) {
		if (!conditions) {
			return null;
		}

		const FOUND_CONDITION = conditions.find((condition) => condition.cm === id);
		//console.log(conditions);
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

	function findParent(jsonObj, id) {
		if (jsonObj.id === id) {
			return null;
		}

		if (jsonObj.c) {
			for (let child of jsonObj.c) {
				if (child.id === id) {
					return jsonObj;
				} else if (child.type === "conditionsGroup") {
					const PARENT = findParent(child, id);
					if (PARENT) {
						return PARENT;
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
					const FOUND_CHILDREN = findChildren(child, id, excludedId);
					if (FOUND_CHILDREN.length > 0) {
						children = children.concat(FOUND_CHILDREN); // Found children in the child's subtree
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

	const [label, setLabel] = useState<string>();
	const [width, setWidth] = useState<string>();

	useEffect(() => {
		setLabel(getSelfCondition());
	}, [JSON.stringify(getNodeById(target, rfNodes))]);

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
							background: "var(--blockflow-edge-background-color)",
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
