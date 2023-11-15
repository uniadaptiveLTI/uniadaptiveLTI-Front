import { hasConditionsNeedingQualifications } from "@utils/Moodle";

describe("hasConditionsNeedingQualifications", () => {
	it("should return the correct boolean value", () => {
		const node = {
			data: {
				c: [
					{ type: "completion", e: 2 },
					{ type: "grade", e: 1 },
				],
			},
		};

		const result = hasConditionsNeedingQualifications(node);
		expect(result).toBe(false);
	});
});
