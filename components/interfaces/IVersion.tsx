import { INode } from "./INode";

export interface IVersionSkeleton {
	id: string;
	name: string;
	lastUpdate: string;
}

export interface IVersion extends IVersionSkeleton {
	blocks_data: Array<INode>;
}
