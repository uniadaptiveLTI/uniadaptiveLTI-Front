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

/**
 * Method to reorder the sakaiRequisites in a custom order
 * @param {Object} requisites - Requisites as an object
 * @returns {Object} Sorted requisites
 */
export function reOrderSakaiRequisites(requisites) {
	const customSort = (a, b) => {
		const typeOrder = {
			date: 1,
			dateException: 2,
			group: 3,
		};

		return typeOrder[a.type] - typeOrder[b.type];
	};

	const sortedArray = [...requisites].sort(customSort);

	return sortedArray;
}

export function sakaiTypeSwitch(node) {
	switch (node.type) {
		case "resource":
		case "html":
		case "text":
			return { type: 1, contentRef: node.id.toString() };
		case "assign":
			return { type: 3, contentRef: "/assignment/" + node.id };
		case "exam":
			return { type: 4, contentRef: "/sam_pub/" + node.id };
		case "url":
			return { type: 6, contentRef: node.id.toString() };
		case "forum":
			return { type: 8, contentRef: "/forum_forum/" + node.id };
		case "folder":
			return { type: 20, contentRef: node.id.toString() };
	}
}

export function createNewSakaiMap(nodes, lesson, metadata, maps) {
	const endX = Math.max(...nodes.map((node) => node.position.x)) + 125;
	const midY = nodes.map((node) => node.position.y).sort((a, b) => a - b)[
		Math.floor(nodes.length / 2)
	];

	nodes.forEach((node) => {
		if (node.data.gradeRequisites) {
			const parentNodes = [];

			let rootParent = node.data.gradeRequisites
				? { ...node.data.gradeRequisites, id: uniqueId() }
				: undefined;
			console.log(rootParent);
			delete rootParent?.argument;
			delete rootParent?.siteId;
			delete rootParent?.toolId;
			delete rootParent?.hasParent;

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

			delete node?.data?.sakaiImportId;
			node.data.gradeRequisites = parsedRequisites;
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
		newNode.id = String(uniqueId());
		newNode.type = node.modname;
		newNode.position = { x: newX, y: newY };
		newNode.data = {
			label: node.name,
			section: node.section,
			indent: node.indent,
			order: node.order,
			sakaiImportId: node.id,
			lmsResource: String(node.sakaiId),
			children: [],
			requisites: [],
			gradeRequisites: !node.gradeRequisites ? undefined : node.gradeRequisites,
		};

		if (newNode.type == "exam" || newNode.type == "assign") {
			if (node && node?.openDate && node?.dueDate && node?.closeDate) {
				newNode.data.requisites.push({
					id: String(uniqueId()),
					type: "date",
					openingDate: node.openDate,
					dueDate: node.dueDate,
					closeTime: node.closeDate,
				});
			}
		} else {
			if (node && node?.openDate && node?.dueDate) {
				newNode.data.requisites.push({
					id: String(uniqueId()),
					type: "date",
					openingDate: node.openDate,
					dueDate: node.dueDate,
				});
			}
		}
		console.log(node);
		if (
			node.modname == "exam" &&
			node.timeExceptions &&
			node.timeExceptions.length >= 1
		) {
			node.timeExceptions.map((exception) =>
				newNode.data.requisites.push({
					id: String(uniqueId()),
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
				id: String(uniqueId()),
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
	let node = nodes.find((node) => node.data.sakaiImportId == resourceId);
	if (node && node.id) {
		return node.id;
	} else {
		return undefined;
	}
}

function sakaiConditionalIDAdder(subConditions, nodes, parentNodes) {
	subConditions.map((rootCondition) => {
		rootCondition.id = uniqueId();
		rootCondition.subConditions?.map((childCondition) => {
			childCondition.id = uniqueId();
			const newItemId = sakaiLMSResourceToId(childCondition.itemId, nodes);
			childCondition.itemId = newItemId;

			delete childCondition?.siteId;
			delete childCondition?.toolId;
			delete childCondition?.subConditions;
			delete childCondition?.hasParent;

			parentNodes.push(newItemId);
		});

		delete rootCondition?.argument;
		delete rootCondition?.siteId;
		delete rootCondition?.toolId;
		delete rootCondition?.itemId;
		delete rootCondition?.hasParent;
	});
	console.log(subConditions);
	return subConditions;
}

/**
 * Clamps and reorders the nodes for Sakai.
 * @param {Array} nodeArray - Node array.
 * @returns {Array} The reordered node array.
 */
export function clampNodesOrderSakai(nodeArray) {
	const newArray = [];
	let maxSection = 0;
	nodeArray.forEach((node) => {
		if (maxSection < (node.data.section || 0))
			maxSection = node.data.section || 0;
	});
	for (let i = 0; i <= maxSection; i++) {
		const sectionArray = nodeArray.filter(
			(node) => (node.data.section || 0) == i
		);
		let maxIndent = 0;
		sectionArray.forEach((node) => {
			if (maxIndent < (node.data.indent || 0))
				maxIndent = node.data.indent || 0;
		});
		for (let j = 0; j <= maxIndent; j++) {
			const indentArray = sectionArray.filter(
				(node) => (node.data.indent || 0) == j
			);
			indentArray.sort((a, b) => {
				if (a.data.order === undefined) return -1;
				if (b.data.order === undefined) return 1;
				return a.data.order - b.data.order;
			});
			for (let k = 0; k < indentArray.length; k++) {
				newArray.push({
					...indentArray[k],
					data: { ...indentArray[k].data, order: k },
				});
			}
		}
	}
	return newArray;
}
