import {
	FontAwesomeIcon,
	FontAwesomeIconProps,
} from "@fortawesome/react-fontawesome";
import { clampNodesOrderMoodle } from "./Moodle";
import { clampNodesOrderSakai } from "./Sakai";
import { fetchBackEnd } from "middleware/common";
import storeVersion, {
	VersionStoreSkeleton,
} from "middleware/api/storeVersion";
import { IActionNode, INode } from "@components/interfaces/INode";
import { IMetaData, ISection } from "@components/interfaces/IMetaData";
import { IMap } from "@components/interfaces/IMap";
import { IVersion } from "@components/interfaces/IVersion";
import { Platforms } from "./Platform";
import { ToastProps } from "react-toastify/dist/types";
import { SizeProp } from "@fortawesome/fontawesome-svg-core";
interface IdentificableObject {
	id: string | number;
}

/**
 * Returns a new array with updated entries from the original array.
 * @param updatedEntry The entry or entries to be updated in the original array. Each entry must have an id property.
 * @param originalArray The original array of entries. Each entry must have an id property.
 * @returns A new array with the updated entries. If an entry in the original array does not have a matching id in the updatedEntry, it is returned unchanged.
 */
export const getUpdatedArrayById = (
	updatedEntry: IdentificableObject | Array<IdentificableObject>,
	originalArray: Array<IdentificableObject>
) => {
	const NEW_ENTRIES: Array<IdentificableObject> = Array.isArray(updatedEntry)
		? updatedEntry
		: [updatedEntry];

	if (originalArray.length > 0) {
		return originalArray.map((oldEntry) => {
			const newEntry = NEW_ENTRIES.find((entry) => entry.id === oldEntry.id);
			return newEntry ? { ...oldEntry, ...newEntry } : oldEntry;
		});
	} else {
		return [];
	}
};

/**
 * Filters an array by the value of a specific property
 * @param  property The property to filter
 * @param value The wanted value
 * @param array The array
 * @returns Returns the array filtered.
 */
export const getByProperty = (
	property: string,
	value: any,
	array: Array<Object>
) => {
	return array.filter((item) => item[property] === value);
};

/**
 * Adds multiple event listeners to an element.
 * @param element The element to add the event listeners to.
 * @param events An array of event objects with the event type and listener function.
 */
export function addEventListeners(element: Element, events) {
	events.forEach(({ type, listener }) => {
		element.addEventListener(type, listener, false);
	});
}

/**
 * Capitalizes the first letter of a string.
 * @param string The string to capitalize.
 * @return The string with the first letter capitalized.
 */
