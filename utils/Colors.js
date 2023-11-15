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
		const BRANDING = LTISettings.branding;

		if (BRANDING.main) {
			const MAIN = BRANDING.main;
			setRootStyle("--main-font-color", MAIN.fontColor);
			setRootStyle("--bs-body-color", MAIN.fontColor); //Replacing bootstrap defaults
			//FIXME: setRootStyle("--bs-modal-color", main.fontColor); //Replacing bootstrap defaults

			setRootStyle("--main-font-family", MAIN.fontFamily);
			setRootStyle("--bs-body-font-family", MAIN.fontFamily); //Replacing bootstrap defaults

			setRootStyle("--main-background-color", MAIN.backgroundColor);
			setRootStyle("--bs-body-bg", MAIN.backgroundColor); //Replacing bootstrap defaults
			//FIXME: setRootStyle("--bs-modal-bg", main.backgroundColor + " !important"); //Replacing bootstrap defaults

			setRootStyle(
				"--main-secondary-background-color",
				MAIN.secondaryBackgroundColor
			);
			setRootStyle("--bs-secondary-bg", MAIN.secondaryBackgroundColor); //Replacing bootstrap defaults

			setRootStyle("--main-third-background-color", MAIN.thirdBackgroundColor);
			setRootStyle("--bs-tertiary-bg", MAIN.thirdBackgroundColor); //Replacing bootstrap defaults

			//setRootStyle("--main-border-color", main.borderColor);
			//FIXME: MODALS setRootStyle("--bs-border-color", main.borderColor); //Replacing bootstrap defaults
			setRootStyle("--main-border-radius", MAIN.borderRadius);
			setRootStyle("--bs-border-radius", MAIN.borderRadius); //Replacing bootstrap defaults
		}
		if (BRANDING.header) {
			const HEADER = BRANDING.header;

			setRootStyle("--header-font-color", HEADER.fontColor);
			setRootStyle("--header-font-family", HEADER.fontFamily);
			setRootStyle("--header-background-color", HEADER.backgroundColor);

			if (HEADER.actionButtons) {
				const ACTION_BUTTONS = HEADER.actionButtons;

				setRootStyle(
					"--header-action-buttons-border-radius",
					ACTION_BUTTONS.borderRadius
				);
				/*setRootStyle(
					"--header-action-buttons-border",
					actionButtons.buttonsBorder
				); HAS TO BE REPLACED */
				setRootStyle(
					"--header-action-buttons-background-color",
					ACTION_BUTTONS.backgroundColor
				);
				setRootStyle(
					"--header-action-buttons-svg-filter",
					ACTION_BUTTONS.svgFilter
				);
			}

			if (HEADER.versionDropdown) {
				const VERSION_DROPDOWN = HEADER.versionDropdown;

				setRootStyle(
					"--header-version-dropdown-container-font-color",
					VERSION_DROPDOWN.fontColor
				);
				setRootStyle(
					"--header-version-dropdown-container-font-family",
					VERSION_DROPDOWN.fontFamily
				);
				setRootStyle(
					"--header-version-dropdown-container-background-color",
					VERSION_DROPDOWN.backgroundColor
				);
				setRootStyle(
					"--header-version-dropdown-box-shadow-color",
					VERSION_DROPDOWN.boxShadowColor
				);
			}

			setRootStyle(
				"--header-user-image-border-radius",
				HEADER.userImageBorderRadius
			);

			setRootStyle(
				"--header-user-image-border-width",
				HEADER.userImageBorderWidth
			);
			setRootStyle(
				"--header-user-image-border-color",
				HEADER.userImageBorderColor
			);
		}
		if (BRANDING.aside) {
			const ASIDE = BRANDING.aside;

			setRootStyle("--aside-font-color", ASIDE.fontColor);
			setRootStyle("--aside-font-family", ASIDE.fontFamily);
			setRootStyle("--aside-background-color", ASIDE.backgroundColor);

			if (ASIDE.collapse) {
				const COLLAPSE = ASIDE.collapse;

				setRootStyle("--aside-collapse-icon-color", COLLAPSE.fontColor);
				setRootStyle(
					"--aside-collapse-icon-background-color",
					COLLAPSE.backgroundColor
				);
			}

			if (ASIDE.logo) {
				const LOGO = ASIDE.logo;

				setRootStyle("--aside-logo-background-color", LOGO.backgroundColor);
			}
		}
		if (BRANDING.blockflow) {
			const BLOCKFLOW = LTISettings.branding.blockflow;

			setRootStyle("--blockflow-font-color", BLOCKFLOW.fontColor);
			setRootStyle("--blockflow-font-family", BLOCKFLOW.fontFamily);
			setRootStyle("--blockflow-background-color", BLOCKFLOW.backgroundColor);

			if (BLOCKFLOW.label) {
				const LABEL = BLOCKFLOW.label;
				setRootStyle("--blockflow-label-font-color", LABEL.fontColor);
				setRootStyle("--blockflow-label-font-family", LABEL.fontFamily);
				setRootStyle(
					"--blockflow-label-background-color",
					LABEL.backgroundColor
				);
			}

			if (BLOCKFLOW.hover) {
				const HOVER = BLOCKFLOW.hover;
				setRootStyle("--blockflow-hover-font-color", HOVER.fontColor);
				setRootStyle("--blockflow-hover-font-family", HOVER.fontFamily);
				setRootStyle(
					"--blockflow-hover-background-color",
					HOVER.backgroundColor
				);
			}

			setRootStyle(
				"--blockflow-inner-box-shadow-color",
				BLOCKFLOW.innerBoxShadowColor
			);

			if (BLOCKFLOW.node) {
				const NODE = BLOCKFLOW.node;
				setRootStyle("--blockflow-node-border-width", NODE.borderWidth);
				setRootStyle("--blockflow-node-border-color", NODE.borderColor);
				setRootStyle("--blockflow-node-border-radius", NODE.borderRadius);
				setRootStyle(
					"--blockflow-handles-border-radius",
					NODE.handlesBorderRadius
				);
			}

			if (BLOCKFLOW.edge) {
				const EDGE = BLOCKFLOW.edge;
				setRootStyle("--blockflow-edge-font-color", EDGE.fontColor);
				setRootStyle("--blockflow-edge-background-color", EDGE.backgroundColor);
				setRootStyle("--blockflow-edge-border-width", EDGE.borderWidth);
				setRootStyle("--blockflow-edge-border-color", EDGE.borderColor);
				setRootStyle("--blockflow-edge-border-radius", EDGE.borderRadius);
			}

			if (BLOCKFLOW.controls) {
				const CONTROLS = BLOCKFLOW.controls;

				setRootStyle("--blockflow-controls-border", CONTROLS.border);

				if (CONTROLS.button) {
					const BUTTON = CONTROLS.button;
					setRootStyle(
						"--blockflow-controls-button-font-color",
						BUTTON.fontColor
					);
					setRootStyle(
						"--blockflow-controls-button-background-color",
						BUTTON.backgroundColor
					);
					setRootStyle("--blockflow-controls-button-border", BUTTON.border);
					setRootStyle(
						"--blockflow-controls-button-svg-filter",
						BUTTON.svgFilter
					);
				}
			}

			if (BLOCKFLOW.minimap) {
				const MINIMAP = BLOCKFLOW.minimap;

				setRootStyle("--blockflow-minimap-border", MINIMAP.border);
				setRootStyle(
					"--blockflow-minimap-background-color",
					MINIMAP.backgroundColor
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

const REUSABLE_TYPES = [
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
	const BACKGROUND_COLOR = getRootStyle(`--${type}-background-color`);
	const BORDER = hasBorders ? getRootStyle(`--${type}-border`) : "none";
	const BORDER_RADIUS = hasRadius
		? getRootStyle(`--${type}-border-radius`)
		: "0";
	if (REUSABLE_TYPES.includes(type)) {
		let color = "";
		if (type != "dev") {
			color = containsText
				? getContrastingTextColor(BACKGROUND_COLOR)
				: getContrastingColor(BACKGROUND_COLOR);
		} else {
			color = "#fffff";
		}
		return {
			color: color,
			background: BACKGROUND_COLOR,
			//border: border,
			//borderRadius: borderRadius,
			fontWeight: type == "dev" ? "bolder" : "inherit",
			textShadow: type == "dev" ? "0 0 5px BLACK" : "inherit",
		};
	} else {
		const ERROR_COLOR = "#FF00FF";

		return {
			color: "#ffffff",
			background: ERROR_COLOR,
			border: hasBorders ? "4px dotted white" : "none",
			borderRadius: hasRadius ? "100%" : "0",
		};
	}
}
