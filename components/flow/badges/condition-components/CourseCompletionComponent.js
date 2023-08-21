import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faEdit,
	faShuffle,
	faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";

const CourseCompletionComponent = ({
	condition,
	setConditionEdit,
	deleteCondition,
	parseDate,
	swapConditionGroup,
}) => {
	return (
		<Container
			className="mb-3 mt-3"
			style={{ padding: "10px", border: "1px solid #C7C7C7" }}
		>
			<Row className="align-items-center">
				<Col>
					<div>
						{(!condition.op || condition.op === "0" || condition.op === "") &&
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
										antes del <strong>{parseDate(condition.dateTo)}</strong>
										<br></br>
									</a>
								)}
								{condition.op &&
									condition.op !== "0" &&
									condition.op !== "" && (
										<a>
											{" "}
											con calificación mínima de <strong>{condition.op}</strong>
										</a>
									)}
							</div>
						)}
					</div>
				</Col>
				<Col className="col-md-2 d-flex align-items-center gap-2">
					<Button variant="light" onClick={() => setConditionEdit(condition)}>
						<div>
							<FontAwesomeIcon icon={faEdit} />
						</div>
					</Button>
					<Button variant="light" onClick={() => deleteCondition(condition.id)}>
						<div>
							<FontAwesomeIcon icon={faTrashAlt} />
						</div>
					</Button>
				</Col>
			</Row>
		</Container>
	);
};

export default CourseCompletionComponent;
