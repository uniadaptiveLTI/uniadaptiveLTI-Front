export const uniqueId = () => parseInt(Date.now() * Math.random()).toString();

export function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

//Blocks

export const getBlockById = (id, blocksData) => {
	return blocksData.find((block) => block.id == id);
};

export const getBlockByNode = (node, blocksData) => {
	return blocksData.find((block) => block.id == node.dataset.id);
};

export const getBlocksByNodes = (nodes, blocksData) => {
	const blockArray = [];
	nodes.forEach((node) => {
		const block = getBlockByNode(node, blocksData);
		if (block) {
			blockArray.push(block);
		}
	});
	return blockArray;
};

export const getUpdatedBlocksData = (newBlock, blocksData) => {
	const newBlocks = Array.isArray(newBlock) ? newBlock : [newBlock];

	return blocksData.map((oldBlock) => {
		const newBlock = newBlocks.find((block) => block.id === oldBlock.id);
		return newBlock ? { ...oldBlock, ...newBlock } : oldBlock;
	});
};

export const getUpdatedBlocksDataFromFlow = (blocksData, reactflowInstance) => {
	return getUpdatedBlocksData(reactflowInstance.getNodes(), blocksData);
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
		const node = getBlockByNode(block, reactflowInstance);
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
