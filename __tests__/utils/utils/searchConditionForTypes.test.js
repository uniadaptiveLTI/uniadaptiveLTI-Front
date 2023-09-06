import { searchConditionForTypes } from "@utils/Utils";

describe("searchConditionForTypes", () => {
	test("should add conditions with types that match the target types to the results array", () => {
		const jsonData = {
			type: "completion",
			c: [
				{
					type: "grade",
					c: [
						{
							type: "time",
						},
					],
				},
				{
					type: "time",
				},
			],
		};
		const targetTypes = ["grade", "time"];
		const results = [];
		searchConditionForTypes(jsonData, targetTypes, results);
		expect(results).toEqual([
			{
				type: "grade",
				c: [
					{
						type: "time",
					},
				],
			},
			{
				type: "time",
			},
			{
				type: "time",
			},
		]);
	});
});
