import { toast } from "react-toastify";
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
	const COLUMN_NODES = nodeArray.filter(
		(node) => node.data.indent == column - 1
	);
	const SECTION_NODES = COLUMN_NODES.filter(
		(node) => node.data.section == section
	);
	const MAX_POSITION = Math.max(
		...SECTION_NODES.map((node) => node.data.order),
		-1
	);
	return MAX_POSITION;
}

/**
 * Method to reorder the sakaiRequisites in a custom order
 * @param {Object} requisites - Requisites as an object
 * @returns {Object} Sorted requisites
 */
export function reOrderSakaiRequisites(requisites) {
	const customSort = (a, b) => {
		const TYPE_ORDER = {
			date: 1,
			dateException: 2,
			group: 3,
		};

		return TYPE_ORDER[a.type] - TYPE_ORDER[b.type];
	};

	const SORTED_ARRAY = [...requisites].sort(customSort);

	return SORTED_ARRAY;
}

/**
 * Switches the type of a Sakai node and returns an object with the new type and content reference.
 *
 * @export
 * @param {Object} node - The Sakai node to switch the type of.
 * @returns {Object} - An object containing the new type and content reference.
 */
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

/**
 * Creates a new Sakai map from the given nodes, lesson, metadata, and maps.
 *
 * @export
 * @param {Array} nodes - The array of nodes to create the map from.
 * @param {Object} lesson - The lesson to create the map from.
 * @param {Object} metadata - The metadata to create the map from.
 * @param {Array} maps - The array of maps to create the map from.
 * @returns {Object} - The new Sakai map.
 */
export function createNewSakaiMap(nodes, lesson, metadata, maps) {
	const END_X =
		Math.max(...nodes.map((node) => node.position.x)) + 125 >= 125
			? Math.max(...nodes.map((node) => node.position.x)) + 125
			: 125;
	const MID_Y =
		nodes.map((node) => node.position.y).sort((a, b) => a - b)[
			Math.floor(nodes.length / 2)
		] || 0;

	const IS_EMPTY = nodes.length < 1;
	if (!IS_EMPTY) {
		nodes.forEach((node) => {
			if (node.data.g) {
				const PARENT_NODES = [];

				let rootParent = node.data.g
					? { ...node.data.g, id: uniqueId() }
					: undefined;
				delete rootParent?.argument;
				delete rootParent?.siteId;
				delete rootParent?.toolId;
				delete rootParent?.hasParent;

				const PARSED_REQUISITES = {
					...rootParent,
					subConditions:
						rootParent?.subConditions == undefined
							? []
							: sakaiConditionalIDAdder(
									rootParent.subConditions,
									nodes,
									PARENT_NODES
							  ),
				};

				PARENT_NODES.forEach((parentNode) => {
					const PARENT_FOUND = nodes.find((node) => node.id == parentNode);
					if (PARENT_FOUND) {
						PARENT_FOUND.data.children.push(node.id);
					}
				});

				delete node?.data?.sakaiImportId;
				node.data.g = PARSED_REQUISITES;
			}
		});
	} else {
		toast("Lección vacía, creado un mapa vacío en su lugar.", {
			hideProgressBar: false,
			autoClose: 4000,
			type: "info",
			position: "bottom-center",
			theme: "light",
		});
	}

	const NEW_MAP = {
		id: uniqueId(),
		name: IS_EMPTY
			? `Nuevo Mapa ${maps.length - 1}`
			: lesson != undefined
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
				default: false,
				blocks_data: [...nodes],
			},
		],
	};
	return NEW_MAP;
}

/**
 * Parses a Sakai node and adds it to the nodes array if it is of a valid type.
 *
 * @export
 * @param {Array} nodes - The array to which the parsed node will be added.
 * @param {Object} node - The Sakai node to be parsed.
 * @param {number} newX - The x-coordinate for the new node's position.
 * @param {number} newY - The y-coordinate for the new node's position.
 * @param {Array} validTypes - The array of valid node types.
 */
