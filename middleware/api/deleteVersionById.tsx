import { IVersion } from "@components/interfaces/IVersion";
import { fetchBackEnd, getLocalToken } from "middleware/common";

/**
 * Deletes a version by the created_id (front's id)
 * @param id The ID of the version.
 */
export default async function deleteVersionById(id: IVersion["id"]) {
	return fetchBackEnd(getLocalToken(), "api/lti/delete_version_by_id", "POST", {
		id: id,
	});
}
