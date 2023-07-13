import { Container, Row, Col, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrashCan } from "@fortawesome/free-solid-svg-icons";

const GroupingComponent = ({
	condition,
	setConditionEdit,
	deleteCondition,
	moodleGroupings,
}) => {
	const grouping = moodleGroupings.find(
		(grouping) => grouping.id === condition.groupingId
	);

	return (
		<Container
			className="mb-3 mt-3"
			style={{ padding: "10px", border: "1px solid #C7C7C7" }}
		>
			<Row>
				<Col>
					<div>Tipo: Agrupamiento</div>
					<div>
						Se pertenezca al agrupamiento <strong>{grouping.name}</strong>
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

export default GroupingComponent;
