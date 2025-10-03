// Iterator interface
export interface Iterator<T> {
	hasNext(): boolean;
	next(): T;
	reset(): void;
}

// Aggregate interface
export interface IterableCollection<T> {
	createIterator(): Iterator<T>;
	createReverseIterator(): Iterator<T>;
	createFilterIterator(predicate: (item: T) => boolean): Iterator<T>;
}

// Concrete Iterator implementations
export class ArrayIterator<T> implements Iterator<T> {
	private position: number = 0;

	constructor(private items: T[]) {}

	hasNext(): boolean {
		return this.position < this.items.length;
	}

	next(): T {
		if (!this.hasNext()) {
			throw new Error("No more elements");
		}
		return this.items[this.position++];
	}

	reset(): void {
		this.position = 0;
	}
}

export class ReverseArrayIterator<T> implements Iterator<T> {
	private position: number;

	constructor(private items: T[]) {
		this.position = items.length - 1;
	}

	hasNext(): boolean {
		return this.position >= 0;
	}

	next(): T {
		if (!this.hasNext()) {
			throw new Error("No more elements");
		}
		return this.items[this.position--];
	}

	reset(): void {
		this.position = this.items.length - 1;
	}
}

export class FilterIterator<T> implements Iterator<T> {
	private position: number = 0;
	private filteredItems: T[];

	constructor(
		items: T[],
		private predicate: (item: T) => boolean,
	) {
		this.filteredItems = items.filter(predicate);
	}

	hasNext(): boolean {
		return this.position < this.filteredItems.length;
	}

	next(): T {
		if (!this.hasNext()) {
			throw new Error("No more elements");
		}
		return this.filteredItems[this.position++];
	}

	reset(): void {
		this.position = 0;
	}
}

// Tree-like structure with its own iterators
export class TreeNode<T> {
	public children: TreeNode<T>[] = [];

	constructor(
		public value: T,
		public parent: TreeNode<T> | null = null,
	) {}

	addChild(value: T): TreeNode<T> {
		const child = new TreeNode(value, this);
		this.children.push(child);
		return child;
	}

	addChildNode(node: TreeNode<T>): void {
		node.parent = this;
		this.children.push(node);
	}
}

export class DepthFirstIterator<T> implements Iterator<T> {
	private stack: TreeNode<T>[] = [];
	private visited: Set<TreeNode<T>> = new Set();
	private originalRoot: TreeNode<T>;

	constructor(root: TreeNode<T>) {
		this.originalRoot = root;
		this.stack.push(root);
	}

	hasNext(): boolean {
		return this.stack.length > 0;
	}

	next(): T {
		if (!this.hasNext()) {
			throw new Error("No more elements");
		}

		const current = this.stack.pop()!;
		this.visited.add(current);

		// Add children to stack (in reverse order for left-to-right traversal)
		for (let i = current.children.length - 1; i >= 0; i--) {
			if (!this.visited.has(current.children[i])) {
				this.stack.push(current.children[i]);
			}
		}

		return current.value;
	}

	reset(): void {
		this.stack = [this.originalRoot];
		this.visited.clear();
	}
}

export class BreadthFirstIterator<T> implements Iterator<T> {
	private queue: TreeNode<T>[] = [];
	private visited: Set<TreeNode<T>> = new Set();
	private originalRoot: TreeNode<T>;

	constructor(root: TreeNode<T>) {
		this.originalRoot = root;
		this.queue.push(root);
	}

	hasNext(): boolean {
		return this.queue.length > 0;
	}

	next(): T {
		if (!this.hasNext()) {
			throw new Error("No more elements");
		}

		const current = this.queue.shift()!;
		this.visited.add(current);

		// Add children to queue
		for (const child of current.children) {
			if (!this.visited.has(child)) {
				this.queue.push(child);
			}
		}

		return current.value;
	}

	reset(): void {
		this.queue = [this.originalRoot];
		this.visited.clear();
	}
}

// Concrete Collection
export class SmartCollection<T> implements IterableCollection<T> {
	private items: T[] = [];

