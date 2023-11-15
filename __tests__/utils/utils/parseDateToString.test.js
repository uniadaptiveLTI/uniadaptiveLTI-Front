import { parseDateToString } from "@utils/Utils";

describe("parseDateToString", () => {
	it("should return the correct date string", () => {
		const date = new Date(2023, 10, 14, 8, 25);

		const result = parseDateToString(date);
		expect(result).toBe("2023-11-14T08:25");
	});
});
