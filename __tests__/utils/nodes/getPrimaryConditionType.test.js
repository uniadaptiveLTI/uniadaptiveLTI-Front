import { getPrimaryConditionType } from "@utils/Nodes";

describe("getPrimaryConditionType", () => {
	it("should return the primary condition type of a node", () => {
		const node = {
			data: {
				c: [
					{ type: "completion" },
					{ type: "grade" },
					{
						type: "conditionsGroup",
						c: [{ type: "completion" }, { type: "grade" }],
					},
				],
			},
		};

		const result = getPrimaryConditionType(node);
		expect(result).toBe(undefined);
	});
});
