import { getByProperty, orderByPropertyAlphabetically } from "@utils/Utils";
import { NodeTypes } from "@utils/TypeDefinitions";

export const ReservedNodeTypes = ["start", "end"];

export const ActionNodes = NodeTypes.map((node) => {
	if (node.nodeType == "ActionNode") return node.type;
});

export const getNodeById = (id, nodeArray) => {
	if (Array.isArray(nodeArray)) {
		return nodeArray.find((node) => node.id == id);
	} else {
		return undefined;
	}
};

export const getNodeByBlock = (block, nodeArray) => {
	if (Array.isArray(nodeArray)) {
		return nodeArray.find((node) => block.id == id);
	} else {
		return undefined;
	}
};

export const getNodeByNodeDOM = (nodeDOM, nodeArray) => {
	if (Array.isArray(nodeArray)) {
		return nodeArray.find((node) => node.id == nodeDOM.dataset.id);
	} else {
		return undefined;
	}
};

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

export const isNodeEqual = (node1, node2) => {
	return JSON.stringify(node1) == JSON.stringify(node2);
};

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

export function orderByLabelAlphabetically(array) {
	return orderByPropertyAlphabetically(array, "data", "label");
}

//NodesDOM

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
