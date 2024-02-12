export interface IBasicMoodleConditionStructure {
	params: any;
	id: string;
	type: string;
	showc: boolean | Array<boolean>;
}

/// Types

export type MoodleAllConditionTypes =
	| MoodleElementConditions
	| MoodleActionConditions;

export type MoodleElementConditions =
	| IMoodleGradeCondition
	| IMoodleCompletionCondition;

export type MoodleActionConditions =
	| IMoodleBadgeCompletionCondition
	| IMoodleBadgeConditionsGroup;

export type IMoodleConditionsGroup =
	| IMoodleElementConditionsGroup
	| IMoodleBadgeConditionsGroup;

// Condition Groups

export interface IMoodleElementConditionsGroup
	extends IBasicMoodleConditionStructure {
	type: "conditionsGroup";
	op: "&" | "|" | "!&" | "!|";
	c: Array<MoodleElementConditions>;
}

export interface IMoodleBadgeConditionsGroup
	extends IBasicMoodleConditionStructure {
	type: "conditionsGroup";
	method: "&" | "|";
	params: Array<IBasicMoodleConditionStructure>; //FIXME: Set AllBadgeNodeConditions
}

// Element conditions

export interface IMoodleGradeCondition extends IBasicMoodleConditionStructure {
	type: "grade";
	min?: number;
	max?: number;
}

export interface IMoodleCompletionCondition
	extends IBasicMoodleConditionStructure {
	type: "completion";
	cm: string;
	showc: boolean;
	e: number;
}

//TODO: Add remaining

// Badge conditions

export interface IBasicMoodleBadgeConditionStructure {
	//TEMP
	id: string;
	type: string;
	params: Object; //FIXME: Define params
}

export interface IMoodleBadgeCompletionCondition
	extends IBasicMoodleConditionStructure {
	type: "completion";
	op: "|" | "&";
}

//TODO: Add remaining
