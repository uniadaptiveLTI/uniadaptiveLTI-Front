import { INode } from "@components/interfaces/INode";
import { ISendNodesPayload } from "../ExportPane";
import {
	IMoodleElementConditionsGroup,
	MoodleAllConditionTypes,
} from "@components/interfaces/INodeConditionsMoodle";
import { parseMoodleBadgeToExport } from "@utils/Moodle";
import { IMetaData } from "@components/interfaces/IMetaData";

function manageShowC(nodeArray: Array<INode>): Array<INode> {
	function deleteRecursiveShowC(
		conditionArray: Array<MoodleAllConditionTypes>
	) {
		conditionArray.forEach((condition) => {
			if (
				"c" in condition &&
				condition.hasOwnProperty("c") &&
				Array.isArray(condition.c)
			) {
				deleteRecursiveShowC(condition.c);
			}
			if ("showc" in condition && condition.hasOwnProperty("showc")) {
				delete condition.showc;
			}
		});
	}

	function setFixShowCMode(
		ConditionsGroup: IMoodleElementConditionsGroup
	): IMoodleElementConditionsGroup {
		enum ReplaceModes {
			Group = "GROUP",
			FirstLevel = "FIRST_LEVEL",
		}
		const REPLACE_MODE =
			ConditionsGroup.op == "&" || ConditionsGroup.op == "!|"
				? ReplaceModes.Group
				: ReplaceModes.FirstLevel;

		let newConditionsGroup: IMoodleElementConditionsGroup = {
			...ConditionsGroup,
		};

		switch (REPLACE_MODE) {
			case ReplaceModes.Group:
				const getFirstLevelShowC = ConditionsGroup.c.map(
					(condition) => condition.showc
				);
				newConditionsGroup.showc = getFirstLevelShowC;
				break;
			case ReplaceModes.FirstLevel:
				newConditionsGroup.show = Boolean(newConditionsGroup.showc);
				delete newConditionsGroup.showc;
				break;
		}

		if (
			"c" in newConditionsGroup &&
			newConditionsGroup.hasOwnProperty("c") &&
			Array.isArray(newConditionsGroup.c)
		) {
			deleteRecursiveShowC(newConditionsGroup.c);
		}

		return newConditionsGroup;
	}

	return nodeArray.map((node) => {
		if (
			node.data.c != undefined &&
			"type" in node.data.c &&
			node.data.c.type == "conditionsGroup" &&
			"op" in node.data.c
		) {
			return {
				...node,
				data: { ...node.data, c: setFixShowCMode(node.data.c) },
			};
		} else {
			return node;
		}
	}) as Array<INode>;
}

function manageBadges(nodeArray: Array<INode>, metaData: IMetaData) {
	return nodeArray.map((node) => {
		if (node.type == "badge") {
			return parseMoodleBadgeToExport(node, nodeArray, metaData);
		} else {
			return node;
		}
	});
}

function manageConditions(nodeArray: Array<INode>) {
	function specifyRecursiveConditionType(condition) {
		let newCondition = JSON.parse(JSON.stringify(condition));
		let type = "";
		if (condition.hasOwnProperty("type")) {
			type = condition.type;
		}

		switch (type) {
			case "grade":
				newCondition.id = condition.cm;
				if (newCondition.min) delete newCondition.cm;
				break;
			case "courseGrade":
				newCondition.id = condition.courseId;
				delete newCondition.courseId;
				break;
			case "group":
				if (condition.groupId) {
					newCondition.id = condition.groupId;
				} else {
					delete newCondition.id;
				}
				delete newCondition.groupId;
				break;
			case "grouping":
				newCondition.id = condition.groupingId;
				delete newCondition.groupingId;
				break;
			default:
				delete newCondition.id;
				break;
		}

		if (
			newCondition.hasOwnProperty("c") &&
			newCondition.c != undefined &&
			Array.isArray(newCondition.c)
		) {
			newCondition.c.forEach(specifyRecursiveConditionType);
		}
		return newCondition;
	}

	function replaceGenericConditions(conditionArray: Array<any>) {
		const newConditionArray = conditionArray.map((condition, index) => {
			// Obtener el elemento actual
			condition = conditionArray[index];
			// Comprobar si el tipo es "generic"
			if (condition.type === "generic") {
				// Reemplazar el elemento con su propiedad "data"
				if (condition.data) {
					if (condition.data.type && typeof condition.data.type == "string") {
						return condition.data;
					}
				}
			}

			// Comprobar si el elemento tiene una propiedad "c" que es un array de JSON
			if (
				condition.hasOwnProperty("c") &&
				condition.c != undefined &&
				Array.isArray(condition.c)
			) {
				// Llamar a la función recursiva con ese elemento
				return { ...condition, c: replaceGenericConditions(condition.c) };
			}
			return condition;
		});
		return newConditionArray;
	}

	const newNodeArray = nodeArray.map((node) => {
		if ("c" in node.data && "c" in node.data.c) {
			const newConditions = node.data.c.c;
			const specifiedConditions = newConditions.map((condition) =>
				specifyRecursiveConditionType(condition)
			);
			const fixedConditions = replaceGenericConditions(specifiedConditions);
			const newNode = {
				...node,
				data: {
					...node.data,
					c: { ...node.data.c, c: fixedConditions },
				},
			};
			return newNode;
		}
		return node;
	});

	return newNodeArray;
}

interface moodleNode {
	id: number;
	c: INode["data"]["c"];
	type: INode["type"];
	data: INode["data"];
	children: any;
	label: string;
	lmsResource: any;
	actionType?: INode["type"];
	conditions?: INode["data"]["c"];
}

function finalClean(nodeArray: Array<any>) {
	return nodeArray.map((node) => {
		const newNode: moodleNode = {
			...node,
			...node.data,
			id: node.id == "" ? -1 : Number(node.id),
		};
		if (newNode.type == "badge") {
			newNode.actionType = newNode.type;
			delete newNode.c;
		}
		delete newNode.type;
		if ("c" in newNode && "id" in newNode.c) delete newNode.c.id;
		delete newNode.data;
		delete newNode.children;
		delete newNode.label;
		delete newNode.lmsResource;
		return newNode;
	});
}

export function finalBadgeAdaptation(node: moodleNode) {
	const newNode = { ...node };
	newNode.conditions = { ...newNode.conditions, criteriaType: 0 };
}

export default function moodleExport(
	CLEANED_NODES: Array<INode>,
	metaData: IMetaData
): ISendNodesPayload {
	const nodesWithFixedShowC = manageShowC(CLEANED_NODES);
	console.log("fixedC", nodesWithFixedShowC);
	const nodesWithConditionsFixed = manageConditions(nodesWithFixedShowC);
	console.log("conditionsfixed", nodesWithConditionsFixed);
	const nodesWithBadgesFixed = manageBadges(
		nodesWithConditionsFixed as INode[],
		metaData
	);
	console.log("badges", nodesWithBadgesFixed);
	const nodesCleaned = finalClean(nodesWithBadgesFixed);
	console.log("nodesCleaned", nodesCleaned);
	return { resources: nodesCleaned };
}
