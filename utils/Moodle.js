import { useReactFlow } from "reactflow";
import { getNodeById } from "./Nodes";
import { getUpdatedArrayById, uniqueId, parseDate } from "./Utils";

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

export function parseMoodleBadges(badge, newX, newY) {
	console.log(badge);
	const newNode = {};
	newNode.id = "" + uniqueId();
	newNode.type = "badge";
	newNode.position = { x: newX, y: newY };
	newNode.data = {
		label: badge.name,
		c: parseMoodleBadgeParams(badge.params), //Adapted in "createNewMoodleMap" (as we need all the IDs)
		lmsResource: badge.id,
	};
	console.log(newNode);
	return newNode;
}

export function parseMoodleBadgeParams(conditions) {
	let parsedBadgesConditions = {};
	conditions?.map((condition) => {
		console.log(condition);
		let newCondition = {
			id: uniqueId(),
			criteriatype: condition.criteriatype,
			type: getMoodleConditionType(condition.criteriatype),
			//method: condition.method === 1 ? "&" : "|",
		};

		/*condition?.params.map((param) => {
			switch
		});*/

		switch (newCondition.type) {
			case "conditionsGroup":
				newCondition.params = [];
				newCondition.method = condition.method === 1 ? "&" : "|";
				parsedBadgesConditions = newCondition;
				break;
			case "completion":
				newCondition.params = [];
				newCondition.method = condition.method === 1 ? "&" : "|";

				const filteredArray = condition?.params?.filter(
					(item) => item.name && item.name.includes("module")
				);

				filteredArray.map((moduleObj) => {
					const date = condition?.params?.find((param) =>
						param.name.includes("bydate_" + moduleObj.value)
					);

					let dateJsonObj = undefined;

					if (date) {
						var dateObj = new Date(date.value * 1000);
						dateJsonObj = parseDate(dateObj);
					}

					newCondition.params.push({
						id: moduleObj.value,
						date: date ? dateJsonObj : undefined,
					});
				});

				parsedBadgesConditions.params.push(newCondition);
				break;
			case "role":
			case "badgeList":
			case "skills":
				newCondition.method = condition.method === 1 ? "&" : "|";
				if (condition?.params?.length >= 1) {
					newCondition.params = [];
					condition?.params.map((param) => {
						newCondition.params.push(param.value);
					});
				}
				parsedBadgesConditions.params.push(newCondition);
				break;
			case "courseCompletion":
				const grade = condition?.params?.find((param) =>
					param.name.includes("grade")
				);
				const date = condition?.params?.find((param) =>
					param.name.includes("bydate")
				);

				if (grade) {
					newCondition.method = grade.value;
				}

				if (date) {
					var dateObj = new Date(date.value * 1000);
					newCondition.dateTo = parseDate(dateObj);
				}

				parsedBadgesConditions.params.push(newCondition);
				break;
		}
		console.log(newCondition);
	});

	if (Object.keys(parsedBadgesConditions).length === 0) {
		return undefined;
	} else {
		return parsedBadgesConditions;
	}
}

function getMoodleConditionType(criteriaType) {
	switch (criteriaType) {
		case 0:
			return "conditionsGroup";
		case 1:
			return "completion";
		case 2:
			return "role";
		case 4:
			return "courseCompletion";
		case 7:
			return "badgeList";
		case 9:
			return "skills";
	}
}

