import { IVersionSkeleton } from "./IVersion";

export interface IMap {
	id: string;
	name: string;
	versions: Array<IVersionSkeleton>;
}
