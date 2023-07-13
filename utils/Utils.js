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
 * @param {number} index - The index of the value in the array.
 * @param {Array} self - The array itself.
 * @returns {boolean} - Whether the value is unique or not.
 */
export function isUnique(value, index, self) {
	return self.indexOf(value) === index;
}

export function base64Encode(string = "") {
	const buffer = Buffer.from(string, "utf-8");
	const base64 = buffer.toString("base64");
	return base64;
}

export function base64Decode(base64 = "") {
	const buffer = Buffer.from(base64, "base64");
	const string = buffer.toString("utf-8");
	return string;
}

export function arrayMoveByIndex(from, to, array) {
	const newArray = [...array];
	newArray.splice(to, 0, newArray.splice(from, 1)[0]);
	return newArray;
}

export function arrayMoveById(from, to, array) {
	const newArray = [...array];
	const fromIndex = newArray.findIndex((item) => item.id == from);
	const toIndex = newArray.findIndex((item) => item.id == to);
	newArray.splice(toIndex, 0, newArray.splice(fromIndex, 1)[0]);
	return newArray;
}

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

export function findCompletionAndQualification(obj) {
	let results = [];

	function search(obj) {
		if (obj.type === "completion" || obj.type === "qualification") {
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

export function updateBadgeConditions(blockNodeTarget, blockNodeSource) {
	// Variable to store the conditions of the target node
	let conditions = blockNodeTarget.data.c.c;

	// Find method to get the condition of type completion
	const conditionExists = conditions.find(
		(condition) => condition.type === "completion"
	);

	// Condition to know if the condition exists
	if (conditionExists) {
		// Condition to check if the activity list has more than one entry
		if (conditionExists.activityList.length > 1) {
			console.log("entro a eliminar solo una");

			// Filter method to delete the specific node from the activity list
			conditionExists.activityList = conditionExists.activityList.filter(
				(item) => item.id !== blockNodeSource.id
			);
		} else {
			// Filter method to delete the condition type completion
			blockNodeTarget.data.c.c = conditions.filter(
				(item) => item.type !== "completion"
			);
		}
	} else {
		// Filter method to delete the condition type completion
		blockNodeTarget.data.c.c = conditions.filter(
			(item) => item.type !== "completion"
		);
	}
}
