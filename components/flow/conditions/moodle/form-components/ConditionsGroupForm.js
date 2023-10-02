import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useId } from "react";
import { Alert, Form } from "react-bootstrap";

const ConditionsGroupForm = ({
	conditionEdit,
	conditionOperator,
	conditionSubOperator,
}) => {
	const cId = useId();
	return (
		<>
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
						style={{ minWidth: "170px" }}
					>
						Operador:{" "}
					</Form.Label>
					<Form.Select
						id={cId}
						ref={conditionOperator}
						defaultValue={conditionEdit?.op.includes("!") ? "!" : "!!"}
					>
						<option value="!!">Deben cumplirse</option>
						<option value="!">No debe cumplirse</option>
					</Form.Select>
				</div>
				<div className="d-flex align-items-baseline col-12 col-lg-7 col-xl-5">
					<Form.Label
						htmlFor={cId}
						className="me-4"
						style={{ minWidth: "170px" }}
					>
						Condición:{" "}
					</Form.Label>
					<Form.Select
						id={cId}
						ref={conditionSubOperator}
						defaultValue={conditionEdit?.op.includes("&") ? "&" : "|"}
					>
						<option value="&">Todas</option>
						<option value="|">Cualquiera de</option>
					</Form.Select>
				</div>
			</Form.Group>
			<Alert
				style={{ border: "1px solid #e4cd8b", borderRadius: "inherit" }}
				variant={"warning"}
			>
				<FontAwesomeIcon icon={faExclamationTriangle}></FontAwesomeIcon>{" "}
				Dependiendo del operador y condición seleccionada la visibilidad de las
				condiciones en moodle cambiará.
			</Alert>
		</>
	);
};

export default ConditionsGroupForm;
