import { IVersion, IVersionSkeleton } from "./IVersion";

export interface IMap {
	id: number;
	name: string;
	versions: Array<IVersionSkeleton | IVersion>;
}
