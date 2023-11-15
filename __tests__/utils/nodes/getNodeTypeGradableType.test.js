import { getNodeTypeGradableType } from "@utils/Nodes";

describe("getNodeTypeGradableType", () => {
	it("should get the gradable type of a node for a given platform", () => {
		const node = { type: "nodeType1" };
		const platform = "platform1";

		const result = getNodeTypeGradableType(node, platform);
		expect(result).toBe("");
	});
});
