import React from "react";
import { Form } from "react-bootstrap";

const SkillsForm = ({
	conditionEdit,
	conditionOperator,
	skillsList,
	handleCheckboxChange,
}) => {
	return (
		<Form.Group>
			<Form.Select ref={conditionOperator} defaultValue={conditionEdit?.op}>
				<option value="&">
					Se deben obtener todas las insignias seleccionadas
				</option>
				<option value="|">
					Se debe obtener alguna de las insignias seleccionadas
				</option>
			</Form.Select>
			{skillsList.map((option) => {
				return (
					<div key={option.id}>
						<Form.Check
							onChange={handleCheckboxChange}
							value={option.id}
							label={option.name}
						/>
					</div>
				);
			})}
		</Form.Group>
	);
};

export default SkillsForm;
