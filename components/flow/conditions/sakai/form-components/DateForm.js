import { Form } from "react-bootstrap";
import DateAssignComponent from "@conditionsSakai/form-components/date/DateAssignComponent";
import DateCommonComponent from "@conditionsSakai/form-components/date/DateCommonComponent";
import DateExceptionComponent from "@conditionsSakai/form-components/date/DateExceptionComponent";

const DateForm = ({
	blockData,
	dates,
	setDates,
	visibilityArray,
	openingDateRef,
	dueDateRef,
	editing,
	exceptionSelectRef,
	exceptionEntityRef,
	exceptionSelected,
	setExceptionSelected,
	sakaiGroups,
	sakaiUsers,
	conditionEdit,
}) => {
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
					onCheckboxChange={handleCheckboxChange}
					openingDateRef={openingDateRef}
					dueDateRef={dueDateRef}
					setDates={setDates}
				/>
			)}

			{editing == "date" &&
				!visibilityArray.includes(blockData.type) &&
				blockData.type == "assign" && <DateAssignComponent />}

			{editing == "dateException" && blockData.type == "exam" && (
				<DateExceptionComponent
					onCheckboxChange={handleCheckboxChange}
					openingDateRef={openingDateRef}
					dueDateRef={dueDateRef}
					setDates={setDates}
					exceptionSelectRef={exceptionSelectRef}
					exceptionEntityRef={exceptionEntityRef}
					exceptionSelected={exceptionSelected}
					setExceptionSelected={setExceptionSelected}
					sakaiGroups={sakaiGroups}
					sakaiUsers={sakaiUsers}
				></DateExceptionComponent>
			)}
		</Form.Group>
	);
};

export default DateForm;
