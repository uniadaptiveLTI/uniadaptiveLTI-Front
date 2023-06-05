import { getByProperty, orderByPropertyAlphabetically } from "@utils/Utils";
import { NodeTypes } from "@utils/TypeDefinitions";

/**
 * An array of node types that are reserved and cannot be modified or deleted.
 * @const {string[]}
 */
export const ReservedNodeTypes = ["start", "end"];

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

/**
 * Gets a node from an array of nodes by its DOM element data-id attribute.
 * @param {Element} nodeDOM - The DOM element of the node to get.
 * @param {Object[]} nodeArray - The array of nodes to search in.
 * @return {Object|undefined} The node with the same data-id as the DOM element or undefined if not found.
 */
export const getNodeByNodeDOM = (nodeDOM, nodeArray) => {
	if (Array.isArray(nodeArray)) {
		return nodeArray.find((node) => node.id == nodeDOM.dataset.id);
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
function getReservedNodeDOMClassesFromTypes() {
	// Prefix each type with the class name "react-flow__node-"
	const nodes = ReservedNodeTypes.map((type) => "react-flow__node-" + type);
	// Add a dot before each selector
	const classes = nodes.map((node) => "." + node);
	return classes;
}
