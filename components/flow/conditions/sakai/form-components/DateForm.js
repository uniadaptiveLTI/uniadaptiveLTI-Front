import { Form } from "react-bootstrap";
import DateLimitComponent from "@components/flow/conditions/sakai/form-components/date/DateLimitComponent";
import DateCommonComponent from "@components/flow/conditions/sakai/form-components/date/DateCommonComponent";
import DateExceptionComponent from "@components/flow/conditions/sakai/form-components/date/DateExceptionComponent";
import { parseDateToString } from "@utils/Utils";
import { useEffect, useState } from "react";

const DateForm = ({
	blockData,
	errorForm,
	dates,
	setDates,
	visibilityArray,
	openingDateRef,
	dueDateRef,
	closeTimeRef,
	editing,
	exceptionSelectRef,
	exceptionEntityRef,
	exceptionSelected,
	setExceptionSelected,
	sakaiGroups,
	sakaiUsers,
	conditionEdit,
}) => {
	function calculateDefaultDateTime(minutesToAdd) {
		const targetTime = new Date();
		targetTime.setMinutes(targetTime.getMinutes() + minutesToAdd);
		return targetTime.toISOString().slice(0, 16);
	}

	const handleCheckboxChange = (checkboxName, checked, ref) => {
		if (!checked) {
			setDates((prevDates) => ({ ...prevDates, [checkboxName]: undefined }));
		} else {
			setDates((prevDates) => ({
				...prevDates,
				[checkboxName]: ref.current.value,
			}));
		}
	};

	const handleCheckbox1Change = (e) => {
		if (!e.target.checked) {
			openingDateRef.current.disabled = true;
		} else {
			openingDateRef.current.disabled = false;
		}

		handleCheckboxChange("openingDate", e.target.checked, openingDateRef);
	};

	const handleCheckbox2Change = (e) => {
		if (!e.target.checked) {
			dueDateRef.current.disabled = true;
		} else {
			dueDateRef.current.disabled = false;
		}
		handleCheckboxChange("dueDate", e.target.checked, dueDateRef);
	};

	const dateInputChange = (paramName, ref) => {
		setDates((prevDates) => {
			console.log(prevDates, prevDates[paramName]);
			if (prevDates) {
				return {
					...prevDates,
					[paramName]: ref.current.value,
				};
			}
			console.log(prevDates);
			return prevDates;
		});
	};

	return (
		<Form.Group
			style={{
				padding: "10px",
				border: "1px solid #C7C7C7",
				marginBottom: "10px",
			}}
			className="d-flex flex-column gap-2 p-4"
		>
			{editing == "date" && visibilityArray.includes(blockData.type) && (
				<DateCommonComponent
					conditionEdit={conditionEdit}
					errorForm={errorForm}
					openingDateRef={openingDateRef}
					dueDateRef={dueDateRef}
					setDates={setDates}
					calculateDefaultDateTime={calculateDefaultDateTime}
					dateInputChange={dateInputChange}
				/>
			)}

			{editing == "date" && !visibilityArray.includes(blockData.type) && (
				<DateLimitComponent
					conditionEdit={conditionEdit}
					errorForm={errorForm}
					openingDateRef={openingDateRef}
					dueDateRef={dueDateRef}
					closeTimeRef={closeTimeRef}
					setDates={setDates}
					calculateDefaultDateTime={calculateDefaultDateTime}
					dateInputChange={dateInputChange}
				/>
			)}

			{/*editing == "dateException" && blockData.type == "exam" && (
				<DateExceptionComponent
					errorForm={errorForm}
					openingDateRef={openingDateRef}
					closeTimeRef={closeTimeRef}
					dueDateRef={dueDateRef}
					setDates={setDates}
					exceptionSelectRef={exceptionSelectRef}
					exceptionEntityRef={exceptionEntityRef}
					exceptionSelected={exceptionSelected}
					setExceptionSelected={setExceptionSelected}
					sakaiGroups={sakaiGroups}
					sakaiUsers={sakaiUsers}
					calculateDefaultDateTime={calculateDefaultDateTime}
					dateInputChange={dateInputChange}
				></DateExceptionComponent>
			)*/}
		</Form.Group>
	);
};

export default DateForm;
