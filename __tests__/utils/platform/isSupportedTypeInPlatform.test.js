import { isSupportedTypeInPlatform } from "@utils/Platform";

describe("isSupportedTypeInPlatform", () => {
	test("returns true if type is supported in platform", () => {
		expect(isSupportedTypeInPlatform("moodle", "assign")).toBe(true);
	});

	test("returns false if type is not supported in platform", () => {
		expect(isSupportedTypeInPlatform("moodle", "wiki")).toBe(false);
	});

	test("returns true if type is supported in platform and excludeLTI is true", () => {
		expect(isSupportedTypeInPlatform("moodle", "assign", true)).toBe(true);
	});

	test("returns false if type is not supported in platform and excludeLTI is true", () => {
		expect(isSupportedTypeInPlatform("moodle", "fragment", true)).toBe(false);
	});
});
