import { createNewSakaiMap } from "@utils/Sakai";

describe("createNewSakaiMap", () => {
	it("should return the correct new Sakai map", () => {
		const nodes = [
			{
				id: "node1",
				position: { x: 10, y: 20 },
				data: { section: 0, indent: 0, order: 0 },
			},
			{
				id: "node2",
				position: { x: 20, y: 30 },
				data: { section: 1, indent: 1, order: 1 },
			},
		];
		const lesson = undefined;
		const metadata = { name: "metadata", lessons: [] };
		const maps = [{}];

		const result = createNewSakaiMap(nodes, lesson, metadata, maps);
		expect(result).toEqual({
			id: expect.any(String),
			name: "Mapa importado desde metadata (1)",
			versions: [
				{
					id: expect.any(String),
					name: "Primera versión",
					lastUpdate: expect.any(String),
					default: "true",
					blocksData: [
						{
							id: "node1",
							position: { x: 10, y: 20 },
							data: { section: 0, indent: 0, order: 0 },
						},
						{
							id: "node2",
							position: { x: 20, y: 30 },
							data: { section: 1, indent: 1, order: 1 },
						},
					],
				},
			],
		});
	});
});
