import { IMap } from "@components/interfaces/IMap";
import {
	ICommonResponse,
	fetchBackEnd,
	getLocalToken,
} from "middleware/common";

export interface VersionStoreSkeleton {
	instance_id: any;
	course_id: any;
	platform: any;
	user_id: any;
	map: {
		id: any;
		name: any;
		versions: any[];
	};
	lesson_id?: any;
}

/**
 * Stores a singular version (Using the DB id)
 * @param versionToStore Version to store surrounded by Map Data.
 */
export default async function storeVersion(
	versionToStore: VersionStoreSkeleton
): Promise<ICommonResponse> {
	return fetchBackEnd(getLocalToken(), "api/lti/store_version", "POST", {
		saveData: versionToStore,
	});
}
