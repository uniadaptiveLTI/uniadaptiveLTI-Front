import { parseMoodleCalifications } from "@utils/Moodle";

describe("parseMoodleCalifications", () => {
	it("should return the correct node with parsed gradables", () => {
		const node = {
			type: "type",
			g: {
				hasConditions: true,
				hasToBeSeen: true,
				hasToBeQualified: true,
				data: { min: 0, max: 0, hasToSelect: true },
			},
		};

		const result = parseMoodleCalifications(node);
		expect(result).toEqual({
			type: "type",
			g: {
				hasConditions: true,
				hasToBeSeen: true,
				hasToBeQualified: true,
				data: { min: 0, max: 0, hasToSelect: true },
			},
		});
	});
});
