import { ILTISettings } from "@components/interfaces/ILTISettings";
import { fetchBackEnd, getLocalToken } from "middleware/common";

export default async function setConf(
	adminPassword: string,
	LTISettings: ILTISettings
) {
	return fetchBackEnd(getLocalToken(), "api/lti/set_conf", "POST", {
		password: adminPassword,
		settings: LTISettings,
	});
}
