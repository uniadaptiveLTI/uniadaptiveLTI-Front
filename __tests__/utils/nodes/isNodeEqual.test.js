// Import the function to test
import { isNodeEqual } from "@utils/Nodes";

// Write a test suite for the isNodeEqual function
describe("isNodeEqual", () => {
	// Write a test case for comparing two nodes by their JSON representation
	test("should compare two nodes by their JSON representation", () => {
		// Create a sample node with an id and a data property
		const node = { id: "1", data: { label: "Node 1" } };

		// Create another node with the same id and data property
		const nodeCopy = { id: "1", data: { label: "Node 1" } };

		// Create another node with a different id and data property
		const nodeDifferent = { id: "2", data: { label: "Node 2" } };

		// Call the function with the node and its copy
		const result1 = isNodeEqual(node, nodeCopy);

		// Expect that the result is true
		expect(result1).toBe(true);

		// Call the function with the node and the different node
		const result2 = isNodeEqual(node, nodeDifferent);

		// Expect that the result is false
		expect(result2).toBe(false);
	});
});
