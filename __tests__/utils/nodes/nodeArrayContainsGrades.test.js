// nodeArrayContainsGrades.test.js
import { nodeArrayContainsGrades } from "@utils/Nodes";

describe("nodeArrayContainsGrades", () => {
	it("should check if any node in the array contains a grade present in the metaData", () => {
		const nodeArray = [
			{ data: { lmsResource: "grade1" } },
			{ data: { lmsResource: "grade2" } },
		];
		const metaData = { grades: ["grade1", "grade2"] };

		const result = nodeArrayContainsGrades(nodeArray, metaData);
		expect(result).toBe(true);
	});
});
