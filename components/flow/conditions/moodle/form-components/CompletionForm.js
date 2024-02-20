import React, { useId } from "react";
import { Form } from "react-bootstrap";
import { getGradableTypes } from "@utils/TypeDefinitions";
import { getNodeById } from "@utils/Nodes";
import { Platforms } from "@utils/Platform";

function CompletionForm({
	parentsNodeArray,
	conditionOperator,
	conditionQuery,
	conditionEdit,
	nodes,
}) {
	const CONDITION_OPERATOR_ID = useId();
	const SOURCE_NODE = getNodeById(conditionEdit.cm, nodes);
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
				<Form.Label className="me-4" style={{ minWidth: "125px" }}>
					Bloque:
				</Form.Label>
				<Form.Label>
					<strong>{SOURCE_NODE?.data?.label}</strong>
				</Form.Label>
			</div>
			<div className="d-flex align-items-baseline col-12 col-lg-6 col-xl-4">
				<Form.Label
					htmlFor={CONDITION_OPERATOR_ID}
					className="me-4"
					style={{ minWidth: "125px" }}
				>
					Condición:{" "}
				</Form.Label>
				<Form.Select
					id={CONDITION_OPERATOR_ID}
					ref={conditionQuery}
					defaultValue={conditionEdit?.e}
				>
					{/* The value is in that order refering to Moodle DB table schem */}
					<option value="1">debe estar completa</option>
					<option value="0">no debe estar completa</option>
					{getGradableTypes(Platforms.Moodle).includes(SOURCE_NODE?.type) &&
						SOURCE_NODE?.data?.g?.hasToBeQualified && (
							<>
								<option value="2">debe estar completa y aprobada</option>
								<option value="3">debe estar completa y suspendida</option>
							</>
						)}
				</Form.Select>
			</div>
		</Form.Group>
	);
}

export default CompletionForm;
