import { getNumberOfIndependentConditions } from "@utils/Nodes";

describe("getNumberOfIndependentConditions", () => {
	test("should return 0 for a node without conditions", () => {
		const node = { data: {} };
		expect(getNumberOfIndependentConditions(node)).toBe(0);
	});

	test("should return the number of independent conditions in a node with conditions", () => {
		const node = {
			data: {
				c: {
					type: "conditionsGroup",
					c: [
						{ type: "completion" },
						{ type: "qualification" },
						{ type: "age", value: 18 },
						{ type: "gender", value: "female" },
						{
							type: "conditionsGroup",
							c: [
								{ type: "country", value: "US" },
								{ type: "state", value: "CA" },
								{ type: "completion" },
							],
						},
					],
				},
			},
		};
		expect(getNumberOfIndependentConditions(node)).toBeGreaterThan(0);
	});
});
