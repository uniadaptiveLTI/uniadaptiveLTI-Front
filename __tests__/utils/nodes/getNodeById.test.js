// Import the function to test
import { getNodeById } from "@utils/Nodes";

// Write a test suite for the getNodeById function
describe("getNodeById", () => {
	// Write a test case for getting a node from an array of nodes by its id
	test("should get a node from an array of nodes by its id", () => {
		// Create a sample node with an id and a data property
		const node = { id: "1", data: { label: "Node 1" } };

		// Create a sample array of nodes that contains the node
		const nodeArray = [
			{ id: "2", data: { label: "Node 2" } },
			node,
			{ id: "3", data: { label: "Node 3" } },
		];

		// Call the function with the node id and the array
		const result = getNodeById(node.id, nodeArray);

		// Expect that the result is the node with the given id
		expect(result).toBe(node);
	});

	// Write a test case for handling an invalid id
	test("should return undefined if the id is not found in the array", () => {
		// Create a sample array of nodes
		const nodeArray = [
			{ id: "2", data: { label: "Node 2" } },
			{ id: "1", data: { label: "Node 1" } },
			{ id: "3", data: { label: "Node 3" } },
		];

		// Call the function with an invalid id and the array
		const result = getNodeById("4", nodeArray);

		// Expect that the result is undefined
		expect(result).toBeUndefined();
	});

	// Write a test case for handling a non-array input
	test("should return undefined if the input is not an array", () => {
		// Call the function with a non-array input
		const result = getNodeById("1", null);

		// Expect that the result is undefined
		expect(result).toBeUndefined();
	});
});
