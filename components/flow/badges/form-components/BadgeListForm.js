import React from "react";
import { useId } from "react";
import { Form } from "react-bootstrap";

const BadgeListForm = ({
	conditionEdit,
	conditionOperator,
	badgeList,
	handleCheckboxChange,
}) => {
	const blId = useId();
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
				<Form.Label htmlFor={blId} style={{ width: "250px" }}>
					Condición:
				</Form.Label>
				<Form.Select
					id={blId}
					ref={conditionOperator}
					defaultValue={conditionEdit?.op}
				>
					<option value="&">
						Se deben obtener todas las insignias seleccionadas
					</option>
					<option value="|">
						Se debe obtener alguna de las insignias seleccionadas
					</option>
				</Form.Select>
			</div>
			<b className="mt-4">Insignias:</b>
			<div className="ms-4 me-0">
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
			</div>
		</Form.Group>
	);
};

export default BadgeListForm;
