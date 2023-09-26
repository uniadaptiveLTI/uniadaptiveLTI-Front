import React from "react";
import { useId } from "react";
import { Form } from "react-bootstrap";

const SkillsForm = ({
	conditionEdit,
	conditionOperator,
	skillsList,
	handleCheckboxChange,
}) => {
	const skId = useId();
	return (
		<Form.Group
			style={{
				padding: "10px",
				border: "1px solid #C7C7C7",
				marginBottom: "10px",
			}}
			className="p-4"
		>
			<div className="d-flex flex-row gap-2 align-items-baseline col-12 col-lg-10 col-xl-7">
				<Form.Label htmlFor={skId} style={{ width: "250px" }}>
					Condición:{" "}
				</Form.Label>
				<Form.Select
					id={skId}
					ref={conditionOperator}
					defaultValue={conditionEdit?.method}
				>
					<option value="&">
						Se deben obtener todas las competencias seleccionadas
					</option>
					<option value="|">
						Se debe obtener alguna de las competencias seleccionadas
					</option>
				</Form.Select>
			</div>
			<b className="mt-4">Competencias:</b>
			<div className="ms-4 me-0">
				{skillsList.map((option) => {
					return (
						<div key={option.id}>
							<Form.Check
								onChange={handleCheckboxChange}
								value={option.id}
								label={option.name}
								defaultChecked={conditionEdit?.params?.includes(option.id)}
							/>
						</div>
					);
				})}
				{skillsList && skillsList.length <= 0 && (
					<div>
						No existen competencias creadas para la creación de la condición, es
						necesario crear al menos una.
					</div>
				)}
			</div>
		</Form.Group>
	);
};

export default SkillsForm;
