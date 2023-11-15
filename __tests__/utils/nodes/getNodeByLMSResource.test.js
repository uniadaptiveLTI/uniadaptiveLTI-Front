import { getNodeByLMSResource } from "@utils/Nodes";

describe("getNodeByLMSResource", () => {
	it("should return the correct node", () => {
		const lmsResource = "lmsResource1";
		const nodeArray = [
			{ data: { lmsResource: "lmsResource1" } },
			{ data: { lmsResource: "lmsResource2" } },
		];

		const result = getNodeByLMSResource(lmsResource, nodeArray);
		expect(result).toEqual({ data: { lmsResource: "lmsResource1" } });
	});
});
