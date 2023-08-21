import React, { useId, useLayoutEffect } from "react";
import { Form } from "react-bootstrap";

const DateCommonComponent = ({
	conditionEdit,
	onCheckboxChange,
	openingDateRef,
	dueDateRef,
	setDates,
}) => {
	const cqId = useId();
	const coId = useId();

	const handleCheckbox1Change = (e) => {
		if (!e.target.checked) {
			openingDateRef.current.disabled = true;
		} else {
			openingDateRef.current.disabled = false;
		}

		onCheckboxChange("openingDate", e.target.checked, openingDateRef);
	};

	const handleCheckbox2Change = (e) => {
		if (!e.target.checked) {
			dueDateRef.current.disabled = true;
		} else {
			dueDateRef.current.disabled = false;
		}
		onCheckboxChange("dueDate", e.target.checked, dueDateRef);
	};

	const dateInputChange = (paramName, ref) => {
		setDates((prevDates) => {
			if (prevDates && prevDates[paramName] !== undefined) {
				return {
					...prevDates,
					[paramName]: ref.current.value,
				};
			}
			return prevDates;
		});
	};

	return (
		<>
			<div className="d-flex align-items-baseline col-12 col-lg-6 col-xl-4">
				<Form.Check
					id="objectiveCheckbox"
					type="checkbox"
					onChange={handleCheckbox1Change}
					defaultChecked={
						conditionEdit && conditionEdit.openingDate ? true : false
					}
				/>
				<Form.Label
					htmlFor={cqId}
					className="me-4"
					style={{ minWidth: "125px", marginLeft: "20px" }}
				>
					Desde:{" "}
				</Form.Label>
				<Form.Control
					id={cqId}
					ref={openingDateRef}
					onChange={() => {
						dateInputChange("openingDate", openingDateRef);
					}}
					// FIXME: CHANGE TO SERVER DATE TIME
					defaultValue={
						conditionEdit?.openingDate
							? conditionEdit.openingDate
							: new Date().toISOString().slice(0, 16)
					}
					type="datetime-local"
					disabled={!conditionEdit || !conditionEdit?.openingDate}
				/>
			</div>
			<div className="d-flex align-items-baseline col-12 col-lg-6 col-xl-4">
				<Form.Check
					id="objectiveCheckbox"
					type="checkbox"
					onChange={handleCheckbox2Change}
					defaultChecked={conditionEdit && conditionEdit.dueDate ? true : false}
				/>
				<Form.Label
					htmlFor={coId}
					className="me-4"
					style={{ minWidth: "125px", marginLeft: "20px" }}
				>
					Hasta:{" "}
				</Form.Label>
				<Form.Control
					id={coId}
					ref={dueDateRef}
					type="datetime-local"
					onChange={() => {
						dateInputChange("dueDate", dueDateRef);
					}}
					defaultValue={
						conditionEdit?.dueDate
							? conditionEdit.dueDate
							: new Date().toISOString().substr(0, 16)
					}
					disabled={!conditionEdit || !conditionEdit?.dueDate}
				/>
			</div>
		</>
	);
};

export default DateCommonComponent;
