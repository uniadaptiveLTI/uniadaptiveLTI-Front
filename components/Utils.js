export const uniqueId = () => parseInt(Date.now() * Math.random()).toString();

export function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

//Blocks

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
//Nodes

export const getNodeById = (id, reactflowInstance) => {
	return reactflowInstance.getNodes()?.find((node) => node.id == id);
};

export const getNodeByBlock = (block, reactflowInstance) => {
	return reactflowInstance.getNodes()?.find((node) => node.id == block.id);
};

export const getNodesByBlocks = (blocks, reactflowInstance) => {
	const nodeArray = [];
	blocks.forEach((block) => {
		const node = getBlockByNodeDOM(block, reactflowInstance);
		if (node) {
			nodeArray.push(node);
		}
	});
	return nodeArray;
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

// Edges

export const getEdgeBetweenNodeIds = (id1, id2, reactflowInstance) => {
	return reactflowInstance.getEdge(`${id1}-${id2}`);
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

	return originalArray.map((oldEntry) => {
		const newBlock = newBlocks.find((entry) => entry.id === oldEntry.id);
		return newBlock ? { ...oldEntry, ...newBlock } : oldEntry;
	});
};
