import { ILTISettings } from "@components/interfaces/ILTISettings";
import {
	ICommonInvalidResponse,
	ICommonValidResponse,
	fetchBackEnd,
	getLocalToken,
} from "middleware/common";

interface GetConfResponse extends ICommonValidResponse {
	data: ILTISettings;
}

export default async function getConf() {
	return fetchBackEnd(getLocalToken(), "api/lti/get_conf", "POST") as
		| Promise<GetConfResponse>
		| Promise<ICommonInvalidResponse>;
}
