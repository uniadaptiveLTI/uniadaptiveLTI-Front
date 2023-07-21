import React, { useRef } from "react";
import { Form } from "react-bootstrap";

const RoleForm = ({
	conditionEdit,
	conditionOperator,
	handleCheckboxChange,
	roleList,
}) => {
	return (
		<Form.Group>
			<Form.Select ref={conditionOperator} defaultValue={conditionEdit?.op}>
				<option value="&">
					Todos los roles seleccionados otorgan la insignia
				</option>
				<option value="|">Cualquiera de</option>
			</Form.Select>
			{roleList.map((option) => (
				<div key={option.id}>
					<Form.Check
						onChange={handleCheckboxChange}
						value={option.id}
						label={option.name}
						defaultChecked={conditionEdit?.roleList.some(
							(role) => role.id === option.id
						)}
					/>
				</div>
			))}
		</Form.Group>
	);
};

export default RoleForm;
