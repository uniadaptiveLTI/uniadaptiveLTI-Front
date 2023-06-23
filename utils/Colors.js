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
	let rootColor = color;
	if (!color.startsWith("#")) {
		rootColor = getRootStyle(color);
	}
	return { color: getContrastingColor(rootColor), background: rootColor };
}

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
