import React from "react";
import RoleComponent from "./condition-components/RoleComponent";
import CourseCompletionComponent from "./condition-components/CourseCompletionComponent";
import BadgeListComponent from "./condition-components/BadgeListComponent";
import CompletionComponent from "./condition-components/CompletionComponent";
import SkillsComponent from "./condition-components/SkillsComponent";
import { parseDate } from "@utils/Utils";

function Criteria({
	condition,
	roleList,
	badgeList,
	skillsList,
	deleteCondition,
	addCondition,
	setConditionEdit,
	swapConditionGroup,
}) {
	switch (condition.type) {
		case "role":
			return (
				<RoleComponent
					condition={condition}
					roleList={roleList}
					setConditionEdit={setConditionEdit}
					deleteCondition={deleteCondition}
					swapConditionGroup={swapConditionGroup}
				/>
			);
		case "courseCompletion":
			return (
				<CourseCompletionComponent
					condition={condition}
					setConditionEdit={setConditionEdit}
					deleteCondition={deleteCondition}
					parseDate={parseDate}
				/>
			);
		case "badgeList":
			return (
				<BadgeListComponent
					condition={condition}
					badgeList={badgeList}
					setConditionEdit={setConditionEdit}
					deleteCondition={deleteCondition}
					swapConditionGroup={swapConditionGroup}
				/>
			);
		case "completion":
			return (
				<CompletionComponent
					condition={condition}
					parseDate={parseDate}
					setConditionEdit={setConditionEdit}
					deleteCondition={deleteCondition}
					swapConditionGroup={swapConditionGroup}
				/>
			);
		case "skills":
			return (
				<SkillsComponent
					condition={condition}
					skillsList={skillsList}
					setConditionEdit={setConditionEdit}
					deleteCondition={deleteCondition}
					swapConditionGroup={swapConditionGroup}
				/>
			);
		default:
			return null;
	}
}

export default Criteria;
