import React, { useId } from "react";
import { Form } from "react-bootstrap";

function CompletionForm({
	parentsNodeArray,
	conditionOperator,
	conditionQuery,
	conditionEdit,
}) {
	const coId = useId();
	return (
		<Form.Group
			style={{
				padding: "10px",
				border: "1px solid #C7C7C7",
				marginBottom: "10px",
			}}
			className="d-flex flex-column gap-2 p-4"
		>
			<Form.Control
				ref={conditionOperator}
				defaultValue={conditionEdit?.cm}
				type="text"
				disabled
				hidden
			/>
			<div className="d-flex align-items-baseline col-12 col-lg-6 col-xl-4">
				<Form.Label
					htmlFor={coId}
					className="me-4"
					style={{ minWidth: "125px" }}
				>
					Condición:{" "}
				</Form.Label>
				<Form.Select
					id={coId}
					ref={conditionQuery}
					defaultValue={conditionEdit?.e}
				>
					{/* The value is in that order refering to Moodle DB table schem */}
					<option value="1">debe estar completa</option>
					<option value="0">no debe estar completa</option>
					<option value="2">debe estar completa y aprobada</option>
					<option value="3">debe estar completa y suspendida</option>
				</Form.Select>
			</div>
		</Form.Group>
	);
}

export default CompletionForm;
