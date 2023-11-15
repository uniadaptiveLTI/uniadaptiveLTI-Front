import { parseSakaiNode } from "@utils/Sakai";

describe("parseSakaiNode", () => {
	it("should add the parsed node to the nodes array", () => {
		const nodes = [];
		const node = {
			modname: "validType",
			name: "name",
			section: 0,
			indent: 0,
			order: 0,
			id: "id",
			sakaiId: "sakaiId",
		};
		const newX = 10;
		const newY = 20;
		const validTypes = ["validType"];

		parseSakaiNode(nodes, node, newX, newY, validTypes);
		expect(nodes).toEqual([
			{
				id: expect.any(String),
				type: "validType",
				position: { x: newX, y: newY },
				data: {
					label: "name",
					section: 0,
					indent: 0,
					order: 0,
					sakaiImportId: "id",
					lmsResource: "sakaiId",
					children: [],
					requisites: [],
					gradeRequisites: undefined,
				},
			},
		]);
	});
});
