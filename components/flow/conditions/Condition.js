import {
	faEdit,
	faPlus,
	faShuffle,
	faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import DateComponent from "./condition-components/DateComponent";
import QualificationComponent from "./condition-components/QualificationComponent";
import CompletionComponent from "./condition-components/CompletionComponent";
import GroupComponent from "./condition-components/GroupComponent";
import GroupingComponent from "./condition-components/GroupingComponent";
import UserProfileComponent from "./condition-components/UserProfileComponent";
import ConditionsGroupComponent from "./condition-components/ConditionsGroupComponent";
import CourseQualificationForm from "./form-components/CourseQualificationForm";
import CourseQualificationComponent from "./condition-components/CourseQualificationComponent";

function Condition({
	condition,
	conditionsList,
	upCondition,
	downCondition,
	deleteCondition,
	addCondition,
	setConditionEdit,
	swapConditionGroup,
}) {
	const completionQueryList = [
		{ value: "completed", name: "debe estar completa" },
		{ value: "notCompleted", name: "no debe estar completa" },
		{ value: "completedApproved", name: "debe estar completa y aprobada" },
		{ value: "completedSuspended", name: "debe estar completa y suspendida" },
	];

	switch (condition.type) {
		case "date":
			return (
				<DateComponent
					condition={condition}
					setConditionEdit={setConditionEdit}
					deleteCondition={deleteCondition}
				/>
			);
		case "qualification":
			return (
				<QualificationComponent
					condition={condition}
					conditionsList={conditionsList}
					upCondition={upCondition}
					downCondition={downCondition}
					setConditionEdit={setConditionEdit}
					deleteCondition={deleteCondition}
				/>
			);
		case "courseQualification":
			return (
				<CourseQualificationComponent
					condition={condition}
					conditionsList={conditionsList}
					upCondition={upCondition}
					downCondition={downCondition}
					setConditionEdit={setConditionEdit}
					deleteCondition={deleteCondition}
				/>
			);
		case "completion":
			return (
				<CompletionComponent
					condition={condition}
					conditionsList={conditionsList}
					upCondition={upCondition}
					downCondition={downCondition}
					completionQueryList={completionQueryList}
					setConditionEdit={setConditionEdit}
					deleteCondition={deleteCondition}
				/>
			);
		case "group":
			return (
				<GroupComponent
					condition={condition}
					setConditionEdit={setConditionEdit}
					deleteCondition={deleteCondition}
				/>
			);
		case "grouping":
			return (
				<GroupingComponent
					condition={condition}
					setConditionEdit={setConditionEdit}
					deleteCondition={deleteCondition}
				/>
			);
		case "userProfile":
			return (
				<UserProfileComponent
					condition={condition}
					setConditionEdit={setConditionEdit}
					deleteCondition={deleteCondition}
				/>
			);
		case "conditionsGroup":
			return (
				<ConditionsGroupComponent
					condition={condition}
					conditionsList={conditionsList}
					setConditionEdit={setConditionEdit}
					upCondition={upCondition}
					downCondition={downCondition}
					deleteCondition={deleteCondition}
					addCondition={addCondition}
					swapConditionGroup={swapConditionGroup}
				/>
			);
		default:
			return null;
	}
}

export default Condition;
