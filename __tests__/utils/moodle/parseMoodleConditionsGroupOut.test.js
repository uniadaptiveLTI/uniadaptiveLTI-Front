import { parseMoodleConditionsGroupOut } from "@utils/Moodle";

describe("parseMoodleConditionsGroupOut", () => {
	it("should return the correct node conditions", () => {
		const c = {
			type: "conditionsGroup",
			c: [{ type: "type", c: [{ type: "type" }] }],
		};

		const result = parseMoodleConditionsGroupOut(c);
		expect(result).toEqual({
			c: [{ type: "type", c: [{ type: "type" }] }],
		});
	});
});
