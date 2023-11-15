import { parseMoodleBadgeParams } from "@utils/Moodle";

describe("parseMoodleBadgeParams", () => {
	it("should return the correct LTI badge conditions", () => {
		const conditions = [
			{
				criteriatype: "type1",
				method: 1,
				params: [
					{ name: "module1", value: "value1" },
					{ name: "bydate_value1", value: 1234567890 },
				],
			},
			{
				criteriatype: "type2",
				method: 2,
				params: [
					{ name: "name1", value: "value1" },
					{ name: "name2", value: "value2" },
				],
			},
		];

		const result = parseMoodleBadgeParams(conditions);
		expect(result).toEqual(undefined);
	});
});
