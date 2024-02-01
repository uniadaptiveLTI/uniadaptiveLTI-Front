import { INode } from "./INode";

export interface IVersionSkeleton {
	id: string;
	name: string;
	lastUpdate: string;
}

export interface IVersion extends IVersionSkeleton {
	default: boolean;
	blocks_data: Array<INode>;
}
