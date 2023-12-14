import { useReactFlow } from "reactflow";
import { getNodeById } from "./Nodes";
import {
	getUpdatedArrayById,
	uniqueId,
	parseDate,
	LMSResourceToId,
} from "./Utils";

/**
 * Parses a Moodle resource to a LTI Node.
 * @param {Object} badge - Moodle's node.
 * @param {Number} newX - X position for the badge in the map.
 * @param {Number} newY - Y position for the badge in the map.
 * @returns {Object} LTI's resource's node.
 */
export function parseMoodleNode(node, newX, newY) {
	const NEW_NODE = {};

	NEW_NODE.id = String(uniqueId());
	NEW_NODE.type = node.modname;
	NEW_NODE.position = { x: newX, y: newY };
	NEW_NODE.data = {
		label: node.name,
		indent: node.indent,
		section: node.section,
		children: [], //Filled in "createNewMoodleMap" (as we need all the IDs)
		c: node.availability, //Adapted in "createNewMoodleMap" (as we need all the IDs)
		g: node.g ? parseMoodleCalifications(node).g : undefined,
		order: node.order,
		lmsResource: String(node.id),
		lmsVisibility: node.visible,
	};

	return NEW_NODE;
}

/**
 * Parses a Moodle badge
 * @param {Object} badge - Moodle's badge.
 * @param {Number} newX - X position for the badge in the map.
 * @param {Number} newY - Y position for the badge in the map.
 * @returns {Object} LTI's badge node.
 */
export function parseMoodleBadges(badge, newX, newY, nodes) {
	const newNode = {};
	newNode.id = String(uniqueId());
	newNode.type = "badge";
	newNode.position = { x: newX, y: newY };
	newNode.data = {
		label: badge.name,
		c: parseMoodleBadgeParams(badge.params, nodes), //Adapted in "createNewMoodleMap" (as we need all the IDs)
		lmsResource: String(badge.id),
	};
	return NEW_NODE;
}

/**
 * Transforms Moodle's badge's conditions to LTI's badge's conditions.
 * @param {Array} conditions - Moodle's badge's conditions
 * @returns {Array} LTI's badge's conditions
 */
