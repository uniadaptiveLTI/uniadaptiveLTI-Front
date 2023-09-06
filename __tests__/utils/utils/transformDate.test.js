import { transformDate } from "@utils/Utils";

describe("transformDate", () => {
	test("should return the date formatted as 'day of monthName of year'", () => {
		const dateStr = "2021-08-10";
		expect(transformDate(dateStr)).toBe("10 de agosto de 2021");
	});
});
