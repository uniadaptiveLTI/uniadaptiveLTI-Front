import { updateBadgeConditions } from "@utils/Utils";

describe("updateBadgeConditions", () => {
	test("should remove the completion condition if it has only one activity in the list", () => {
		const blockNodeTarget = {
			data: {
				c: {
					c: [
						{
							type: "completion",
							activityList: [
								{
									id: "a1",
								},
							],
						},
					],
				},
			},
		};
		const blockNodeSource = {
			id: "a1",
		};
		updateBadgeConditions(blockNodeTarget, blockNodeSource);
		expect(blockNodeTarget.data.c.c).toEqual([]);
	});

	test("should remove the specific activity from the completion condition if it has more than one activity in the list", () => {
		const blockNodeTarget = {
			data: {
				c: {
					c: [
						{
							type: "completion",
							activityList: [
								{
									id: "a1",
								},
								{
									id: "a2",
								},
							],
						},
					],
				},
			},
		};
		const blockNodeSource = {
			id: "a1",
		};
		updateBadgeConditions(blockNodeTarget, blockNodeSource);
		expect(blockNodeTarget.data.c.c).toEqual([
			{
				type: "completion",
				activityList: [
					{
						id: "a2",
					},
				],
			},
		]);
	});

	test("should do nothing if the completion condition does not exist", () => {
		const blockNodeTarget = {
			data: {
				c: {
					c: [
						{
							type: "grade",
						},
					],
				},
			},
		};
		const blockNodeSource = {
			id: "a1",
		};
		updateBadgeConditions(blockNodeTarget, blockNodeSource);
		expect(blockNodeTarget.data.c.c).toEqual([
			{
				type: "grade",
			},
		]);
	});
});
