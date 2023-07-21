import React from "react";
import { Form } from "react-bootstrap";

const BadgeListForm = ({
	conditionEdit,
	conditionOperator,
	badgeList,
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
			{badgeList.map((option) => {
				return (
					<div key={option.id}>
						{" "}
						<Form.Check
							onChange={handleCheckboxChange}
							value={option.id}
							label={option.name}
						></Form.Check>
					</div>
				);
			})}
		</Form.Group>
	);
};

export default BadgeListForm;
