import { findCompletionAndGrade } from "@utils/Utils";

describe("findCompletionAndGrade", () => {
	test("should return an array containing any found completion and grade conditions in the given object", () => {
		const obj = {
			type: "conditionsGroup",
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
		expect(findCompletionAndGrade(obj)).toEqual([
			{
				type: "grade",
				c: [
					{
						type: "time",
					},
				],
			},
		]);
	});
});
