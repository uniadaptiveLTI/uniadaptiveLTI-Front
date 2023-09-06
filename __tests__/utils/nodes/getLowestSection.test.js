import { getLowestSection } from "@utils/Nodes";

describe("getLowestSection", () => {
	test("should return Infinity for an empty array", () => {
		const nodeArray = [];
		expect(getLowestSection(nodeArray)).toBe(Infinity);
	});

	test("should return Infinity for an array of nodes without sections", () => {
		const nodeArray = [{ data: {} }, { data: {} }, { data: {} }];
		expect(getLowestSection(nodeArray)).toBe(Infinity);
	});

	test("should return the lowest section number for an array of nodes with sections", () => {
		const nodeArray = [
			{ data: { section: 1 } },
			{ data: { section: 3 } },
			{ data: { section: 2 } },
			{ data: {} },
		];
		expect(getLowestSection(nodeArray)).toBe(1);
	});
});
