import {
	faCalendar,
	faGraduationCap,
	faPlus,
	faQuestion,
	faUser,
	faUserGroup,
	faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export function getConditionIcon(type, style = {}, desiredSize = 32) {
	switch (type) {
		case "date":
			return <FontAwesomeIcon icon={faCalendar} style={style} />;
		case "courseGrade":
			return <FontAwesomeIcon icon={faGraduationCap} style={style} />;
		case "group":
			return <FontAwesomeIcon icon={faUserGroup} style={style} />;
		case "grouping":
			return <FontAwesomeIcon icon={faUsers} style={style} />;
		case "profile":
			return <FontAwesomeIcon icon={faUser} style={style} />;
		case "multiple":
			return <FontAwesomeIcon icon={faPlus} style={style} />;
		default:
			return <FontAwesomeIcon icon={faQuestion} style={style} />;
	}
}
