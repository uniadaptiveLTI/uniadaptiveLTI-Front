/**
 * Gets the root style for a given style.
 * @param {string} [style=""] - The style to get the root style for. Defaults to an empty string.
 * @returns {string} The root style for the given style.
 */
export function getRootStyle(style = "") {
	return getComputedStyle(document.body).getPropertyValue(style);
}

/**
 * Gets a contrasting text color for a given color.
 * @param {string} [color="#000000"] - The color to get a contrasting text color for. Defaults to black.
 * @returns {string} A contrasting text color for the given color.
 */
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

/**
 * Gets a contrasting color for a given color.
 * @param {string} [color="#000000"] - The color to get a contrasting color for. Defaults to black.
 * @returns {string} A contrasting color for the given color.
 */
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

/**
 * Calculates the luma of a given color.
 * @param {string|Array<number>} color - The color to calculate the luma of. Can be a hex string or an array of RGB values 0-255.
 * @returns {number} The luma of the given color.
 */
function luma(color) {
	// color can be a hx string or an array of RGB values 0-255
	var rgb = typeof color === "string" ? hexToRGBArray(color) : color;
	return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]; // SMPTE C, Rec. 709 weightings
}

/**
 * Converts a hex color string to an array of RGB values 0-255.
 * @param {string} color - The hex color string to convert to an array of RGB values 0-255.
 * @returns {Array<number>} An array of RGB values 0-255 representing the given hex color string.
 */
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

/**
 * Gets an object containing automatic colors for a given color.
 * @param {string} color - The color to get automatic colors for.
 * @returns {Object} An object containing automatic colors for the given color.
 */
export function getAutomaticColorsObject(color) {
	let rootColor = color;
	if (!color.startsWith("#")) {
		rootColor = getRootStyle(color);
	}
	return { color: getContrastingColor(rootColor), background: rootColor };
}

/**
 * Gets an object containing automatic text colors for a given color.
 * @param {string} color - The color to get automatic text colors for.
 * @returns {Object} An object containing automatic text colors for the given color.
 */
export function getAutomaticTextColorsObject(color) {
	let rootColor = color;
	if (!color.startsWith("#")) {
		rootColor = getRootStyle(color);
	}
	return {
		color: getContrastingTextColor(rootColor),
		background: rootColor,
	};
}

const reusableTypes = [
	"primary",
	"secondary",
	"light",
	"success",
	"warning",
	"error",
	"dev",
];

/**
 * Gets an object containing automatic reusable styles for a given type, with options to specify if it contains text, has borders, and has radius.
 * @param {string} [type="primary"] - The type to get automatic reusable styles for. Defaults to "primary".
 * @param {boolean} [containsText=true] - Whether or not the styles are for something that contains text. Defaults to true.
 * @param {boolean} [hasBorders=true] - Whether or not the styles should include borders. Defaults to true.
 * @param {boolean} [hasRadius=true] - Whether or not the styles should include radius. Defaults to true.
 * @returns {Object} An object containing automatic reusable styles for the given type and options.
 */
export function getAutomaticReusableStyles(
	type = "primary",
	containsText = true,
	hasBorders = true,
	hasRadius = true
) {
	const bgColor = getRootStyle(`--${type}-background-color`);
	const border = hasBorders ? getRootStyle(`--${type}-border`) : "none";
	const borderRadius = hasRadius
		? getRootStyle(`--${type}-border-radius`)
		: "0";
	if (reusableTypes.includes(type)) {
		let color = "";
		if (type != "dev") {
			color = containsText
				? getContrastingTextColor(bgColor)
				: getContrastingColor(bgColor);
		} else {
			color = "#fffff";
		}
		return {
			color: color,
			background: bgColor,
			border: border,
			borderRadius: borderRadius,
			fontWeight: type == "dev" ? "bolder" : "inherit",
			textShadow: type == "dev" ? "0 0 5px BLACK" : "inherit",
		};
	} else {
		const errorColor = "#FF00FF";

		return {
			color: "#ffffff",
			background: errorColor,
			border: hasBorders ? "4px dotted white" : "none",
			borderRadius: hasRadius ? "100%" : "0",
		};
	}
}
