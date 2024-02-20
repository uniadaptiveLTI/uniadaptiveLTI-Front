export interface IBasicMoodleElementConditionStructure {
	id: string;
	type: string;
	showc: boolean;
}

export interface IBasicMoodleActionConditionStructure {
	params: any;
	id: string;
	type: string;
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

export interface IMoodleElementConditionsGroup {
	id: string;
	type: "conditionsGroup";
	op: "&" | "|" | "!&" | "!|";
	c: Array<MoodleElementConditions>;
	showc: boolean | Array<boolean>;
	show?: boolean; //Only used in export
}

export interface IMoodleBadgeConditionsGroup
	extends IBasicMoodleActionConditionStructure {
	type: "conditionsGroup";
	method: "&" | "|";
	params: Array<IBasicMoodleActionConditionStructure>; //FIXME: Set AllBadgeNodeConditions
}

// Element conditions

export interface IMoodleGradeCondition
	extends IBasicMoodleElementConditionStructure {
	type: "grade";
	min?: number;
	max?: number;
}

export interface IMoodleCompletionCondition
	extends IBasicMoodleElementConditionStructure {
	type: "completion";
	cm: string;
	showc: boolean;
	e: number;
}

//TODO: Add remaining

// Badge conditions

export interface IMoodleBadgeCompletionCondition
	extends IBasicMoodleActionConditionStructure {
	type: "completion";
	op: "|" | "&";
}

//TODO: Add remaining
