import { base64Encode } from "@utils/Utils";

describe("base64Encode", () => {
	test("should return an empty string for an empty string input", () => {
		const string = "";
		expect(base64Encode(string)).toBe("");
	});

	test("should return the base64 encoded version of a given string input", () => {
		const string = "Hello world!";
		expect(base64Encode(string)).toBe("SGVsbG8gd29ybGQh");
	});
});
