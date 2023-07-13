import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Condition from "../Condition";
import {
	faPlus,
	faTrashCan,
	faShuffle,
} from "@fortawesome/free-solid-svg-icons";

const conditionsGroupOperatorList = [
	{ value: "&", name: "Se deben cumplir todas" },
	{ value: "|", name: "Solo debe cumplirse una" },
];

const ConditionsGroupComponent = ({
	condition,
	conditionsList,
	deleteCondition,
	upCondition,
	downCondition,
	addCondition,
	setConditionEdit,
	swapConditionGroup,
}) => {
	return (
		<Container
			className="mb-3 mt-3"
			style={{ padding: "10px", border: "1px solid #C7C7C7" }}
		>
			<Row>
				<Col>
					<div>Tipo: Conjunto de condiciones</div>
					<div>Id: {condition.id}</div>
					<div>
						<strong>
							{
								conditionsGroupOperatorList.find(
									(item) => item.value === condition.op
								)?.name
							}
						</strong>
					</div>
				</Col>
				<Col className="d-flex align-items-center gap-2">
					<Button variant="light" onClick={() => addCondition(condition.id)}>
						<FontAwesomeIcon icon={faPlus} />
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
					<Button variant="light" onClick={() => deleteCondition(condition.id)}>
						<div>
							<FontAwesomeIcon icon={faTrashCan} />
						</div>
					</Button>
				</Col>
				{condition.c &&
					condition.c.map((innerCondition) => (
						<div className="mb-3">
							<Condition
								condition={innerCondition}
								conditionsList={conditionsList}
								deleteCondition={deleteCondition}
								upCondition={upCondition}
								addCondition={addCondition}
								downCondition={downCondition}
								setConditionEdit={setConditionEdit}
								swapConditionGroup={swapConditionGroup}
							/>
						</div>
					))}
			</Row>
		</Container>
	);
};

export default ConditionsGroupComponent;
