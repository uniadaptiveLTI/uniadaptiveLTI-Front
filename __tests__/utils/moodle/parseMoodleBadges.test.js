import { parseMoodleBadges } from "@utils/Moodle";

describe("parseMoodleBadges", () => {
	it("should return the correct LTI badge node", () => {
		const badge = {
			name: "name",
			params: [],
			id: "id",
		};
		const newX = 10;
		const newY = 20;

		const result = parseMoodleBadges(badge, newX, newY);
		expect(result).toEqual({
			id: expect.any(String),
			type: "badge",
			position: { x: newX, y: newY },
			data: {
				label: "name",
				c: undefined,
				lmsResource: "id",
			},
		});
	});
});
