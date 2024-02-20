import { IVersionSkeleton } from "@components/interfaces/IVersion";
import {
	ICommonInvalidResponse,
	ICommonValidResponse,
	fetchBackEnd,
	getLocalToken,
} from "middleware/common";

interface GetVersionsResponse extends ICommonValidResponse {
	data: Array<IVersionSkeleton>;
}

export default async function getVersions(mapCreatedId: number) {
	return fetchBackEnd(getLocalToken(), "api/lti/get_versions", "POST", {
		map_id: mapCreatedId,
	}) as Promise<GetVersionsResponse> | Promise<ICommonInvalidResponse>;
}
