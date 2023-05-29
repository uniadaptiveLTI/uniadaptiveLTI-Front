import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faArrowDown,
	faArrowUp,
	faEdit,
	faTrashCan,
} from "@fortawesome/free-solid-svg-icons";

function CourseQualificationComponent({
	condition,
	conditionsList,
	upCondition,
	downCondition,
	setConditionEdit,
	deleteCondition,
}) {
	return (
		<Container
			className="mb-3 mt-3"
			style={{ padding: "10px", border: "1px solid #C7C7C7" }}
		>
			<Row>
				<Col>
					<div>Tipo: Calificación total del curso</div>
					<div>
						{condition.objective && !condition.objective2 && (
							<div>
								La puntuación <strong>total del curso</strong> debe ser{" "}
								<strong>
									{">="} {condition.objective}
								</strong>
							</div>
						)}
						{!condition.objective && condition.objective2 && (
							<div>
								La puntuación <strong>total del curso</strong> debe ser{" "}
								<strong>
									{"<"} {condition.objective2}
								</strong>
							</div>
						)}
						{condition.objective && condition.objective2 && (
							<div>
								La puntuación <strong>total del curso</strong> debe ser{" "}
								<strong>
									{">="} {condition.objective}
								</strong>{" "}
								y{" "}
								<strong>
									{"<"} {condition.objective2}
								</strong>
							</div>
						)}
					</div>
				</Col>
				<Col className="col d-flex align-items-center gap-2">
					<Button variant="light" onClick={() => setConditionEdit(condition)}>
						<div>
							<FontAwesomeIcon icon={faEdit} />
						</div>
					</Button>
					<Button variant="light" onClick={() => deleteCondition(condition.id)}>
						<div>
							<FontAwesomeIcon icon={faTrashCan} />
						</div>
					</Button>
					{conditionsList.length > 1 && (
						<>
							<Button variant="light" onClick={() => upCondition(condition)}>
								<div>
									<FontAwesomeIcon icon={faArrowUp} />
								</div>
							</Button>
							<Button variant="light" onClick={() => downCondition(condition)}>
								<div>
									<FontAwesomeIcon icon={faArrowDown} />
								</div>
							</Button>
						</>
					)}
				</Col>
			</Row>
		</Container>
	);
}

export default CourseQualificationComponent;
