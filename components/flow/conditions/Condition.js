import { faPlus, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Button } from "react-bootstrap";

function Condition({ condition, deleteCondition, addCondition }) {
	switch (condition.type) {
		case "date":
			return (
				<div id={condition.id} className="mb-3">
					<div>Tipo: Fecha</div>
					<div>Consulta: {condition.query}</div>
					<div>Operador: {condition.op}</div>
					<Button variant="light" onClick={() => deleteCondition(condition.id)}>
						<div>
							<FontAwesomeIcon icon={faTrashCan} />
							Eliminar bloque...
						</div>
					</Button>
				</div>
			);
		case "qualification":
			return (
				<div className="mb-3">
					<div>Tipo: Calificación</div>
					<div>Operador: {condition.op}</div>
					<div>Mayor o igual que: {condition.objective}</div>
					{condition.objective2 && <div>Menor que: {condition.objective2}</div>}
					<Button variant="light" onClick={() => deleteCondition(condition.id)}>
						<div>
							<FontAwesomeIcon onclick icon={faTrashCan} />
							Eliminar bloque...
						</div>
					</Button>
				</div>
			);
		case "completion":
			return (
				<div className="mb-3">
					<div>Tipo: Finalización</div>
					<div>Operador: {condition.op}</div>
					<div>Objetivo 1: {condition.query}</div>
					<Button variant="light" onClick={() => deleteCondition(condition.id)}>
						<div>
							<FontAwesomeIcon icon={faTrashCan} />
							Eliminar bloque...
						</div>
					</Button>
				</div>
			);
		case "userProfile":
			return (
				<div className="mb-3">
					<div>Tipo: Perfil de usuario</div>
					<div>Operador: {condition.op}</div>
					<div>Consulta: {condition.query}</div>
					<Button variant="light" onClick={() => deleteCondition(condition.id)}>
						<div>
							<FontAwesomeIcon icon={faTrashCan} />
							Eliminar condición...
						</div>
					</Button>
				</div>
			);
		case "conditionsGroup":
			console.log(condition.id);
			return (
				<div
					className="mb-3"
					style={{ border: "1px solid black", padding: "10px" }}
				>
					<div>Tipo: Conjunto de condiciones</div>
					<div>Operador: {condition.op}</div>
					{condition.conditions &&
						condition.conditions.map((innerCondition) => (
							<div className="mb-3">
								<Condition
									condition={innerCondition}
									deleteCondition={deleteCondition}
									addCondition={addCondition}
								/>
							</div>
						))}
					<Button
						className="mb-3"
						variant="light"
						onClick={() => addCondition(condition.id)}
					>
						<div role="button">
							<FontAwesomeIcon icon={faPlus} />
							Crear condición
						</div>
					</Button>
					<Button variant="light" onClick={() => deleteCondition(condition.id)}>
						<div>
							<FontAwesomeIcon icon={faTrashCan} />
							Eliminar condición...
						</div>
					</Button>
				</div>
			);
		default:
			return null;
	}
}

export default Condition;
