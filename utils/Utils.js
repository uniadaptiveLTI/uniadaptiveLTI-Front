import { clampNodesOrderMoodle } from "./Moodle";
import { clampNodesOrderSakai } from "./Sakai";

/**
 * Returns a new array with updated entries from the original array.
 * @param {Object|Object[]} updatedEntry - The entry or entries to be updated in the original array. Each entry must have an id property.
 * @param {Object[]} originalArray - The original array of entries. Each entry must have an id property.
 * @returns {Object[]} A new array with the updated entries. If an entry in the original array does not have a matching id in the updatedEntry, it is returned unchanged.
 */
export const getUpdatedArrayById = (updatedEntry, originalArray) => {
	const newEntries = Array.isArray(updatedEntry)
		? updatedEntry
		: [updatedEntry];

	if (originalArray.length > 0) {
		return originalArray.map((oldEntry) => {
			const newEntry = newEntries.find((entry) => entry.id === oldEntry.id);
			return newEntry ? { ...oldEntry, ...newEntry } : oldEntry;
		});
	} else {
		return [];
	}
};

/**
 * Filters an array by the value of a specific property
 * @param {String} property - The property to filter
 * @param {any} value - The wanted value
 * @param {Object[]} array - The array
 * @returns {Object[]|undefined} - Returns the array filtered, or undefined was not one.
 */
