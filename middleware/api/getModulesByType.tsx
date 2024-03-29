import { fetchBackEnd, getLocalToken } from "middleware/common";

interface Payload {
	type: string;
	supportedTypes?: Array<string>;
}

export default async function getModulesByType(payload: Payload) {
	return fetchBackEnd(
		getLocalToken(),
		"api/lti/get_modules_by_type",
		"POST",
		payload
	);
}
