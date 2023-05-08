import { faEdit, faPlus, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Button, Col, Container, Row } from "react-bootstrap";

function Condition({
	condition,
	deleteCondition,
	addCondition,
	setConditionEdit,
}) {
	switch (condition.type) {
		case "date":
			return (
				<Container className="mb-3 mt-3">
					<Row>
						<Col>
							<div>Id: {condition.id}</div>
							<div>Tipo: Fecha</div>
							<div>Consulta: {condition.query}</div>
							<div>Operador: {condition.op}</div>
						</Col>
						<Col>
							<Button
								variant="light"
								onClick={() => setConditionEdit(condition)}
							>
								<div>
									<FontAwesomeIcon icon={faEdit} />
								</div>
							</Button>
							<Button
								variant="light"
								onClick={() => deleteCondition(condition.id)}
							>
								<div>
									<FontAwesomeIcon icon={faTrashCan} />
								</div>
							</Button>
						</Col>
					</Row>
				</Container>
			);
		case "qualification":
			return (
				<Container className="mb-3 mt-3">
					<Row>
						<Col>
							<div>Id: {condition.id}</div>
							<div>Tipo: Calificación</div>
							<div>Operador: {condition.op}</div>
							{condition.objective && (
								<div>Mayor o igual que: {condition.objective}</div>
							)}
							{condition.objective2 && (
								<div>Menor que: {condition.objective2}</div>
							)}
						</Col>
						<Col>
							<Button
								variant="light"
								onClick={() => setConditionEdit(condition)}
							>
								<div>
									<FontAwesomeIcon icon={faEdit} />
								</div>
							</Button>
							<Button
								variant="light"
								onClick={() => deleteCondition(condition.id)}
							>
								<div>
									<FontAwesomeIcon onclick icon={faTrashCan} />
								</div>
							</Button>
						</Col>
					</Row>
				</Container>
			);
		case "completion":
			return (
				<Container className="mb-3 mt-3">
					<Row>
						<Col>
							<div>Id: {condition.id}</div>
							<div>Tipo: Finalización</div>
							<div>Operador: {condition.op}</div>
							<div>Objetivo 1: {condition.query}</div>
						</Col>
						<Col>
							<Button
								variant="light"
								onClick={() => setConditionEdit(condition)}
							>
								<div>
									<FontAwesomeIcon icon={faEdit} />
								</div>
							</Button>
							<Button
								variant="light"
								onClick={() => deleteCondition(condition.id)}
							>
								<div>
									<FontAwesomeIcon icon={faTrashCan} />
								</div>
							</Button>
						</Col>
					</Row>
				</Container>
			);
		case "userProfile":
			return (
				<Container className="mb-3 mt-3">
					<Row>
						<Col>
							<div>Id: {condition.id}</div>
							<div>Tipo: Perfil de usuario</div>
							<div>Operador: {condition.op}</div>
							<div>Consulta: {condition.query}</div>
						</Col>
						<Col>
							<Button
								variant="light"
								onClick={() => setConditionEdit(condition)}
							>
								<div>
									<FontAwesomeIcon icon={faEdit} />
								</div>
							</Button>
							<Button
								variant="light"
								onClick={() => deleteCondition(condition.id)}
							>
								<div>
									<FontAwesomeIcon icon={faTrashCan} />
								</div>
							</Button>
						</Col>
					</Row>
				</Container>
			);
		case "conditionsGroup":
			return (
				<Container
					className="mb-3 mt-3"
					style={{ border: "1px solid black", padding: "10px" }}
				>
					<Row>
						<Col>
							<div>Id: {condition.id}</div>
							<div>Tipo: Conjunto de condiciones</div>
							<div>Operador: {condition.op}</div>
						</Col>
						<Col>
							<Button
								variant="light"
								onClick={() => addCondition(condition.id)}
							>
								<FontAwesomeIcon icon={faPlus} />
							</Button>
							<Button
								variant="light"
								onClick={() => setConditionEdit(condition)}
							>
								<div>
									<FontAwesomeIcon icon={faEdit} />
								</div>
							</Button>
							<Button
								variant="light"
								onClick={() => deleteCondition(condition.id)}
							>
								<div>
									<FontAwesomeIcon icon={faTrashCan} />
								</div>
							</Button>
						</Col>
						{condition.conditions &&
							condition.conditions.map((innerCondition) => (
								<div className="mb-3">
									<Condition
										condition={innerCondition}
										deleteCondition={deleteCondition}
										addCondition={addCondition}
										setConditionEdit={setConditionEdit}
									/>
								</div>
							))}
					</Row>
				</Container>
			);
		default:
			return null;
	}
}

export default Condition;
