import { arrayMoveByIndex } from "@utils/Utils";

describe("arrayMoveByIndex", () => {
	test("should return a new array with the element moved from the specified index to the specified index", () => {
		const from = 0;
		const to = 2;
		const array = [1, 2, 3, 4];
		expect(arrayMoveByIndex(from, to, array)).toEqual([2, 3, 1, 4]);
	});
});
