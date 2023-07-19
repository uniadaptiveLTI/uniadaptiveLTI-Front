import React from "react";
import { Form } from "react-bootstrap";

function CourseQualificationForm(props) {
	const {
		conditionOperator,
		conditionQuery,
		conditionObjective,
		conditionObjective2,
		conditionEdit,
		parentsNodeArray,
		checkInputs,
	} = props;

	return (
		<Form.Group className="d-flex flex-column gap-2 m-4 me-0">
			<div className="d-flex align-items-baseline col-12 col-lg-4 col-xl-3">
				<Form.Check
					id="objectiveCheckbox"
					type="checkbox"
					className="me-4"
					style={{ minWidth: "125px" }}
					label="Debe ser >="
					onChange={checkInputs}
					defaultChecked={
						conditionEdit && conditionEdit.min
							? true
							: false ||
							  !conditionEdit ||
							  conditionEdit.type !== "courseQualification"
					}
				/>
				<Form.Control
					ref={conditionObjective}
					type="number"
					min="0"
					max="10"
					defaultValue={
						conditionEdit
							? conditionEdit.type === "courseQualification"
								? conditionEdit.min !== undefined
									? conditionEdit.min
									: 5
								: 5
							: 5
					}
					disabled={
						conditionEdit &&
						!conditionEdit.min &&
						conditionEdit.type === "courseQualification"
					}
					onChange={checkInputs}
				/>
			</div>
			<div className="d-flex align-items-baseline col-12 col-lg-4 col-xl-3">
				<Form.Check
					id="objective2Checkbox"
					type="checkbox"
					className="me-4"
					style={{ minWidth: "125px" }}
					label="Debe ser <"
					defaultChecked={
						conditionEdit && conditionEdit.max ? true : false || false
					}
					onChange={checkInputs}
				/>
				<Form.Control
					ref={conditionObjective2}
					type="number"
					min="0"
					max="10"
					defaultValue={
						conditionEdit && conditionEdit.max !== undefined
							? conditionEdit.max
							: 5
					}
					disabled={!conditionEdit || !conditionEdit.max}
					onChange={checkInputs}
				/>
			</div>
		</Form.Group>
	);
}

export default CourseQualificationForm;
