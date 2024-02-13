import { IVersion } from "@components/interfaces/IVersion";
import {
	ICommonInvalidResponse,
	ICommonValidResponse,
	fetchBackEnd,
	getLocalToken,
} from "middleware/common";

interface GetVersionResponse extends ICommonValidResponse {
	data: IVersion;
}

interface Payload {
	version_id?: number;
	created_id?: number;
}

/**
 *
 * @param version_id DB's id
 * @param created_id Front end id (Defaults to this one)
 * @returns
 */
export default async function getVersion({ version_id, created_id }: Payload) {
	if (created_id != undefined) {
		return fetchBackEnd(getLocalToken(), "api/lti/get_version", "POST", {
			created_id: created_id,
		}) as Promise<GetVersionResponse> | Promise<ICommonInvalidResponse>;
	}
	return fetchBackEnd(getLocalToken(), "api/lti/get_version", "POST", {
		version_id: version_id,
	}) as Promise<GetVersionResponse> | Promise<ICommonInvalidResponse>;
}
