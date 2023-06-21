// Import the function to test
import { deduplicateById } from "@utils/Utils";

// Write a test suite for the deduplicateById function
describe("deduplicateById", () => {
	// Write a test case for removing duplicate objects from an array by their id property
	test("should remove duplicate objects from an array by their id property", () => {
		// Create a sample array of objects with id properties that has some duplicates
		const arr = [
			{ id: "1" },
			{ id: "2" },
			{ id: "3" },
			{ id: "1" },
			{ id: "2" },
		];

		// Call the function with the array
		const result = deduplicateById(arr);

		// Expect that the result is an array without duplicate objects
		expect(result).toEqual([{ id: "1" }, { id: "2" }, { id: "3" }]);
	});

	// Write a test case for handling an empty array
	test("should return an empty array if the input is empty", () => {
		// Call the function with an empty array
		const result = deduplicateById([]);

		// Expect that the result is an empty array
		expect(result).toEqual([]);
	});
});
