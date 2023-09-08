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
	//FIXME: DO ME PROPERLY
	const newMap = {
		id: uniqueId(),
		name:
			lesson != undefined
				? `Mapa importado desde ${
						metadata.lessons.find((lesson) => lesson.id == lesson).name
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
