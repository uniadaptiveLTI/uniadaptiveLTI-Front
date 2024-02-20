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
			if ("showc" in condition && condition.hasOwnProperty("showc")) {
				delete condition.showc;
			}
			if (
				"c" in condition &&
				condition.hasOwnProperty("c") &&
				Array.isArray(condition.c)
			) {
				condition.c.forEach(deleteRecursiveShowC);
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
				deleteRecursiveShowC(newConditionsGroup.c);
				newConditionsGroup.showc = getFirstLevelShowC;
				break;
			case ReplaceModes.FirstLevel:
				newConditionsGroup.show = Boolean(newConditionsGroup.showc);
				deleteRecursiveShowC(newConditionsGroup.c);
				delete newConditionsGroup.showc;
				break;
		}

		return newConditionsGroup;
	}

	return nodeArray.map((node) => {
		if (
			node.data.c != undefined &&
			Array.isArray(node.data.c) &&
			node.data.c.every(
				(item) => item.type == "conditionsGroup" && "op" in item
			)
		) {
			return {
				...node,
				data: {
					...node.data,
					c: node.data.c.map(setFixShowCMode),
				},
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
		let type = "";
		if (condition.hasOwnProperty("type")) {
			type = condition.type;
		}

		switch (type) {
			case "grade":
				condition.id = condition.cm;
				if (condition.min) delete condition.cm;
				break;
			case "courseGrade":
				condition.id = condition.courseId;
				delete condition.courseId;
				break;
			case "group":
				if (condition.groupId) {
					condition.id = condition.groupId;
				} else {
					delete condition.id;
				}
				delete condition.groupId;
				break;
			case "grouping":
				condition.id = condition.groupingId;
				delete condition.groupingId;
				break;
			default:
				delete condition.id;
				break;
		}

		if (condition.hasOwnProperty("c") && Array.isArray(condition.c)) {
			condition.c.forEach(specifyRecursiveConditionType);
		}
	}

	function replaceGenericConditions(conditionArray) {
		// Recorrer el array de condiciones
		for (let i = 0; i < conditionArray.length; i++) {
			// Obtener el elemento actual
			let element = conditionArray[i];
			// Comprobar si el tipo es "generic"
			if (element.type === "generic") {
				// Reemplazar el elemento con su propiedad "data"
				conditionArray.c[i] = element.data;
			}

			// Comprobar si el elemento tiene una propiedad "c" que es un array de JSON
			if (element.hasOwnProperty("c") && Array.isArray(element)) {
				// Llamar a la función recursiva con ese elemento
				replaceGenericConditions(element);
			}
		}

		return conditionArray;
	}

	const newNodeArray = nodeArray.map((node) => {
		if ("c" in node.data && "c" in node.data.c) {
			const newConditions = node.data.c.c;
			newConditions.map((condition) =>
				specifyRecursiveConditionType(condition)
			);
			const fixedConditions = replaceGenericConditions(newConditions);
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
	const nodesWithBadgesFixed = manageBadges(nodesWithConditionsFixed, metaData);
	console.log("badges", nodesWithBadgesFixed);
	const nodesCleaned = finalClean(nodesWithBadgesFixed);
	console.log("nodesCleaned", nodesCleaned);
	return { resources: nodesCleaned };
}
