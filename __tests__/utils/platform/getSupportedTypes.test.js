import { getSupportedTypes } from "@utils/Platform";
import { NodeTypes } from "@utils/TypeDefinitions";

describe("getSupportedTypes", () => {
	it("should return an array of supported types for a given platform", () => {
		const platform = "moodle";
		const expected = NodeTypes.filter((node) =>
			node.lms.includes(platform)
		).map((node) => node.type);
		const result = getSupportedTypes(platform);
		expect(result).toEqual(expected);
	});

	it("should return an empty array for an unsupported platform", () => {
		const platform = "unsupportedPlatform";
		const result = getSupportedTypes(platform);
		expect(result).toEqual([]);
	});
});
