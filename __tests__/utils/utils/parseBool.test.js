import { parseBool } from "@utils/Utils";

describe("parseBool", () => {
	test("should return false for an empty string", () => {
		const str = "";
		expect(parseBool(str)).toBe(false);
	});

	test("should return false for a string that is not 'true'", () => {
		const str = "false";
		expect(parseBool(str)).toBe(false);
	});

	test("should return true for a string that is 'true' (case-insensitive)", () => {
		const str = "True";
		expect(parseBool(str)).toBe(true);
	});
});
