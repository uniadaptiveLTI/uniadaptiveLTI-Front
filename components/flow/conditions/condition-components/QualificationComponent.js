import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useReactFlow } from "reactflow";
import {
	faArrowDown,
	faArrowUp,
	faEdit,
	faTrashCan,
} from "@fortawesome/free-solid-svg-icons";

function QualificationComponent({
	condition,
	conditionsList,
	upCondition,
	downCondition,
	setConditionEdit,
	deleteCondition,
}) {
	const reactFlowInstance = useReactFlow();
	const nodes = reactFlowInstance.getNodes();

	const node = nodes.find((node) => node.id === condition.op);

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
								en <strong>{node.data.label}</strong>
							</div>
						)}
						{!condition.objective && condition.objective2 && (
							<div>
								La puntuación debe ser{" "}
								<strong>
									{"<"} {condition.objective2}
								</strong>{" "}
								en <strong>{node.data.label}</strong>
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
								en <strong>{node.data.label}</strong>
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
					{conditionsList.length >= 1 && (
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

export default QualificationComponent;
