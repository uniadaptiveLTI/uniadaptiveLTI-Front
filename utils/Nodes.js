import {
	arrayMoveByIndex,
	getByProperty,
	getUpdatedArrayById,
	orderByPropertyAlphabetically,
} from "@utils/Utils";
import { NodeTypes } from "@utils/TypeDefinitions";

/**
 * An array of node types that are reserved and cannot be modified or deleted.
 * @const {string[]}
 */
export const ReservedNodeTypes = []; //Deprecated

/**
 * An array of node types that are actions and can be executed.
 * @const {string[]}
 */
export const ActionNodes = NodeTypes.map((node) => {
	if (node.nodeType == "ActionNode") return node.type;
});

/**
 * Gets a node from an array of nodes by its id.
 * @param {string} id - The id of the node to get.
 * @param {Object[]} nodeArray - The array of nodes to search in.
 * @return {Object|undefined} The node with the given id or undefined if not found.
 */
export const getNodeById = (id, nodeArray) => {
	if (Array.isArray(nodeArray)) {
		return nodeArray.find((node) => node.id == id);
	} else {
		return undefined;
	}
};

export const getParentsNode = (nodesArray, childId) => {
	return nodesArray.filter(
		(node) => node.data.children && node.data.children.includes(childId)
	);
};

/**
 * Gets a node from an array of nodes by its DOM element data-id attribute.
 * @param {Element} nodeDOM - The DOM element of the node to get.
 * @param {Object[]} nodeArray - The array of nodes to search in.
 * @return {Object|undefined} The node with the same data-id as the DOM element or undefined if not found.
 */
export const getNodeByNodeDOM = (nodeDOM, nodeArray) => {
	if (Array.isArray(nodeArray)) {
		return nodeArray.find((node) => node.id == nodeDOM.id);
	} else {
		return undefined;
	}
};

/**
 * Checks if there are any reserved nodes in an array of nodes.
 * @param {Object[]} nodeArray - The array of nodes to check.
 * @return {boolean} True if there are reserved nodes in the array, false otherwise.
 */
export function thereIsReservedNodesInArray(nodeArray) {
	let isReserved = false;
	isReserved = nodeArray.some((node) => ReservedNodeTypes.includes(node.type));
	return isReserved;
}

/**
 * Returns the children of a given fragment id. - A shorthand of getByProperty
 * @param {String} fragmentID - ID of a Fragment node
 * @param {Object[]} nodeArray - A node array
 * @returns {Object[]|undefined} - Returns the filtered node array with only the children of the given fragment
 */
export const getChildrenNodesFromFragmentID = (fragmentID, nodeArray) => {
	return getByProperty("parentNode", fragmentID, nodeArray);
};

/**
 * Compares two nodes by their JSON representation.
 * @param {Object} node1 - The first node to compare.
 * @param {Object} node2 - The second node to compare.
 * @return {boolean} True if the nodes have the same JSON representation, false otherwise.
 */
export const isNodeEqual = (node1, node2) => {
	return JSON.stringify(node1) == JSON.stringify(node2);
};

/**
 * Compares two arrays of nodes by their JSON representation.
 * @param {Object[]} nodeArray1 - The first array of nodes to compare.
 * @param {Object[]} nodeArray2 - The second array of nodes to compare.
 * @return {boolean} True if the arrays have the same JSON representation, false otherwise.
 */
export const isNodeArrayEqual = (nodeArray1, nodeArray2) => {
	if (nodeArray1.length != nodeArray2.length) {
		return false;
	}

	const filteredArray = nodeArray1.filter((node1) =>
		getNodeById(node1.id, nodeArray2)
	);

	if (filteredArray.length != nodeArray1.length) {
		return false;
	}

	for (const node1 of nodeArray1) {
		const node2 = nodeArray2.find((node2) => node2.id == node1.id);
		if (!isNodeEqual(node1, node2)) {
			return false;
		}
	}

	return true;
};

/**
 * Sorts an array of nodes by their data.label property alphabetically.
 * @param {Object[]} array - The array of nodes to sort.
 * @return {Object[]} The array sorted by the data.label property.
 */
export function orderByLabelAlphabetically(array) {
	return orderByPropertyAlphabetically(array, "data", "label");
}

//NodesDOM

/**
 * Gets an array of nodes from an array of nodes by their DOM elements data-id attributes.
 * @param {Element[]} nodesDOM - The array of DOM elements of the nodes to get.
 * @param {Object[]} nodeArray - The array of nodes to search in.
 * @return {Object[]} The array of nodes with the same data-id as the DOM elements or an empty array if none found.
 */
export const getNodesByNodesDOM = (nodesDOM, nodeArray) => {
	const blockArray = [];
	nodesDOM.forEach((nodeDOM) => {
		const block = getNodeByNodeDOM(nodeDOM, nodeArray);
		if (block) {
			blockArray.push(block);
		}
	});
	return blockArray;
};

/**
 * Returns the DOM element of a node with a given id in a React Flow graph.
 * @param {string} id - The id of the node to find.
 * @returns {Element|null} The DOM element of the node or null if not found.
 */
