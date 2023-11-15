import { LMSResourceToId } from "@utils/Utils";

describe("LMSResourceToId", () => {
	it("should return the correct node ID", () => {
		const resourceId = "resource1";
		const nodes = [
			{ id: "node1", data: { lmsResource: "resource1" } },
			{ id: "node2", data: { lmsResource: "resource2" } },
		];

		const result = LMSResourceToId(resourceId, nodes);
		expect(result).toBe("node1");
	});
});