export function parseMoodleBadgeParams(conditions, nodes) {
	let parsedBadgesConditions = {};
	conditions?.map((condition) => {
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

				const FILTERED_ARRAY = condition?.params?.filter(
					(item) => item.name && item.name.includes("module")
				);

				FILTERED_ARRAY.map((moduleObj) => {
					const date = condition?.params?.find((param) =>
						param.name.includes("bydate_" + moduleObj.value)
					);

					let dateJsonObj = undefined;

					if (date) {
						var dateObj = new Date(date.value * 1000);
						dateJsonObj = parseDate(dateObj);
					}

					let newId = nodes.find(
						(node) => node?.data?.lmsResource == moduleObj?.value
					).id;

					if (newId) {
						newCondition?.params.push({
							id: newId,
							date: date ? dateJsonObj : undefined,
						});
					}
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
				const GRADE = condition?.params?.find((param) =>
					param.name.includes("grade")
				);
				const DATE = condition?.params?.find((param) =>
					param.name.includes("bydate")
				);

				if (GRADE) {
					newCondition.method = GRADE.value;
				}

				if (DATE) {
					var dateObj = new Date(DATE.value * 1000);
					newCondition.dateTo = parseDate(dateObj);
				}

				parsedBadgesConditions.params.push(newCondition);
				break;
		}
	});

	if (Object.keys(parsedBadgesConditions).length === 0) {
		return undefined;
	} else {
		return parsedBadgesConditions;
	}
}

/**
 * Transforms moodle's condition types to a string based ones.
 * @param {Number} criteriaType - Moodle's condition type.
 * @returns {String} Returns the correspondent condition type in string.
 */
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

/**
 * Creates a new map given a node array, the metadata and the current maps array.
 * @param {Array} nodes - Nodes array.
 * @param {Object} metadata - Metadata object.
 * @param {Array} maps - Maps array.
 * @returns {Object} Returns the new map.
 */
export function createNewMoodleMap(nodes, metadata, maps) {
	const END_X =
		Math.max(...nodes.map((node) => node.position.x)) + 125 >= 125
			? Math.max(...nodes.map((node) => node.position.x)) + 125
			: 125;
	const MID_Y =
		nodes.map((node) => node.position.y).sort((a, b) => a - b)[
			Math.floor(nodes.length / 2)
		] || 0;

	const CONDITIONATED_NODES = nodes.map((node) => {
		if (node.type !== "badge") {
			let conditions;
			if (node.data.c && (!node.data.c.c || node.data.c.c.length < 1)) {
				conditions = undefined;
			} else {
				conditions = {
					...node.data.c,
					id: uniqueId(),
					type: "conditionsGroup",
				};
			}
			const PARSED_CONDITIONS = {
				...conditions,
				c:
					conditions?.c == undefined
						? []
						: moodleConditionalIDAdder(conditions.c, nodes),
			};

			//Import show/showc
			if (
				PARSED_CONDITIONS.showc != undefined ||
				PARSED_CONDITIONS.show != undefined
			) {
				if (PARSED_CONDITIONS.showc != undefined) {
					const SHOWC = [...PARSED_CONDITIONS.showc];
					delete PARSED_CONDITIONS.showc;
					if (
						PARSED_CONDITIONS.c &&
						PARSED_CONDITIONS.c.length > 0 &&
						Array.isArray(SHOWC)
					) {
						for (let i = 0; i < SHOWC.length; i++) {
							PARSED_CONDITIONS.c[i].showc = SHOWC[i];
						}
					}
				}

				if (PARSED_CONDITIONS.show != undefined) {
					const SHOW = PARSED_CONDITIONS.show;
					PARSED_CONDITIONS.showc = SHOW;
					delete PARSED_CONDITIONS.show;
				}
			}

			if (
				PARSED_CONDITIONS &&
				PARSED_CONDITIONS.c &&
				PARSED_CONDITIONS.c.length >= 1
			) {
				node.data.c = PARSED_CONDITIONS;
			}
		}

		return node;
	});

	const NODES_WITH_CHILDREN = moodleParentingSetter(CONDITIONATED_NODES);

	const NEW_MAP = {
		id: uniqueId(),
		name: `Mapa importado desde ${metadata.name} (${maps.length})`,
		versions: [
			{
				id: uniqueId(),
				name: "Primera versión",
				lastUpdate: new Date().toLocaleDateString(),
				default: "true",
				blocks_data: [...NODES_WITH_CHILDREN],
			},
		],
	};
	return NEW_MAP;
}

/**
 * Parses the resource conditions to node conditions. (From LMS to LTI)
 * @param {Array} conditionArray - Condition array.
 * @param {Array} nodes - Node array
 * @returns {Array} A node array with the correct conditions.
 */
function moodleConditionalIDAdder(conditionArray, nodes) {
	// Create a deep copy of the original array
	let newArray = JSON.parse(JSON.stringify(conditionArray));
	for (let i = 0; i < newArray.length; i++) {
		if (typeof newArray[i] === "object" && newArray[i] !== null) {
			if (conditionArray[i].type === "completion") {
				newArray[i].cm = LMSResourceToId(newArray[i].cm, nodes);
				if (!newArray[i].cm) {
					newArray = newArray.filter((item, index) => index !== i);
					i--;
					break;
				}
			}

			if (conditionArray[i].type === "grade") {
				newArray[i].cm = LMSResourceToId(newArray[i].id, nodes);
				if (!newArray[i].cm) {
					newArray = newArray.filter((item, index) => index !== i);
					i--;
					break;
				}
			}

			if (conditionArray[i].type === "date") {
				newArray[i].t = parseDate(newArray[i].t);
			}

			if (conditionArray[i].type === "group") {
				newArray[i].groupId = newArray[i].id;
			}

			if (conditionArray[i].type === "grouping") {
				newArray[i].groupingId = newArray[i].id;
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

/**
 * Gets the IDs used in the completion and grade conditions.
 * @param {Array} conditionArray - Condition array.
 * @returns {Array} An array of the IDs used.
 */
function moodleFlowConditionalsExtractor(conditionArray) {
	let cmValues = [];
	if (conditionArray) {
		for (let i = 0; i < conditionArray.length; i++) {
			if (typeof conditionArray[i] === "object" && conditionArray[i] !== null) {
				// If the object has type "completion" or "grade", add the value of "cm" to the array
				if (
					conditionArray[i].type === "completion" ||
					conditionArray[i].type === "grade"
				) {
					if (conditionArray[i].cm) cmValues.push(conditionArray[i].cm);
				}

				// If the object has a property "c", enter that property
				if ("c" in conditionArray[i]) {
					cmValues = cmValues.concat(
						moodleFlowConditionalsExtractor(conditionArray[i].c)
					);
				}
			}
		}
	}

	return cmValues;
}

/**
 * Sets the correct children for the nodes.
 * @param {Array} nodeArray - Node array.
 * @returns {Array} The array with the correct children.
 */
function moodleParentingSetter(nodeArray) {
	// Create a deep copy of the original array
	const NEW_ARRAY = JSON.parse(JSON.stringify(nodeArray));

	for (let i = 0; i < nodeArray.length; i++) {
		if (nodeArray[i]?.type !== "badge") {
			if (nodeArray[i]?.data?.c) {
				const PARENTS = moodleFlowConditionalsExtractor(nodeArray[i].data.c.c);
				if (PARENTS) {
					if (PARENTS.length > 0) {
						PARENTS.forEach((parent) => {
							const PARENT_FOUND = nodeArray.find((node) => node.id == parent);
							if (PARENT_FOUND) {
								NEW_ARRAY.find(
									(node) => node.id == PARENT_FOUND.id
								).data.children.push(nodeArray[i].id);
							}
						});
					}
				}
			}
		} else {
			const COMPLETION_CONDITION = nodeArray[i].data?.c?.params?.find(
				(condition) => condition.type == "completion"
			);
			if (COMPLETION_CONDITION) {
				let parents = [];
				COMPLETION_CONDITION.params.map((node) => {
					parents.push(node.id);
				});

				parents.forEach((parent) => {
					const PARENT_FOUND = nodeArray.find((node) => node.id == parent);
					if (PARENT_FOUND) {
						NEW_ARRAY.find(
							(node) => node.id == PARENT_FOUND.id
						).data.children.push(nodeArray[i].id);
					}
				});
			}
		}
	}

	return NEW_ARRAY;
}

/**
 * Clamps and reorders the nodes for Moodle.
 * @param {Array} nodeArray - Node array.
 * @returns {Array} The reordered node array.
 */
export function clampNodesOrderMoodle(nodeArray) {
	const NEW_ARRAY = [];
	let maxSection = 0;
	nodeArray.forEach((node) => {
		if (maxSection < node.data.section) maxSection = node.data.section;
	});
	for (let i = 0; i <= maxSection; i++) {
		const NEW_SECTION = [];
		const SECTION_ARRAY = nodeArray.filter((node) => node.data.section == i);
		// Sort sectionArray by data.order, undefined values go first
		SECTION_ARRAY.sort((a, b) => {
			if (a.data.order === undefined) return -1;
			if (b.data.order === undefined) return 1;
			return a.data.order - b.data.order;
		});
		for (let k = 0; k < SECTION_ARRAY.length; k++) {
			NEW_SECTION.push({
				...SECTION_ARRAY[k],
				data: { ...SECTION_ARRAY[k].data, order: k },
			});
		}
		NEW_ARRAY.push(...NEW_SECTION);
	}
	return getUpdatedArrayById(NEW_ARRAY, nodeArray);
}

/**
 * Parses the badges to the moodle format (Used in the exportation)
 * @param {Object} node - Reactflow's Node.
 * @param {Array} nodeArray - Node array.
 * @param {Object} metaData - metaData object.
 * @returns {Object} The node with the correct condition format.
 */
export function parseMoodleBadgeToExport(node, nodeArray, metaData) {
	let newNode = node;
	let newConditions = [];

	const extractCondition = (condition) => {
		const getResourceById = (id) => {
			return getNodeById(id, nodeArray)?.data?.lmsResource;
		};

		const CRITERIA_TYPE = condition.criteriatype;
		const NEW_METHOD = condition.op == "&" ? 1 : 2;
		if (condition.c) delete condition.c;
		switch (condition.type) {
			case "conditionsGroup": {
				return {
					criteriatype: CRITERIA_TYPE,
					method: NEW_METHOD,
					params: [],
					descriptionformat: 1,
					description: "",
				};
			}
			case "completion": {
				const ARRAY = [];
				condition.params.map((param) => {
					ARRAY.push({
						name: `module_${getResourceById(param.id)}`,
						value: getResourceById(param.id),
					});
					if (param.date) {
						ARRAY.push({
							name: `bydate_${getResourceById(param.id)}`,
							value: (Date.parse(param.date) / 1000).toString(), //UNIX
						});
					}
				});
				return {
					descriptionformat: 1,
					description: "",
					criteriatype: CRITERIA_TYPE,
					method: NEW_METHOD,
					params: ARRAY,
				};
			}
			case "badgeList":
				return {
					descriptionformat: 1,
					description: "",
					criteriatype: CRITERIA_TYPE,
					method: NEW_METHOD,
					params: condition.params.map((param) => {
						return {
							name: `badge_${param}`,
							value: param,
						};
					}),
				};
			case "skills":
				return {
					descriptionformat: 1,
					description: "",
					criteriatype: CRITERIA_TYPE,
					method: NEW_METHOD,
					params: condition.params.map((param) => {
						return {
							name: `competency_${param}`,
							value: param,
						};
					}),
				};
			case "role":
				return {
					descriptionformat: 1,
					description: "",
					criteriatype: CRITERIA_TYPE,
					method: NEW_METHOD,
					params: condition.params.map((param) => {
						return {
							name: `role_${param}`,
							value: param,
						};
					}),
				};
			case "courseCompletion":
				const ARRAY = [];
				ARRAY.push({
					name: `course_${metaData.course_id}`,
					value: metaData.course_id,
				});

				if (condition.method) {
					ARRAY.push({
						name: `grade_${metaData.course_id}`,
						value: condition.method,
					});
				}

				if (condition.dateTo) {
					ARRAY.push({
						name: `bydate_${metaData.course_id}`,
						value: (Date.parse(condition.dateTo) / 1000).toString(),
					});
				}

				return {
					descriptionformat: 1,
					description: "",
					criteriatype: CRITERIA_TYPE,
					method: 1,
					params: ARRAY,
				};
		}

		return condition;
	};

	if (node.c) {
		const FLAT_CONDITIONS = [node.c, ...node.c.params];

		FLAT_CONDITIONS.map((condition) => {
			newConditions.push(extractCondition(condition));
		});

		delete newNode.c;
		newNode.conditions = newConditions;
	}

	return newNode;
}

/**
 * Parses the gradables to a correct format depending of the node type.
 * @param {Object} node - Reactflow's Node.
 * @returns {Object} The node with the parsed gradables.
 */
export function parseMoodleCalifications(node) {
	if (node.g) {
		if (node.type != "generic") {
			const og = node.g;

			let newGrades;

			newGrades = {
				hasConditions: og.hasConditions || false,
				hasToBeSeen: og.hasToBeSeen || false,
				hasToBeQualified: og.hasToBeQualified || false,
				data: {
					min: og.data.min || 0,
					max: og.data.max || 0,
					hasToSelect: og.data.hasToSelect || false,
				},
			};
			return { ...node, g: newGrades };
		} else {
			return { ...node, g: undefined };
		}
	} else {
		return node;
	}
}

/**
 * Removes the property type from the conditions of the type "conditionsGroup"
 * @param {Object} c - Node conditions property
 * @returns {Array} New node conditions property
 */
export function parseMoodleConditionsGroupOut(c) {
	const NEWC = { ...c };

	if (c) {
		if (c.type == "conditionsGroup") {
			delete NEWC.type;
		}

		if (c.c) {
			if (Array.isArray(c.c)) {
				NEWC.c = c.c.map((item) => {
					if (item.c) {
						return parseMoodleConditionsGroupOut(item);
					}
					return item;
				});
			} else if (typeof c.c === "object" && c.c !== null) {
				NEWC.c = parseMoodleConditionsGroupOut(c.c);
			}
		}
	}

	return NEWC;
}

/**
 * Checks if completion condition exists in the node, and if needs a qualification
 *
 * @export
 * @param {Object} node - The node to check.
 * @param {string} typeName - Type name to search for.
 * @returns {boolean} Returns the true if exists, false if it isn't
 */
export function hasConditionsNeedingQualifications(node) {
	const recursiveGet = (c, array = []) => {
		if (c.c) {
			c.c.forEach((condition) => {
				if (condition.type != "conditionsGroup") {
					if (condition.type == "completion") {
						if (condition.e > 1) array.push(condition.type);
					}
				} else {
					if (condition.c) {
						array.push(...recursiveGet(condition, array));
					}
				}
			});
		}

		return array;
	};
	if (node.data.c) {
		const TYPES = [...new Set(recursiveGet(node.data.c))];
		return TYPES.length > 0 ? true : false;
	}
	return false;
}

/**
 * Checks if completion condition exists in the node
 *
 * @export
 * @param {Object} node - The node to check.
 * @param {string} typeName - Type name to search for.
 * @returns {boolean} Returns the true if exists, false if it isn't
 */
export function hasConditionsNeedingCompletion(node) {
	const recursiveGet = (c, array = []) => {
		if (c.c) {
			c.c.forEach((condition) => {
				if (condition.type != "conditionsGroup") {
					if (condition.type == "completion") {
						array.push(condition.type);
					}
				} else {
					if (condition.c) {
						array.push(...recursiveGet(condition, array));
					}
				}
			});
		}

		return array;
	};
	if (node.data.c) {
		const TYPES = [...new Set(recursiveGet(node.data.c))];
		return TYPES.length > 0 ? true : false;
	}
	return false;
}