export const getNodeDOMById = (id) => {
	return [...document.getElementsByClassName("react-flow__node")].find(
		(node) => node.dataset.id == id
	);
};

/**
 * Checks if there are any reserved blocks in an array of DOM elements
 * @param {HTMLElement[]} nodeDOMArray - An array of DOM elements
 * @returns {boolean} True if there is at least one reserved block, false otherwise
 */
export function thereIsReservedNodesDOMInArray(nodeDOMArray) {
	// Get the CSS selectors for the reserved block types
	let classes = getReservedNodeDOMClassesFromTypes();
	// Join the selectors with a comma
	let matchString = classes.join(", ");
	// Check if any element in the array matches any of the selectors
	const isReserved = nodeDOMArray.some((dom) =>
		dom.matches(":is(" + matchString + ")")
	);
	return isReserved;
}

/**
 * Converts an array of reserved block types to an array of CSS selectors
 * @returns {string[]} An array of CSS selectors for the reserved block types
 */
export function getReservedNodeDOMClassesFromTypes() {
	// Prefix each type with the class name "react-flow__node-"
	const nodes = ReservedNodeTypes.map((type) => "react-flow__node-" + type);
	// Add a dot before each selector
	const classes = nodes.map((node) => "." + node);
	return classes;
}

/**
 * Gets the lowest section number from an array of nodes.
 * @param {Array} nodeArray - The array of nodes to check.
 * @returns {number} The lowest section number, or Infinity if no section is found.
 */
export function getLowestSection(nodeArray) {
	return Math.min(
		...[...nodeArray.map((node) => node.data.section)].filter(
			(value) => value != undefined
		)
	);
}

/**
 * Gets the nodes that belong to a given section from an array of nodes.
 * @param {number} [section=0] - The section number to filter by.
 * @param {Array} nodeArray - The array of nodes to filter.
 * @returns {Array} The nodes that belong to the given section, or an empty array if none is found.
 */
export function getSectionNodes(section = 0, nodeArray) {
	return nodeArray.filter((node) => node.data.section == section);
}

/**
 * Gets the last position in a section from an array of nodes.
 * @param {number} [section=0] - The section number to filter by.
 * @param {Object[]} nodeArray - The array of nodes to search in.
 * @returns {number} The maximum position number in the section, or -Infinity if no nodes match the section.
 */
export function getLastPositionInSection(section, nodeArray) {
	const sectionNodes = getSectionNodes(section, nodeArray);
	const maxPosition = Math.max(
		...sectionNodes.map((node) => node.data.order),
		-1
	);
	return maxPosition;
}

/**
 * Reorders the nodes of a given section according to the from and to values.
 * @param {number} [section=0] - The section that contains the nodes to reorder.
 * @param {number} from - The data.order of the node that wants to be moved.
 * @param {number} to - The data.order of the desired position for the node.
 * @param {Array} nodeArray - The array of all nodes in the document.
 * @param {boolean} [swap=false] - A flag that indicates if the node should be swapped with another node or inserted in a new position.
 * @returns {Array} The updated array of nodes after reordering.
 */
export function reorderFromSection(
	section = 0,
	from,
	to,
	nodeArray,
	swap = false
) {
	const sectionNodes = getSectionNodes(section, nodeArray);
	//Check if the array is not empty
	if (sectionNodes.length > 0) {
		if (swap) {
			const fromNode = sectionNodes.find((node) => node.data.order == from);
			const toNode = sectionNodes.find((node) => node.data.order == to);
			if (toNode) {
				fromNode.data.order = to;
				toNode.data.order = from;
				return getUpdatedArrayById([fromNode, toNode], nodeArray);
			} else {
				fromNode.data.order = to;
				return getUpdatedArrayById(fromNode, nodeArray);
			}
		} else {
			if (from + 1 == to) {
				from += 1;
				to -= 1;
			}

			//Sort the array of nodes by their data.order
			let sortedNodes = sectionNodes.sort(
				(a, b) => a.data.order - b.data.order
			);

			//Assign them a new data.order consecutive according to their position in the array
			for (let i = 0; i < sortedNodes.length; i++) {
				sortedNodes[i].data.order = i;
			}

			//Remove the node you want to move from the array
			const movedNode = sortedNodes.splice(from, 1)[0];

			//Insert it in the desired position
			sortedNodes.splice(to, 0, movedNode);

			//Filter possible nulls
			const filteredNodes = sectionNodes.filter(
				(node) => node != null || node != undefined
			);
			//Assign them a new data.order consecutive according to their position in the array
			for (let i = 0; i < filteredNodes.length; i++) {
				filteredNodes[i].data.order = i;
			}

			//Return the modified array;
			return getUpdatedArrayById(filteredNodes, nodeArray);
		}
	} else {
		return [];
	}
}

/**
 * Reorders the nodes of a given section and column according to the from and to values.
 * @param {number} [section=0] - The section that contains the nodes to reorder.
 * @param {number} [column=0] - The column that contains the nodes to reorder.
 * @param {number} from - The data.order of the node that wants to be moved.
 * @param {number} to - The data.order of the desired position for the node.
 * @param {Array} nodeArray - The array of all nodes in the document.
 * @param {boolean} [swap=false] - A flag that indicates if the node should be swapped with another node or inserted in a new position.
 * @returns {Array} The updated array of nodes after reordering.
 */
