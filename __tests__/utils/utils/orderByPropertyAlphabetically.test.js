// Import the function to test
import { orderByPropertyAlphabetically } from "@utils/Utils";

// Write a test suite for the orderByPropertyAlphabetically function
describe("orderByPropertyAlphabetically", () => {
	// Write a test case for sorting an array of objects by a property alphabetically
	test("should sort an array of objects by a property alphabetically", () => {
		// Create a sample array of objects with a name property
		const array = [{ name: "Charlie" }, { name: "Alice" }, { name: "Bob" }];

		// Call the function with the array and the name property
		const result = orderByPropertyAlphabetically(array, "name");

		// Expect that the result is an array sorted by the name property
		expect(result).toEqual([
			{ name: "Alice" },
			{ name: "Bob" },
			{ name: "Charlie" },
		]);
	});

	// Write a test case for sorting an array of objects by a subproperty alphabetically
	test("should sort an array of objects by a subproperty alphabetically", () => {
		// Create a sample array of objects with a person property that has a name subproperty
		const array = [
			{ person: { name: "Charlie" } },
			{ person: { name: "Alice" } },
			{ person: { name: "Bob" } },
		];

		// Call the function with the array, the person property, and the name subproperty
		const result = orderByPropertyAlphabetically(array, "person", "name");

		// Expect that the result is an array sorted by the name subproperty
		expect(result).toEqual([
			{ person: { name: "Alice" } },
			{ person: { name: "Bob" } },
			{ person: { name: "Charlie" } },
		]);
	});
});
