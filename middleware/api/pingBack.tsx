import {
	ICommonInvalidResponse,
	ICommonValidResponse,
	fetchBackEnd,
	getLocalToken,
} from "middleware/common";

interface PingBackResponse extends ICommonValidResponse {
	data: "pong";
}

export default async function pingBack(): Promise<
	PingBackResponse | ICommonInvalidResponse
> {
	return fetchBackEnd(getLocalToken(), "api/lti/ping", "POST", {
		ping: "ping",
	}) as Promise<PingBackResponse | ICommonInvalidResponse>;
}
