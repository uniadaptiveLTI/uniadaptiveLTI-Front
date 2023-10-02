import { getSupportedTypes } from "@utils/Platform";

describe("getSupportedTypes", () => {
	test("returns an array of supported types for a given platform", () => {
		expect(getSupportedTypes("lti")).toEqual(["end", "fragment", "start"]);
	});
});
