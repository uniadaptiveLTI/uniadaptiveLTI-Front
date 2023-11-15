import { sakaiLMSResourceToId } from "@utils/Sakai";

describe("sakaiLMSResourceToId", () => {
	it("should return the correct node", () => {
		const resourceId = "id1";
		const nodes = [
			{ id: "node1", data: { sakaiImportId: "id1" } },
			{ id: "node2", data: { sakaiImportId: "id2" } },
		];

		const result = sakaiLMSResourceToId(resourceId, nodes);
		expect(result).toEqual({ id: "node1", data: { sakaiImportId: "id1" } });
	});
});
