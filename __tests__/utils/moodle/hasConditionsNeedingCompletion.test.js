import { hasConditionsNeedingCompletion } from "@utils/Moodle";

describe("hasConditionsNeedingCompletion", () => {
	it("should return the correct boolean value", () => {
		const node = {
			data: {
				c: [{ type: "completion" }, { type: "grade" }],
			},
		};

		const result = hasConditionsNeedingCompletion(node);
		expect(result).toBe(false);
	});
});
