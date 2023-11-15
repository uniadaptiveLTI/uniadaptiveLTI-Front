import { getFetchUrl } from "@utils/Utils";

describe("getFetchUrl", () => {
	it("should return the correct URL", () => {
		const LTISettings = { back_url: "www.example.com" };
		const webservice = "service";

		const result = getFetchUrl(LTISettings, webservice);
		expect(result).toBe("http://www.example.com/service");
	});
});
