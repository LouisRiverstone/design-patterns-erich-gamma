import { describe, it, expect, vi, beforeEach } from "vitest";
import { demonstrateProblems } from "./before";
import {
	demonstrateSolution,
	ArrayIterator,
	ReverseArrayIterator,
	FilterIterator,
	SmartCollection,
	TreeNode,
	TreeCollection,
	DepthFirstIterator,
	BreadthFirstIterator,
} from "./after";

describe("Iterator Pattern", () => {
	describe("Before: Without Iterator Pattern", () => {
		it("should demonstrate problems with direct access", () => {
			const spy = vi.spyOn(console, "log").mockImplementation(() => {});

			demonstrateProblems();

			expect(spy).toHaveBeenCalledWith(
				expect.stringContaining("ANTES (Problemático)"),
			);

			spy.mockRestore();
		});
	});

	describe("After: With Iterator Pattern", () => {
		describe("ArrayIterator", () => {
			let iterator: ArrayIterator<string>;

			beforeEach(() => {
				iterator = new ArrayIterator(["A", "B", "C"]);
			});

			it("should iterate through all elements", () => {
				const result: string[] = [];
				while (iterator.hasNext()) {
					result.push(iterator.next());
				}

				expect(result).toEqual(["A", "B", "C"]);
			});

			it("should throw error when no more elements", () => {
				// Exhaust iterator
				while (iterator.hasNext()) {
					iterator.next();
				}

				expect(() => iterator.next()).toThrow("No more elements");
			});

			it("should reset correctly", () => {
				iterator.next(); // Move to 'B'
				iterator.reset();

				expect(iterator.next()).toBe("A");
			});

			it("should handle empty array", () => {
				const emptyIterator = new ArrayIterator<string>([]);

				expect(emptyIterator.hasNext()).toBe(false);
				expect(() => emptyIterator.next()).toThrow("No more elements");
			});
		});

		describe("ReverseArrayIterator", () => {
			it("should iterate in reverse order", () => {
				const iterator = new ReverseArrayIterator(["A", "B", "C"]);
				const result: string[] = [];

				while (iterator.hasNext()) {
					result.push(iterator.next());
				}

				expect(result).toEqual(["C", "B", "A"]);
			});

			it("should reset to last element", () => {
				const iterator = new ReverseArrayIterator(["A", "B", "C"]);

				iterator.next(); // Should be 'C'
				iterator.next(); // Should be 'B'
				iterator.reset();

				expect(iterator.next()).toBe("C");
			});
		});

		describe("FilterIterator", () => {
			it("should iterate only through filtered elements", () => {
				const numbers = [1, 2, 3, 4, 5, 6];
				const evenIterator = new FilterIterator(numbers, (n) => n % 2 === 0);
				const result: number[] = [];

				while (evenIterator.hasNext()) {
					result.push(evenIterator.next());
				}

				expect(result).toEqual([2, 4, 6]);
			});

			it("should handle filter that matches nothing", () => {
				const numbers = [1, 3, 5];
				const evenIterator = new FilterIterator(numbers, (n) => n % 2 === 0);

				expect(evenIterator.hasNext()).toBe(false);
			});

			it("should reset filtered iterator", () => {
				const numbers = [2, 4, 6];
				const iterator = new FilterIterator(numbers, (n) => n > 0);

				iterator.next(); // 2
				iterator.reset();

				expect(iterator.next()).toBe(2);
			});
		});

		describe("SmartCollection", () => {
			let collection: SmartCollection<number>;

			beforeEach(() => {
				collection = new SmartCollection();
				collection.add(1);
				collection.add(2);
				collection.add(3);
			});

			it("should create normal iterator", () => {
				const iterator = collection.createIterator();
				const result: number[] = [];

				while (iterator.hasNext()) {
					result.push(iterator.next());
				}

				expect(result).toEqual([1, 2, 3]);
			});

			it("should create reverse iterator", () => {
				const iterator = collection.createReverseIterator();
				const result: number[] = [];

				while (iterator.hasNext()) {
					result.push(iterator.next());
				}

				expect(result).toEqual([3, 2, 1]);
			});

			it("should create filter iterator", () => {
				const iterator = collection.createFilterIterator((n) => n > 1);
				const result: number[] = [];

				while (iterator.hasNext()) {
					result.push(iterator.next());
				}

				expect(result).toEqual([2, 3]);
			});

			it("should handle add and remove operations", () => {
				expect(collection.size()).toBe(3);

				collection.add(4);
				expect(collection.size()).toBe(4);

				const removed = collection.remove(2);
				expect(removed).toBe(true);
				expect(collection.size()).toBe(3);

				const notRemoved = collection.remove(99);
				expect(notRemoved).toBe(false);
				expect(collection.size()).toBe(3);
			});

			it("should handle isEmpty", () => {
				expect(collection.isEmpty()).toBe(false);

				const emptyCollection = new SmartCollection<number>();
				expect(emptyCollection.isEmpty()).toBe(true);
			});

			it("should provide forEach functionality", () => {
				const results: { item: number; index: number }[] = [];

				collection.forEach((item, index) => {
					results.push({ item, index });
				});

				expect(results).toEqual([
					{ item: 1, index: 0 },
					{ item: 2, index: 1 },
					{ item: 3, index: 2 },
				]);
			});

			it("should convert to array", () => {
				const array = collection.toArray();

				expect(array).toEqual([1, 2, 3]);
				// Should be a copy, not the original
				array.push(4);
				expect(collection.size()).toBe(3);
			});

			it("should protect against external modifications", () => {
				const iterator = collection.createIterator();

				// Adding to collection after creating iterator shouldn't affect iteration
				collection.add(4);

				const result: number[] = [];
				while (iterator.hasNext()) {
					result.push(iterator.next());
				}

				expect(result).toEqual([1, 2, 3]); // Should not include 4
			});
		});

		describe("TreeNode and TreeIterators", () => {
			let root: TreeNode<string>;

			beforeEach(() => {
				// Create tree: A -> B, C where B -> D, E and C -> F
				root = new TreeNode("A");
				const b = root.addChild("B");
				const c = root.addChild("C");
				b.addChild("D");
				b.addChild("E");
				c.addChild("F");
			});

			it("should build tree structure correctly", () => {
				expect(root.value).toBe("A");
				expect(root.children).toHaveLength(2);
				expect(root.children[0].value).toBe("B");
				expect(root.children[1].value).toBe("C");
				expect(root.children[0].children).toHaveLength(2);
			});

			describe("DepthFirstIterator", () => {
				it("should traverse in depth-first order", () => {
					const iterator = new DepthFirstIterator(root);
					const result: string[] = [];

					while (iterator.hasNext()) {
						result.push(iterator.next());
					}

					expect(result).toEqual(["A", "B", "D", "E", "C", "F"]);
				});

				it("should reset correctly", () => {
					const iterator = new DepthFirstIterator(root);

					iterator.next(); // A
					iterator.next(); // B
					iterator.reset();

					expect(iterator.next()).toBe("A");
				});

				it("should handle single node tree", () => {
					const singleNode = new TreeNode("ONLY");
					const iterator = new DepthFirstIterator(singleNode);

					expect(iterator.hasNext()).toBe(true);
					expect(iterator.next()).toBe("ONLY");
					expect(iterator.hasNext()).toBe(false);
				});
			});

			describe("BreadthFirstIterator", () => {
				it("should traverse in breadth-first order", () => {
					const iterator = new BreadthFirstIterator(root);
					const result: string[] = [];

					while (iterator.hasNext()) {
						result.push(iterator.next());
					}

					expect(result).toEqual(["A", "B", "C", "D", "E", "F"]);
				});

				it("should reset correctly", () => {
					const iterator = new BreadthFirstIterator(root);

					iterator.next(); // A
					iterator.next(); // B
					iterator.reset();

					expect(iterator.next()).toBe("A");
				});
			});
		});

		describe("TreeCollection", () => {
			let tree: TreeCollection<string>;
			let root: TreeNode<string>;

			beforeEach(() => {
				root = new TreeNode("A");
				const b = root.addChild("B");
				const c = root.addChild("C");
				b.addChild("D");
				c.addChild("E");

				tree = new TreeCollection(root);
			});

			it("should create depth-first iterator", () => {
				const iterator = tree.createDepthFirstIterator();
				const result: string[] = [];

				while (iterator.hasNext()) {
					result.push(iterator.next());
				}

				expect(result).toEqual(["A", "B", "D", "C", "E"]);
			});

			it("should create breadth-first iterator", () => {
				const iterator = tree.createBreadthFirstIterator();
				const result: string[] = [];

				while (iterator.hasNext()) {
					result.push(iterator.next());
				}

				expect(result).toEqual(["A", "B", "C", "D", "E"]);
			});

			it("should provide access to root", () => {
				expect(tree.getRoot()).toBe(root);
			});
		});

		describe("Error Handling", () => {
			it("should handle empty collections gracefully", () => {
				const emptyCollection = new SmartCollection<string>();
				const iterator = emptyCollection.createIterator();

				expect(iterator.hasNext()).toBe(false);
				expect(() => iterator.next()).toThrow("No more elements");
			});

			it("should handle multiple reset calls", () => {
				const collection = new SmartCollection<number>();
				collection.add(1);
				collection.add(2);

				const iterator = collection.createIterator();
				iterator.next();
				iterator.reset();
				iterator.reset(); // Multiple resets should be safe

				expect(iterator.next()).toBe(1);
			});
		});

		it("should demonstrate complete solution", () => {
			const spy = vi.spyOn(console, "log").mockImplementation(() => {});

			demonstrateSolution();

			expect(spy).toHaveBeenCalledWith(
				expect.stringContaining("DEPOIS (Solução Iterator)"),
			);

			spy.mockRestore();
		});
	});
});
