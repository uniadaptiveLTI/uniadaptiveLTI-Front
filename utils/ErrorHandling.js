/**
 * Checks if a data item or an array of data items have errors and updates the error list accordingly.
 * @param {Object|Object[]} data - The data item or array of data items to check.
 * @param {string[]} errorList - The current list of errors.
 * @param {function} setErrorList - The function to set the new error list.
 * @param {boolean} deleteFromList - A flag to indicate if the errors should be deleted from the list or not.
 */
export function errorListCheck(data, errorList, setErrorList, deleteFromList) {
	const errorArray = errorList || [];

	if (!Array.isArray(data)) {
		const isContained = errorArray.includes(data.id);
		if (isContained) {
			const newErrorList = errorArray.filter((str) => str !== data.id);
			if (deleteFromList) {
				setErrorList(newErrorList);
			}
		} else {
			if (!data.data.lmsResource) {
				setErrorList([...errorArray, data.id]);
			}
		}
	} else {
		if (deleteFromList) {
			const updatedErrorList = errorArray.filter((str) => {
				const json = data.find((item) => item.id === str);
				return json ? json.data.lmsResource : true;
			});
			setErrorList(updatedErrorList);
		} else {
			data.forEach((item) => {
				if (item.type !== "start" && item.type !== "end") {
					if (!item.data.lmsResource) {
						if (!errorArray.includes(item.id)) {
							errorArray.push(item.id);
						}
					}
				}
			});

			setErrorList(errorArray);
		}
	}
}
