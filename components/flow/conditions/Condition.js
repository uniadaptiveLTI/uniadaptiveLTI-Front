import {
	faEdit,
	faPlus,
	faShuffle,
	faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Button, Col, Container, Row } from "react-bootstrap";

function Condition({
	condition,
	deleteCondition,
	addCondition,
	setConditionEdit,
	swapConditionGroup,
}) {
	const completionQueryList = [
		{ value: "completed", name: "debe estar completa" },
		{ value: "notCompleted", name: "no debe estar completa" },
		{ value: "completedApproved", name: "debe estar completa y aprobada" },
		{ value: "completedSuspended", name: "debe estar completa y suspendida" },
	];

	const userProfileOperatorList = [
		{ value: "firstName", name: "Nombre" },
		{ value: "lastName", name: "Apellido" },
		{ value: "city", name: "Ciudad" },
		{ value: "department", name: "Departamento" },
		{ value: "address", name: "Dirección" },
		{ value: "emailAddress", name: "Dirección de correo" },
		{ value: "institution", name: "Institución" },
		{ value: "idNumber", name: "Número de ID" },
		{ value: "country", name: "País" },
		{ value: "telephone", name: "Teléfono" },
		{ value: "mobilePhone", name: "Teléfono Movil" },
	];
	const userProfileQueryList = [
		{ value: "equals", name: "es igual a" },
		{ value: "contains", name: "contiene" },
		{ value: "notContains", name: "no contiene" },
		{ value: "startsWith", name: "comienza con" },
		{ value: "endsWith", name: "termina en" },
		{ value: "empty", name: "está vacío" },
		{ value: "notEmpty", name: "no está vacío" },
	];
	const conditionsGroupOperatorList = [
		{ value: "&", name: "Se deben cumplir todas" },
		{ value: "|", name: "Solo debe cumplirse una" },
	];

	function transformDate(dateStr) {
		const date = new Date(dateStr);
		const year = date.getFullYear();
		const month = date.getMonth();

		const monthNames = [
			"enero",
			"febrero",
			"marzo",
			"abril",
			"mayo",
			"junio",
			"julio",
			"agosto",
			"septiembre",
			"octubre",
			"noviembre",
			"diciembre",
		];

		const monthName = monthNames[month];
		const day = date.getDate();

		const formattedDate = `${day} de ${monthName} de ${year}`;

		return formattedDate;
	}

	switch (condition.type) {
		case "date":
			return (
				<Container
					className="mb-3 mt-3"
					style={{ padding: "10px", border: "1px solid #C7C7C7" }}
				>
					<Row>
						<Col>
							<div>Tipo: Fecha</div>
							{condition.query === "dateFrom" && (
								<div>
									En esta fecha <strong>{transformDate(condition.op)}</strong> o
									después
								</div>
							)}
							{condition.query === "dateTo" && (
								<div>
									Antes del final de{" "}
									<strong>{transformDate(condition.op)}</strong>
								</div>
							)}
						</Col>
						<Col class="col d-flex align-items-center">
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
				<Container
					className="mb-3 mt-3"
					style={{ padding: "10px", border: "1px solid #C7C7C7" }}
				>
					<Row>
						<Col>
							<div>Tipo: Calificación</div>
							<div>
								{condition.objective && !condition.objective2 && (
									<div>
										La puntuación debe ser{" "}
										<strong>
											{">="} {condition.objective}
										</strong>{" "}
										en{" "}
										{condition.op === "fullCourse" ? (
											<strong>Total del curso</strong>
										) : (
											<strong>{condition.op}</strong>
										)}
									</div>
								)}
								{!condition.objective && condition.objective2 && (
									<div>
										La puntuación debe ser{" "}
										<strong>
											{"<"} {condition.objective2}
										</strong>{" "}
										en{" "}
										{condition.op === "fullCourse" ? (
											<strong>Total del curso</strong>
										) : (
											<strong>{condition.op}</strong>
										)}
									</div>
								)}
								{condition.objective && condition.objective2 && (
									<div>
										La puntuación debe ser{" "}
										<strong>
											{">="} {condition.objective}
										</strong>{" "}
										y{" "}
										<strong>
											{"<"} {condition.objective2}
										</strong>{" "}
										en{" "}
										{condition.op === "fullCourse" ? (
											<strong>Total del curso</strong>
										) : (
											<strong>{condition.op}</strong>
										)}
									</div>
								)}
							</div>
						</Col>
						<Col class="col d-flex align-items-center">
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
				<Container
					className="mb-3 mt-3"
					style={{ padding: "10px", border: "1px solid #C7C7C7" }}
				>
					<Row>
						<Col>
							<div>Tipo: Finalización</div>
							<div>
								La actividad <strong>{condition.op}</strong>{" "}
								{
									completionQueryList.find(
										(item) => item.value === condition.query
									)?.name
								}
							</div>
						</Col>
						<Col class="col d-flex align-items-center">
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
				<Container
					className="mb-3 mt-3"
					style={{ padding: "10px", border: "1px solid #C7C7C7" }}
				>
					<Row>
						<Col>
							<div>Tipo: Perfil de usuario</div>
							<div>
								Su{" "}
								<strong>
									{
										userProfileOperatorList.find(
											(item) => item.value === condition.op
										)?.name
									}
								</strong>{" "}
								{
									userProfileQueryList.find(
										(item) => item.value === condition.query
									)?.name
								}{" "}
								<strong>{condition.objective}</strong>
							</div>
						</Col>
						<Col class="col d-flex align-items-center">
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
					style={{ padding: "10px", border: "1px solid #C7C7C7" }}
				>
					<Row>
						<Col>
							<div>Tipo: Conjunto de condiciones</div>
							<div>
								<strong>
									{
										conditionsGroupOperatorList.find(
											(item) => item.value === condition.op
										)?.name
									}
								</strong>
							</div>
						</Col>
						<Col class="col d-flex align-items-center">
							<Button
								variant="light"
								onClick={() => addCondition(condition.id)}
							>
								<FontAwesomeIcon icon={faPlus} />
							</Button>
							<Button
								variant="light"
								onClick={() => {
									swapConditionGroup(condition);
								}}
							>
								<div>
									<FontAwesomeIcon icon={faShuffle} />
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
										swapConditionGroup={swapConditionGroup}
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