export function reorderFromSectionAndColumn(
	section = 0,
	column = 0,
	from,
	to,
	nodeArray,
	swap = false
) {
	const sectionAndColumnNodes = nodeArray.filter(
		(node) => node.data.section == section && node.data.indent == column - 1
	);

	if (sectionAndColumnNodes.length > 0) {
		if (swap) {
			const fromNode = sectionAndColumnNodes.find(
				(node) => node.data.order == from
			);
			const toNode = sectionAndColumnNodes.find(
				(node) => node.data.order == to
			);
			if (toNode) {
				fromNode.data.order = to;
				toNode.data.order = from;
				return getUpdatedArrayById([fromNode, toNode], nodeArray);
			} else {
				fromNode.data.order = to;
				return getUpdatedArrayById(fromNode, nodeArray);
			}
		} else {
			let sortedNodes = sectionAndColumnNodes.sort(
				(a, b) => a.data.order - b.data.order
			);
			for (let i = 0; i < sortedNodes.length; i++) {
				sortedNodes[i].data.order = i;
			}
			const movedNode = sortedNodes.splice(from, 1)[0];
			sortedNodes.splice(to, 0, movedNode);
			const filteredNodes = sectionAndColumnNodes.filter(
				(node) => node != null || node != undefined
			);
			for (let i = 0; i < filteredNodes.length; i++) {
				filteredNodes[i].data.order = i;
			}
			return getUpdatedArrayById(filteredNodes, nodeArray);
		}
	} else {
		return [];
	}
}

/**
 * Gets the number of independent conditions in a node.
 * @param {Object} node - The node to get the number of independent conditions from.
 * @returns {number} The number of independent conditions in the node.
 */
export function getNumberOfIndependentConditions(node) {
	const recursiveTypeGet = (c, array = []) => {
		if (c.c) {
			c.c.forEach((condition) => {
				if (condition.type != "conditionsGroup") {
					if (condition.type != "completion" && condition.type != "grade") {
						array.push(condition.type);
					}
				} else {
					if (condition.c) {
						array.push(...recursiveTypeGet(condition, array));
					}
				}
			});
		}
		return array;
	};
	if (node.data.c) {
		return recursiveTypeGet(node.data.c).length;
	}
	return 0;
}

/**
 * Gets the primary condition type of a given node.
 *
 * @export
 * @param {Object} node - The node to check.
 * @returns {string|undefined} Returns the primary condition type if it exists, 'multiple' if there are more than one types, otherwise returns undefined.
 */
export function getPrimaryConditionType(node) {
	const recursiveTypeGet = (c, array = []) => {
		if (c.c) {
			c.c.forEach((condition) => {
				if (condition.type != "conditionsGroup") {
					if (condition.type != "completion" && condition.type != "grade") {
						array.push(condition.type);
					}
				} else {
					if (condition.c) {
						array.push(...recursiveTypeGet(condition, array));
					}
				}
			});
		}

		return array;
	};
	if (node.data.c) {
		const types = [...new Set(recursiveTypeGet(node.data.c))].filter(
			(cType) =>
				cType !== "grade" &&
				cType !== "conditionsGroup" &&
				cType !== "completion"
		);
		return types.length > 1 ? "multiple" : types[0];
	}
	return undefined;
}

/**
 * Checks if specific condition exists
 *
 * @export
 * @param {Object} node - The node to check.
 * @param {string} typeName - Type name to search for.
 * @returns {boolean} Returns the true if exists, false if it isn't
 */
export function conditionTypeExists(node, typeName) {
	const recursiveTypeGet = (c, array = []) => {
		if (c.c) {
			c.c.forEach((condition) => {
				if (condition.type != "conditionsGroup") {
					array.push(condition.type);
				} else {
					if (condition.c) {
						array.push(...recursiveTypeGet(condition, array));
					}
				}
			});
		}

		return array;
	};
	if (node.data.c) {
		const types = [...new Set(recursiveTypeGet(node.data.c))].filter(
			(cType) => cType == typeName
		);
		return types.length > 0 ? true : false;
	}
	return false;
}

/**
 * Checks if any node in the given array contains a grade present in the metaData.
 *
 * @param {Array} nodeArray - The array of nodes to check.
 * @param {Object} metaData - The metaData object containing grades.
 * @returns {boolean} Returns true if any node in the array contains a grade present in the metaData, otherwise returns false.
 */
export function nodeArrayContainsGrades(nodeArray, metaData) {
	if (
		nodeArray.filter((node) => metaData.grades.includes(node.data.lmsResource))
			.length > 0
	)
		return true;
	return false;
}

/**
 * Gets the gradable type given a node.
 *
 * @param {Object} node - The node object.
 * @param {string} platform - The platform name.
 * @returns {string} The gradable type of the node for the given platform.
 */
export function getNodeTypeGradableType(node, platform) {
	return NodeTypes.find((nt) => nt.type == node.type)?.gradable.find(
		(gradable) => gradable.lms == platform
	).type;
}
