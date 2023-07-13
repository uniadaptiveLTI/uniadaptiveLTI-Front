import React from "react";
import { Form } from "react-bootstrap";

function CompletionForm({
	parentsNodeArray,
	conditionOperator,
	conditionQuery,
	conditionEdit,
}) {
	return (
		<Form.Group>
			<Form.Control
				ref={conditionOperator}
				defaultValue={conditionEdit?.cm}
				type="text"
				hidden
			/>

			<Form.Select ref={conditionQuery} defaultValue={conditionEdit?.e}>
				{/* The value is in that order refering to Moodle DB table schem */}
				<option value="1">debe estar completa</option>
				<option value="0">no debe estar completa</option>
				<option value="2">debe estar completa y aprobada</option>
				<option value="3">debe estar completa y suspendida</option>
			</Form.Select>
		</Form.Group>
	);
}

export default CompletionForm;
