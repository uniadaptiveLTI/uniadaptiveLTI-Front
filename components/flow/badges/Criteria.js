import {
	faEdit,
	faPlus,
	faShuffle,
	faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Button, Col, Container, Row } from "react-bootstrap";

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

function Criteria({
	condition,
	roleList,
	badgeList,
	skillsList,
	deleteCondition,
	addCondition,
	setConditionEdit,
	swapConditionGroup,
}) {
	switch (condition.type) {
		case "role":
			return (
				<Container
					className="mb-3 mt-3"
					style={{ padding: "10px", border: "1px solid #C7C7C7" }}
				>
					<Row>
						<Col class="col-md-10">
							<div>Tipo: Concesión manual por rol</div>
							{condition.op == "&" && (
								<div>
									Esta insignia debe ser otorgada a los usuarios con{" "}
									<strong>TODOS</strong> los siguientes roles:
								</div>
							)}

							{condition.op == "|" && (
								<div>
									Esta insignia debe ser otorgada a los usuarios con{" "}
									<strong>CUALQUIERA</strong> de los siguientes roles:
								</div>
							)}

							<ul>
								{condition.roleList.map((option) => {
									const role = roleList.find((role) => role.id === option.id);
									return <li key={option.id}>{role.name}</li>;
								})}
							</ul>
							<div>{condition.description}</div>
						</Col>
						<Col class="col-md-2 d-flex align-items-center gap-2">
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
		case "courseCompletion":
			return (
				<Container
					className="mb-3 mt-3"
					style={{ padding: "10px", border: "1px solid #C7C7C7" }}
				>
					<Row>
						<Col class="col-md-10">
							<div>
								{(!condition.op ||
									condition.op === "0" ||
									condition.op === "") &&
									!condition.dateTo && (
										<div>
											Los usuarios deben finalizar el curso{" "}
											<strong>NOMBRE DEL CURSO</strong>
										</div>
									)}
								{(condition.op || condition.dateTo) && (
									<div>
										Los usuarios deben finalizar el curso{" "}
										<strong>NOMBRE DEL CURSO</strong>
										{condition.dateTo && (
											<a>
												{" "}
												antes del{" "}
												<strong>{transformDate(condition.dateTo)}</strong>
											</a>
										)}
										{condition.op &&
											condition.op !== "0" &&
											condition.op !== "" && (
												<a>
													{" "}
													con calificación mínima de{" "}
													<strong>{condition.op}</strong>
												</a>
											)}
									</div>
								)}
							</div>
						</Col>
						<Col class="col-md-2 d-flex align-items-center gap-2">
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
		case "badgeList":
			return (
				<Container
					className="mb-3 mt-3"
					style={{ padding: "10px", border: "1px solid #C7C7C7" }}
				>
					<Row>
						<Col class="col-md-10">
							<div>
								{condition.op == "&" && (
									<a>
										<strong>TODAS</strong> las{" "}
									</a>
								)}
								{condition.op == "|" && (
									<a>
										<strong>CUALQUIERA</strong> de las{" "}
									</a>
								)}
								siguientes insignias tienen que haber sido ganadas:
								<ul>
									{condition.badgeList.map((option) => {
										const badge = badgeList.find(
											(badge) => badge.id === option.id
										);
										return <li key={badge.id}>{badge.name}</li>;
									})}
								</ul>
							</div>
						</Col>
						<Col class="col-md-2 d-flex align-items-center gap-2">
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
		case "completion":
			return (
				<Container
					className="mb-3 mt-3"
					style={{ padding: "10px", border: "1px solid #C7C7C7" }}
				>
					<Row>
						<Col class="col-md-10">
							<div>
								{condition.op == "&" && (
									<a>
										<strong>TODAS</strong> las{" "}
									</a>
								)}
								{condition.op == "|" && (
									<a>
										<strong>CUALQUIERA</strong> de las{" "}
									</a>
								)}
								siguientes actividades se han finalizado:
								<ul>
									{condition.activityList.map((option) => {
										return (
											<li>
												<strong>{option.name}</strong>{" "}
												{option.date && (
													<a>
														{" "}
														antes del{" "}
														<strong>{transformDate(option.date)}</strong>
													</a>
												)}
											</li>
										);
									})}
								</ul>
							</div>
						</Col>
						<Col class="col-md-2 d-flex align-items-center gap-2">
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
						</Col>
					</Row>
				</Container>
			);
		case "skills":
			return (
				<Container
					className="mb-3 mt-3"
					style={{ padding: "10px", border: "1px solid #C7C7C7" }}
				>
					<Row>
						<Col class="col-md-10">
							<div>
								{condition.op == "&" && (
									<a>
										<strong>TODAS</strong> las{" "}
									</a>
								)}
								{condition.op == "|" && (
									<a>
										<strong>CUALQUIERA</strong> de las{" "}
									</a>
								)}
								siguientes competencias tengan que ser completadas:
								<ul>
									{condition.skillsList.map((option) => {
										const skill = skillsList.find(
											(skill) => skill.id === option.id
										);
										return <li key={skill.id}>{skill.name}</li>;
									})}
								</ul>
							</div>
						</Col>
						<Col class="col-md-2 d-flex align-items-center gap-2">
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
		default:
			return null;
	}
}

export default Criteria;
