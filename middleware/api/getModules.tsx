import {
	ICommonInvalidResponse,
	ICommonValidResponse,
	fetchBackEnd,
	getLocalToken,
} from "middleware/common";

interface GetModulesResponse extends ICommonValidResponse {
	data: Array<Object>;
}

export default async function getModules(lessonId: number) {
	return fetchBackEnd(getLocalToken(), "api/lti/get_modules", "POST", {
		lessonId: lessonId,
	}) as Promise<GetModulesResponse> | Promise<ICommonInvalidResponse>;
}
