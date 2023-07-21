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
import ProfileComponent from "./condition-components/ProfileComponent";
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
	swapConditionParam,
	moodleGroups,
	moodleGroupings,
}) {
	const completionQueryList = [
		{ id: 1, name: "debe estar completa" },
		{ id: 0, name: "no debe estar completa" },
		{ id: 2, name: "debe estar completa y aprobada" },
		{ id: 3, name: "debe estar completa y suspendida" },
	];

	switch (condition.type) {
		case "date":
			return (
				<DateComponent
					condition={condition}
					conditionsList={conditionsList}
					setConditionEdit={setConditionEdit}
					upCondition={upCondition}
					downCondition={downCondition}
					deleteCondition={deleteCondition}
					swapConditionParam={swapConditionParam}
				/>
			);
		case "qualification":
			return (
				<QualificationComponent
					condition={condition}
					conditionsList={conditionsList}
					setConditionEdit={setConditionEdit}
					upCondition={upCondition}
					downCondition={downCondition}
					deleteCondition={deleteCondition}
					swapConditionParam={swapConditionParam}
				/>
			);
		case "courseQualification":
			return (
				<CourseQualificationComponent
					condition={condition}
					conditionsList={conditionsList}
					setConditionEdit={setConditionEdit}
					upCondition={upCondition}
					downCondition={downCondition}
					deleteCondition={deleteCondition}
					swapConditionParam={swapConditionParam}
				/>
			);
		case "completion":
			return (
				<CompletionComponent
					condition={condition}
					conditionsList={conditionsList}
					setConditionEdit={setConditionEdit}
					upCondition={upCondition}
					downCondition={downCondition}
					completionQueryList={completionQueryList}
					deleteCondition={deleteCondition}
					swapConditionParam={swapConditionParam}
				/>
			);
		case "group":
			return (
				<GroupComponent
					condition={condition}
					conditionsList={conditionsList}
					setConditionEdit={setConditionEdit}
					upCondition={upCondition}
					downCondition={downCondition}
					deleteCondition={deleteCondition}
					moodleGroups={moodleGroups}
					swapConditionParam={swapConditionParam}
				/>
			);
		case "grouping":
			return (
				<GroupingComponent
					condition={condition}
					conditionsList={conditionsList}
					setConditionEdit={setConditionEdit}
					upCondition={upCondition}
					downCondition={downCondition}
					deleteCondition={deleteCondition}
					moodleGroupings={moodleGroupings}
					swapConditionParam={swapConditionParam}
				/>
			);
		case "profile":
			return (
				<ProfileComponent
					condition={condition}
					conditionsList={conditionsList}
					setConditionEdit={setConditionEdit}
					upCondition={upCondition}
					downCondition={downCondition}
					deleteCondition={deleteCondition}
					swapConditionParam={swapConditionParam}
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
					swapConditionParam={swapConditionParam}
					moodleGroups={moodleGroups}
					moodleGroupings={moodleGroupings}
				/>
			);
		default:
			return null;
	}
}

export default Condition;
