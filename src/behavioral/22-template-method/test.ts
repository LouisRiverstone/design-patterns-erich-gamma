import { describe, it, expect, vi, beforeEach } from "vitest";
import { demonstrateProblems } from "./before";
import {
	demonstrateSolution,
	CSVDataProcessor,
	JSONDataProcessor,
	XMLDataProcessor,
	BatchDataProcessor,
	ValidationResult,
	ProcessingResult,
	StandardRecord,
} from "./after";

describe("Template Method Pattern", () => {
	describe("Before: Without Template Method Pattern", () => {
		it("should demonstrate problems with code duplication", () => {
			const spy = vi.spyOn(console, "log").mockImplementation(() => {});

			demonstrateProblems();

			expect(spy).toHaveBeenCalledWith(
				expect.stringContaining("ANTES (Problemático)"),
			);

			spy.mockRestore();
		});
	});

	describe("After: With Template Method Pattern", () => {
		describe("CSVDataProcessor", () => {
			let processor: CSVDataProcessor;

			beforeEach(() => {
				processor = new CSVDataProcessor();
			});

			it("should process valid CSV data successfully", () => {
				const spy = vi.spyOn(console, "log").mockImplementation(() => {});

				const csvData = [
					["1", "Alice", "100.50"],
					["2", "Bob", "200.75"],
				];

				const result = processor.processData(csvData);

				expect(result.success).toBe(true);
				expect(result.recordsProcessed).toBe(2);
				expect(result.data).toBeDefined();
				expect(result.data?.[0]).toMatchObject({
					id: "1",
					name: "Alice",
					value: 100.5,
					source: "CSV",
				});

				spy.mockRestore();
			});

			it("should handle invalid CSV data", () => {
				const spy = vi.spyOn(console, "log").mockImplementation(() => {});

				const invalidData = [
					["", "Alice", "invalid-number"],
					["2", "", "200"],
				];

				const result = processor.processData(invalidData);

				expect(result.success).toBe(false);
				expect(result.error).toContain("Validação falhou");

				spy.mockRestore();
			});

			it("should preprocess data correctly", () => {
				const spy = vi.spyOn(console, "log").mockImplementation(() => {});

				const dataWithSpaces = [
					["1", "  Alice  ", "100"],
					["", "", ""], // Empty line should be filtered
					["2", "Bob   ", "200"],
				];

				const result = processor.processData(dataWithSpaces);

				expect(result.success).toBe(true);
				expect(result.recordsProcessed).toBe(2); // Empty line filtered out

				spy.mockRestore();
			});

			it("should generate unique batch IDs", () => {
				const spy = vi.spyOn(console, "log").mockImplementation(() => {});

				const csvData = [["1", "Alice", "100"]];

				const result1 = processor.processData(csvData);
				const result2 = processor.processData(csvData);

				expect(result1.data?.[0].batchId).toBeDefined();
				expect(result2.data?.[0].batchId).toBeDefined();
				expect(result1.data?.[0].batchId).not.toBe(result2.data?.[0].batchId);

				spy.mockRestore();
			});
		});

		describe("JSONDataProcessor", () => {
			let processor: JSONDataProcessor;

			beforeEach(() => {
				processor = new JSONDataProcessor();
			});

			it("should process valid JSON data successfully", () => {
				const spy = vi.spyOn(console, "log").mockImplementation(() => {});

				const jsonData = [
					{ id: 1, name: "Alice", value: 100.5 },
					{ id: 2, name: "Bob", value: 200.75 },
				];

				const result = processor.processData(jsonData);

				expect(result.success).toBe(true);
				expect(result.recordsProcessed).toBe(2);
				expect(result.data?.[0]).toMatchObject({
					id: "1",
					name: "Alice",
					value: 100.5,
					source: "JSON",
				});

				spy.mockRestore();
			});

			it("should handle invalid JSON data", () => {
				const spy = vi.spyOn(console, "log").mockImplementation(() => {});

				const invalidData = [
					{ id: null, name: "Alice", value: "invalid" },
					{ name: "Bob" }, // Missing id and value
				];

				const result = processor.processData(invalidData);

				expect(result.success).toBe(false);
				expect(result.error).toContain("Validação falhou");

				spy.mockRestore();
			});

			it("should postprocess data with rounding and metadata", () => {
				const spy = vi.spyOn(console, "log").mockImplementation(() => {});

				const jsonData = [
					{ id: 1, name: "Alice", value: 100.555 }, // Should be rounded
				];

				const result = processor.processData(jsonData);

				expect(result.success).toBe(true);
				expect(result.data?.[0].value).toBe(100.56); // Rounded to 2 decimal places
				expect((result.data?.[0] as any).metadata).toEqual({
					processor: "JSON",
					enriched: true,
				});

				spy.mockRestore();
			});
		});

		describe("XMLDataProcessor", () => {
			let processor: XMLDataProcessor;

			beforeEach(() => {
				processor = new XMLDataProcessor();
			});

			it("should process valid XML data successfully", () => {
				const spy = vi.spyOn(console, "log").mockImplementation(() => {});

				const xmlData = `
          <record id="1"><name>Alice</name><value>100.50</value></record>
          <record id="2"><name>Bob</name><value>200.75</value></record>
        `;

				const result = processor.processData(xmlData);

				expect(result.success).toBe(true);
				expect(result.recordsProcessed).toBe(2);
				expect(result.data?.[0]).toMatchObject({
					id: "1",
					name: "Alice",
					value: 100.5,
					source: "XML",
				});

				spy.mockRestore();
			});

			it("should handle invalid XML data", () => {
				const spy = vi.spyOn(console, "log").mockImplementation(() => {});

				const invalidXml = `
          <record><name>Alice</name><value>100</value></record>
          <record id="2"><value>invalid</value></record>
        `;

				const result = processor.processData(invalidXml);

				expect(result.success).toBe(false);
				expect(result.error).toContain("Validação falhou");

				spy.mockRestore();
			});

			it("should parse XML structure correctly", () => {
				const spy = vi.spyOn(console, "log").mockImplementation(() => {});

				const xmlData =
					'<record id="test"><name>Test Name</name><value>123.45</value></record>';

				const result = processor.processData(xmlData);

				expect(result.success).toBe(true);
				expect(result.data?.[0]).toMatchObject({
					id: "test",
					name: "Test Name",
					value: 123.45,
					source: "XML",
				});

				spy.mockRestore();
			});
		});

		describe("BatchDataProcessor", () => {
			let processor: BatchDataProcessor;

			beforeEach(() => {
				processor = new BatchDataProcessor();
			});

			it("should process mixed data types in batch", () => {
				const spy = vi.spyOn(console, "log").mockImplementation(() => {});

				const batchData = {
					items: [
						{
							type: "csv" as const,
							data: [["1", "Alice", "100"]],
						},
						{
							type: "json" as const,
							data: [{ id: 2, name: "Bob", value: 200 }],
						},
					],
				};

				const result = processor.processData(batchData);

				expect(result.success).toBe(true);
				expect(result.recordsProcessed).toBe(2);

				// Should contain records from both CSV and JSON
				const sources = result.data?.map((record) => record.source) || [];
				expect(sources).toContain("CSV");
				expect(sources).toContain("JSON");

				spy.mockRestore();
			});

			it("should handle empty batch", () => {
				const spy = vi.spyOn(console, "log").mockImplementation(() => {});

				const emptyBatch = {
					items: [],
				};

				const result = processor.processData(emptyBatch);

				expect(result.success).toBe(false);
				expect(result.error).toContain("Nenhum dado válido encontrado");

				spy.mockRestore();
			});

			it("should handle batch with unsupported type", () => {
				const spy = vi.spyOn(console, "log").mockImplementation(() => {});

				const batchWithUnsupported = {
					items: [
						{
							type: "unsupported" as any,
							data: ["some", "data"],
						},
					],
				};

				const result = processor.processData(batchWithUnsupported);

				expect(result.success).toBe(false);
				expect(result.error).toContain("Nenhum dado válido encontrado");

				spy.mockRestore();
			});
		});

		describe("Error Handling and Processing Results", () => {
			it("should measure processing time", () => {
				const spy = vi.spyOn(console, "log").mockImplementation(() => {});

				const processor = new CSVDataProcessor();
				const csvData = [["1", "Alice", "100"]];

				const result = processor.processData(csvData);

				expect(result.processingTime).toBeGreaterThan(0);
				expect(typeof result.processingTime).toBe("number");

				spy.mockRestore();
			});

			it("should handle processing exceptions", () => {
				const spy = vi.spyOn(console, "log").mockImplementation(() => {});
				const errorSpy = vi
					.spyOn(console, "error")
					.mockImplementation(() => {});

				// Create a processor that will throw an error
				class ErrorProcessor extends CSVDataProcessor {
					protected transformData(): never {
						throw new Error("Simulated processing error");
					}
				}

				const processor = new ErrorProcessor();
				const csvData = [["1", "Alice", "100"]];

				const result = processor.processData(csvData);

				expect(result.success).toBe(false);
				expect(result.error).toBe("Simulated processing error");
				expect(result.processingTime).toBeGreaterThan(0);

				spy.mockRestore();
				errorSpy.mockRestore();
			});

			it("should provide detailed validation results", () => {
				const processor = new CSVDataProcessor();

				// Access protected method for testing (using type assertion)
				const validation = (processor as any).validateData([
					["1", "Alice", "100"],
					["", "Bob", "invalid"],
				]);

				expect(validation.isValid).toBe(false);
				expect(validation.errors).toHaveLength(2);
				expect(validation.errors[0]).toContain("ID vazio");
				expect(validation.errors[1]).toContain("valor inválido");
			});
		});

		it("should demonstrate complete solution", () => {
			const spy = vi.spyOn(console, "log").mockImplementation(() => {});

			demonstrateSolution();

			expect(spy).toHaveBeenCalledWith(
				expect.stringContaining("DEPOIS (Solução Template Method)"),
			);

			spy.mockRestore();
		});
	});
});
