import { getSectionNodes } from "@utils/Nodes";

describe("getSectionNodes", () => {
	test("should return an empty array for an empty array", () => {
		const nodeArray = [];
		expect(getSectionNodes(0, nodeArray)).toEqual([]);
	});

	test("should return an empty array for an array of nodes without sections", () => {
		const nodeArray = [{ data: {} }, { data: {} }, { data: {} }];
		expect(getSectionNodes(0, nodeArray)).toEqual([]);
	});

	test("should return the nodes that belong to a given section for an array of nodes with sections", () => {
		const nodeArray = [
			{ data: { section: 1 } },
			{ data: { section: 3 } },
			{ data: { section: 2 } },
			{ data: {} },
		];
		expect(getSectionNodes(2, nodeArray)).toEqual([{ data: { section: 2 } }]);
	});
});
