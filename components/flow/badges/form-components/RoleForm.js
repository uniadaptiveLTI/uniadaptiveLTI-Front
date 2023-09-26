import React, { useRef } from "react";
import { useId } from "react";
import { Form } from "react-bootstrap";

const RoleForm = ({
	conditionEdit,
	conditionOperator,
	roleList,
	handleCheckboxChange,
}) => {
	const cId = useId();
	return (
		<Form.Group
			style={{
				padding: "10px",
				border: "1px solid #C7C7C7",
				marginBottom: "10px",
			}}
			className="p-4"
		>
			<div className="d-flex flex-row gap-2 align-items-baseline col-12 col-lg-8 col-xl-6">
				<Form.Label htmlFor={cId}>Condición: </Form.Label>
				<Form.Select
					id={cId}
					ref={conditionOperator}
					defaultValue={conditionEdit?.method}
				>
					<option value="&">
						Todos los roles seleccionados otorgan la insignia
					</option>
					<option value="|">Cualquiera de</option>
				</Form.Select>
			</div>
			<b className="mt-4">Roles:</b>
			<div className="ms-4 me-0">
				{roleList?.map((option) => (
					<div key={option.id}>
						<Form.Check
							onChange={handleCheckboxChange}
							value={option.id}
							label={option.name}
							defaultChecked={conditionEdit?.params?.includes(option.id)}
						/>
					</div>
				))}
				{roleList && roleList.length <= 0 && (
					<div>
						No existen roles disponibles para la creación de la condición, es
						necesario crear al menos uno.
					</div>
				)}
			</div>
		</Form.Group>
	);
};

export default RoleForm;
