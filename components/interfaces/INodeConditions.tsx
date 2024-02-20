import {
	IMoodleBadgeConditionsGroup,
	IMoodleElementConditionsGroup,
	MoodleElementConditions,
} from "./INodeConditionsMoodle";
import { SakaiElementConditions } from "./INodeConditionsSakai";

export type AllValidRootElementNodeConditions =
	| undefined
	| IMoodleElementConditionsGroup
	| SakaiElementConditions;

export type AllValidRootActionNodeConditions = IMoodleBadgeConditionsGroup;

export type AllElementNodeConditions =
	| MoodleElementConditions
	| SakaiElementConditions;
