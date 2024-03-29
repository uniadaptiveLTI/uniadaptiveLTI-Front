import { NodeDeclarations } from "./TypeDefinitions";

export enum Platforms {
	Moodle = "moodle",
	Sakai = "sakai",
	LTI = "lti", //itself
}

/**
 * Gets the visibility options for a given platform.
 * @param {string} platform - The platform to get the visibility options for.
 * @returns {Array} An array of visibility options for the given platform.
 */
export function getVisibilityOptions(platform) {
	switch (platform) {
		case Platforms.Moodle:
			return [
				{ name: "Ocultar a estudiantes", value: "hidden" },
				{ name: "Mostrar a estudiantes", value: "show_unconditionally" },
			];
		case Platforms.Sakai:
			return [
				{ name: "Ocultar hasta tener acceso", value: "hidden_until_access" },
				{ name: "Mostrar siempre sin acceso", value: "show_unconditionally" },
			];
		default:
			return [
				{ name: "Ocultar hasta tener acceso", value: "hidden_until_access" },
				{ name: "Mostrar siempre sin acceso", value: "show_unconditionally" },
			];
	}
}

/**
 * Gets the default visibility for a given platform.
 * @param {string} platform - The platform to get the default visibility for.
 * @returns {string} The default visibility for the given platform.
 */
export function getDefaultVisibility(platform) {
	switch (platform) {
		case Platforms.Moodle:
			return "show_unconditionally";
		case Platforms.Sakai:
			return "show_unconditionally";
		default:
			return "hidden_until_access";
	}
}

/**
 * Determines if a given platform has lessons.
 * @param {string} platform - The platform to check if it has lessons.
 * @returns {boolean} True if the given platform has lessons, false otherwise.
 */
export function hasLessons(platform) {
	switch (platform) {
		case Platforms.Moodle:
			return false;
		case Platforms.Sakai:
			return true;
		default:
			return false;
	}
}

/**
 * Determines if a given platform has sections.
 * @param {string} platform - The platform to check if it has sections.
 * @returns {boolean} True if the given platform has sections, false otherwise.
 */
export function hasSections(platform) {
	switch (platform) {
		case Platforms.Moodle:
			return true;
		case Platforms.Sakai:
			return false;
		default:
			return false;
	}
}

/**
 * Determines if a given platform has unordered resources.
 * @param {string} platform - The platform to check if it has unordered resources.
 * @returns {boolean} True if the given platform has unordered resources, false otherwise.
 */
export function hasUnorderedResources(platform) {
	switch (platform) {
		case Platforms.Moodle:
			return false;
		case Platforms.Sakai:
			return true;
		default:
			return false;
	}
}

/**
 * Gets the starting section ID for a given platform.
 * @param {string} platform - The platform to get the starting section ID for.
 * @returns {number} The starting section ID for the given platform.
 */
export function startingSectionID(platform) {
	switch (platform) {
		case Platforms.Moodle:
			return 0;
		case Platforms.Sakai:
			return 0;
		default:
			return 1;
	}
}

/**
 * Determines if a given platform allows partial export.
 * @param {string} platform - The platform to check if it allows partial export.
 * @returns {boolean} True if the given platform allows partial export, false otherwise.
 */
export function allowsPartialExport(platform) {
	switch (platform) {
		case Platforms.Moodle:
			return true;
		case Platforms.Sakai:
			return true;
		default:
			return false;
	}
}

/**
 * Gets the backup URL for a given platform and metadata.
 * @param {string} platform - The platform to get the backup URL for.
 * @param {Object} metaData - The metadata to use when constructing the backup URL.
 * @returns {string|null} The backup URL for the given platform and metadata, or null if not applicable.
 */
export function getBackupURL(platform, metaData) {
	switch (platform) {
		case Platforms.Moodle:
			return `${metaData.lms_url}/backup/backup.php?id=${metaData.course_id}`;
		default:
			return null;
	}
}

/**
 * Determines if a given type is supported in a given platform, with an option to exclude LTI types.
 * @param {string} platform - The platform to check if the type is supported in.
 * @param {string} type - The type to check if it is supported in the given platform.
 * @param {boolean} [excludeLTI=false] - Whether or not to exclude LTI types from consideration. Defaults to false.
 * @returns {boolean} True if the type is supported in the given platform, false otherwise.
 */
export function isSupportedTypeInPlatform(platform, type, excludeLTI = false) {
	if (excludeLTI) {
		return NodeDeclarations.find(
			(definition) =>
				definition.type == type && definition.lms.includes(platform)
		)
			? true
			: false;
	} else {
		return NodeDeclarations.find(
			(definition) =>
				definition.type == type &&
				(definition.lms.includes(platform) ||
					definition.lms.includes(Platforms.LTI))
		)
			? true
			: false;
	}
}

/**
 * Gets an array of supported types for a given platform.
 * @param {string} platform - The platform to get an array of supported types for.
 * @returns {Array<string>} An array of supported types for the given platform.
 */
export function getSupportedTypes(platform) {
	return NodeDeclarations.filter((declaration) => {
		if (declaration.lms.includes(platform)) return declaration.type;
	}).map((validDeclaration) => validDeclaration.type);
}