export function createNewMoodleMap(nodes, metadata, maps) {
	const endX = Math.max(...nodes.map((node) => node.position.x)) + 125;
	const midY = nodes.map((node) => node.position.y).sort((a, b) => a - b)[
		Math.floor(nodes.length / 2)
	];

	const conditionatedNodes = nodes.map((node) => {
		if (node.type !== "badge") {
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
		} else {
			const completionCondition = node.data.c?.params?.find(
				(condition) => condition.type == "completion"
			);

			if (
				completionCondition &&
				completionCondition.params &&
				completionCondition.params.length >= 1
			) {
				completionCondition.params.map((node) => {
					moodleConditionalBadgeIDAdder(node, nodes);
				});
			}
			console.log(completionCondition);
		}

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

function moodleConditionalBadgeIDAdder(objArray, nodes) {
	objArray.id = moodleLMSResourceToId(objArray.id, nodes);
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
	return node ? node.id : undefined;
}

function moodleParentingSetter(objArray) {
	// Create a deep copy of the original array
	const newArray = JSON.parse(JSON.stringify(objArray));

	for (let i = 0; i < objArray.length; i++) {
		if (objArray[i]?.type !== "badge") {
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
		} else {
			const completionCondition = objArray[i].data?.c?.params?.find(
				(condition) => condition.type == "completion"
			);
			if (completionCondition) {
				let parents = [];
				completionCondition.params.map((node) => {
					parents.push(node.id);
				});

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

export function clampNodesOrderMoodle(nodeArray) {
	const newArray = [];
	let maxSection = 0;
	nodeArray.forEach((node) => {
		if (maxSection < node.data.section) maxSection = node.data.section;
	});
	for (let i = 0; i <= maxSection; i++) {
		const newSection = [];
		const sectionArray = nodeArray.filter((node) => node.data.section == i);
		// Sort sectionArray by data.order, undefined values go first
		sectionArray.sort((a, b) => {
			if (a.data.order === undefined) return -1;
			if (b.data.order === undefined) return 1;
			return a.data.order - b.data.order;
		});
		for (let k = 0; k < sectionArray.length; k++) {
			newSection.push({
				...sectionArray[k],
				data: { ...sectionArray[k].data, order: k },
			});
		}
		newArray.push(...newSection);
	}
	console.log(nodeArray, getUpdatedArrayById(newArray, nodeArray));
	return getUpdatedArrayById(newArray, nodeArray);
}

export function parseMoodleBadgeToExport(node, nodeArray, metaData) {
	let newNode = node;
	let newConditions = [];

	const extractCondition = (condition) => {
		const getResourceById = (id) => {
			return getNodeById(id, nodeArray)?.data?.lmsResource;
		};

		const criteriaType = condition.criteriatype;
		const newMethod = condition.op == "&" ? 1 : 2;
		if (condition.c) delete condition.c;
		switch (condition.type) {
			case "conditionsGroup": {
				return { criteriatype: criteriaType, method: newMethod, params: [] };
			}
			case "completion": {
				const array = [];
				condition.params.map((param) => {
					array.push({
						name: `module_${getResourceById(param.id)}`,
						value: getResourceById(param.id),
					});
					if (param.date) {
						array.push({
							name: `bydate_${getResourceById(param.id)}`,
							value: (Date.parse(param.date) / 1000).toString(), //UNIX
						});
					}
				});
				return {
					criteriatype: criteriaType,
					method: newMethod,
					params: array,
				};
			}
			case "badgeList":
				return {
					criteriatype: criteriaType,
					method: newMethod,
					params: condition.params.map((param) => {
						return {
							name: `badge_${param}`,
							value: param,
						};
					}),
				};
			case "skills":
				return {
					criteriatype: criteriaType,
					method: newMethod,
					params: condition.params.map((param) => {
						return {
							name: `competency_${param}`,
							value: param,
						};
					}),
				};
			case "role":
				return {
					criteriatype: criteriaType,
					method: newMethod,
					params: condition.params.map((param) => {
						return {
							name: `role_${param}`,
							value: param,
						};
					}),
				};
			case "courseCompletion":
				const array = [];
				array.push({
					name: `course_${metaData.course_id}`,
					value: metaData.course_id,
				});

				if (condition.method) {
					array.push({
						name: `grade_${metaData.course_id}`,
						value: condition.method,
					});
				}

				if (condition.dateTo) {
					array.push({
						name: `bydate_${metaData.course_id}`,
						value: (Date.parse(condition.dateTo) / 1000).toString(),
					});
				}

				return {
					criteriatype: criteriaType,
					method: 1,
					params: array,
				};
		}

		return condition;
	};

	if (node.c) {
		const flatConditions = [node.c, ...node.c.params];

		flatConditions.map((condition) => {
			newConditions.push(extractCondition(condition));
		});

		delete newNode.c;
		newNode.conditions = newConditions;
	}

	return newNode;
}
