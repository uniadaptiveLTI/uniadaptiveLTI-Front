import { Node } from "reactflow";
import {
	AllValidRootActionNodeConditions,
	AllValidRootElementNodeConditions,
} from "./INodeConditions";

export interface INode extends Node {
	type: string;
	data: INodeData;
}

export interface IElementNode extends INode {
	data: IElementNodeData;
}

export interface IActionNode extends INode {
	data: IActionNodeData;
}

export interface IFragmentNode extends Node {
	type: "fragment";
	data: IFragmentNodeData;
}

export type INodeType = INode | IFragmentNode;

export interface IElementNodeData {
	label: string;
	children: Array<string>;

	section: number;
	order: number;
	indent: number;

	c: AllValidRootElementNodeConditions; // TODO: Do the correct condition type
	g: IGradableDataMoodle | IGradableDataSakai;

	lmsVisibility: "show_unconditionally" | "hidden_until_access";
	lmsResource: string;
}

export interface IActionNodeData {
	label: string;
	lmsResource: string;
	c: AllValidRootActionNodeConditions;
}

export interface IFragmentNodeData {
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
