import { sakaiTypeSwitch } from "@utils/Sakai";

describe("sakaiTypeSwitch", () => {
	it("should return the correct object with new type and content reference", () => {
		const node = { type: "resource", id: "id" };

		const result = sakaiTypeSwitch(node);
		expect(result).toEqual({ type: 1, contentRef: "id" });
	});
});
