import React from "react";
import { Form } from "react-bootstrap";
import { getNodeById } from "@utils/Nodes";

function GradeForm(props) {
	const {
		conditionOperator,
		conditionQuery,
		conditionObjective,
		conditionObjective2,
		conditionEdit,
		parentsNodeArray,
		checkInputs,
		nodes,
	} = props;

	return (
		<Form.Group
			style={{
				padding: "10px",
				border: "1px solid #C7C7C7",
				marginBottom: "10px",
			}}
			className="d-flex flex-column gap-2 p-4"
		>
			<div className="d-flex align-items-baseline col-12 col-lg-6 col-xl-4">
				<Form.Label className="me-4" style={{ minWidth: "125px" }}>
					Bloque:
				</Form.Label>
				<Form.Label>
					<strong>{getNodeById(conditionEdit.cm, nodes).data.label}</strong>
				</Form.Label>
			</div>
			<Form.Control
				ref={conditionOperator}
				defaultValue={conditionEdit?.cm}
				type="text"
				hidden
			/>
			<div className="d-flex align-items-baseline col-12 col-lg-5 col-xl-3">
				<Form.Check
					id="objectiveCheckbox"
					type="checkbox"
					label="Debe ser >="
					className="me-4"
					style={{ minWidth: "125px" }}
					onChange={checkInputs}
					defaultChecked={
						conditionEdit && conditionEdit.min
							? true
							: false || !conditionEdit || conditionEdit.type !== "grade"
					}
				/>

				<Form.Control
					ref={conditionObjective}
					type="number"
					min="0"
					max="10"
					defaultValue={
						conditionEdit
							? conditionEdit.type === "grade"
								? conditionEdit.min !== undefined
									? conditionEdit.min
									: 5
								: 5
							: 5
					}
					disabled={
						conditionEdit &&
						!conditionEdit.min &&
						conditionEdit.type === "grade"
					}
					onChange={checkInputs}
				/>
			</div>
			<div className="d-flex align-items-baseline col-12 col-lg-5 col-xl-3">
				<Form.Check
					id="objective2Checkbox"
					type="checkbox"
					label="Debe ser <"
					className="me-4"
					style={{ minWidth: "125px" }}
					defaultChecked={
						conditionEdit && conditionEdit.max ? true : false || false
					}
					onChange={checkInputs}
				/>

				<Form.Control
					ref={conditionObjective2}
					type="number"
					min="0"
					max="10"
					defaultValue={
						conditionEdit && conditionEdit.max !== undefined
							? conditionEdit.max
							: 5
					}
					disabled={!conditionEdit || !conditionEdit.max}
					onChange={checkInputs}
				/>
			</div>
		</Form.Group>
	);
}

export default GradeForm;
