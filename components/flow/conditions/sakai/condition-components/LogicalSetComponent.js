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
	faShuffle,
	faTrashCan,
} from "@fortawesome/free-solid-svg-icons";

function LogicalSetComponent({
	lastIndex,
	condition,
	setConditionEdit,
	deleteRequisite,
	swapToOr,
}) {
	const reactFlowInstance = useReactFlow();
	return (
		<Container
			className={lastIndex ? "mb-0 mt-3" : "mb-3 mt-3"}
			style={{
				padding: "10px",
				border: "1px solid #C7C7C7",
			}}
		>
			<Row className="align-items-center">
				<Col>
					{condition.operator === "GREATER_THAN" && (
						<div>
							La puntuación debe ser{" "}
							<strong>
								{"mayor que"} {condition.argument}
							</strong>{" "}
							en{" "}
							<strong>
								{
									getNodeById(condition.itemId, reactFlowInstance.getNodes())
										.data.label
								}
							</strong>
						</div>
					)}
					{condition.operator === "GREATER_THAN_OR_EQUAL_TO" && (
						<div>
							La puntuación debe ser{" "}
							<strong>
								{"mayor o igual que"} {condition.argument}
							</strong>{" "}
							en{" "}
							<strong>
								{
									getNodeById(condition.itemId, reactFlowInstance.getNodes())
										.data.label
								}
							</strong>
						</div>
					)}
					{condition.operator === "SMALLER_THAN" && (
						<div>
							La puntuación debe ser{" "}
							<strong>
								{"menor que"} {condition.argument}
							</strong>{" "}
							en{" "}
							<strong>
								{
									getNodeById(condition.itemId, reactFlowInstance.getNodes())
										.data.label
								}
							</strong>
						</div>
					)}
					{condition.operator === "SMALLER_THAN_OR_EQUAL_TO" && (
						<div>
							La puntuación debe ser{" "}
							<strong>
								{"menor o igual que"} {condition.argument}
							</strong>{" "}
							en{" "}
							<strong>
								{
									getNodeById(condition.itemId, reactFlowInstance.getNodes())
										.data.label
								}
							</strong>
						</div>
					)}
					{condition.operator === "EQUAL_TO" && (
						<div>
							La puntuación debe ser{" "}
							<strong>
								{"igual que"} {condition.argument}
							</strong>{" "}
							en{" "}
							<strong>
								{
									getNodeById(condition.itemId, reactFlowInstance.getNodes())
										.data.label
								}
							</strong>
						</div>
					)}
				</Col>
				<Col className="col-md-auto d-flex align-items-center justify-content-end gap-2">
					<Button
						variant="light"
						onClick={() => {
							swapToOr();
						}}
					>
						<div>
							<FontAwesomeIcon icon={faShuffle} />
						</div>
					</Button>
					<Button variant="light" onClick={() => setConditionEdit(condition)}>
						<div>
							<FontAwesomeIcon icon={faEdit} />
						</div>
					</Button>
					<Button
						variant="light"
						onClick={() => deleteRequisite(condition.itemId, false)}
					>
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