export const getByProperty = (property, value, array) => {
	if (Array.isArray(array)) {
		return array.filter((item) => item[property] === value);
	} else {
		return undefined;
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

/**
 * Capitalizes the first letter of a string.
 * @param {string} string - The string to capitalize.
 * @return {string} The string with the first letter capitalized.
 */
export function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Generates a unique identifier based on the current date and a random number.
 * @return {string} The generated unique identifier.
 */
export const uniqueId = () => parseInt(Date.now() * Math.random()).toString();

/**
 * Calculates the nearest power of two to a given number.
 * @param {number} n - The number to approximate.
 * @return {number} The nearest power of two to n.
 */
export function nearestPowerOfTwo(n) {
	return Math.pow(2, Math.round(Math.log(n) / Math.log(2)));
}

/**
 * Sorts an array of objects by a property alphabetically.
 * @param {Object[]} array - The array to sort.
 * @param {string} property - The property to sort by.
 * @param {string} [subproperty] - The subproperty to sort by, if the property is an object.
 * @return {Object[]} The array sorted by the property or subproperty indicated.
 */
export function orderByPropertyAlphabetically(array, property, subproperty) {
	if (subproperty) {
		return [...array].sort((a, b) =>
			a[property][subproperty].localeCompare(b[property][subproperty])
		);
	} else {
		return [...array].sort((a, b) => a[property].localeCompare(b[property]));
	}
}

/**
 * Checks if an object is in an array by its id property.
 * @param {Object} obj - The object to search for.
 * @param {Object[]} arr - The array to search in.
 * @return {boolean} True if the object is in the array, false otherwise.
 */
export function inArrayById(obj, arr) {
	return arr.some((x) => x.id === obj.id);
}

/**
 * Checks if all the objects in an array are in another array by their id property.
 * @param {Object[]} arr1 - The first array of objects.
 * @param {Object[]} arr2 - The second array of objects.
 * @return {boolean} True if all the objects in the first array are in the second, false otherwise.
 */
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

/**
 * Parses a string and returns a boolean value.
 * @param {string} str - The string to parse.
 * @returns {boolean} True if the string is "true" (case-insensitive), false otherwise.
 */
export function parseBool(str) {
	if (str) {
		return str.toLowerCase() == "true" ? true : false;
	}
	return false;
}

/**
 * Returns true if the value is unique in the array, false otherwise.
 * @param {*} value - The value to check for uniqueness.
 * @param {Array} array - The array itself.
 * @returns {boolean} - Whether the value is unique or not.
 */
export function isUnique(value, array) {
	let isUnique = false;
	let findings = 0;
	array.forEach((el) => {
		if (el === value) {
			findings++;
		}
	});
	if (findings == 1) isUnique = true;
	return isUnique;
}

/**
 * Encodes a given string to base64.
 * @param {string} [string=""] - The string to encode to base64. Defaults to an empty string.
 * @returns {string} The base64 encoded version of the given string.
 */
export function base64Encode(string = "") {
	const buffer = Buffer.from(string, "utf-8");
	const base64 = buffer.toString("base64");
	return base64;
}

/**
 * Decodes a given base64 string to a regular string.
 * @param {string} [base64=""] - The base64 string to decode. Defaults to an empty string.
 * @returns {string} The decoded version of the given base64 string.
 */
export function base64Decode(base64 = "") {
	const buffer = Buffer.from(base64, "base64");
	const string = buffer.toString("utf-8");
	return string;
}

/**
 * Moves an element in an array from one index to another.
 * @param {number} from - The index of the element to move.
 * @param {number} to - The index to move the element to.
 * @param {Array} array - The array to move the element in.
 * @returns {Array} A new array with the element moved from the specified index to the specified index.
 */
export function arrayMoveByIndex(from, to, array) {
	const newArray = [...array];
	newArray.splice(to, 0, newArray.splice(from, 1)[0]);
	return newArray;
}

/**
 * Moves an element in an array with objects that have an "id" property from one ID to another.
 * @param {number|string} from - The ID of the element to move.
 * @param {number|string} to - The ID of the element to move the element after.
 * @param {Array<Object>} array - The array to move the element in.
 * @returns {Array<Object>} A new array with the element moved from the specified ID to after the specified ID.
 */
export function arrayMoveById(from, to, array) {
	const newArray = [...array];
	const fromIndex = newArray.findIndex((item) => item.id == from);
	const toIndex = newArray.findIndex((item) => item.id == to);
	newArray.splice(toIndex, 0, newArray.splice(fromIndex, 1)[0]);
	return newArray;
}

/**
 * Searches a JSON data object for conditions with types that match a given array of target types, and adds them to a results array.
 * @param {Object} jsonData - The JSON data object to search for conditions with types that match the target types.
 * @param {Array<string>} targetTypes - An array of target types to search for in the JSON data object's conditions.
 * @param {Array<Object>} results - An array to add any found conditions with types that match the target types to.
 */
export function searchConditionForTypes(jsonData, targetTypes, results) {
	if (targetTypes.includes(jsonData.type)) {
		results.push(jsonData);
	}

	if (jsonData.c && Array.isArray(jsonData.c)) {
		for (const condition of jsonData.c) {
			searchConditionForTypes(condition, targetTypes, results);
		}
	}
}

/**
 * Finds completion and qualification conditions in a given object and returns them in an array.
 * @param {Object} obj - The object to search for completion and qualification conditions in.
 * @returns {Array<Object>} An array containing any found completion and qualification conditions in the given object.
 */
export function findCompletionAndGrade(obj) {
	let results = [];

	function search(obj) {
		if (obj.type === "completion" || obj.type === "grade") {
			results.push(obj);
		}

		if (obj.c && Array.isArray(obj.c)) {
			obj.c.forEach((condition) => {
				search(condition);
			});
		}
	}

	search(obj);

	return results;
}

/**
 * Updates badge conditions for a given block node target and block node source.
 * @param {Object} blockNodeTarget - The block node target to update badge conditions for.
 * @param {Object} blockNodeSource - The block node source used when updating badge conditions for the block node target.
 */
export function updateBadgeConditions(blockNodeTarget, blockNodeSource) {
	// Variable to store the conditions of the target node
	let conditions = blockNodeTarget.data.c.params;

	// Find method to get the condition of type completion
	const conditionExists = conditions.find(
		(condition) => condition.type === "completion"
	);

	// Condition to know if the condition exists
	if (conditionExists) {
		// Condition to check if the activity list has more than one entry
		if (conditionExists.params.length > 1) {
			// Filter method to delete the specific node from the activity list
			conditionExists.params = conditionExists.params.filter(
				(node) => node.id !== blockNodeSource.id
			);
		} else {
			// Filter method to delete the condition type completion
			blockNodeTarget.data.c.params = conditions.filter(
				(node) => node.type !== "completion"
			);
		}
	} else {
		// Filter method to delete the condition type completion
		blockNodeTarget.data.c.params = conditions.filter(
			(condition) => condition.type !== "completion"
		);
	}
}

/**
 * Gets the HTTP prefix based on whether or not SSL is enabled in environment variables.
 * @returns {string} The HTTP prefix, either "http" or "https".
 */
export function getHTTPPrefix() {
	return window.location.protocol;
}

/**
 * Constructs a URL for fetching data from the server.
 * @param {Object} LTISettings - An object containing the LTI settings.
 * @param {string} [webservice] - An optional string to be appended to the URL.
 * @returns {string} The constructed URL for fetching data from the server.
 */
export function getFetchUrl(LTISettings, webservice) {
	return webservice == undefined
		? `${getHTTPPrefix()}//${LTISettings.back_url}`
		: `${getHTTPPrefix()}//${LTISettings.back_url}/${webservice}`;
}

/**
 * Fetches data from the back-end using the specified token, webservice, and method.
 * @async
 * @function
 * @param {Object} LTISettings - The LTI settings object.
 * @param {string} token - The token to use for authentication.
 * @param {string} webservice - The webservice to fetch data from.
 * @param {string} [method="GET"] - The HTTP method to use for the request.
 * @param {Object} [load] - The payload to send with the request.
 * @returns {Promise<Object>} A Promise that resolves to the fetched data.
 */
export async function fetchBackEnd(
	LTISettings,
	token,
	webservice,
	method = "GET",
	load
) {
	const fetchURL = getFetchUrl(LTISettings, webservice);
	let fetchResponse;

	if (method === "POST") {
		const response = await fetch(fetchURL, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ ...load, token }),
		});
		fetchResponse = await response.json();
	} else if (method === "GET") {
		fetchResponse = (
			await fetch(
				fetchURL + `?${new URLSearchParams({ ...load, token }).toString()}`
			)
		).json();
	}

	return fetchResponse;
}

