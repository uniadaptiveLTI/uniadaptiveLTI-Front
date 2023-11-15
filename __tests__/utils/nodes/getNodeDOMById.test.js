import { getNodeDOMById } from "@utils/Nodes";

describe("getNodeDOMById", () => {
	it("should return the correct DOM element", () => {
		document.body.innerHTML = `
      <div class="react-flow__node" data-id="id1"></div>
      <div class="react-flow__node" data-id="id2"></div>
    `;

		const id = "id1";
		const result = getNodeDOMById(id);
		expect(result).toEqual(document.querySelector(`[data-id="${id}"]`));
	});
});
