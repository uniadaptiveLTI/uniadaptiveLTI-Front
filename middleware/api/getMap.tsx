import {
	ICommonInvalidResponse,
	ICommonValidResponse,
	fetchBackEnd,
	getLocalToken,
} from "middleware/common";

interface GetMapResponse extends ICommonValidResponse {
	data: { created_id: number };
}

export default async function getMap(mapId: number) {
	return fetchBackEnd(getLocalToken(), "api/lti/get_map", "POST", {
		map_id: mapId,
	}) as Promise<GetMapResponse> | Promise<ICommonInvalidResponse>;
}
