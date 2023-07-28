import { Container, Row, Col, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faArrowDown,
	faArrowUp,
	faEdit,
	faEye,
	faEyeSlash,
	faTrashCan,
} from "@fortawesome/free-solid-svg-icons";

const GroupingComponent = ({
	condition,
	conditionsList,
	setConditionEdit,
	upCondition,
	downCondition,
	deleteCondition,
	moodleGroupings,
	swapConditionParam,
}) => {
	const grouping = moodleGroupings.find(
		(grouping) => grouping.id == condition.groupingId
	);

	const mainCondition = conditionsList.c.some((c) => c.id === condition.id);

	return (
		<Container
			className="mb-3 mt-3"
			style={{ padding: "10px", border: "1px solid #C7C7C7" }}
		>
			<Row className="align-items-center">
				{mainCondition && conditionsList.op === "&" && (
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
					<div>Tipo: Agrupamiento</div>
					<div>
						Se pertenezca al agrupamiento <strong>{grouping.name}</strong>
					</div>
				</Col>
				<Col className="d-flex align-items-center justify-content-end gap-2">
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
};

export default GroupingComponent;
