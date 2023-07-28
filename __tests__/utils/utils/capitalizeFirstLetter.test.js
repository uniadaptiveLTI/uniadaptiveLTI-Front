// Import the function to test
import { capitalizeFirstLetter } from "@utils/Utils";

// Write a test suite for the capitalizeFirstLetter function
describe("capitalizeFirstLetter", () => {
	// Write a test case for capitalizing the first letter of a string
	test("should capitalize the first letter of a string", () => {
		// Call the function with a sample string
		const result = capitalizeFirstLetter("hello");

		// Expect that the result is a string with the first letter capitalized
		expect(result).toBe("Hello");
	});
});
