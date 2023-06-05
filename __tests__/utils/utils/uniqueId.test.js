// Import the function to be tested
import { uniqueId } from "@utils/Utils";

// Write a test suite for the uniqueId function
describe("uniqueId", () => {
	// Write a test case for generating 100 unique identifiers
	test("should generate 100 unique identifiers", () => {
		// Create an array to store the identifiers
		const ids = [];

		// Use a for loop to generate 100 identifiers and push them to the array
		for (let i = 0; i < 100; i++) {
			const id = uniqueId();
			ids.push(id);
		}

		// Expect that the identifiers are strings
		ids.forEach((id) => {
			expect(typeof id).toBe("string");
		});

		// Expect that there are no duplicate identifiers in the array
		expect(ids.every((id, index) => ids.indexOf(id) === index)).toBe(true);
	});
});