export function capitalizeFirstLetter(string: string): string {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Generates a unique identifier based on the current date and a random number.
 * @return The generated unique identifier.
 */
export const uniqueId = (): string =>
	String(parseInt((Date.now() * Math.random()).toString()));

/**
 * Calculates the nearest power of two to a given number.
 * @param n The number to approximate.
 * @return The nearest power of two to n.
 */
export function nearestPowerOfTwo(n: number): number {
	return Math.pow(2, Math.round(Math.log(n) / Math.log(2)));
}

/**
 * Sorts an array of objects by a property alphabetically.
 * @param array The array to sort.
 * @param property The property to sort by.
 * @param subproperty The subproperty to sort by, if the property is an object.
 * @return The array sorted by the property or subproperty indicated.
 */
export function orderByPropertyAlphabetically(
	array: Array<Object>,
	property: string,
	subproperty?: string
): Array<Object> {
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
 * @param obj The object to search for.
 * @param arr The array to search in.
 * @return True if the object is in the array, false otherwise.
 */
export function inArrayById(
	obj: IdentificableObject,
	arr: Array<IdentificableObject>
): boolean {
	return arr.some((x) => x.id === obj.id);
}

/**
 * Checks if all the objects in an array are in another array by their id property.
 * @param arr1 The first array of objects.
 * @param arr2 The second array of objects.
 * @return True if all the objects in the first array are in the second, false otherwise.
 */
export function arrayInsideArrayById(
	arr1: Array<IdentificableObject>,
	arr2: Array<IdentificableObject>
): boolean {
	return arr1.map((obj) => inArrayById(obj, arr2)).every(Boolean);
}

/**
 * Returns an array with objects with unique IDs from other without unique IDs. (Deletes duplicated entries)
 * @param arr array with objects with IDs
 * @returns Array with objects with unique IDs
 */
export function deduplicateById(
	arr: Array<IdentificableObject>
): Array<IdentificableObject> {
	return arr.reduce((accumulator, current) => {
		if (!accumulator.some((item) => item.id === current.id)) {
			accumulator.push(current);
		}
		return accumulator;
	}, []);
}

/**
 * Parses a string and returns a boolean value.
 * @param str - The string to parse.
 * @returns True if the string is "true" (case-insensitive), false otherwise.
 */
export function parseBool(str) {
	if (str) {
		return str.toLowerCase() == "true" ? true : false;
	}
	return false;
}

/**
 * Returns true if the value is unique in the array, false otherwise.
 * @param value The value to check for uniqueness.
 * @param array The array itself.
 * @returns Whether the value is unique or not.
 */
export function isUnique(value: any, array: Array<any>): boolean {
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
 * @param string The string to encode to base64. Defaults to an empty string.
 * @returns The base64 encoded version of the given string.
 */
export function base64Encode(string: string): string {
	const BUFFER = Buffer.from(string, "utf-8");
	const BASE64 = BUFFER.toString("base64");
	return BASE64;
}

/**
 * Decodes a given base64 string to a regular string.
 * @param base64 The base64 string to decode. Defaults to an empty string.
 * @returns The decoded version of the given base64 string.
 */
export function base64Decode(base64 = ""): string {
	const BUFFER = Buffer.from(base64, "base64");
	const BASE64 = BUFFER.toString("utf-8");
	return BASE64;
}

/**
 * Moves an element in an array from one index to another.
 * @param from - The index of the element to move.
 * @param to - The index to move the element to.
 * @param array - The array to move the element in.
 * @returns A new array with the element moved from the specified index to the specified index.
 */
export function arrayMoveByIndex(
	from: number,
	to: number,
	array: Array<any>
): Array<any> {
	const NEW_ARRAY = [...array];
	NEW_ARRAY.splice(to, 0, NEW_ARRAY.splice(from, 1)[0]);
	return NEW_ARRAY;
}

/**
 * Moves an element in an array with objects that have an "id" property from one ID to another.
 * @param from - The ID of the element to move.
 * @param to - The ID of the element to move the element after.
 * @param array - The array to move the element in.
 * @returns A new array with the element moved from the specified ID to after the specified ID.
 */
export function arrayMoveById(
	from: IdentificableObject["id"],
	to: IdentificableObject["id"],
	array: Array<IdentificableObject>
): Array<IdentificableObject> {
	const NEW_ARRAY = [...array];
	const FORM_INDEX = NEW_ARRAY.findIndex((item) => item.id == from);
	const TO_INDEX = NEW_ARRAY.findIndex((item) => item.id == to);
	NEW_ARRAY.splice(TO_INDEX, 0, NEW_ARRAY.splice(FORM_INDEX, 1)[0]);
	return NEW_ARRAY;
}

/**
 * Finds completion and qualification conditions in a given condition and returns them in an array.
 * @param obj - The object to search for completion and qualification conditions in.
 * @returns An array containing any found completion and qualification conditions in the given object.
 */
export function findCompletionAndGrade(obj: {
	type: string;
	c?: Array<Object>;
}): Array<Object> {
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
 * Updates badge conditions for a given node target and node source.
 * @param nodeTarget - The node target to update badge conditions for.
 * @param nodeSource - The node source used when updating badge conditions for the node target.
 */
export function updateBadgeConditions(
	nodeTarget: IActionNode,
	nodeSource: INode
) {
	if ("c" in nodeTarget.data && "params" in nodeTarget.data.c) {
		// Variable to store the conditions of the target node
		let conditions = nodeTarget.data.c.params;

		// Find method to get the condition of type completion
		const CONDITION_EXISTS = conditions.find(
			(condition) => condition.type === "completion"
		);

		// Condition to know if the condition exists
		if (CONDITION_EXISTS) {
			// Condition to check if the activity list has more than one entry
			if (CONDITION_EXISTS.params.length > 1) {
				// Filter method to delete the specific node from the activity list
				CONDITION_EXISTS.params = CONDITION_EXISTS.params.filter(
					(node) => node.id !== nodeSource.id
				);
			} else {
				// Filter method to delete the condition type completion
				nodeTarget.data.c.params = conditions.filter(
					(node) => node.type !== "completion"
				);
			}
		} else {
			// Filter method to delete the condition type completion
			nodeTarget.data.c.params = conditions.filter(
				(condition) => condition.type !== "completion"
			);
		}
	}
}

/**
 * Gets the HTTP prefix based on whether or not SSL is enabled in environment variables.
 * @returns The HTTP prefix, either "http" or "https".
 */
export function getHTTPPrefix(): string {
	return window.location.protocol;
}

/**
 * Constructs a URL for fetching data from the server.
 * @param webservice An optional string to be appended to the URL.
 * @returns The constructed URL for fetching data from the server.
 */
export function getFetchUrl(webservice: string): string {
	return webservice == undefined
		? `${getHTTPPrefix()}//${process.env.NEXT_PUBLIC_BACK_URL}`
		: `${getHTTPPrefix()}//${process.env.NEXT_PUBLIC_BACK_URL}/${webservice}`;
}

/**
 * Gets a section from an array of sections based on its position property value.
 * @param sectionArray - An array of sections to search for a section with a matching position property value.
 * @param sectionPosition - The position property value of the section to search for in the section array.
 * @returns The section with a matching position property value, or undefined if not found.
 */
export function getSectionFromPosition(
	sectionArray: Array<ISection>,
	sectionPosition: number
): ISection | undefined {
	return sectionArray.find((section) => section.position == sectionPosition);
}

/**
 * Gets a section ID from an array of sections based on its position property value.
 * @param sectionArray An array of sections to search for a section with a matching position property value and get its ID property value from.
 * @param sectionPosition The position property value of the section whose ID property value should be returned from the section array.
 * @returns The ID property value of the section with a matching position property value, or undefined if not found.
 */
export function getSectionIDFromPosition(
	sectionArray: Array<ISection>,
	sectionPosition: number
): ISection["id"] | undefined {
	return getSectionFromPosition(sectionArray, sectionPosition)?.id;
}

/**
 * Method to parse the given date using day, month and year, in case dateComplete param true then add hour and minute
 * @param date Date string, or UNIX Date
 * @param dateComplete Boolean to define if the date must be parsed with hour and minute
 * @returns Returns formatted date string
 */
export function parseDate(date: Date, dateComplete: boolean = false): string {
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
 * @param date Date object
 * @param full to define change if full date or partial date (Default: true)
 * @returns Returns formatted date string
 */
export function parseDateToString(date: Date, full: boolean = true) {
	const YEAR = date.getFullYear();
	const MONTH = String(date.getMonth() + 1).padStart(2, "0");
	const DAY = String(date.getDate()).padStart(2, "0");
	if (full) {
		const HOURS = String(date.getHours()).padStart(2, "0");
		const MINUTES = String(date.getMinutes()).padStart(2, "0");
		return `${YEAR}-${MONTH}-${DAY}T${HOURS}:${MINUTES}`;
	} else {
		return `${YEAR}-${MONTH}-${DAY}`;
	}
}

/**
 * Method to used to save the node version
 * @param rfNodes Node Array
 * @param metaData metaData object
 * @param platform Platform string
 * @param userData userData object
 * @param mapSelected current map object
 * @param versionJson current version object
 * @param defaultToastSuccess Toast Success Settings Object
 * @param defaultToastSuccess Toast Error Settings Object
 * @param toast Toast function
 * @param enable
 * @param {Object} responseData responseData object
 * @param lessonId
 * @param setAsDefault sets the map as default
 */
export async function saveVersion(
	rfNodes: Array<INode>,
	metaData: IMetaData,
	platform: Platforms,
	userData: IUserData,
	mapSelected: IMap,
	versionJson: IVersion,
	defaultToastSuccess: ToastProps,
	defaultToastError: ToastProps,
	toast: Function,
	enable: Function,
	responseData: Object,
	lessonId?: string,
	setAsDefault?: boolean
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
	const CLEANED_NODES = cleanNodes(rfNodes);
	// Define constants for the success and error messages
	const SUCCESS_MESSAGE = "Versión guardada con éxito";
	const ERROR_MESSAGE = "No se pudo guardar";
	try {
		const SAVE_DATA: VersionStoreSkeleton = {
			instance_id: metaData.instance_id,
			course_id: metaData.course_id,
			platform: platform,
			user_id: userData.user_id,
			map: {
				id: mapSelected.id,
				name: mapSelected.name,
				versions: [
					{
						...versionJson,
						lastUpdate: new Date().toLocaleString("es-ES"),
						blocks_data: CLEANED_NODES,
						default: setAsDefault ? true : false,
					},
				],
			},
		};

		if (platform == Platforms.Sakai) {
			SAVE_DATA.lesson_id = lessonId;
		}

		const RESPONSE = await storeVersion(SAVE_DATA);

		saveVersionErrors(
			RESPONSE,
			responseData,
			toast,
			SUCCESS_MESSAGE,
			defaultToastSuccess,
			ERROR_MESSAGE,
			defaultToastError
		);
		return true;
	} catch (e) {
		// If an error occurs when making the request, show the error message and log the error in the console
		console.error(e);
		toast(ERROR_MESSAGE, defaultToastError);
		return false;
	} finally {
		enable(false);
	}
}

/**
 * Method to used to save map
 * @param metaData metaData object
 * @param platform Platform string
 * @param userData userData object
 * @param mapSelected current map object
 * @param versionJson current version object
 * @param LTISettings LTISettings object
 * @param defaultToastSuccess Toast Success Settings Object
 * @param defaultToastSuccess Toast Error Settings Object
 * @param toast Toast function
 * @param enable
 * @param responseData responseData object
 * @param lessonId
 */
export async function saveVersions(
	versions: Array<IVersion>,
	metaData: IMetaData,
	platform: Platforms,
	userData: IUserData,
	mapSelected: IMap,
	defaultToastSuccess: ToastProps,
	defaultToastError: ToastProps,
	toast: Function,
	enable: Function,
	responseData: Object,
	lessonId?: string
) {
	// Helper function to clean the nodes
	function cleanNodes(nodes) {
		if (nodes == undefined) {
			return [];
		}
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
	// Clean the versions using the helper function
	const CLEANED_VERSIONS = versions.map((version) => {
		return {
			...version,
			blocks_data: cleanNodes(version.blocks_data),
			lastUpdate: new Date().toLocaleString("es-ES"),
		};
	});
	// Define constants for the success and error messages
	const SUCCESS_MESSAGE = "Versión guardada con éxito";
	const ERROR_MESSAGE = "No se pudo guardar";
	try {
		const SAVE_DATA: VersionStoreSkeleton = {
			instance_id: metaData.instance_id,
			course_id: metaData.course_id,
			platform: platform,
			user_id: userData.user_id,
			map: {
				id: mapSelected.id,
				name: mapSelected.name,
				versions: {
					...CLEANED_VERSIONS,
				},
			},
		};
		if (platform == Platforms.Sakai) {
			SAVE_DATA.lesson_id = lessonId;
		}

		const RESPONSE = await fetchBackEnd(
			sessionStorage.getItem("token"),
			"api/lti/store_version",
			"POST",
			{ saveData: SAVE_DATA }
		);

		saveVersionErrors(
			RESPONSE,
			responseData,
			toast,
			SUCCESS_MESSAGE,
			defaultToastSuccess,
			ERROR_MESSAGE,
			defaultToastError
		);
	} catch (e) {
		// If an error occurs when making the request, show the error message and log the error in the console
		console.error(e);
		toast(ERROR_MESSAGE, defaultToastError);
	} finally {
		enable(false);
	}
}

function saveVersionErrors(
	response,
	responseData,
	toast,
	SUCCESS_MESSAGE,
	defaultToastSuccess,
	ERROR_MESSAGE,
	defaultToastError
) {
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
			toast(SUCCESS_MESSAGE, defaultToastSuccess);
		}
	} else {
		if (responseData) {
			switch (responseData) {
				case "SUCCESSFUL_EXPORT":
					console.log(
						"%c :warning: La exportación se ha completado con éxito, el guardado ha fallado",
						"background: #FFE3D7; color: black; padding: 4px;"
					);
					toast(
						"La exportación se ha completado con éxito, el guardado ha fallado",
						defaultToastError
					);
					break;
				case "SUCCESSFUL_EXPORT_WITHOUT_CONDITIONS":
					console.log(
						"%c :warning: La exportación (sin condiciones) se ha completado con éxito, el guardado ha fallado",
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
				"%c :x: No se pudo guardar",
				"background: #FFD7DC; color: black; padding: 4px;"
			);
			// If the response is not successful, show the error message
			toast(ERROR_MESSAGE, defaultToastError);
		}
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
		case Platforms.Moodle:
			return clampNodesOrderMoodle(nodeArray);
		case Platforms.Sakai:
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
	const NODE = nodes.find((node) => node.data.lmsResource == resourceId);
	return NODE ? NODE.id : undefined;
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
	const PREFIX_SUFFIX_MAP = {
		"[": "]",
		"(": ")",
		"{": "}",
		"<": ">",
	};

	const PREFIX = PREFIX_SUFFIX_MAP[separatorType] ? separatorType : "";
	const SUFFIX = PREFIX_SUFFIX_MAP[separatorType] || separatorType;

	let nameCount = array.reduce(
		(count, arrayName) => (arrayName.startsWith(name) ? count + 1 : count),
		0
	);
	let finalName = name;

	if (nameCount > 0 || forceCount) {
		finalName = `${name} ${PREFIX}${nameCount + 1}${SUFFIX}`;
	}

	if (array.includes(finalName)) {
		return handleNameCollision(finalName, array, false, separatorType);
	}

	return finalName;
}

/**
 * This function returns a fontAwesome component passing an icon
 */
export function createFontAwesome(
	icon: FontAwesomeIconProps["icon"],
	size: SizeProp = "1x",
	color: FontAwesomeIconProps["color"] = ""
) {
	return <FontAwesomeIcon icon={icon} color={color} size={size} />;
}

export function findConditionById(id, conditions) {
	if (!conditions) {
		return null;
	}

	const FOUND_CONDITION = conditions.find((condition) => condition.cm === id);

	if (FOUND_CONDITION) {
		return FOUND_CONDITION;
	} else {
		const FOUND_ACTION_CONDITION = conditions.find(
			(condition) => condition.type === "completion"
		);

		if (FOUND_ACTION_CONDITION) return FOUND_ACTION_CONDITION;
	}

	for (const CONDITION of conditions) {
		if (CONDITION.c) {
			const INNER_CONDITION = findConditionById(id, CONDITION.c);
			if (INNER_CONDITION) {
				return INNER_CONDITION;
			}
		}
	}

	return null;
}

export function findConditionByParentId(subConditions, blockNodeId) {
	for (const SUBCONDITION of subConditions) {
		const FOUND_CONDITION = SUBCONDITION.subConditions?.find((condition) => {
			return condition.itemId === blockNodeId;
		});
		if (FOUND_CONDITION) {
			return FOUND_CONDITION;
		}
	}

	return null;
}

export function regexReplacer(OLD_VALUE:string, NEW_VALUE:string, OBJECT_STRING:any){
	const REGEX = new RegExp('"' + OLD_VALUE + '"', "g");

	OBJECT_STRING = OBJECT_STRING.replace(
		REGEX,
		JSON.stringify(String(NEW_VALUE))
	);

	return OBJECT_STRING;
}

export function deleteNotFoundConditions(conditions, blocks){
    if (Array.isArray(conditions)) {
      for (let i = conditions.length - 1; i >= 0; i--) {
        const condition = conditions[i];

        if (condition.type === 'grade' || condition.type === 'completion') {
			const matchingBlock = blocks.find((block) => block.id === condition.cm);
			if(!matchingBlock){
				conditions.splice(i, 1);
			}
        }

        if (condition.c && Array.isArray(condition.c)) {
          deleteNotFoundConditions(condition.c, blocks);
        }
      }
    }
  };
