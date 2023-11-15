import { clampNodesOrderSakai } from "@utils/Sakai";

describe("clampNodesOrderSakai", () => {
	it("should return the correct reordered node array", () => {
		const nodeArray = [
			{ data: { section: 1, indent: 0, order: 1 } },
			{ data: { section: 0, indent: 0, order: 0 } },
			{ data: { section: 1, indent: 0, order: 0 } },
			{ data: { section: 0, indent: 0, order: 1 } },
		];

		const result = clampNodesOrderSakai(nodeArray);
		expect(result).toEqual([
			{ data: { section: 0, indent: 0, order: 0 } },
			{ data: { section: 0, indent: 0, order: 1 } },
			{ data: { section: 1, indent: 0, order: 0 } },
			{ data: { section: 1, indent: 0, order: 1 } },
		]);
	});
});
