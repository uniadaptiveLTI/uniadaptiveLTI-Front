import { base64Decode } from "@utils/Utils";

describe("base64Decode", () => {
	test("should return an empty string for an empty string input", () => {
		const base64 = "";
		expect(base64Decode(base64)).toBe("");
	});

	test("should return the decoded version of a given base64 string input", () => {
		const base64 = "SGVsbG8gd29ybGQh";
		expect(base64Decode(base64)).toBe("Hello world!");
	});
});