export function parseSakaiNode(nodes, node, newX, newY, validTypes) {
	if (validTypes.includes(node.modname)) {
		const NEW_NODE = {};
		NEW_NODE.id = String(uniqueId());
		NEW_NODE.type = node.modname;
		NEW_NODE.position = { x: newX, y: newY };
		NEW_NODE.data = {
			label: node.name,
			section: node.section,
			indent: node.indent,
			order: node.order,
			sakaiImportId: node.id,
			lmsResource: String(node.sakaiId),
			children: [],
			requisites: [],
			g: !node.g ? undefined : node.g,
		};

		if (NEW_NODE.type == "exam" || NEW_NODE.type == "assign") {
			if (node && node?.openDate && node?.dueDate && node?.closeDate) {
				NEW_NODE.data.requisites.push({
					id: String(uniqueId()),
					type: "date",
					openingDate: node.openDate,
					dueDate: node.dueDate,
					closeTime: node.closeDate,
				});
			}
		} else {
			if (node && node?.openDate && node?.dueDate) {
				NEW_NODE.data.requisites.push({
					id: String(uniqueId()),
					type: "date",
					openingDate: node.openDate,
					dueDate: node.dueDate,
				});
			}
		}
		if (
			node.modname == "exam" &&
			node.timeExceptions &&
			node.timeExceptions.length >= 1
		) {
			node.timeExceptions.map((exception) =>
				NEW_NODE.data.requisites.push({
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
			const GROUP_CONDITION = {
				id: String(uniqueId()),
				type: "group",
				groupList: [],
			};

			GROUP_CONDITION.groupList = node.groups.map((group, groupIndex) => ({
				id: group,
				index: groupIndex,
			}));

			NEW_NODE.data.requisites.push(GROUP_CONDITION);
		}
		nodes.push(NEW_NODE);
	}
}

/**
 * Finds a node in the nodes array that matches the given resource ID.
 *
 * @param {string} resourceId - The resource ID to search for.
 * @param {Array} nodes - The array of nodes to search in.
 * @returns {Object|undefined} - The node that matches the resource ID, or undefined if no match is found.
 */
export function sakaiLMSResourceToId(resourceId, nodes) {
	let node = nodes.find((node) => node.data.sakaiImportId == resourceId);
	if (node) {
		return node;
	} else {
		return undefined;
	}
}

/**
 * Adds a unique ID to each sub-condition and updates the item ID and type.
 *
 * @param {Array} subConditions - The array of sub-conditions to update.
 * @param {Array} nodes - The array of nodes to search in for the item ID.
 * @param {Array} parentNodes - The array to which the new item ID will be added.
 * @returns {Array} - The updated array of sub-conditions.
 */
export function sakaiConditionalIDAdder(subConditions, nodes, parentNodes) {
	let deleteConditions = [];
	subConditions.map((rootCondition) => {
		rootCondition.id = uniqueId();
		rootCondition.subConditions?.map((childCondition) => {
			childCondition.id = uniqueId();
			const NEW_ITEM = sakaiLMSResourceToId(childCondition.itemId, nodes);
			if (NEW_ITEM) {
				console.log(
					"🚀 ~ rootCondition.subConditions?.map ~ NEW_ITEM:",
					NEW_ITEM
				);

				childCondition.itemId = NEW_ITEM.id;
				childCondition.itemType = NEW_ITEM.type;

				delete childCondition?.subConditions;
				delete childCondition?.hasParent;

				parentNodes.push(NEW_ITEM.id);
			} else {
				deleteConditions.push(childCondition);
			}
		});

		delete rootCondition?.argument;
		delete rootCondition?.itemId;
		delete rootCondition?.hasParent;
	});

	if (deleteConditions && deleteConditions.length >= 1) {
		deleteConditions.forEach((deleteCondition) => {
			subConditions = subConditions.map((subCondition) => {
				console.log(deleteCondition);
				console.log(subCondition);
				return {
					...subCondition,
					subConditions: subCondition.subConditions.filter(
						(subCondition) => subCondition.id !== deleteCondition.id
					),
				};
			});
		});
	}

	return subConditions;
}

/**
 * Clamps and reorders the nodes for Sakai.
 * @param {Array} nodeArray - Node array.
 * @returns {Array} The reordered node array.
 */
export function clampNodesOrderSakai(nodeArray) {
	const NEW_ARRAY = [];
	let maxSection = 0;
	nodeArray.forEach((node) => {
		if (maxSection < (node.data.section || 0))
			maxSection = node.data.section || 0;
	});
	for (let i = 0; i <= maxSection; i++) {
		const SECTION_ARRAY = nodeArray.filter(
			(node) => (node.data.section || 0) == i
		);
		let maxIndent = 0;
		SECTION_ARRAY.forEach((node) => {
			if (maxIndent < (node.data.indent || 0))
				maxIndent = node.data.indent || 0;
		});
		for (let j = 0; j <= maxIndent; j++) {
			const INDENT_ARRAY = SECTION_ARRAY.filter(
				(node) => (node.data.indent || 0) == j
			);
			INDENT_ARRAY.sort((a, b) => {
				if (a.data.order === undefined) return -1;
				if (b.data.order === undefined) return 1;
				return a.data.order - b.data.order;
			});
			for (let k = 0; k < INDENT_ARRAY.length; k++) {
				NEW_ARRAY.push({
					...INDENT_ARRAY[k],
					data: { ...INDENT_ARRAY[k].data, order: k },
				});
			}
		}
	}
	return NEW_ARRAY;
}
