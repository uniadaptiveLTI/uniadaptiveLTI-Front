// Import the function to test
import { getChildrenNodesFromFragmentID } from "@utils/Nodes";

// Write a test suite for the getChildrenNodesFromFragmentID function
describe("getChildrenNodesFromFragmentID", () => {
	// Write a test case for returning the children of a given fragment id
	test("should return the children of a given fragment id", () => {
		// Create a sample fragment node with an id and a data property with innerNodes
		const fragment = {
			id: "1",
			type: "fragment",
			data: { label: "Fragment", data: { innerNodes: ["2", "3"] } },
		};

		// Create a sample array of nodes that contains the fragment and its children
		const nodeArray = [
			fragment,
			{ id: "2", type: "action", data: { label: "Action 1" }, parentNode: "1" },
			{ id: "3", type: "action", data: { label: "Action 2" }, parentNode: "1" },
			{ id: "4", type: "action", data: { label: "Action 3" } },
		];

		// Call the function with the fragment id and the array of nodes
		const result = getChildrenNodesFromFragmentID(fragment.id, nodeArray);

		// Expect that the result is an array of nodes with the same parentNode as the fragment id
		expect(result).toEqual([
			{ id: "2", type: "action", data: { label: "Action 1" }, parentNode: "1" },
			{ id: "3", type: "action", data: { label: "Action 2" }, parentNode: "1" },
		]);
	});

	// Write a test case for handling a non-array input
	test("should return undefined if the input is not an array", () => {
		// Call the function with a non-array input and null
		const result = getChildrenNodesFromFragmentID("1", null);

		// Expect that the result is undefined
		expect(result).toBeUndefined();
	});
});
