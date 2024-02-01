import { ICommonResponse, fetchBackEnd } from "middleware/common";

interface PingBackResponse extends ICommonResponse {
	data: "pong";
}

export default async function pingBack(): Promise<PingBackResponse> {
	return fetchBackEnd(sessionStorage.getItem("token"), "api/lti/ping", "POST", {
		ping: "ping",
	}) as Promise<PingBackResponse>;
}
