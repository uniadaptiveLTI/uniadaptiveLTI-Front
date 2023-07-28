// Import the function to be tested
import { inArrayById } from "@utils/Utils";

// Write a test suite for the inArrayById function
describe("inArrayById", () => {
	// Write a test case for checking if an object is in an array by its id property
	test("should check if an object is in an array by its id property", () => {
		// Create a sample object with an id property
		const obj = { id: "1" };

		// Create a sample array of objects with id properties
		const arr = [{ id: "1" }, { id: "2" }, { id: "3" }];

		// Call the function with the object and the array
		const result = inArrayById(obj, arr);

		// Expect that the result is true
		expect(result).toBe(true);
	});

	// Write a test case for checking if an object is not in an array by its id property
	test("should check if an object is not in an array by its id property", () => {
		// Create a sample object with an id property
		const obj = { id: "4" };

		// Create a sample array of objects with id properties
		const arr = [{ id: "1" }, { id: "2" }, { id: "3" }];

		// Call the function with the object and the array
		const result = inArrayById(obj, arr);

		// Expect that the result is false
		expect(result).toBe(false);
	});
});
