import { getLastPositionInSection } from "@utils/Nodes";

describe("getLastPositionInSection", () => {
	test("should return -1 for an empty array", () => {
		const nodeArray = [];
		expect(getLastPositionInSection(0, nodeArray)).toBe(-1);
	});

	test("should return -1 for an array of nodes without sections", () => {
		const nodeArray = [{ data: {} }, { data: {} }, { data: {} }];
		expect(getLastPositionInSection(0, nodeArray)).toBe(-1);
	});

	test("should return the last position in a section for an array of nodes with sections", () => {
		const nodeArray = [
			{ data: { section: 1, order: 0 } },
			{ data: { section: 3, order: 2 } },
			{ data: { section: 2, order: 1 } },
			{ data: {} },
		];
		expect(getLastPositionInSection(3, nodeArray)).toBe(2);
	});
});
