import { uniqueId } from "@utils/Utils";
import { getParentsNode } from "@utils/Nodes";

/**
 * Checks if a data item or an array of data items have errors and updates the error list accordingly.
 * @param {Object|Object[]} data - The data item or array of data items to check.
 * @param {string[]} errorList - The current list of errors.
 * @param {function} setErrorList - The function to set the new error list.
 * @param {boolean} deleteFromList - A flag to indicate if the errors should be deleted from the list or not.
 */
export function errorListCheck(data, errorList, setErrorList, deleteFromList) {
	let errorArray = errorList;
	if (!errorArray) {
		errorArray = [];
	}

	if (!Array.isArray(data) || data.length <= 1) {
		if (Array.isArray(data)) {
			data = data[0];
		}
		if (data.type !== "fragment") {
			const isContained = errorArray.some((error) => error.nodeId == data.id);
			if (isContained) {
				if (deleteFromList) {
					const updatedList = errorList.filter(
						(item) => item.nodeId !== data.id
					);
					setErrorList(updatedList);
				} else {
					const updatedList = deleteNodeFromErrorList(data, errorList);

					setErrorList(updatedList);
				}
			} else {
				createItemErrors(data, errorArray);
				setErrorList(errorArray);
			}
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

export function deleteNodeFromErrorList(data, errorList) {
	let errorListUpdated = errorList;

	if (data.data.lmsResource !== undefined && data.data.lmsResource !== -1) {
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

export function createItemErrors(item, errorArray) {
	if (
		!(
			item.type === "start" ||
			item.type === "end" ||
			item.type === "fragment" ||
			item.type === "remgroup" ||
			item.type === "addgroup" ||
			item.type === "badge" ||
			item.type === "mail"
		)
	) {
		const errorEntry = {
			id: uniqueId(),
			nodeId: item.id,
		};
		if (
			item.data.lmsResource === null ||
			item.data.lmsResource === undefined ||
			item.data.lmsResource < 0
		) {
			const customEntry = {
				...errorEntry,
				severity: "error",
				type: "resourceNotFound",
			};

			console.log(item.data.lmsResource);

			const errorFound = errorArray.find(
				(obj) =>
					obj.nodeId === customEntry.nodeId &&
					obj.severity === customEntry.severity &&
					obj.type === customEntry.type
			);

			if (!errorFound) {
				errorArray.push(customEntry);
			}
		}

		if (
			item.data.section === null ||
			item.data.section === undefined ||
			item.data.section < 0
		) {
			const customEntry = {
				...errorEntry,
				severity: "error",
				type: "sectionNotFound",
			};

			const errorFound = errorArray.find(
				(obj) =>
					obj.nodeId === customEntry.nodeId &&
					obj.severity === customEntry.severity &&
					obj.type === customEntry.type
			);

			if (!errorFound) {
				errorArray.push(customEntry);
			}
		}

		if (item.data.order == undefined || item.data.order == -Infinity) {
			const customEntry = {
				...errorEntry,
				severity: "error",
				type: "orderNotFound",
			};

			const errorFound = errorArray.find(
				(obj) =>
					obj.nodeId === customEntry.nodeId &&
					obj.severity === customEntry.severity &&
					obj.type === customEntry.type
			);

			if (!errorFound) {
				errorArray.push(customEntry);
			}
		}
	}
}
