import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useReactFlow } from "reactflow";
import {
	faArrowDown,
	faArrowUp,
	faEdit,
	faEye,
	faEyeSlash,
	faTrashCan,
} from "@fortawesome/free-solid-svg-icons";

function GradeComponent({
	condition,
	conditionsList,
	setConditionEdit,
	upCondition,
	downCondition,
	deleteCondition,
	swapConditionParam,
}) {
	const reactFlowInstance = useReactFlow();
	const NODES = reactFlowInstance.getNodes();

	const NODE = NODES.find((node) => node.id === condition.cm);
	const MAIN_CONDITION = conditionsList.c.some((c) => c.id === condition.id);

	return (
		<Container
			className="mb-3 mt-3"
			style={{ padding: "10px", border: "1px solid #C7C7C7" }}
		>
			<Row className="align-items-center">
				{MAIN_CONDITION &&
					(conditionsList.op === "&" || conditionsList.op === "!|") && (
						<Col className="col-1">
							<Button
								variant="light"
								onClick={() => swapConditionParam(condition, "showc")}
							>
								<div>
									{condition.showc ? (
										<FontAwesomeIcon icon={faEye} />
									) : (
										<FontAwesomeIcon icon={faEyeSlash} />
									)}
								</div>
							</Button>
						</Col>
					)}
				<Col style={{ width: "531px", flex: "0 0 auto" }}>
					<div>Tipo: Calificación</div>
					<div>
						{condition.min && !condition.max && (
							<div>
								La puntuación debe ser{" "}
								<strong>
									{">="} {condition.min}
								</strong>{" "}
								en <strong>{NODE.data.label}</strong>
							</div>
						)}
						{!condition.min && condition.max && (
							<div>
								La puntuación debe ser{" "}
								<strong>
									{"<"} {condition.max}
								</strong>{" "}
								en <strong>{NODE.data.label}</strong>
							</div>
						)}
						{condition.min && condition.max && (
							<div>
								La puntuación debe ser{" "}
								<strong>
									{">="} {condition.min}
								</strong>{" "}
								y{" "}
								<strong>
									{"<"} {condition.max}
								</strong>{" "}
								en <strong>{NODE.data.label}</strong>
							</div>
						)}
					</div>
				</Col>
				<Col className="col d-flex align-items-center justify-content-end gap-2">
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
					{conditionsList.c.length >= 1 && (
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

export default GradeComponent;
