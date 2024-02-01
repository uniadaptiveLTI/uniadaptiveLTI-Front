import { IMap } from "@components/interfaces/IMap";
import { ICommonResponse, fetchBackEnd } from "middleware/common";

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
 * Stores a singular version
 * @param versionToStore Version to store surrounded by Map Data.
 * @returns {ICommonResponse}
 */
export default async function storeVersion(
	versionToStore: VersionStoreSkeleton
) {
	return fetchBackEnd(
		sessionStorage.getItem("token"),
		"api/lti/store_version",
		"POST",
		{ saveData: versionToStore }
	);
}
