export const ReservedBlockTypes = ["start", "end"];

//Blocks //TODO: Test all if have any use

export const getBlockById = (id, blocksData) => {
	return blocksData.find((block) => block.id == id);
};

/*export const getBlockByNodeDOM = (node, blocksData) => {
	return blocksData.find((block) => block.id == node.dataset.id);
};*/

/*export const getBlocksByNodesDOM = (nodes, blocksData) => {
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
};*/

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

/*export const getNodesByBlocks = (blocks, nodeArray) => {
	const finalNodeArray = [];
	blocks.forEach((block) => {
		const node = getBlockByNodeDOM(block, nodeArray);
		if (node) {
			finalNodeArray.push(node);
		}
	});
	return finalNodeArray;
};*/

export const getNodeByNodeDOM = (nodeDOM, nodeArray) => {
	console.log("gnbnD", nodeDOM, nodeArray);
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

export const getNodesByProperty = (
	property = "parentNode",
	value = undefined,
	nodeArray
) => {
	if (Array.isArray(nodeArray)) {
		return nodeArray.filter((node) => node[property] == value);
	} else {
		return undefined;
	}
};

export function thereIsReservedNodesInArray(nodeArray) {
	let isReserved = false;
	isReserved = nodeArray.some((node) => ReservedBlockTypes.includes(node.type));
	return isReserved;
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
	const nodes = ReservedBlockTypes.map((type) => "react-flow__node-" + type);
	// Add a dot before each selector
	const classes = nodes.map((node) => "." + node);
	return classes;
}

//Specific

export const getChildrenNodesFromFragmentID = (fragmentID, nodeArray) => {
	return getNodesByProperty("parentNode", fragmentID, nodeArray);
};

//Generic

/**
 * Returns a new array with updated entries from the original array.
 * @param {Object|Object[]} updatedEntry - The entry or entries to be updated in the original array. Each entry must have an id property.
 * @param {Object[]} originalArray - The original array of entries. Each entry must have an id property.
 * @returns {Object[]} A new array with the updated entries. If an entry in the original array does not have a matching id in the updatedEntry, it is returned unchanged.
 */
export const getUpdatedArrayById = (updatedEntry, originalArray) => {
	const newBlocks = Array.isArray(updatedEntry) ? updatedEntry : [updatedEntry];

	if (originalArray.length > 0) {
		return originalArray.map((oldEntry) => {
			const newBlock = newBlocks.find((entry) => entry.id === oldEntry.id);
			return newBlock ? { ...oldEntry, ...newBlock } : oldEntry;
		});
	}
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
	return orderByPropertyAlphabetically(array, "data", "label");
}

export function orderByPropertyAlphabetically(array, property, subproperty) {
	if (subproperty) {
		return [...array].sort((a, b) =>
			a[property][subproperty].localeCompare(b[property][subproperty])
		);
	} else {
		return [...array].sort((a, b) => a[property].localeCompare(b[property]));
	}
}

export function inArrayById(obj, arr) {
	return arr.some((x) => x.id === obj.id);
}

export function arrayInsideArrayById(arr1, arr2) {
	return arr1.map((obj) => inArrayById(obj, arr2)).every(Boolean);
}

export function deduplicateById(arr) {
	return arr.reduce((accumulator, current) => {
		if (!accumulator.some((item) => item.id === current.id)) {
			accumulator.push(current);
		}
		return accumulator;
	}, []);
}
