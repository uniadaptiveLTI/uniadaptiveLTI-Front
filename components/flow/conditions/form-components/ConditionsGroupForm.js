import React from "react";
import { Form } from "react-bootstrap";

const ConditionsGroupForm = ({ conditionEdit, conditionOperator }) => {
	return (
		<Form.Group>
			<Form.Select ref={conditionOperator} defaultValue={conditionEdit?.op}>
				<option value="&">Se deben cumplir todas</option>
				<option value="|">Solo debe cumplirse una</option>
			</Form.Select>
		</Form.Group>
	);
};

export default ConditionsGroupForm;
