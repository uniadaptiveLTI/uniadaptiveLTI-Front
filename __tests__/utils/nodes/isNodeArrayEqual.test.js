// Import the function to test
import { isNodeArrayEqual } from "@utils/Nodes";

// Write a test suite for the isNodeArrayEqual function
describe("isNodeArrayEqual", () => {
	// Write a test case for comparing two arrays of nodes by their JSON representation
	test("should compare two arrays of nodes by their JSON representation", () => {
		// Create a sample array of nodes with id and data properties
		const nodeArray1 = [
			{ id: "1", data: { label: "Node 1" } },
			{ id: "2", data: { label: "Node 2" } },
			{ id: "3", data: { label: "Node 3" } },
		];

		// Create another array of nodes with the same id and data properties as the first array
		const nodeArray2 = [
			{ id: "1", data: { label: "Node 1" } },
			{ id: "2", data: { label: "Node 2" } },
			{ id: "3", data: { label: "Node 3" } },
		];

		// Create another array of nodes with different id and data properties from the first array
		const nodeArray3 = [
			{ id: "4", data: { label: "Node 4" } },
			{ id: "5", data: { label: "Node 5" } },
			{ id: "6", data: { label: "Node 6" } },
		];

		// Call the function with the first and second array of nodes
		const result1 = isNodeArrayEqual(nodeArray1, nodeArray2);

		// Expect that the result is true
		expect(result1).toBe(true);

		// Call the function with the first and third array of nodes
		const result2 = isNodeArrayEqual(nodeArray1, nodeArray3);

		// Expect that the result is false
		expect(result2).toBe(false);
	});
});
