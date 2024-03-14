import { INode } from "@components/interfaces/INode";
import { INodeError } from "@components/interfaces/INodeError";
import { uniqueId } from "@utils/Utils";

/**
 * Checks if a data item or an array of data items have errors and updates the error list accordingly.
 * @param data - The data item or array of data items to check.
 * @param errorList - The current list of errors.
 * @param setErrorList - The function to set the new error list.
 * @param deleteFromList - A flag to indicate if the errors should be deleted from the list or not.
 */
export function errorListCheck(
	data: INode | INode[],
	errorList: Array<INodeError>,
	setErrorList: Function,
	deleteFromList: boolean = false
) {
	let errorArray = errorList;
	if (!errorArray) {
		errorArray = [];
	}

	if (!Array.isArray(data) || data.length <= 1) {
		let node: INode;
		if (Array.isArray(data)) {
			data = data[0];
		}
		node = data;
		if (data && data.type !== "fragment") {
			console.log("INITIAL ERROR ARRAY", errorArray);
			let NODE_ERROR_LIST = errorArray.filter(
				(error) => error.nodeId == node.id
			);

			let resourceErrorFounded = false;
			let sectionErrorFounded = false;
			let orderErrorFounded = false;

			NODE_ERROR_LIST.forEach((error) => {
				switch (error.type) {
					case "resourceNotFound":
						console.log(data);
						if (
							node.data?.lmsResource != undefined &&
							node.data?.lmsResource != "-1"
						) {
							errorArray = errorArray.filter(
								(errorFounded) => error.id !== errorFounded.id
							);
						}
						resourceErrorFounded = true;
						break;
					case "sectionNotFound":
						if (
							"section" in node.data &&
							node.data.section !== null &&
							node.data.section !== undefined &&
							node.data.section > 0 &&
							node.type !== "badge"
						) {
							errorArray = errorArray.filter(
								(errorFounded) => error.id !== errorFounded.id
							);
						}
						sectionErrorFounded = true;
						break;
					case "orderNotFound":
						if (
							"order" in node.data &&
							node.data.order !== undefined &&
							node.data.order !== -Infinity &&
							node.type !== "badge"
						) {
							errorArray = errorArray.filter(
								(errorFounded) => error.id !== errorFounded.id
							);
						}
						orderErrorFounded = true;
						break;
					default:
						break;
				}
			});

			if (!resourceErrorFounded) {
				createErrorByType(data, errorArray, "resource");
			}

			if (!sectionErrorFounded) {
				createErrorByType(data, errorArray, "section");
			}

			if (!orderErrorFounded) {
				createErrorByType(data, errorArray, "order");
			}

			console.log("FINAL ERROR ARRAY", errorArray);

			setErrorList(errorArray);
		}
	} else {
		if (deleteFromList) {
			let updatedList = [...errorList];

			data.forEach((entry) => {
				updatedList = updatedList.filter((item) => item.nodeId !== entry.id);
			});

			setErrorList(updatedList);
		} else {
			data.forEach((item) => {
				createItemErrors(item, errorArray);
			});

			setErrorList(errorArray);
		}
	}
}

/**
 * Deletes a node from an error list.
 * @param {Object} data - The data of the node to delete from the error list.
 * @param {Array} errorList - The error list to delete the node from.
 * @returns {Array} The updated error list with the node deleted.
 */
export function deleteNodeFromErrorList(data, errorList) {
	let errorListUpdated = errorList;

	if (data.data.lmsResource !== undefined && data.data.lmsResource != "") {
		errorListUpdated = errorListUpdated.filter(
			(item) => item.nodeId !== data.id || item.type !== "resourceNotFound"
		);
	}

	if (data.data.section != undefined && data.data.section >= 0) {
		errorListUpdated = errorListUpdated.filter(
			(item) => item.nodeId !== data.id || item.type !== "sectionNotFound"
		);
	}

	if (data.data.order) {
		errorListUpdated = errorListUpdated.filter(
			(item) => item.nodeId !== data.id || item.type !== "orderNotFound"
		);
	}

	return errorListUpdated;
}

/**
 * Creates item errors for a given item and adds them to an error array.
 * @param {Object} item - The item to create errors for.
 * @param {Array} errorArray - The array to add the created errors to.
 */
export function createItemErrors(item, errorArray) {
	if (item != undefined && item?.data) {
		if (
			!(
				item.type === "fragment" ||
				item.type === "remgroup" ||
				item.type === "addgroup" ||
				item.type === "mail"
			)
		) {
			createErrorByType(item, errorArray, "resource");
			createErrorByType(item, errorArray, "section");
			createErrorByType(item, errorArray, "order");
		}
	}
}

function createErrorByType(item, errorArray, type) {
	const ERROR_ENTRY = {
		id: uniqueId(),
		nodeId: item.id,
	};

	switch (type) {
		case "resource":
			if (
				item.data?.lmsResource == undefined ||
				item.data?.lmsResource == "-1"
			) {
				const CUSTOM_ENTRY = {
					...ERROR_ENTRY,
					severity: "error",
					type: "resourceNotFound",
				};

				const ERROR_FOUND = errorArray.find(
					(obj) =>
						obj.nodeId === CUSTOM_ENTRY.nodeId &&
						obj.severity === CUSTOM_ENTRY.severity &&
						obj.type === CUSTOM_ENTRY.type
				);

				if (!ERROR_FOUND) {
					errorArray.push(CUSTOM_ENTRY);
				}
			}
			break;
		case "section":
			if (
				(item.data.section === null ||
					item.data.section === undefined ||
					item.data.section < 0) &&
				item.type !== "badge"
			) {
				const CUSTOM_ENTRY = {
					...ERROR_ENTRY,
					severity: "error",
					type: "sectionNotFound",
				};

				const ERROR_FOUND = errorArray.find(
					(obj) =>
						obj.nodeId === CUSTOM_ENTRY.nodeId &&
						obj.severity === CUSTOM_ENTRY.severity &&
						obj.type === CUSTOM_ENTRY.type
				);

				if (!ERROR_FOUND) {
					errorArray.push(CUSTOM_ENTRY);
				}
			}
			break;
		case "order":
			if (
				(item.data.order == undefined || item.data.order == -Infinity) &&
				item.type !== "badge"
			) {
				const CUSTOM_ENTRY = {
					...ERROR_ENTRY,
					severity: "error",
					type: "orderNotFound",
				};

				const ERROR_FOUND = errorArray.find(
					(obj) =>
						obj.nodeId === CUSTOM_ENTRY.nodeId &&
						obj.severity === CUSTOM_ENTRY.severity &&
						obj.type === CUSTOM_ENTRY.type
				);

				if (!ERROR_FOUND) {
					errorArray.push(CUSTOM_ENTRY);
				}
			}
			break;
	}
}
