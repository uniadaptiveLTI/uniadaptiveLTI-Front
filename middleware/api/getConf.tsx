import { ILTISettings } from "@components/interfaces/ILTISettings";
import {
	ICommonResponse,
	fetchBackEnd,
	getLocalToken,
} from "middleware/common";

interface GetConfResponse extends ICommonResponse {
	data: ILTISettings;
}

export default async function getConf() {
	return fetchBackEnd(
		getLocalToken(),
		"api/lti/get_conf",
		"POST"
	) as Promise<GetConfResponse>;
}
