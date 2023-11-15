import { reOrderSakaiRequisites } from "@utils/Sakai";

describe("reOrderSakaiRequisites", () => {
	it("should return the correct sorted requisites", () => {
		const requisites = [
			{ type: "dateException" },
			{ type: "date" },
			{ type: "group" },
		];

		const result = reOrderSakaiRequisites(requisites);
		expect(result).toEqual([
			{ type: "date" },
			{ type: "dateException" },
			{ type: "group" },
		]);
	});
});
