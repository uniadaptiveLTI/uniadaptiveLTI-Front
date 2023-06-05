// Import the function to test
import { getNodesByNodesDOM } from "@utils/Nodes";

// Write a test suite for the getNodesByNodesDOM function
describe("getNodesByNodesDOM", () => {
	// Write a test case for getting an array of nodes from an array of nodes by their DOM elements data-id attributes
	test("should get an array of nodes from an array of nodes by their DOM elements data-id attributes", () => {
		// Create a sample array of nodes with id and data properties
		const nodeArray = [
			{ id: "1", data: { label: "Node 1" } },
			{ id: "2", data: { label: "Node 2" } },
			{ id: "3", data: { label: "Node 3" } },
		];

		// Create a sample array of DOM elements with data-id attributes that match some node ids
		const nodesDOM = [
			document.createElement("div"),
			document.createElement("div"),
			document.createElement("div"),
		];
		nodesDOM[0].dataset.id = "1";
		nodesDOM[1].dataset.id = "3";
		nodesDOM[2].dataset.id = "4";

		// Call the function with the array of DOM elements and the array of nodes
		const result = getNodesByNodesDOM(nodesDOM, nodeArray);

		// Expect that the result is an array of nodes with the same data-id as the DOM elements
		expect(result).toEqual([
			{ id: "1", data: { label: "Node 1" } },
			{ id: "3", data: { label: "Node 3" } },
		]);
	});

	// Write a test case for handling an empty array of DOM elements
	test("should return an empty array if the input is an empty array of DOM elements", () => {
		// Create a sample array of nodes with id and data properties
		const nodeArray = [
			{ id: "1", data: { label: "Node 1" } },
			{ id: "2", data: { label: "Node 2" } },
			{ id: "3", data: { label: "Node 3" } },
		];

		// Call the function with an empty array of DOM elements and the array of nodes
		const result = getNodesByNodesDOM([], nodeArray);

		// Expect that the result is an empty array
		expect(result).toEqual([]);
	});
});
