// Import the function to test
import { getNodeByNodeDOM } from "@utils/Nodes";

// Write a test suite for the getNodeByNodeDOM function
describe("getNodeByNodeDOM", () => {
	// Write a test case for getting a node from an array of nodes by its DOM element data-id attribute
	test("should get a node from an array of nodes by its DOM element data-id attribute", () => {
		// Create a sample node with an id and a data property
		const node = { id: "1", data: { label: "Node 1" } };

		// Create a sample array of nodes that contains the node
		const nodeArray = [
			{ id: "2", data: { label: "Node 2" } },
			node,
			{ id: "3", data: { label: "Node 3" } },
		];

		// Create a mock DOM element with a data-id attribute that matches the node id
		const nodeDOM = document.createElement("div");
		nodeDOM.dataset.id = node.id;

		// Call the function with the DOM element and the array
		const result = getNodeByNodeDOM(nodeDOM, nodeArray);

		// Expect that the result is the node with the same data-id as the DOM element
		expect(result).toBe(node);
	});

	// Write a test case for handling an invalid DOM element
	test("should return undefined if the DOM element does not have a matching data-id in the array", () => {
		// Create a sample array of nodes
		const nodeArray = [
			{ id: "2", data: { label: "Node 2" } },
			{ id: "1", data: { label: "Node 1" } },
			{ id: "3", data: { label: "Node 3" } },
		];

		// Create a mock DOM element with a data-id attribute that does not match any node id
		const nodeDOM = document.createElement("div");
		nodeDOM.dataset.id = "4";

		// Call the function with the DOM element and the array
		const result = getNodeByNodeDOM(nodeDOM, nodeArray);

		// Expect that the result is undefined
		expect(result).toBeUndefined();
	});

	// Write a test case for handling a non-array input
	test("should return undefined if the input is not an array", () => {
		// Create a mock DOM element with a data-id attribute
		const nodeDOM = document.createElement("div");
		nodeDOM.dataset.id = "1";

		// Call the function with the DOM element and a non-array input
		const result = getNodeByNodeDOM(nodeDOM, null);

		// Expect that the result is undefined
		expect(result).toBeUndefined();
	});
});
