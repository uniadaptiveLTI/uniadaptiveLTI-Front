/**
 * Gets the root style for a given style.
 * @param {string} [style=""] - The style to get the root style for. Defaults to an empty string.
 * @returns {string} The root style for the given style.
 */
export function getRootStyle(style = "") {
	return getComputedStyle(document.body).getPropertyValue(style);
}

/**
 * Sets the root style for a given style to a specific value.
 * @param {string} [style=""] - The style to set the root style for. Defaults to an empty string.
 * @param {string} [value=""] - The value to set for the root style. Defaults to an empty string.
 */
export function setRootStyle(style = "", value = "") {
	if (style != undefined && style != "") {
		document.body.style.setProperty(style, value);
	}
}

/**
 * Applies branding-related settings from an LTISettings object.
 * @param {Object} LTISettings - An object containing a 'branding' property with branding-related settings.
 * @returns {void}
 */
export function applyBranding(LTISettings) {
	if (LTISettings && LTISettings.branding) {
		const branding = LTISettings.branding;

		if (branding.main) {
			const main = branding.main;
			setRootStyle("--main-font-color", main.fontColor);
			setRootStyle("--bs-body-color", main.fontColor); //Replacing bootstrap defaults
			//FIXME: setRootStyle("--bs-modal-color", main.fontColor); //Replacing bootstrap defaults

			setRootStyle("--main-font-family", main.fontFamily);
			setRootStyle("--bs-body-font-family", main.fontFamily); //Replacing bootstrap defaults

			setRootStyle("--main-background-color", main.backgroundColor);
			setRootStyle("--bs-body-bg", main.backgroundColor); //Replacing bootstrap defaults
			//FIXME: setRootStyle("--bs-modal-bg", main.backgroundColor + " !important"); //Replacing bootstrap defaults

			setRootStyle(
				"--main-secondary-background-color",
				main.secondaryBackgroundColor
			);
			setRootStyle("--bs-secondary-bg", main.secondaryBackgroundColor); //Replacing bootstrap defaults

			setRootStyle("--main-third-background-color", main.thirdBackgroundColor);
			setRootStyle("--bs-tertiary-bg", main.thirdBackgroundColor); //Replacing bootstrap defaults

			//setRootStyle("--main-border-color", main.borderColor);
			//FIXME: MODALS setRootStyle("--bs-border-color", main.borderColor); //Replacing bootstrap defaults
			setRootStyle("--main-border-radius", main.borderRadius);
			setRootStyle("--bs-border-radius", main.borderRadius); //Replacing bootstrap defaults
		}
		if (branding.header) {
			const header = branding.header;

			setRootStyle("--header-font-color", header.fontColor);
			setRootStyle("--header-font-family", header.fontFamily);
			setRootStyle("--header-background-color", header.backgroundColor);

			if (header.actionButtons) {
				const actionButtons = header.actionButtons;

				setRootStyle(
					"--header-action-buttons-border-radius",
					actionButtons.borderRadius
				);
				/*setRootStyle(
					"--header-action-buttons-border",
					actionButtons.buttonsBorder
				); HAS TO BE REPLACED */
				setRootStyle(
					"--header-action-buttons-background-color",
					actionButtons.backgroundColor
				);
				setRootStyle(
					"--header-action-buttons-svg-filter",
					actionButtons.svgFilter
				);
			}

			if (header.versionDropdown) {
				const vD = header.versionDropdown;

				setRootStyle(
					"--header-version-dropdown-container-font-color",
					vD.fontColor
				);
				setRootStyle(
					"--header-version-dropdown-container-font-family",
					vD.fontFamily
				);
				setRootStyle(
					"--header-version-dropdown-container-background-color",
					vD.backgroundColor
				);
				setRootStyle(
					"--header-version-dropdown-box-shadow-color",
					vD.boxShadowColor
				);
			}

			setRootStyle(
				"--header-user-image-border-radius",
				header.userImageBorderRadius
			);

			setRootStyle(
				"--header-user-image-border-width",
				header.userImageBorderWidth
			);
			setRootStyle(
				"--header-user-image-border-color",
				header.userImageBorderColor
			);
		}
		if (branding.aside) {
			const aside = branding.aside;

			setRootStyle("--aside-font-color", aside.fontColor);
			setRootStyle("--aside-font-family", aside.fontFamily);
			setRootStyle("--aside-background-color", aside.backgroundColor);

			if (aside.collapse) {
				const collapse = aside.collapse;

				setRootStyle("--aside-collapse-icon-color", collapse.fontColor);
				setRootStyle(
					"--aside-collapse-icon-background-color",
					collapse.backgroundColor
				);
			}

			if (aside.logo) {
				const logo = aside.logo;

				setRootStyle("--aside-logo-background-color", logo.backgroundColor);
			}
		}
		if (branding.blockflow) {
			const blockflow = LTISettings.branding.blockflow;

			setRootStyle("--blockflow-font-color", blockflow.fontColor);
			setRootStyle("--blockflow-font-family", blockflow.fontFamily);
			setRootStyle("--blockflow-background-color", blockflow.backgroundColor);

			if (blockflow.label) {
				const label = blockflow.label;
				setRootStyle("--blockflow-label-font-color", label.fontColor);
				setRootStyle("--blockflow-label-font-family", label.fontFamily);
				setRootStyle(
					"--blockflow-label-background-color",
					label.backgroundColor
				);
			}

			if (blockflow.hover) {
				const hover = blockflow.hover;
				setRootStyle("--blockflow-hover-font-color", hover.fontColor);
				setRootStyle("--blockflow-hover-font-family", hover.fontFamily);
				setRootStyle(
					"--blockflow-hover-background-color",
					hover.backgroundColor
				);
			}

			setRootStyle(
				"--blockflow-inner-box-shadow-color",
				blockflow.innerBoxShadowColor
			);

			if (blockflow.node) {
				const node = blockflow.node;
				setRootStyle("--blockflow-node-border-width", node.borderWidth);
				setRootStyle("--blockflow-node-border-color", node.borderColor);
				setRootStyle("--blockflow-node-border-radius", node.borderRadius);
				setRootStyle(
					"--blockflow-handles-border-radius",
					node.handlesBorderRadius
				);
			}

			if (blockflow.edge) {
				const edge = blockflow.edge;
				setRootStyle("--blockflow-edge-font-color", edge.fontColor);
				setRootStyle("--blockflow-edge-background-color", edge.backgroundColor);
				setRootStyle("--blockflow-edge-border-width", edge.borderWidth);
				setRootStyle("--blockflow-edge-border-color", edge.borderColor);
				setRootStyle("--blockflow-edge-border-radius", edge.borderRadius);
			}

			if (blockflow.controls) {
				const controls = blockflow.controls;

				setRootStyle("--blockflow-controls-border", controls.border);

				if (controls.button) {
					const button = controls.button;
					setRootStyle(
						"--blockflow-controls-button-font-color",
						button.fontColor
					);
					setRootStyle(
						"--blockflow-controls-button-background-color",
						button.backgroundColor
					);
					setRootStyle("--blockflow-controls-button-border", button.border);
					setRootStyle(
						"--blockflow-controls-button-svg-filter",
						button.svgFilter
					);
				}
			}

			if (blockflow.minimap) {
				const minimap = blockflow.minimap;

				setRootStyle("--blockflow-minimap-border", minimap.border);
				setRootStyle(
					"--blockflow-minimap-background-color",
					minimap.backgroundColor
				);
			}
		}
	}
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
	type = "dev",
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
			//border: border,
			//borderRadius: borderRadius,
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
