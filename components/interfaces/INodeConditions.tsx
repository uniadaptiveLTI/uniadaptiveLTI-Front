import {
	IMoodleBadgeConditionsGroup,
	IMoodleConditionsGroup,
	MoodleElementConditions,
} from "./INodeConditionsMoodle";
import { SakaiElementConditions } from "./INodeConditionsSakai";

export type AllValidRootElementNodeConditions =
	| IMoodleConditionsGroup
	| SakaiElementConditions;

export type AllValidRootActionNodeConditions = IMoodleBadgeConditionsGroup;

export type AllElementNodeConditions =
	| MoodleElementConditions
	| SakaiElementConditions;
