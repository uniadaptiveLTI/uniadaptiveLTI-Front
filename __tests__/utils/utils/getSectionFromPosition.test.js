import { getSectionFromPosition } from "@utils/Utils";

describe("getSectionFromPosition", () => {
	test("should return the section with a matching position property value from the section array", () => {
		const sectionArray = [
			{ id: 1, position: 0 },
			{ id: 2, position: 1 },
			{ id: 3, position: 2 },
		];
		const sectionPosition = 1;
		expect(getSectionFromPosition(sectionArray, sectionPosition)).toEqual({
			id: 2,
			position: 1,
		});
	});

	test("should return undefined if no section with a matching position property value is found in the section array", () => {
		const sectionArray = [
			{ id: 1, position: 0 },
			{ id: 2, position: 1 },
			{ id: 3, position: 2 },
		];
		const sectionPosition = 3;
		expect(
			getSectionFromPosition(sectionArray, sectionPosition)
		).toBeUndefined();
	});
});
