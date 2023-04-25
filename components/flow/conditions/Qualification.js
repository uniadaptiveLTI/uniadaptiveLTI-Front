import React from "react";
import { Form } from "react-bootstrap";

const Qualification = ({
	condition,
	conditionTypes,
	qualificationOperand,
	titleID,
	titleDOM,
	expandedCondition,
}) => {
	return (
		<div
			style={{
				opacity: expandedCondition ? "1" : "0",
				visibility: expandedCondition ? "visible" : "hidden",
				maxHeight: expandedCondition ? "" : "0",
				transition: "all .2s",
			}}
			className="mb-3"
		>
			<Form.Group className="mb-3">
				<Form.Label htmlFor={titleID} className="mb-1">
					Tipo de relación
				</Form.Label>
				<Form.Select value={condition.type}>
					{conditionTypes.map((conditionType) => {
						return (
							<option value={conditionType.value} key={conditionType.value}>
								{conditionType.name}
							</option>
						);
					})}
				</Form.Select>
			</Form.Group>
			<Form.Group className="mb-3">
				<Form.Label htmlFor={titleID} className="mb-1">
					Operante
				</Form.Label>
				<Form.Select value={condition.operand}>
					{qualificationOperand.map((operand) => {
						return (
							<option value={operand.value} key={operand.value}>
								{operand.name}
							</option>
						);
					})}
				</Form.Select>
			</Form.Group>
			<Form.Group className="mb-3">
				<Form.Label htmlFor={titleID} className="mb-1">
					Objetivo
				</Form.Label>
				<Form.Control
					ref={titleDOM}
					id={titleID}
					type="number"
					className="w-100"
					value={condition.objective}
				></Form.Control>
			</Form.Group>
		</div>
	);
};

export default Qualification;
