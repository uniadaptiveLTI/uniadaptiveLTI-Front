import { IMap } from "@components/interfaces/IMap";
import { IMetaData } from "@components/interfaces/IMetaData";
import {
	ICommonInvalidResponse,
	ICommonValidResponse,
	fetchBackEnd,
	getLocalToken,
} from "middleware/common";

interface GetSessionResponse extends ICommonValidResponse {
	data: [IUserData, IMetaData, Array<IMap>];
}

/**
 * Gets initial session data.
 */
export default async function getSession(): Promise<
	GetSessionResponse | ICommonInvalidResponse
> {
	return fetchBackEnd(
		getLocalToken(),
		"api/lti/get_session",
		"POST"
	) as Promise<GetSessionResponse | ICommonInvalidResponse>;
}
