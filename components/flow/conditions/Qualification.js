import React, { useContext } from "react";
import { Form } from "react-bootstrap";
import styles from "@components/styles/Aside.module.css";
import { SettingsContext } from "@components/pages/_app";

const Qualification = ({
	condition,
	conditionTypes,
	qualificationOperand,
	titleID,
	titleDOM,
	expandedCondition,
}) => {
	const { settings, setSettings } = useContext(SettingsContext);
	const parsedSettings = JSON.parse(settings);
	let { reducedAnimations } = parsedSettings;
	return (
		<div
			className={
				[
					styles.uniadaptiveDetails,
					expandedCondition ? styles.active : null,
					reducedAnimations && styles.noAnimation,
				].join(" ") + "mb-3"
			}
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
