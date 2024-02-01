import { ILTISettings } from "@components/interfaces/ILTISettings";
import { fetchBackEnd, getLocalToken } from "middleware/common";

export default async function setConf(
	adminPassword: string,
	LTISettings: ILTISettings
) {
	return fetchBackEnd(getLocalToken(), "api/lti/auth", "POST", {
		password: adminPassword,
		settings: LTISettings,
	});
}