/**
 * Gets a section from an array of sections based on its position property value.
 * @param {Array<Object>} sectionArray - An array of sections to search for a section with a matching position property value.
 * @param {number} sectionPosition - The position property value of the section to search for in the section array.
 * @returns {Object|undefined} The section with a matching position property value, or undefined if not found.
 */
export function getSectionFromPosition(sectionArray, sectionPosition) {
	return sectionArray.find((section) => section.position == sectionPosition);
}

/**
 * Gets a section ID from an array of sections based on its position property value.
 * @param {Array<Object>} sectionArray - An array of sections to search for a section with a matching position property value and get its ID property value from.
 * @param {number} sectionPosition - The position property value of the section whose ID property value should be returned from the section array.
 * @returns {*} The ID property value of the section with a matching position property value, or undefined if not found.
 */
export function getSectionIDFromPosition(sectionArray, sectionPosition) {
	return getSectionFromPosition(sectionArray, sectionPosition)?.id;
}

/**
 * Method to parse the given date using day, month and year, in case dateComplete param true then add hour and minute
 * @param {String} date - Date string, or UNIX Date
 * @param {boolean} dateComplete - Boolean to define if the date must be parsed with hour and minute
 * @returns {*} Returns formatted date string
 */
export function parseDate(date, dateComplete) {
	let d = date;

	if (typeof d === "number") {
		d = new Date(d * 1000);
	} else if (!(d instanceof Date)) {
		d = new Date(d);
	}

	if (dateComplete) {
		return d.toLocaleDateString("es-ES", {
			day: "numeric",
			month: "long",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	} else {
		return d
			.toLocaleDateString("es-ES", {
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
			})
			.split("/")
			.reverse()
			.join("-");
	}
}

/**
 * Method to parse the given date using day, month and year, in case dateComplete param true then add hour and minute
 * @param {String} date - Date string, or UNIX Date
 * @param {boolean} full - (Default: true) Boolean to define change if full date or partial date
 * @returns {String} Returns formatted date string
 */
export function parseDateToString(date, full = true) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	if (full) {
		const hours = String(date.getHours()).padStart(2, "0");
		const minutes = String(date.getMinutes()).padStart(2, "0");
		return `${year}-${month}-${day}T${hours}:${minutes}`;
	} else {
		return `${year}-${month}-${day}`;
	}
}

/**
 * Method to used to save the node version
 * @param {Node} rfNodes - Node Array
 * @param {Object} metaData - metaData object
 * @param {String} platform - Platform string
 * @param {Object} userData - userData object
 * @param {Object} mapSelected - current map object
 * @param {Object} versionJson - current version object
 * @param {Object} LTISettings - LTISettings object
 * @param {defaultToastSuccess} defaultToastSuccess - Toast Success Settings Object
 * @param {defaultToastError} defaultToastSuccess - Toast Error Settings Object
 * @param {Function} toast - Toast function
 * @param {Boolean} enable - Date string, or UNIX Date
 * @param {Object} responseData - responseData object
 */
export async function saveVersion(
	rfNodes,
	metaData,
	platform,
	userData,
	mapSelected,
	versionJson,
	LTISettings,
	defaultToastSuccess,
	defaultToastError,
	toast,
	enable,
	responseData,
	lesson
) {
	// Helper function to clean the nodes
	function cleanNodes(nodes) {
		return nodes.map((node) => {
			// Copy the node object without the properties that want to be removed
			const {
				height,
				width,
				positionAbsolute,
				dragging,
				selected,
				targetPosition,
				...cleanedNode
			} = node;
			return cleanedNode;
		});
	}
	// Clean the nodes using the helper function
	const cleanedNodes = cleanNodes(rfNodes);
	// Define constants for the success and error messages
	const successMessage = "Versión guardada con éxito";
	const errorMessage = "No se pudo guardar";
	try {
		const saveData = {
			instance_id: metaData.instance_id,
			course_id: metaData.course_id,
			platform: platform,
			user_id: userData.user_id,
			map: {
				id: mapSelected.id,
				name: mapSelected.name,
				versions: {
					...versionJson,
					lastUpdate: new Date().toLocaleString("es-ES"),
					blocksData: cleanedNodes,
				},
			},
		};

		if (platform == "sakai") {
			saveData.lesson_id = lesson;
		}

		const response = await fetchBackEnd(
			LTISettings,
			sessionStorage.getItem("token"),
			"api/lti/store_version",
			"POST",
			{ saveData: saveData }
		);

		if (response && response.ok) {
			if (responseData) {
				switch (responseData) {
					case "SUCCESSFUL_EXPORT":
						console.log(
							"%c ✔ La exportación y el guardado de la página de contenidos se han completado con éxito.",
							"background: #D7FFD7; color: black; padding: 4px;"
						);
						toast(
							"La exportación y el guardado de la página de contenidos se han completado con éxito.",
							defaultToastSuccess
						);
						break;
					case "SUCCESSFUL_EXPORT_WITHOUT_CONDITIONS":
						console.log(
							"%c ✔ La exportación (sin condiciones) y el guardado de la página de contenidos se han completado con éxito.",
							"background: #D7FFD7; color: black; padding: 4px;"
						);
						toast(
							"La exportación (sin condiciones) y el guardado de la página de contenidos se han completado con éxito.",
							defaultToastSuccess
						);
						break;
				}
			} else {
				// If the response is successful, show the success message
				console.log(
					"%c ✔ Versión guardada con éxito",
					"background: #D7FFD7; color: black; padding: 4px;"
				);
				toast(successMessage, defaultToastSuccess);
			}
		} else {
			if (responseData) {
				switch (responseData) {
					case "SUCCESSFUL_EXPORT":
						console.log(
							"%c ⚠️ La exportación se ha completado con éxito, el guardado ha fallado",
							"background: #FFE3D7; color: black; padding: 4px;"
						);
						toast(
							"La exportación se ha completado con éxito, el guardado ha fallado",
							defaultToastError
						);
						break;
					case "SUCCESSFUL_EXPORT_WITHOUT_CONDITIONS":
						console.log(
							"%c ⚠️ La exportación (sin condiciones) se ha completado con éxito, el guardado ha fallado",
							"background: #FFE3D7; color: black; padding: 4px;"
						);
						toast(
							"La exportación (sin condiciones) se ha completado con éxito, el guardado ha fallado",
							defaultToastError
						);
						break;
				}
			} else {
				console.log(
					"%c ❌ No se pudo guardar",
					"background: #FFD7DC; color: black; padding: 4px;"
				);
				// If the response is not successful, show the error message
				toast(errorMessage, defaultToastError);
			}
		}
	} catch (e) {
		// If an error occurs when making the request, show the error message and log the error in the console
		console.error(e);
		toast(errorMessage, defaultToastError);
	} finally {
		enable(false);
	}
}

/**
 * Redirects to the correct clampNodesOrder given the platform
 * @param {Array} nodeArray - ReactFlow's node array.
 * @param {String} platform - The platform name as a string
 * @returns {Array} The reordered node array.
 */
export function clampNodesOrder(nodeArray, platform) {
	switch (platform) {
		case "moodle":
			return clampNodesOrderMoodle(nodeArray);
		case "sakai":
			return clampNodesOrderSakai(nodeArray);
		case "default":
			return nodeArray;
	}
}

/**
 * Gets the ID of a node given its lmsResource ID
 * @param {String} resourceId - Id on string.
 * @param {Array} nodes - Node array.
 * @returns {String} The ID of the node.
 */
export function LMSResourceToId(resourceId, nodes) {
	const node = nodes.find((node) => node.data.lmsResource == resourceId);
	return node ? node.id : undefined;
}

/**
 * This function handles name collisions by appending a count and separator to the name if it already exists in the array.
 * @param {string} name - The name to check for collisions.
 * @param {string[]} [array=[]] - The array of existing names.
 * @param {boolean} [forceCount=false] - Whether to force appending a count to the name.
 * @param {string} [separatorType=""] - The type of separator to use when appending the count.
 * @returns {string} - The final name after handling collisions.
 */
export function handleNameCollision(
	name,
	array = [],
	forceCount = false,
	separatorType = ""
) {
	const prefixSuffixMap = {
		"[": "]",
		"(": ")",
		"{": "}",
		"<": ">",
	};

	const prefix = prefixSuffixMap[separatorType] ? separatorType : "";
	const suffix = prefixSuffixMap[separatorType] || separatorType;

	let nameCount = array.reduce(
		(count, arrayName) => (arrayName.startsWith(name) ? count + 1 : count),
		0
	);
	let finalName = name;

	if (nameCount > 0 || forceCount) {
		finalName = `${name} ${prefix}${nameCount + 1}${suffix}`;
	}

	if (array.includes(finalName)) {
		return handleNameCollision(finalName, array, false, separatorType);
	}

	return finalName;
}

export function sakaiTypeSwitch(node) {
	switch (node.type) {
		case "resource":
		case "html":
		case "text":
			return { type: 1, contentRef: node.id.toString() };
		case "assign":
			return { type: 3, contentRef: "/assignment/" + node.id };
		case "exam":
			return { type: 4, contentRef: "/sam_pub/" + node.id };
		case "url":
			return { type: 6, contentRef: node.id.toString() };
		case "forum":
			return { type: 8, contentRef: "/forum_forum/" + node.id };
		case "folder":
			return { type: 20, dataDirectory: node.id.toString() };
	}
}
