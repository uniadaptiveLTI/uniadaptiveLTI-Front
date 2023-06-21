// Import the function to be tested
import { arrayInsideArrayById } from "@utils/Utils";

// Write a test suite for the arrayInsideArrayById function
describe("arrayInsideArrayById", () => {
	// Write a test case for checking if all the objects in an array are in another array by their id property
	test("should check if all the objects in an array are in another array by their id property", () => {
		// Create a sample array of objects with id properties
		const arr1 = [{ id: "1" }, { id: "2" }, { id: "3" }];

		// Create another sample array of objects with id properties that contains all the objects from the first array
		const arr2 = [{ id: "1" }, { id: "2" }, { id: "3" }, { id: "4" }];

		// Call the function with the two arrays
		const result = arrayInsideArrayById(arr1, arr2);

		// Expect that the result is true
		expect(result).toBe(true);
	});

	// Write a test case for checking if not all the objects in an array are in another array by their id property
	test("should check if not all the objects in an array are in another array by their id property", () => {
		// Create a sample array of objects with id properties
		const arr1 = [{ id: "1" }, { id: "2" }, { id: "3" }];

		// Create another sample array of objects with id properties that does not contain all the objects from the first array
		const arr2 = [{ id: "1" }, { id: "4" }, { id: "5" }];

		// Call the function with the two arrays
		const result = arrayInsideArrayById(arr1, arr2);

		// Expect that the result is false
		expect(result).toBe(false);
	});
});
