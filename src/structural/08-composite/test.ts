import { describe, it, expect, vi } from "vitest";
import { demonstrateProblems } from "./before";
import {
	demonstrateSolution,
	File,
	Directory,
	FileSystemManager,
	FileSystemBuilder,
} from "./after";

describe("Composite Pattern", () => {
	describe("Before: Without Composite", () => {
		it("should demonstrate problems with separate handling", () => {
			const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

			demonstrateProblems();

			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining("ANTES (Problemático)"),
			);

			consoleSpy.mockRestore();
		});
	});

	describe("After: With Composite Pattern", () => {
		describe("File (Leaf)", () => {
			it("should implement component interface", () => {
				const file = new File("test.txt", 10, "content");

				expect(file.getName()).toBe("test.txt");
				expect(file.getSize()).toBe(10);
				expect(file.getContent()).toBe("content");
				expect(file.getPath()).toBe("test.txt");
			});

			it("should find itself when name matches", () => {
				const file = new File("test.txt", 10);

				const results = file.find("test");
				expect(results).toHaveLength(1);
				expect(results[0]).toBe(file);

				const noResults = file.find("notfound");
				expect(noResults).toHaveLength(0);
			});

			it("should update size when content changes", () => {
				const file = new File("test.txt", 10);

				file.setContent("new content with more text");
				expect(file.getSize()).toBeGreaterThan(0);
			});
		});

		describe("Directory (Composite)", () => {
			it("should implement component interface", () => {
				const dir = new Directory("mydir");

				expect(dir.getName()).toBe("mydir");
				expect(dir.getSize()).toBe(0); // Empty directory
				expect(dir.getPath()).toBe("mydir");
				expect(dir.isEmpty()).toBe(true);
			});

			it("should calculate total size of children", () => {
				const dir = new Directory("project");
				const file1 = new File("app.ts", 20);
				const file2 = new File("utils.ts", 15);

				dir.add(file1);
				dir.add(file2);

				expect(dir.getSize()).toBe(35);
				expect(dir.isEmpty()).toBe(false);
				expect(dir.getChildrenCount()).toBe(2);
			});

			it("should handle nested structure", () => {
				const root = new Directory("root");
				const subdir = new Directory("subdir");
				const file1 = new File("file1.txt", 10);
				const file2 = new File("file2.txt", 20);

				subdir.add(file2);
				root.add(file1);
				root.add(subdir);

				expect(root.getSize()).toBe(30); // 10 + 20
				expect(root.getFileCount()).toBe(2);
				expect(root.getDirectoryCount()).toBe(1);
			});

			it("should set parent correctly", () => {
				const parent = new Directory("parent");
				const child = new File("child.txt", 5);

				parent.add(child);

				expect(child.getPath()).toBe("parent/child.txt");
			});

			it("should remove children correctly", () => {
				const dir = new Directory("test");
				const file = new File("test.txt", 10);

				dir.add(file);
				expect(dir.getChildrenCount()).toBe(1);

				dir.remove(file);
				expect(dir.getChildrenCount()).toBe(0);
				expect(file.getPath()).toBe("test.txt"); // Parent removed
			});

			it("should find items recursively", () => {
				const root = new Directory("root");
				const subdir = new Directory("testdir");
				const file1 = new File("test.txt", 10);
				const file2 = new File("other.txt", 5);

				subdir.add(file1);
				root.add(subdir);
				root.add(file2);

				const results = root.find("test");
				expect(results).toHaveLength(2); // testdir and test.txt

				const names = results.map((item) => item.getName());
				expect(names).toContain("testdir");
				expect(names).toContain("test.txt");
			});
		});

		describe("FileSystemManager", () => {
			it("should analyze items uniformly", () => {
				const consoleSpy = vi
					.spyOn(console, "log")
					.mockImplementation(() => {});
				const manager = new FileSystemManager();
				const file = new File("test.txt", 10);

				manager.analyzeItem(file);

				expect(consoleSpy).toHaveBeenCalledWith(
					expect.stringContaining(" Analisando: test.txt"),
				);

				consoleSpy.mockRestore();
			});

			it("should calculate total size of mixed items", () => {
				const manager = new FileSystemManager();
				const file = new File("file.txt", 10);
				const dir = new Directory("dir");
				const subfile = new File("sub.txt", 20);

				dir.add(subfile);

				const total = manager.calculateTotalSize([file, dir]);
				expect(total).toBe(30);
			});

			it("should search across multiple items", () => {
				const manager = new FileSystemManager();
				const dir1 = new Directory("project1");
				const dir2 = new Directory("project2");

				dir1.add(new File("test.txt", 10));
				dir2.add(new File("testing.js", 15));

				const results = manager.searchInItems([dir1, dir2], "test");
				expect(results).toHaveLength(2);
			});

			it("should copy structure recursively", () => {
				const manager = new FileSystemManager();
				const original = new Directory("original");
				const subdir = new Directory("subdir");
				const file = new File("file.txt", 10, "content");

				subdir.add(file);
				original.add(subdir);

				const copy = manager.copyStructure(original, "copy") as Directory;

				expect(copy.getName()).toBe("copy");
				expect(copy.getSize()).toBe(10);
				expect(copy.getDirectoryCount()).toBe(1);
				expect(copy.getFileCount()).toBe(1);

				// Should be independent copies
				expect(copy).not.toBe(original);
				expect(copy.getChildren()[0]).not.toBe(subdir);
			});
		});

		describe("FileSystemBuilder", () => {
			it("should build complex structures fluently", () => {
				const project = new FileSystemBuilder("myproject")
					.addDirectory("/", "src")
					.addDirectory("/src", "components")
					.addFile("/src", "app.ts", 20)
					.addFile("/src/components", "Button.tsx", 15)
					.addFile("/", "README.md", 5)
					.build();

				expect(project.getName()).toBe("myproject");
				expect(project.getSize()).toBe(40);
				expect(project.getFileCount()).toBe(3);
				expect(project.getDirectoryCount()).toBe(2);
			});

			it("should create nested directories automatically", () => {
				const project = new FileSystemBuilder("test")
					.addFile("/deep/nested/path", "file.txt", 10)
					.build();

				expect(project.getDirectoryCount()).toBe(3); // deep, nested, path
				expect(project.getFileCount()).toBe(1);

				const foundFiles = project.find("file.txt");
				expect(foundFiles).toHaveLength(1);
				expect(foundFiles[0].getPath()).toBe("test/deep/nested/path/file.txt");
			});
		});

		it("should demonstrate uniform interface", () => {
			const file = new File("document.pdf", 100);
			const directory = new Directory("folder");
			directory.add(new File("image.jpg", 50));

			// Same interface for both
			const items = [file, directory];

			items.forEach((item) => {
				expect(typeof item.getName()).toBe("string");
				expect(typeof item.getSize()).toBe("number");
				expect(typeof item.getPath()).toBe("string");
				expect(Array.isArray(item.find("test"))).toBe(true);
			});

			// But different behaviors
			expect(file.getSize()).toBe(100);
			expect(directory.getSize()).toBe(50); // Size of contents
		});

		it("should demonstrate solution correctly", () => {
			const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

			demonstrateSolution();

			expect(consoleSpy).toHaveBeenCalledWith(
				expect.stringContaining("DEPOIS (Solução Composite)"),
			);

			consoleSpy.mockRestore();
		});
	});
});
