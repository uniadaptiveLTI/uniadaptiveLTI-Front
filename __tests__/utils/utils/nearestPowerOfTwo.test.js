// Import the function to be tested
import { nearestPowerOfTwo } from "@utils/Utils";

// Write a test suite for the nearestPowerOfTwo function
describe("nearestPowerOfTwo", () => {
	// Write a test case for calculating the nearest power of two to a number
	test("should calculate the nearest power of two to a number", () => {
		// Call the function with some sample numbers
		const result1 = nearestPowerOfTwo(3);
		const result2 = nearestPowerOfTwo(5);
		const result3 = nearestPowerOfTwo(8);

		// Expect that the results are the nearest powers of two to the numbers
		expect(result1).toBe(4);
		expect(result2).toBe(4);
		expect(result3).toBe(8);
	});
});
