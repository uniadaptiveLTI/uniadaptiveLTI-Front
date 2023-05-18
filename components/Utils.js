export const ReservedBlockTypes = ["start", "end"];

//Blocks //TODO: Test all if have any use

export const getBlockById = (id, blocksData) => {
	return blocksData.find((block) => block.id == id);
};

export const getBlockByNodeDOM = (node, blocksData) => {
	return blocksData.find((block) => block.id == node.dataset.id);
};

export const getBlocksByNodesDOM = (nodes, blocksData) => {
	const blockArray = [];
	nodes.forEach((node) => {
		const block = getBlockByNodeDOM(node, blocksData);
		if (block) {
			blockArray.push(block);
		}
	});
	return blockArray;
};

export const getUpdatedBlocksDataFromFlow = (blocksData, reactflowInstance) => {
	return getUpdatedArrayById(reactflowInstance.getNodes(), blocksData);
};

export const isBlockEqual = (block1, block2) => {
	return JSON.stringify(block1) == JSON.stringify(block2);
};

export const isBlockArrayEqual = (blockArray1, blockArray2) => {
	if (blockArray1.length != blockArray2.length) {
		return false;
	}

	const filteredArray = blockArray1.filter((block1) =>
		getBlockById(block1.id, blockArray2)
	);

	if (filteredArray.length != blockArray1.length) {
		return false;
	}

	for (const [index, block1] of blockArray1.entries()) {
		const block2 = blockArray2.find((block2) => block2.id == block1.id);
		if (!isBlockEqual(block1, block2)) {
			return false;
		}
	}

	return true;
};

//Nodes

export const getNodeById = (id, reactFlowInstance) => {
	return reactFlowInstance.getNodes()?.find((node) => node.id == id);
};

export const getNodeByBlock = (block, reactFlowInstance) => {
	return reactFlowInstance.getNodes()?.find((node) => node.id == block.id);
};

export const getNodesByBlocks = (blocks, reactFlowInstance) => {
	const nodeArray = [];
	blocks.forEach((block) => {
		const node = getBlockByNodeDOM(block, reactFlowInstance);
		if (node) {
			nodeArray.push(node);
		}
	});
	return nodeArray;
};

export const getNodeByNodeDOM = (nodeDOM, reactFlowInstance) => {
	console.log("gnbnD", nodeDOM, reactFlowInstance);
	return reactFlowInstance
		.getNodes()
		.find((node) => node.id == nodeDOM.dataset.id);
};

export const getNodesByNodesDOM = (nodesDOM, reactFlowInstance) => {
	const blockArray = [];
	nodesDOM.forEach((nodeDOM) => {
		const block = getNodeByNodeDOM(nodeDOM, reactFlowInstance);
		if (block) {
			blockArray.push(block);
		}
	});
	return blockArray;
};

export const getNodesByProperty = (
	reactflowInstance,
	property = "parentNode",
	value = undefined
) => {
	return reactflowInstance
		.getNodes()
		?.filter((node) => node[property] == value);
};

export function thereIsReservedNodesInArray(nodeArray) {
	let isReserved = false;
	isReserved = nodeArray.some((node) => ReservedBlockTypes.includes(node.type));
	return isReserved;
}

// Edges

export const getEdgeBetweenNodeIds = (id1, id2, reactflowInstance) => {
	return reactflowInstance.getEdge(`${id1}-${id2}`);
};

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
	const nodes = ReservedBlockTypes.map((type) => "react-flow__node-" + type);
	// Add a dot before each selector
	const classes = nodes.map((node) => "." + node);
	return classes;
}

//Generic

/**
 * Returns a new array with updated entries from the original array.
 * @param {Object|Object[]} updatedEntry - The entry or entries to be updated in the original array. Each entry must have an id property.
 * @param {Object[]} originalArray - The original array of entries. Each entry must have an id property.
 * @returns {Object[]} A new array with the updated entries. If an entry in the original array does not have a matching id in the updatedEntry, it is returned unchanged.
 */
export const getUpdatedArrayById = (updatedEntry, originalArray) => {
	const newBlocks = Array.isArray(updatedEntry) ? updatedEntry : [updatedEntry];

	return originalArray.map((oldEntry) => {
		const newBlock = newBlocks.find((entry) => entry.id === oldEntry.id);
		return newBlock ? { ...oldEntry, ...newBlock } : oldEntry;
	});
};

/**
 * Adds multiple event listeners to an element.
 * @param {Element} element - The element to add the event listeners to.
 * @param {Array} events - An array of event objects with the event type and listener function.
 */
export function addEventListeners(element, events) {
	events.forEach(({ type, listener }) => {
		element.addEventListener(type, listener, false);
	});
}

export function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

export const uniqueId = () => parseInt(Date.now() * Math.random()).toString();

export function nearestPowerOfTwo(n) {
	return Math.pow(2, Math.round(Math.log(n) / Math.log(2)));
}

export function orderByLabelAlphabetically(array) {
	return [...array].sort((a, b) => a.data.label.localeCompare(b.data.label));
}
