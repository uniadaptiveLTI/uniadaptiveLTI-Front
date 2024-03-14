import {
	arrayInsideArrayById,
	capitalizeFirstLetter,
	deduplicateById,
	inArrayById,
	nearestPowerOfTwo,
	orderByPropertyAlphabetically,
	uniqueId,
} from "@utils/Utils";

jest.mock("pages/_app", () => {
	return {
		__esModule: true,
		default: () => {},
	};
});

// Test for capitalizeFirstLetter function
describe("capitalizeFirstLetter", () => {
	it("should capitalize the first letter of a string", () => {
		expect(capitalizeFirstLetter("hello")).toBe("Hello");
		expect(capitalizeFirstLetter("world")).toBe("World");
		expect(capitalizeFirstLetter("jest")).toBe("Jest");
	});
});

// Test for uniqueId function
describe("uniqueId", () => {
	it("should generate a unique identifier", () => {
		const id1 = uniqueId();
		const id2 = uniqueId();
		expect(id1).not.toBe(id2);
	});
});

// Test for nearestPowerOfTwo function
describe("nearestPowerOfTwo", () => {
	it("should return the nearest power of two to a given number", () => {
		expect(nearestPowerOfTwo(3)).toBe(4);
		expect(nearestPowerOfTwo(7)).toBe(8);
		expect(nearestPowerOfTwo(13)).toBe(16);
	});
});

// Test for orderByPropertyAlphabetically function
describe("orderByPropertyAlphabetically", () => {
	it("should sort an array of objects by a property alphabetically", () => {
		const array: Array<{ name: string }> = [
			{ name: "Charlie" },
			{ name: "Alice" },
			{ name: "Bob" },
		];
		const sortedArray = orderByPropertyAlphabetically(array, "name") as Array<{
			name: string;
		}>;
		expect(sortedArray[0].name).toBe("Alice");
		expect(sortedArray[1].name).toBe("Bob");
		expect(sortedArray[2].name).toBe("Charlie");
	});
});

// Test for inArrayById function
describe("inArrayById", () => {
	it("should check if an object is in an array by its id property", () => {
		const obj = { id: 1 };
		const arr = [{ id: 1 }, { id: 2 }, { id: 3 }];
		expect(inArrayById(obj, arr)).toBe(true);
	});
});

// Test for arrayInsideArrayById function
describe("arrayInsideArrayById", () => {
	it("should check if all the objects in an array are in another array by their id property", () => {
		const arr1 = [{ id: 1 }, { id: 2 }];
		const arr2 = [{ id: 1 }, { id: 2 }, { id: 3 }];
		expect(arrayInsideArrayById(arr1, arr2)).toBe(true);
	});
});

// Test for deduplicateById function
describe("deduplicateById", () => {
	it("should return an array with objects with unique IDs from other without unique IDs", () => {
		const arr = [{ id: 1 }, { id: 2 }, { id: 2 }, { id: 3 }];
		const deduplicatedArray = deduplicateById(arr);
		expect(deduplicatedArray.length).toBe(3);
	});
});
