import { Node } from "reactflow";

export interface INode extends Node {
	type: string;
	data: INodeData;
}

export interface IFragment extends Node {
	type: "fragment";
	data: FragmentNodeData;
}

export type INodeType = INode | IFragment;

export interface IElementNodeData {
	label: string;
	children: Array<string>;

	section: number;
	order: number;
	indent: number;

	c: any; // TODO: Do the correct condition type
	g: IGradableDataMoodle | IGradableDataSakai;

	lmsVisibility: "show_unconditionally" | "hidden_until_access";
	lmsResource: string;
}

export interface IActionNodeData {
	label: string;
	lmsResource: string;

	c?: any; // TODO: Do the correct condition type
}

interface FragmentNodeData {
	label: string;
	expanded: boolean;
	innerNodes: Array<string>;
}

export type INodeData = IElementNodeData | IActionNodeData;

interface IGradableDataMoodle {
	hasConditions: boolean;
	hasToBeSeen: boolean;
	hasToBeQualified: boolean;
	data: {
		min: number;
		max: number;
		hasToSelect: boolean;
	};
}

interface IGradableDataSakai {
	id: string;
	type:
		| "AND"
		| "OR"
		| "EQUAL_TO"
		| "GREATER_THAN"
		| "SMALLER_THAN"
		| "GREATER_THAN_OR_EQUAL_TO"
		| "SMALLER_THAN_OR_EQUAL_TO"
		| "ROOT"
		| "PARENT"
		| "SCORE";
	itemType?: string;
	operator: string;
	argument: null | string;
	siteId: string;
	toolId: string;
	itemId: string;
	subConditions?: Array<IGradableDataSakai>;
	hasParent?: boolean;
}
