import React from "react";
import { Form } from "react-bootstrap";

function QualificationForm(props) {
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
		<Form.Group>
			<Form.Control
				ref={conditionOperator}
				defaultValue={conditionEdit?.cm}
				type="text"
				hidden
			/>
			<Form.Check
				id="objectiveCheckbox"
				type="checkbox"
				label="debe ser >="
				onChange={checkInputs}
				defaultChecked={
					conditionEdit && conditionEdit.min
						? true
						: false || !conditionEdit || conditionEdit.type !== "qualification"
				}
			/>
			<Form.Control
				ref={conditionObjective}
				type="number"
				min="0"
				max="10"
				defaultValue={
					conditionEdit
						? conditionEdit.type === "qualification"
							? conditionEdit.min !== undefined
								? conditionEdit.min
								: 5
							: 5
						: 5
				}
				disabled={
					conditionEdit &&
					!conditionEdit.min &&
					conditionEdit.type === "qualification"
				}
				onChange={checkInputs}
			/>
			<Form.Check
				id="objective2Checkbox"
				type="checkbox"
				label="debe ser <"
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
		</Form.Group>
	);
}

export default QualificationForm;
