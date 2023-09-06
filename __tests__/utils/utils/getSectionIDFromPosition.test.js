import { getSectionIDFromPosition } from "@utils/Utils";

describe("getSectionIDFromPosition", () => {
	test("should return the ID property value of the section with a matching position property value from the section array", () => {
		const sectionArray = [
			{ id: 1, position: 0 },
			{ id: 2, position: 1 },
			{ id: 3, position: 2 },
		];
		const sectionPosition = 1;
		expect(getSectionIDFromPosition(sectionArray, sectionPosition)).toBe(2);
	});

	test("should return undefined if no section with a matching position property value is found in the section array", () => {
		const sectionArray = [
			{ id: 1, position: 0 },
			{ id: 2, position: 1 },
			{ id: 3, position: 2 },
		];
		const sectionPosition = 3;
		expect(
			getSectionIDFromPosition(sectionArray, sectionPosition)
		).toBeUndefined();
	});
});
