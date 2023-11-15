import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Condition from "../Condition";
import {
	faPlus,
	faTrashCan,
	faShuffle,
	faEye,
	faEyeSlash,
	faArrowUp,
	faArrowDown,
	faEdit,
} from "@fortawesome/free-solid-svg-icons";

const ConditionsGroupComponent = ({
	condition,
	conditionsList,
	deleteCondition,
	upCondition,
	downCondition,
	addCondition,
	setConditionEdit,
	swapConditionParam,
	moodleGroups,
	moodleGroupings,
	conditionsGroupOperatorList,
}) => {
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
					<div>Tipo: Conjunto de condiciones</div>
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
				<Col className="d-flex align-items-center justify-content-end gap-2">
					<Button variant="light" onClick={() => addCondition(condition.id)}>
						<FontAwesomeIcon icon={faPlus} />
					</Button>
					<Button
						variant="light"
						onClick={() => {
							setConditionEdit(condition);
						}}
					>
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
				{condition.c &&
					condition.c.map((innerCondition) => (
						<div className="mb-3">
							<Condition
								key={innerCondition.id}
								condition={innerCondition}
								conditionsList={conditionsList}
								deleteCondition={deleteCondition}
								upCondition={upCondition}
								addCondition={addCondition}
								downCondition={downCondition}
								setConditionEdit={setConditionEdit}
								swapConditionParam={swapConditionParam}
								moodleGroups={moodleGroups}
								moodleGroupings={moodleGroupings}
								conditionsGroupOperatorList={conditionsGroupOperatorList}
							/>
						</div>
					))}
			</Row>
		</Container>
	);
};

export default ConditionsGroupComponent;
