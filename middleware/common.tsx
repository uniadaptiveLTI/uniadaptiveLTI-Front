import { getFetchUrl } from "@utils/Utils";

export interface ICommonResponse {
	ok: boolean;
	data?: any;
}

/**
 * Fetches data from the back-end using the specified token, webservice, and method.
 * @async
 * @function
 * @param {string} token - The token to use for authentication.
 * @param {string} webservice - The webservice to fetch data from.
 * @param {string} [method="GET"] - The HTTP method to use for the request.
 * @param {Object} [load] - The payload to send with the request.
 * @returns {Promise<Object>} A Promise that resolves to the fetched data.
 */
export async function fetchBackEnd(
	token,
	webservice,
	method = "GET",
	load = {}
): Promise<ICommonResponse> {
	const FETCH_URL = getFetchUrl(webservice);
	let fetchResponse;

	if (method === "POST") {
		const RESPONSE = await fetch(FETCH_URL, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ ...load, token: token }),
		});
		fetchResponse = await RESPONSE.json();
	} else if (method === "GET") {
		fetchResponse = (
			await fetch(
				FETCH_URL +
					`?${new URLSearchParams({ ...load, token: token }).toString()}`
			)
		).json();
	}

	return fetchResponse;
}

export async function getLocalToken() {
	return sessionStorage.getItem("token");
}
