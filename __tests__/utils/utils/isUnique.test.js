import { isUnique } from "@utils/Utils";

describe("isUnique", () => {
	test("should return true for a value that is unique in the array", () => {
		const value = "a";
		const array = ["a", "b", "c"];
		expect(isUnique(value, array)).toBe(true);
	});

	test("should return false for a value that is not unique in the array", () => {
		const value = "b";
		const array = ["a", "b", "b"];
		expect(isUnique(value, array)).toBe(false);
	});
});