	add(item: T): void {
		this.items.push(item);
	}

	remove(item: T): boolean {
		const index = this.items.indexOf(item);
		if (index > -1) {
			this.items.splice(index, 1);
			return true;
		}
		return false;
	}

	size(): number {
		return this.items.length;
	}

	isEmpty(): boolean {
		return this.items.length === 0;
	}

	// Different iterator types
	createIterator(): Iterator<T> {
		return new ArrayIterator([...this.items]); // Copy to avoid external modifications
	}

	createReverseIterator(): Iterator<T> {
		return new ReverseArrayIterator([...this.items]);
	}

	createFilterIterator(predicate: (item: T) => boolean): Iterator<T> {
		return new FilterIterator([...this.items], predicate);
	}

	// Utility method for easy iteration
	forEach(callback: (item: T, index: number) => void): void {
		const iterator = this.createIterator();
		let index = 0;
		while (iterator.hasNext()) {
			callback(iterator.next(), index++);
		}
	}

	toArray(): T[] {
		const result: T[] = [];
		const iterator = this.createIterator();
		while (iterator.hasNext()) {
			result.push(iterator.next());
		}
		return result;
	}
}

// Tree collection with multiple traversal options
export class TreeCollection<T> {
	constructor(private root: TreeNode<T>) {}

	createDepthFirstIterator(): Iterator<T> {
		return new DepthFirstIterator(this.root);
	}

	createBreadthFirstIterator(): Iterator<T> {
		return new BreadthFirstIterator(this.root);
	}

	getRoot(): TreeNode<T> {
		return this.root;
	}
}

export function demonstrateSolution() {
	console.log("DEPOIS (Solução Iterator) - Iteração encapsulada e flexível");

	// Demonstrando SmartCollection
	const collection = new SmartCollection<number>();
	collection.add(1);
	collection.add(2);
	collection.add(3);
	collection.add(4);
	collection.add(5);

	console.log("\n=== Iteração Normal ===");
	const normalIterator = collection.createIterator();
	while (normalIterator.hasNext()) {
		console.log(`Item: ${normalIterator.next()}`);
	}

	console.log("\n=== Iteração Reversa ===");
	const reverseIterator = collection.createReverseIterator();
	while (reverseIterator.hasNext()) {
		console.log(`Item: ${reverseIterator.next()}`);
	}

	console.log("\n=== Iteração Filtrada (pares) ===");
	const filterIterator = collection.createFilterIterator((n) => n % 2 === 0);
	while (filterIterator.hasNext()) {
		console.log(`Item par: ${filterIterator.next()}`);
	}

	// Demonstrando TreeCollection
	console.log("\n=== Árvore com Diferentes Traversals ===");
	const root = new TreeNode("A");
	const b = root.addChild("B");
	const c = root.addChild("C");
	b.addChild("D");
	b.addChild("E");
	c.addChild("F");

	const tree = new TreeCollection(root);

	console.log("\nDepth-First (DFS):");
	const dfsIterator = tree.createDepthFirstIterator();
	const dfsResult: string[] = [];
	while (dfsIterator.hasNext()) {
		dfsResult.push(dfsIterator.next());
	}
	console.log(dfsResult.join(" -> "));

	console.log("\nBreadth-First (BFS):");
	const bfsIterator = tree.createBreadthFirstIterator();
	const bfsResult: string[] = [];
	while (bfsIterator.hasNext()) {
		bfsResult.push(bfsIterator.next());
	}
	console.log(bfsResult.join(" -> "));

	// Demonstrando reset
	console.log("\n=== Testando Reset ===");
	const testIterator = collection.createIterator();
	console.log(`Primeiro: ${testIterator.next()}`);
	console.log(`Segundo: ${testIterator.next()}`);

	testIterator.reset();
	console.log(`Após reset: ${testIterator.next()}`);

	// Demonstrando forEach
	console.log("\n=== Usando forEach ===");
	collection.forEach((item, index) => {
		console.log(`[${index}] = ${item}`);
	});
}
