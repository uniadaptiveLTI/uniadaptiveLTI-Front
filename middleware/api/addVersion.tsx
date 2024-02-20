import { IMap } from "@components/interfaces/IMap";
import { IVersion } from "@components/interfaces/IVersion";
import {
	ICommonResponse,
	fetchBackEnd,
	getLocalToken,
} from "middleware/common";

/**
 * Stores a singular version (This one uses the internal map ID)
 * @param versionToStore Version to store.
 */
export default async function addVersion(
	mapId: IMap["id"],
	versionToStore: IVersion
): Promise<ICommonResponse> {
	return fetchBackEnd(getLocalToken(), "api/lti/add_version", "POST", {
		map_id: mapId,
		version: versionToStore,
	});
}
