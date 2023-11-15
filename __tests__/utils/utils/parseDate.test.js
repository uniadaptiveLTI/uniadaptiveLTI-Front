import { parseDate } from "@utils/Utils";

describe("parseDate", () => {
	test("'2021-08-10' should return the date formatted as 'year-month-day", () => {
		const dateStr = "2021-08-10";
		expect(parseDate(dateStr)).toBe("2021-08-10");
	});

	test("1628546400 should return the date formatted as 'year-month-day", () => {
		expect(parseDate(1628546400)).toBe("2021-08-10");
	});
});
