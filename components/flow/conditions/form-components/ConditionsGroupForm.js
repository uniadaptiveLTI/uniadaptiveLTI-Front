import React, { useId } from "react";
import { Form } from "react-bootstrap";

const ConditionsGroupForm = ({ conditionEdit, conditionOperator }) => {
	const cId = useId();
	return (
		<Form.Group
			style={{
				padding: "10px",
				border: "1px solid #C7C7C7",
				marginBottom: "10px",
			}}
			className="d-flex flex-column gap-2 p-4"
		>
			<div className="d-flex align-items-baseline col-12 col-lg-7 col-xl-5">
				<Form.Label
					htmlFor={cId}
					className="me-4"
					style={{ minWidth: "125px" }}
				>
					Condición:{" "}
				</Form.Label>
				<Form.Select
					id={cId}
					ref={conditionOperator}
					defaultValue={conditionEdit?.op}
				>
					<option value="&">Se deben cumplir todas</option>
					<option value="|">Solo debe cumplirse una</option>
				</Form.Select>
			</div>
		</Form.Group>
	);
};

export default ConditionsGroupForm;
