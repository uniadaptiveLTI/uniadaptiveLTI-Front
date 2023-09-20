import { getSectionNodes } from "./Nodes";
import { uniqueId } from "./Utils";

/**
 * Gets the last position in a sakai column from an array of nodes.
 * @param {number} [section=0] - The section number to filter by.
 * @param {column} [column=0] - The column number to filter by.
 * @param {Object[]} nodeArray - The array of nodes to search in.
 * @returns {number} The maximum position number in the section, or -Infinity if no nodes match the section.
 */
export function getLastPositionInSakaiColumn(section, column, nodeArray) {
	console.log("getLastPositionInSakaiColumn", nodeArray, section, column);
	const columnNodes = nodeArray.filter(
		(node) => node.data.indent == column - 1
	);
	const sectionNodes = columnNodes.filter(
		(node) => node.data.section == section
	);
	const maxPosition = Math.max(
		...sectionNodes.map((node) => node.data.order),
		-1
	);
	return maxPosition;
}

export function createNewSakaiMap(nodes, lesson, metadata, maps) {
	const endX = Math.max(...nodes.map((node) => node.position.x)) + 125;
	const midY = nodes.map((node) => node.position.y).sort((a, b) => a - b)[
		Math.floor(nodes.length / 2)
	];

	nodes.forEach((node) => {
		if (node.data.gradeRequisites) {
			const parentNodes = [];

			const rootParent = node.data.gradeRequisites
				? { ...node.data.gradeRequisites, id: uniqueId() }
				: undefined;

			const parsedRequisites = {
				...rootParent,
				subConditions:
					rootParent?.subConditions == undefined
						? []
						: sakaiConditionalIDAdder(
								rootParent.subConditions,
								nodes,
								parentNodes
						  ),
			};

			parentNodes.forEach((parentNode) => {
				const parentFound = nodes.find((node) => node.id == parentNode);
				if (parentFound) {
					parentFound.data.children.push(node.id);
				}
			});

			node.data.gradeRequisites = parsedRequisites;

			console.log(node.data);
		}
	});

	//FIXME: DO ME PROPERLY
	const newMap = {
		id: uniqueId(),
		name:
			lesson != undefined
				? `Mapa importado desde ${
						metadata.lessons.find(
							(metaDataLesson) => metaDataLesson.id === lesson
						).name
				  } (${maps.length})`
				: `Mapa importado desde ${metadata.name} (${maps.length})`,
		versions: [
			{
				id: uniqueId(),
				name: "Primera versión",
				lastUpdate: new Date().toLocaleDateString(),
				default: "true",
				blocksData: [
					{
						id: uniqueId(),
						position: { x: 0, y: midY },
						type: "start",
						deletable: false,
						data: {
							label: "Entrada",
						},
					},
					...nodes,
					{
						id: uniqueId(),
						position: { x: endX, y: midY },
						type: "end",
						deletable: false,
						data: {
							label: "Salida",
						},
					},
				],
			},
		],
	};
	return newMap;
}

export function parseSakaiNode(nodes, node, newX, newY, validTypes) {
	console.log(newX);
	if (validTypes.includes(node.modname)) {
		const newNode = {};
		newNode.id = "" + uniqueId();
		newNode.type = node.modname;
		newNode.position = { x: newX, y: newY };
		newNode.data = {
			label: node.name,
			section: node.section,
			column: node.column,
			order: node.order,
			lmsResource: node.sakaiId,
			children: [],
			requisites: [],
			gradeRequisites: !node.gradeRequisites ? undefined : node.gradeRequisites,
		};
		console.log(newNode);
		if (node.fromDate && node.endDate) {
			newNode.data.requisites.push({
				id: "" + uniqueId(),
				type: "date",
				openingDate: node.fromDate,
				dueDate: node.endDate,
			});
		}
		console.log(node);
		if (
			node.modname == "exam" &&
			node.timeExceptions &&
			node.timeExceptions.length >= 1
		) {
			console.log("ENTRO");
			node.timeExceptions.map((exception) =>
				newNode.data.requisites.push({
					id: "" + uniqueId(),
					type: "dateException",
					op: exception.forEntityRef.includes("group") ? "group" : "user",
					entityId: exception.forEntityRef,
					openingDate: exception.openDate,
					dueDate: exception.dueDate,
					closeTime: exception.closeDate,
				})
			);
		}

		if (node.groups && node.groups.length >= 1) {
			const groupCondition = {
				id: "" + uniqueId(),
				type: "group",
				groupList: [],
			};

			groupCondition.groupList = node.groups.map((group, groupIndex) => ({
				id: group,
				index: groupIndex,
			}));

			newNode.data.requisites.push(groupCondition);
		}
		nodes.push(newNode);
	}
}

function sakaiLMSResourceToId(resourceId, nodes) {
	const node = nodes.find((node) => node.data.lmsResource == resourceId);
	console.log(resourceId, node);
	return node ? node.id : undefined;
}

function sakaiConditionalIDAdder(subConditions, nodes, parentNodes) {
	subConditions.map((rootCondition) => {
		rootCondition.id = uniqueId();
		rootCondition.subConditions?.map((childCondition) => {
			childCondition.id = uniqueId();
			const newItemId = sakaiLMSResourceToId(childCondition.itemId, nodes);
			childCondition.itemId = newItemId;
			parentNodes.push(newItemId);
		});
	});
	return subConditions;
}
