import { arrayMoveById } from "@utils/Utils";

describe("arrayMoveById", () => {
	test("should return a new array with the element moved from the specified ID to after the specified ID", () => {
		const from = 1;
		const to = 2;
		const array = [
			{ id: 1, name: "Alice" },
			{ id: 2, name: "Bob" },
			{ id: 3, name: "Charlie" },
			{ id: 4, name: "David" },
		];
		expect(arrayMoveById(from, to, array)).toEqual([
			{ id: 2, name: "Bob" },
			{ id: 1, name: "Alice" },
			{ id: 3, name: "Charlie" },
			{ id: 4, name: "David" },
		]);
	});
});
