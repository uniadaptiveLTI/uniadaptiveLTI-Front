import React from "react";
import { Form } from "react-bootstrap";

function CourseGradeForm(props) {
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
		<Form.Group
			style={{
				padding: "10px",
				border: "1px solid #C7C7C7",
				marginBottom: "10px",
			}}
			className="d-flex flex-column gap-2 p-4"
		>
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
							: false || !conditionEdit || conditionEdit.type !== "courseGrade"
					}
				/>
				<Form.Control
					ref={conditionObjective}
					type="number"
					min="0"
					max="10"
					defaultValue={
						conditionEdit
							? conditionEdit.type === "courseGrade"
								? conditionEdit.min !== undefined
									? conditionEdit.min
									: 5
								: 5
							: 5
					}
					disabled={
						conditionEdit &&
						!conditionEdit.min &&
						conditionEdit.type === "courseGrade"
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

export default CourseGradeForm;
