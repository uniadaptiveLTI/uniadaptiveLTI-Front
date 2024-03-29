import DateComponent from "@components/flow/conditions/sakai/condition-components/DateComponent";
import DateExceptionComponent from "@components/flow/conditions/sakai/condition-components/DateExceptionComponent";
import GroupComponent from "@components/flow/conditions/sakai/condition-components/GroupComponent";
import { parseDate } from "@utils/Utils";

function Requisite({ requisites, hasRequisiteType, sakaiGroups, sakaiUsers }) {
	return (
		<>
			{hasRequisiteType("date") && (
				<DateComponent
					requisites={requisites}
					parseDate={parseDate}
				></DateComponent>
			)}
			{hasRequisiteType("dateException") && (
				<DateExceptionComponent
					requisites={requisites}
					sakaiGroups={sakaiGroups}
					sakaiUsers={sakaiUsers}
					parseDate={parseDate}
				></DateExceptionComponent>
			)}
			{hasRequisiteType("group") && (
				<GroupComponent
					requisites={requisites}
					sakaiGroups={sakaiGroups}
				></GroupComponent>
			)}
		</>
	);
}

export default Requisite;
