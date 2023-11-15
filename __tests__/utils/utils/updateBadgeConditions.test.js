import { updateBadgeConditions } from "@utils/Utils";

describe("updateBadgeConditions", () => {
	it('should remove the source node from the target node conditions if the condition type is "completion" and there is more than one entry', () => {
		const blockNodeTarget = {
			data: {
				c: {
					params: [
						{
							type: "completion",
							params: [{ id: "1" }, { id: "2" }],
						},
					],
				},
			},
		};
		const blockNodeSource = { id: "1" };
		updateBadgeConditions(blockNodeTarget, blockNodeSource);
		expect(blockNodeTarget.data.c.params[0].params).toEqual([{ id: "2" }]);
	});

	it('should remove the "completion" condition type from the target node conditions if there is only one entry', () => {
		const blockNodeTarget = {
			data: {
				c: {
					params: [
						{
							type: "completion",
							params: [{ id: "1" }],
						},
					],
				},
			},
		};
		const blockNodeSource = { id: "1" };
		updateBadgeConditions(blockNodeTarget, blockNodeSource);
		expect(blockNodeTarget.data.c.params).toEqual([]);
	});

	it('should not modify the target node conditions if the condition type is not "completion"', () => {
		const blockNodeTarget = {
			data: {
				c: {
					params: [
						{
							type: "other",
							params: [{ id: "1" }],
						},
					],
				},
			},
		};
		const blockNodeSource = { id: "1" };
		updateBadgeConditions(blockNodeTarget, blockNodeSource);
		expect(blockNodeTarget.data.c.params).toEqual([
			{
				type: "other",
				params: [{ id: "1" }],
			},
		]);
	});
});
