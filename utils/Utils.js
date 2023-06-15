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

export function getRootStyle(style = "") {
	return getComputedStyle(document.body).getPropertyValue(style);
}

export function getContrastingTextColor(color = "#000000") {
	let usedHash = false;
	if (color.startsWith("#")) {
		usedHash = true;
		color = color.substring(1);
	}
	return usedHash
		? "#" +
				(luma(color) >= 170
					? getRootStyle("--main-font-color").substring(1)
					: "fff")
		: luma(color) >= 170
		? getRootStyle("--main-font-color").substring(1)
		: "fff";
}

export function getContrastingColor(color = "#000000") {
	let usedHash = false;
	if (color.startsWith("#")) {
		usedHash = true;
		color = color.substring(1);
	}
	return usedHash
		? "#" + (luma(color) >= 165 ? "000" : "fff")
		: luma(color) >= 165
		? "000"
		: "fff";
}
function luma(color) {
	// color can be a hx string or an array of RGB values 0-255
	var rgb = typeof color === "string" ? hexToRGBArray(color) : color;
	return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]; // SMPTE C, Rec. 709 weightings
}
function hexToRGBArray(color) {
	if (color.length === 3)
		color =
			color.charAt(0) +
			color.charAt(0) +
			color.charAt(1) +
			color.charAt(1) +
			color.charAt(2) +
			color.charAt(2);
	else if (color.length !== 6) return color; //throw "Invalid hex color: " + color;
	var rgb = [];
	for (var i = 0; i <= 2; i++) rgb[i] = parseInt(color.substr(i * 2, 2), 16);
	return rgb;
}

export function getAutomaticColorsObject(color) {
	return { color: getContrastingColor(color), background: getRootStyle(color) };
}

export function getAutomaticTextColorsObject(color) {
	return {
		color: getContrastingTextColor(color),
		background: getRootStyle(color),
	};
}
