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
			<Form.Select ref={conditionOperator} defaultValue={conditionEdit?.op}>
				<option value="fullCourse">Total del curso</option>
				{parentsNodeArray.length > 0 &&
					parentsNodeArray.map((node) => (
						<option key={node.id}>{node.data.label}</option>
					))}
			</Form.Select>
			<Form.Check
				id="objectiveCheckbox"
				type="checkbox"
				label="debe ser >="
				onChange={checkInputs}
				defaultChecked={
					conditionEdit && conditionEdit.objective
						? true
						: false || !conditionEdit
				}
			/>
			<Form.Control
				ref={conditionObjective}
				type="number"
				min="0"
				max="10"
				defaultValue={
					conditionEdit && conditionEdit.objective !== undefined
						? conditionEdit.objective
						: 5
				}
				disabled={conditionEdit && !conditionEdit.objective}
				onChange={checkInputs}
			/>
			<Form.Check
				id="objective2Checkbox"
				type="checkbox"
				label="debe ser <"
				defaultChecked={
					conditionEdit && conditionEdit.objective2 ? true : false || false
				}
				onChange={checkInputs}
			/>
			<Form.Control
				ref={conditionObjective2}
				type="number"
				min="0"
				max="10"
				defaultValue={
					conditionEdit && conditionEdit.objective2 !== undefined
						? conditionEdit.objective2
						: 5
				}
				disabled={!conditionEdit || !conditionEdit.objective2}
				onChange={checkInputs}
			/>
		</Form.Group>
	);
}

export default QualificationForm;
