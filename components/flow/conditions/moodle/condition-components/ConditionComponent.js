import React from "react";
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
import { useReactFlow } from "reactflow";
import ShowConditionColumn from "./sub-components/ShowConditionColumn";
import ConditionBody from "./sub-components/ConditionBody";
import ConditionUtilsColumn from "./sub-components/ConditionUtilsColumn";
import Condition from "../Condition";

const ConditionComponent = ({
	condition,
	conditionsList,
	setConditionEdit,
	upCondition,
	downCondition,
	deleteCondition,
	addCondition,
	swapConditionParam,
	completionQueryList,
	moodleGroups,
	moodleGroupings,
	profileQueryList,
	profileOperatorList,
	conditionsGroupOperatorList,
}) => {
	return (
		<Container
			className="mb-3 mt-3"
			style={{
				padding: "10px",
				border:
					condition.type == "generic"
						? "2px solid #CDCD00"
						: "1px solid #C7C7C7",
			}}
		>
			<Row className="align-items-center">
				<ShowConditionColumn
					conditionsList={conditionsList}
					condition={condition}
					swapConditionParam={swapConditionParam}
				></ShowConditionColumn>
				<ConditionBody
					condition={condition}
					completionQueryList={completionQueryList}
					moodleGroups={moodleGroups}
					moodleGroupings={moodleGroupings}
					profileQueryList={profileQueryList}
					profileOperatorList={profileOperatorList}
					conditionsGroupOperatorList={conditionsGroupOperatorList}
				></ConditionBody>
				<ConditionUtilsColumn
					condition={condition}
					conditionsList={conditionsList}
					setConditionEdit={setConditionEdit}
					upCondition={upCondition}
					downCondition={downCondition}
					deleteCondition={deleteCondition}
					addCondition={addCondition}
				></ConditionUtilsColumn>
				{condition.type == "conditionsGroup" &&
					condition.c &&
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

export default ConditionComponent;
