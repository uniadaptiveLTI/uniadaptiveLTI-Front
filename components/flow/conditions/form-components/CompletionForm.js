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
			<Form.Select ref={conditionOperator} defaultValue={conditionEdit?.op}>
				{parentsNodeArray.length > 0 &&
					parentsNodeArray.map((node) => (
						<option key={node.id}>{node.data.label}</option>
					))}
			</Form.Select>
			<Form.Select ref={conditionQuery} defaultValue={conditionEdit?.query}>
				<option value="completed">debe estar completa</option>
				<option value="notCompleted">no debe estar completa</option>
				<option value="completedApproved">
					debe estar completa y aprobada
				</option>
				<option value="completedSuspended">
					debe estar completa y suspendida
				</option>
			</Form.Select>
		</Form.Group>
	);
}

export default CompletionForm;
