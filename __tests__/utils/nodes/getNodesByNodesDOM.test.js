// Import the function to test
import { getNodesByNodesDOM } from "@utils/Nodes";

describe("getNodesByNodesDOM", () => {
	it("should get an array of nodes from an array of nodes by their DOM elements data-id attributes", () => {
		const nodesDOM = [{ id: "1" }, { id: "3" }];
		const nodeArray = [
			{ id: "1", data: { label: "Node 1" } },
			{ id: "2", data: { label: "Node 2" } },
			{ id: "3", data: { label: "Node 3" } },
		];
		const expected = [
			{ id: "1", data: { label: "Node 1" } },
			{ id: "3", data: { label: "Node 3" } },
		];
		const result = getNodesByNodesDOM(nodesDOM, nodeArray);
		expect(result).toEqual(expected);
	});

	it("should return an empty array if no nodes match the DOM elements data-id attributes", () => {
		const nodesDOM = [{ id: "4" }, { id: "5" }];
		const nodeArray = [
			{ id: "1", data: { label: "Node 1" } },
			{ id: "2", data: { label: "Node 2" } },
			{ id: "3", data: { label: "Node 3" } },
		];
		const result = getNodesByNodesDOM(nodesDOM, nodeArray);
		expect(result).toEqual([]);
	});
});
