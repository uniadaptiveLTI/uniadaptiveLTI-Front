import { getLastPositionInSakaiColumn } from "@utils/Sakai";

describe("getLastPositionInSakaiColumn", () => {
	it("should return the correct maximum position number", () => {
		const section = 0;
		const column = 1;
		const nodeArray = [
			{ data: { section: 0, indent: 0, order: 0 } },
			{ data: { section: 0, indent: 0, order: 1 } },
			{ data: { section: 1, indent: 0, order: 0 } },
			{ data: { section: 1, indent: 1, order: 1 } },
		];

		const result = getLastPositionInSakaiColumn(section, column, nodeArray);
		expect(result).toBe(1);
	});
});
