// Import the function to be tested
import { getUpdatedArrayById } from "@utils/Utils";

// Describe the test suite
describe("getUpdatedArrayById", () => {
	// Test case 1: updatedEntry is an array
	test("should return an array with updated entries when updatedEntry is an array", () => {
		// Define the input and expected output
		const updatedEntry = [
			{ id: 1, name: "Alice" },
			{ id: 3, name: "Charlie" },
		];
		const originalArray = [
			{ id: 1, name: "Bob" },
			{ id: 2, name: "Eve" },
			{ id: 3, name: "David" },
		];
		const expectedOutput = [
			{ id: 1, name: "Alice" },
			{ id: 2, name: "Eve" },
			{ id: 3, name: "Charlie" },
		];

		// Call the function with the input and check the output
		const actualOutput = getUpdatedArrayById(updatedEntry, originalArray);
		expect(actualOutput).toEqual(expectedOutput);
	});

	// Test case 2: updatedEntry is an object
	test("should return an array with updated entry when updatedEntry is an object", () => {
		// Define the input and expected output
		const updatedEntry = { id: 2, name: "Eve" };
		const originalArray = [
			{ id: 1, name: "Bob" },
			{ id: 2, name: "Alice" },
			{ id: 3, name: "David" },
		];
		const expectedOutput = [
			{ id: 1, name: "Bob" },
			{ id: 2, name: "Eve" },
			{ id: 3, name: "David" },
		];

		// Call the function with the input and check the output
		const actualOutput = getUpdatedArrayById(updatedEntry, originalArray);
		expect(actualOutput).toEqual(expectedOutput);
	});

	// Test case 3: originalArray is empty
	test("should return an empty array when originalArray is empty", () => {
		// Define the input and expected output
		const updatedEntry = { id: 1, name: "Alice" };
		const originalArray = [];
		const expectedOutput = [];

		// Call the function with the input and check the output
		const actualOutput = getUpdatedArrayById(updatedEntry, originalArray);
		expect(actualOutput).toEqual(expectedOutput);
	});
});
