import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrashCan } from "@fortawesome/free-solid-svg-icons";

const GroupComponent = ({
	condition,
	setConditionEdit,
	deleteCondition,
	moodleGroups,
}) => {
	const group = moodleGroups.find(
		(grouping) => grouping.id === condition?.groupId
	);

	return (
		<Container
			className="mb-3 mt-3"
			style={{ padding: "10px", border: "1px solid #C7C7C7" }}
		>
			<Row>
				<Col>
					<div>Tipo: Grupo</div>
					<div>
						{!group && (
							<div>
								Se pertenezca a <strong>cualquier grupo</strong>
							</div>
						)}
						{group && (
							<div>
								Se pertenezca al grupo <strong>{group.name}</strong>
							</div>
						)}
					</div>
				</Col>
				<Col className="d-flex align-items-center gap-2">
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
				</Col>
			</Row>
		</Container>
	);
};

export default GroupComponent;
