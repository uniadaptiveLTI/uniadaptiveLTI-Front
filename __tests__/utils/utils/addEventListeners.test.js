// Import the function to be tested
import { addEventListeners } from "@utils/Utils";

// Create a mock element with a mock addEventListener method
const mockElement = {
	addEventListener: jest.fn(),
};

// Create an array of mock events with mock types and listeners
const mockEvents = [
	{ type: "click", listener: jest.fn() },
	{ type: "change", listener: jest.fn() },
	{ type: "input", listener: jest.fn() },
];

// Write a test suite for the addEventListeners function
describe("addEventListeners", () => {
	// Write a test case for adding multiple event listeners to an element
	test("should add multiple event listeners to an element", () => {
		// Call the function with the mock element and events
		addEventListeners(mockElement, mockEvents);

		// Expect that the mock addEventListener method was called three times
		expect(mockElement.addEventListener).toHaveBeenCalledTimes(3);

		// Expect that the mock addEventListener method was called with each event type and listener
		expect(mockElement.addEventListener).toHaveBeenCalledWith(
			"click",
			mockEvents[0].listener,
			false
		);
		expect(mockElement.addEventListener).toHaveBeenCalledWith(
			"change",
			mockEvents[1].listener,
			false
		);
		expect(mockElement.addEventListener).toHaveBeenCalledWith(
			"input",
			mockEvents[2].listener,
			false
		);
	});
});
