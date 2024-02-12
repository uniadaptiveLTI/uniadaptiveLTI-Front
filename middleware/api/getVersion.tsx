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

export default async function getVersion(versionId: number) {
	return fetchBackEnd(getLocalToken(), "api/lti/get_version", "POST", {
		version_id: versionId,
	}) as Promise<GetVersionResponse> | Promise<ICommonInvalidResponse>;
}
