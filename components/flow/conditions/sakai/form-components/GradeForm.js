import React from "react";
import { Form } from "react-bootstrap";

function GradeForm({ conditionEdit, exceptionSelectRef, pointRef }) {
	return (
		<Form.Group
			style={{
				padding: "10px",
				border: "1px solid #C7C7C7",
				marginBottom: "10px",
			}}
			className="d-flex flex-column gap-2 p-4"
		>
			<Form.Select
				ref={exceptionSelectRef}
				defaultValue={conditionEdit.operator}
			>
				<option value="SMALLER_THAN">Menor que</option>
				<option value="SMALLER_THAN_OR_EQUAL_TO">Menor o igual que</option>
				<option value="EQUAL_TO">Igual que</option>
				<option value="GREATER_THAN_OR_EQUAL_TO">Mayor o igual que</option>
				<option value="GREATER_THAN">Mayor que</option>
			</Form.Select>
			<Form.Control
				ref={pointRef}
				type="number"
				min="1"
				max="100"
				defaultValue={conditionEdit.argument}
			/>
		</Form.Group>
	);
}

export default GradeForm;
