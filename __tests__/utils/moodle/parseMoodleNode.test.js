import { parseMoodleNode } from "@utils/Moodle";

describe("parseMoodleNode", () => {
	it("should return the correct LTI node", () => {
		const node = {
			modname: "modname",
			name: "name",
			indent: 1,
			section: 1,
			availability: undefined,
			g: undefined,
			order: 0,
			id: "id",
			visible: "visible",
		};
		const newX = 10;
		const newY = 20;

		const result = parseMoodleNode(node, newX, newY);
		expect(result).toEqual({
			id: expect.any(String),
			type: "modname",
			position: { x: newX, y: newY },
			data: {
				label: "name",
				indent: 1,
				section: 1,
				children: [],
				c: undefined,
				g: undefined,
				order: 0,
				lmsResource: "id",
				lmsVisibility: "visible",
			},
		});
	});
});
