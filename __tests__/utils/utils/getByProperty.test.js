// Import the function to be tested
import { getByProperty } from "@utils/Utils";

// Describe the test suite
describe("getByProperty", () => {
	// Test case 1: property and value are valid and array is not empty
	test("should return an array of items with the given property and value when property and value are valid and array is not empty", () => {
		// Define the input and expected output
		const property = "type";
		const value = "fruit";
		const array = [
			{ id: "a1", type: "fruit", name: "apple" },
			{ id: "b1", type: "vegetable", name: "broccoli" },
			{ id: "o1", type: "fruit", name: "orange" },
			{ id: "c1", type: "vegetable", name: "carrot" },
		];
		const expectedOutput = [
			{ id: "a1", type: "fruit", name: "apple" },
			{ id: "o1", type: "fruit", name: "orange" },
		];

		// Call the function with the input and check the output
		const actualOutput = getByProperty(property, value, array);
		expect(actualOutput).toEqual(expectedOutput);
	});

	// Test case 2: property and value are valid and array is empty
	test("should return an empty array when property and value are valid and array is empty", () => {
		// Define the input and expected output
		const property = "type";
		const value = "fruit";
		const array = [];
		const expectedOutput = [];

		// Call the function with the input and check the output
		const actualOutput = getByProperty(property, value, array);
		expect(actualOutput).toEqual(expectedOutput);
	});

	// Test case 3: property or value are invalid or array is not an array
	test("should return undefined when property or value are invalid or array is not an array", () => {
		// Define some invalid inputs
		const invalidProperty = undefined;
		const invalidValue = undefined;
		const invalidArray = null;

		// Call the function with the invalid inputs and check the output
		expect(
			getByProperty(invalidProperty, invalidValue, invalidArray)
		).toBeUndefined();
	});
});
