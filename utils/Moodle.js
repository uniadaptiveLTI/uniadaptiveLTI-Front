import { uniqueId } from "./Utils";

export function parseMoodleNode(node, newX, newY) {
	const newNode = {};

	newNode.id = "" + uniqueId();
	newNode.type = node.modname;
	newNode.position = { x: newX, y: newY };
	newNode.data = {
		label: node.name,
		indent: node.indent,
		section: node.section,
		children: [], //Filled in "createNewMoodleMap" (as we need all the IDs)
		c: node.availability, //Adapted in "createNewMoodleMap" (as we need all the IDs)
		order: node.order,
		lmsResource: node.id,
		lmsVisibility: node.visible,
	};
	return newNode;
}

export function createNewMoodleMap(nodes, metadata, maps) {
	const endX = Math.max(...nodes.map((node) => node.position.x)) + 125;
	const midY = nodes.map((node) => node.position.y).sort((a, b) => a - b)[
		Math.floor(nodes.length / 2)
	];

	const conditionatedNodes = nodes.map((node) => {
		const conditions = node.data.c
			? { ...node.data.c, id: uniqueId(), type: "conditionsGroup" }
			: undefined;
		const parsedConditions = {
			...conditions,
			c:
				conditions?.c == undefined
					? []
					: moodleConditionalIDAdder(conditions.c, nodes),
		};

		node.data.c = parsedConditions;
		return node;
	});

	const nodesWithChildren = moodleParentingSetter(conditionatedNodes);

	const newMap = {
		id: uniqueId(),
		name: `Mapa importado desde ${metadata.name} (${maps.length})`,
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
					...nodesWithChildren,
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

function moodleConditionalIDAdder(objArray, nodes) {
	// Create a deep copy of the original array
	let newArray = JSON.parse(JSON.stringify(objArray));

	for (let i = 0; i < newArray.length; i++) {
		if (typeof newArray[i] === "object" && newArray[i] !== null) {
			if (objArray[i].type === "completion") {
				newArray[i].cm = moodleLMSResourceToId(newArray[i].cm, nodes);
			}

			if (objArray[i].type === "grade") {
				console.log("CONDITION ID", newArray[i].id);
				console.log(
					"NODE WITH THAT",
					nodes.find((node) => node.data.lmsResource == newArray[i].id)
				);
				newArray[i].cm = moodleLMSResourceToId(newArray[i].id, nodes);
				console.log(newArray[i], moodleLMSResourceToId(newArray[i].id, nodes));
			}

			// Add/replace "id" property
			newArray[i].id = uniqueId();

			// If "c" property exists, execute again
			if ("c" in newArray[i]) {
				newArray[i].type = "conditionsGroup";
				newArray[i].c = moodleConditionalIDAdder(newArray[i].c, nodes);
			}
		}
	}

	return newArray;
}

function moodleFlowConditionalsExtractor(objArray) {
	let cmValues = [];

	for (let i = 0; i < objArray.length; i++) {
		if (typeof objArray[i] === "object" && objArray[i] !== null) {
			// If the object has type "completion" or "grade", add the value of "cm" to the array
			if (objArray[i].type === "completion" || objArray[i].type === "grade") {
				if (objArray[i].cm) cmValues.push(objArray[i].cm);
			}

			// If the object has a property "c", enter that property
			if ("c" in objArray[i]) {
				cmValues = cmValues.concat(
					moodleFlowConditionalsExtractor(objArray[i].c)
				);
			}
		}
	}

	return cmValues;
}

function moodleLMSResourceToId(resourceId, nodes) {
	const node = nodes.find((node) => node.data.lmsResource == resourceId);
	console.log(resourceId, node);
	return node ? node.id : undefined;
}

function moodleParentingSetter(objArray) {
	// Create a deep copy of the original array
	const newArray = JSON.parse(JSON.stringify(objArray));

	for (let i = 0; i < objArray.length; i++) {
		if (objArray[i]?.data?.c) {
			const parents = moodleFlowConditionalsExtractor(objArray[i].data.c.c);
			console.log("parents", parents);
			if (parents.length > 0) {
				parents.forEach((parent) => {
					const parentFound = objArray.find((node) => node.id == parent);
					if (parentFound) {
						newArray
							.find((node) => node.id == parentFound.id)
							.data.children.push(objArray[i].id);
					}
				});
			}
		}
	}

	return newArray;
}
