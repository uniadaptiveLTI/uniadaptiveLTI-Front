// Import the function to test
import { orderByLabelAlphabetically } from "@utils/Nodes";

// Write a test suite for the orderByLabelAlphabetically function
describe("orderByLabelAlphabetically", () => {
	// Write a test case for sorting an array of nodes by their data.label property alphabetically
	test("should sort an array of nodes by their data.label property alphabetically", () => {
		// Create a sample array of nodes with data.label properties
		const array = [
			{ id: "1", data: { label: "Charlie" } },
			{ id: "2", data: { label: "Alice" } },
			{ id: "3", data: { label: "Bob" } },
		];

		// Call the function with the array
		const result = orderByLabelAlphabetically(array);

		// Expect that the result is an array sorted by the data.label property
		expect(result).toEqual([
			{ id: "2", data: { label: "Alice" } },
			{ id: "3", data: { label: "Bob" } },
			{ id: "1", data: { label: "Charlie" } },
		]);
	});
});
