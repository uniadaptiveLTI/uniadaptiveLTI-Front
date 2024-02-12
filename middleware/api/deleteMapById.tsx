import { IMap } from "@components/interfaces/IMap";
import { fetchBackEnd, getLocalToken } from "middleware/common";

/**
 * Deletes a map by the created_id (front's id)
 * @param id The ID of the map.
 */
export default async function deleteMapById(id: IMap["id"]) {
	return fetchBackEnd(getLocalToken(), "api/lti/delete_map_by_id", "POST", {
		id: id,
	});
}
