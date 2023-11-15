// Import the function to test
import { getNodeByNodeDOM } from "@utils/Nodes";

describe("getNodeByNodeDOM", () => {
	it("should return a node with the same id as the DOM element", () => {
		const nodeDOM = { id: "1" };
		const nodeArray = [
			{ id: "1", name: "node1" },
			{ id: "2", name: "node2" },
		];
		const expected = { id: "1", name: "node1" };
		const result = getNodeByNodeDOM(nodeDOM, nodeArray);
		expect(result).toEqual(expected);
	});

	it("should return undefined if no node matches the DOM element id", () => {
		const nodeDOM = { id: "3" };
		const nodeArray = [
			{ id: "1", name: "node1" },
			{ id: "2", name: "node2" },
		];
		const result = getNodeByNodeDOM(nodeDOM, nodeArray);
		expect(result).toBeUndefined();
	});

	it("should return undefined if the node array is not an array", () => {
		const nodeDOM = { id: "1" };
		const nodeArray = "not an array";
		const result = getNodeByNodeDOM(nodeDOM, nodeArray);
		expect(result).toBeUndefined();
	});
});
