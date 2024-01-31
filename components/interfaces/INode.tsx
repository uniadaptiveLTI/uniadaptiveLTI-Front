import { Node } from "reactflow";

export interface INode extends Node {
	type: string;
	data: INodeData;
}

interface ElementNodeData {
	label: string;
	children: Array<string>;

	section: number;
	order: number;
	indent: number;

	c: any; // TODO: Do the correct condition type
	g: IGradableData;

	lmsVisibility: "show_unconditionally" | "hidden_until_access";
}

interface ActionNodeData {
	label: string;
}

interface FragmentNodeData {
	label: string;
	expanded: boolean;
	innerNodes: Array<string>;
}

export type INodeData = ElementNodeData | ActionNodeData | FragmentNodeData;

interface IGradableData {
	hasConditions: boolean;
	hasToBeSeen: boolean;
	hasToBeQualified: boolean;
	data: {
		min: number;
		max: number;
		hasToSelect: boolean;
	};
}
