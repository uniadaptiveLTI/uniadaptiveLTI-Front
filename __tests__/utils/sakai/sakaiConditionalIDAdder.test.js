import { sakaiConditionalIDAdder } from "@utils/Sakai";

describe("sakaiConditionalIDAdder", () => {
	it("should return the correct updated array of sub-conditions", () => {
		const subConditions = [
			{ type: "completion", itemId: "id1" },
			{ type: "grade", itemId: "id2" },
		];
		const nodes = [
			{ id: "node1", data: { sakaiImportId: "id1" } },
			{ id: "node2", data: { sakaiImportId: "id2" } },
		];
		const parentNodes = [];

		const result = sakaiConditionalIDAdder(subConditions, nodes, parentNodes);
		expect(result).toEqual([
			{ id: expect.any(String), type: "completion" },
			{ id: expect.any(String), type: "grade" },
		]);
		expect(parentNodes).toEqual([]);
	});
});
