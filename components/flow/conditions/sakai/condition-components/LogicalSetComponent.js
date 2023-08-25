import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useReactFlow } from "reactflow";
import { getNodeById } from "@utils/Nodes";
import {
	faArrowDown,
	faArrowUp,
	faEdit,
	faEye,
	faEyeSlash,
	faTrashCan,
} from "@fortawesome/free-solid-svg-icons";

function LogicalSetComponent({ condition, setConditionEdit }) {
	const reactFlowInstance = useReactFlow();

	return (
		<Container
			className="mb-3 mt-3"
			style={{ padding: "10px", border: "1px solid #C7C7C7" }}
		>
			<Row className="align-items-center">
				<Col>
					{condition.op === "GREATER_THAN" && (
						<div>
							La puntuación debe ser{" "}
							<strong>
								{"mayor que"} {condition.points}
							</strong>{" "}
							en{" "}
							<strong>
								{
									getNodeById(condition.parentId, reactFlowInstance.getNodes())
										.data.label
								}
							</strong>
						</div>
					)}
					{condition.op === "GREATER_THAN_OR_EQUAL_TO" && (
						<div>
							La puntuación debe ser{" "}
							<strong>
								{"mayor o igual que"} {condition.points}
							</strong>{" "}
							en{" "}
							<strong>
								{
									getNodeById(condition.parentId, reactFlowInstance.getNodes())
										.data.label
								}
							</strong>
						</div>
					)}
					{condition.op === "SMALLER_THAN" && (
						<div>
							La puntuación debe ser{" "}
							<strong>
								{"menor que"} {condition.points}
							</strong>{" "}
							en{" "}
							<strong>
								{
									getNodeById(condition.parentId, reactFlowInstance.getNodes())
										.data.label
								}
							</strong>
						</div>
					)}
					{condition.op === "SMALLER_THAN_OR_EQUAL_TO" && (
						<div>
							La puntuación debe ser{" "}
							<strong>
								{"menor o igual que"} {condition.points}
							</strong>{" "}
							en{" "}
							<strong>
								{
									getNodeById(condition.parentId, reactFlowInstance.getNodes())
										.data.label
								}
							</strong>
						</div>
					)}
					{condition.op === "EQUAL_TO" && (
						<div>
							La puntuación debe ser{" "}
							<strong>
								{"igual que"} {condition.points}
							</strong>{" "}
							en{" "}
							<strong>
								{
									getNodeById(condition.parentId, reactFlowInstance.getNodes())
										.data.label
								}
							</strong>
						</div>
					)}
				</Col>
				<Col className="col d-flex align-items-center justify-content-end gap-2">
					<Button variant="light" onClick={() => setConditionEdit(condition)}>
						<div>
							<FontAwesomeIcon icon={faEdit} />
						</div>
					</Button>
					<Button variant="light">
						<div>
							<FontAwesomeIcon icon={faTrashCan} />
						</div>
					</Button>
				</Col>
			</Row>
		</Container>
	);
}

export default LogicalSetComponent;
