import { getHTTPPrefix, getFetchUrl, fetchBackEnd } from "@utils/Utils";

describe("getHTTPPrefix", () => {
	test("should return the window location protocol", () => {
		expect(getHTTPPrefix()).toBe(window.location.protocol);
	});
});

describe("getFetchUrl", () => {
	test("should construct a URL with the LTI settings and the webservice", () => {
		const LTISettings = {
			back_url: "example.com",
		};
		const webservice = "test";
		expect(getFetchUrl(LTISettings, webservice)).toBe(
			`${window.location.protocol}//example.com/test`
		);
	});

	test("should construct a URL with only the LTI settings if the webservice is undefined", () => {
		const LTISettings = {
			back_url: "example.com",
		};
		expect(getFetchUrl(LTISettings)).toBe(
			`${window.location.protocol}//example.com`
		);
	});
});

describe("fetchBackEnd", () => {
	// mock the fetch function
	global.fetch = jest.fn(() =>
		Promise.resolve({
			json: () => Promise.resolve({ data: "test" }),
		})
	);

	beforeEach(() => {
		// clear all instances and calls to constructor and all methods:
		fetch.mockClear();
	});

	test("should fetch data from the back-end using POST method and return a promise that resolves to the data", async () => {
		const LTISettings = {
			back_url: "example.com",
		};
		const token = "abc";
		const webservice = "test";
		const method = "POST";
		const load = { foo: "bar" };
		const data = await fetchBackEnd(token, webservice, method, load);
		expect(data).toEqual({ data: "test" });
		expect(fetch).toHaveBeenCalledTimes(1);
		expect(fetch).toHaveBeenCalledWith(
			`${window.location.protocol}//example.com/test`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ ...load, token }),
			}
		);
	});

	test("should fetch data from the back-end using GET method and return a promise that resolves to the data", async () => {
		const LTISettings = {
			back_url: "example.com",
		};
		const token = "abc";
		const webservice = "test";
		const method = "GET";
		const load = { foo: "bar" };
		const data = await fetchBackEnd(token, webservice, method, load);
		expect(data).toEqual({ data: "test" });
		expect(fetch).toHaveBeenCalledTimes(1);
		expect(fetch).toHaveBeenCalledWith(
			`${window.location.protocol}//example.com/test?foo=bar&token=abc`
		);
	});
});
