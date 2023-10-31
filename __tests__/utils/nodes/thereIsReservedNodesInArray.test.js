// Import the function and the reserved node types to test
import { thereIsReservedNodesInArray, ReservedNodeTypes } from "@utils/Nodes";

// Write a test suite for the thereIsReservedNodesInArray function
describe("thereIsReservedNodesInArray", () => {
	// Write a test case for checking if there are any reserved nodes in an array of nodes
	test("should check if there are any reserved nodes in an array of nodes", () => {
		// Create a sample array of nodes with some reserved node types
		const nodeArray = [{ id: "2", type: "action", data: { label: "Action" } }];

		// Call the function with the array of nodes
		const result = thereIsReservedNodesInArray(nodeArray);

		// Expect that the result is true
		expect(result).toBe(true);
	});

	// Write a test case for checking if there are no reserved nodes in an array of nodes
	test("should check if there are no reserved nodes in an array of nodes", () => {
		// Create a sample array of nodes with no reserved node types
		const nodeArray = [
			{ id: "1", type: "action", data: { label: "Action 1" } },
			{ id: "2", type: "action", data: { label: "Action 2" } },
			{ id: "3", type: "action", data: { label: "Action 3" } },
		];

		// Call the function with the array of nodes
		const result = thereIsReservedNodesInArray(nodeArray);

		// Expect that the result is false
		expect(result).toBe(false);
	});
});
