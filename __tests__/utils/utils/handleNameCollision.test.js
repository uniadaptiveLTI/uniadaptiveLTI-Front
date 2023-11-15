import { handleNameCollision } from "@utils/Utils";

describe("handleNameCollision", () => {
	it("should handle name collisions correctly", () => {
		const name = "test";
		const array = ["test", "test [2]"];

		const result = handleNameCollision(name, array, false, "[");
		expect(result).toBe("test [3]");
	});
});
