// Base template class
export abstract class DataProcessor<TInput, TRaw, TProcessed> {
	// Template method - defines the algorithm skeleton
	public processData(input: TInput): ProcessingResult<TProcessed> {
		console.log(`\n=== Iniciando processamento ${this.getProcessorName()} ===`);

		const startTime = Date.now();

		try {
			// Step 1: Load data
			console.log("1. Carregando dados...");
			const rawData = this.loadData(input);

			// Step 2: Optional preprocessing
			console.log("2. Pré-processando dados...");
			const preprocessedData = this.preprocessData?.(rawData) || rawData;

			// Step 3: Validate data
			console.log("3. Validando dados...");
			const validation = this.validateData(preprocessedData);
			if (!validation.isValid) {
				return {
					success: false,
					error: `Validação falhou: ${validation.errors.join(", ")}`,
					processingTime: Math.max(Date.now() - startTime, 1),
				};
			}

			// Step 4: Transform data
			console.log("4. Transformando dados...");
			const transformedData = this.transformData(preprocessedData);

			// Step 5: Optional postprocessing
			console.log("5. Pós-processando dados...");
			const postprocessedData =
				this.postprocessData?.(transformedData) || transformedData;

			// Step 6: Save data
			console.log("6. Salvando dados...");
			const savedData = this.saveData(postprocessedData);

			const processingTime = Math.max(Date.now() - startTime, 1);
			console.log(` Processamento concluído em ${processingTime}ms`);

			return {
				success: true,
				data: savedData,
				processingTime,
				recordsProcessed: Array.isArray(savedData) ? savedData.length : 1,
			};
		} catch (error) {
			const processingTime = Math.max(Date.now() - startTime, 1);
			console.error(`Erro no processamento: ${error}`);

			return {
				success: false,
				error: error instanceof Error ? error.message : String(error),
				processingTime,
			};
		}
	}

	// Abstract methods that subclasses must implement
	protected abstract getProcessorName(): string;
	protected abstract loadData(input: TInput): TRaw[];
	protected abstract validateData(data: TRaw[]): ValidationResult;
	protected abstract transformData(data: TRaw[]): TProcessed[];
	protected abstract saveData(data: TProcessed[]): TProcessed[];

	// Hook methods (optional - subclasses can override)
	protected preprocessData?(data: TRaw[]): TRaw[];
	protected postprocessData?(data: TProcessed[]): TProcessed[];

	// Common utility methods available to all subclasses
	protected logProgress(message: string): void {
		console.log(`[${this.getProcessorName()}] ${message}`);
	}

	protected generateId(): string {
		return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	}
}

// Interfaces
export interface ValidationResult {
	isValid: boolean;
	errors: string[];
}

export interface ProcessingResult<T> {
	success: boolean;
	data?: T[];
	error?: string;
	processingTime: number;
	recordsProcessed?: number;
}

export interface StandardRecord {
	id: string;
	name: string;
	value: number;
	processedAt: Date;
	source: string;
	batchId: string;
}

// Concrete implementations
export class CSVDataProcessor extends DataProcessor<
	string[][],
	string[],
	StandardRecord
> {
	protected getProcessorName(): string {
		return "CSV";
	}

	protected loadData(csvData: string[][]): string[][] {
		this.logProgress(`Carregando ${csvData.length} linhas CSV`);
		return csvData;
	}

	protected validateData(rawData: string[][]): ValidationResult {
		const errors: string[] = [];

		rawData.forEach((row, index) => {
			if (row.length < 3) {
				errors.push(`Linha ${index + 1}: campos insuficientes`);
			}
			if (!row[0] || !row[0].trim()) {
				errors.push(`Linha ${index + 1}: ID vazio`);
			}
			if (row[2] && isNaN(parseFloat(row[2]))) {
				errors.push(`Linha ${index + 1}: valor inválido`);
			}
		});

		return {
			isValid: errors.length === 0,
			errors,
		};
	}

	protected transformData(rawLines: string[][]): StandardRecord[] {
		const batchId = this.generateId();

		return rawLines.map((row) => {
			const [id, name, valueStr] = row;
			return {
				id: id.trim(),
				name: name.trim(),
				value: parseFloat(valueStr),
				processedAt: new Date(),
				source: "CSV",
				batchId,
			};
		});
	}

	protected saveData(data: StandardRecord[]): StandardRecord[] {
		this.logProgress(`Salvando ${data.length} registros CSV processados`);
		// Simulate saving to database/file
		return data;
	}

	// Override hook for CSV-specific preprocessing
	protected preprocessData(rawLines: string[][]): string[][] {
		this.logProgress("Removendo linhas vazias e normalizando dados");
		return rawLines
			.filter((row) => row.some((cell) => cell && cell.trim().length > 0))
			.map((row) => row.map((cell) => cell.replace(/\s+/g, " ").trim()));
	}
}

export class JSONDataProcessor extends DataProcessor<
	any[],
	any,
	StandardRecord
> {
	protected getProcessorName(): string {
		return "JSON";
	}

	protected loadData(jsonData: any[]): any[] {
		this.logProgress(`Carregando ${jsonData.length} objetos JSON`);
		return jsonData;
	}

	protected validateData(data: any[]): ValidationResult {
		const errors: string[] = [];

		data.forEach((item, index) => {
			if (!item.id) {
				errors.push(`Objeto ${index + 1}: ID ausente`);
			}
			if (!item.name) {
				errors.push(`Objeto ${index + 1}: nome ausente`);
			}
			if (typeof item.value !== "number" || isNaN(item.value)) {
				errors.push(`Objeto ${index + 1}: valor inválido`);
			}
		});

		return {
			isValid: errors.length === 0,
			errors,
		};
	}

	protected transformData(data: any[]): StandardRecord[] {
		const batchId = this.generateId();

		return data.map((item) => ({
			id: String(item.id),
			name: String(item.name),
			value: Number(item.value),
			processedAt: new Date(),
			source: "JSON",
			batchId,
		}));
	}

	protected saveData(data: StandardRecord[]): StandardRecord[] {
		this.logProgress(`Salvando ${data.length} registros JSON processados`);
		return data;
	}

	// Override hook for JSON-specific postprocessing
	protected postprocessData(data: StandardRecord[]): StandardRecord[] {
		this.logProgress("Aplicando validações extras e enriquecimento JSON");
		return data.map((record) => ({
			...record,
			value: Math.round(record.value * 100) / 100, // Round to 2 decimal places
			metadata: {
				processor: "JSON",
				enriched: true,
			},
		}));
	}
}

export class XMLDataProcessor extends DataProcessor<
	string,
	XMLNode,
	StandardRecord
> {
	protected getProcessorName(): string {
		return "XML";
	}

	protected loadData(xmlString: string): XMLNode[] {
		this.logProgress("Parsing XML data");
		// Simplified XML parsing simulation
		const nodes = this.parseXML(xmlString);
		return nodes;
	}

	protected validateData(nodes: XMLNode[]): ValidationResult {
		const errors: string[] = [];

		nodes.forEach((node, index) => {
			if (!node.attributes.id) {
				errors.push(`Nó ${index + 1}: atributo ID ausente`);
			}
			if (!node.children.find((child) => child.tag === "name")) {
				errors.push(`Nó ${index + 1}: elemento name ausente`);
			}
			const valueNode = node.children.find((child) => child.tag === "value");
			if (!valueNode || isNaN(parseFloat(valueNode.text))) {
				errors.push(`Nó ${index + 1}: valor inválido`);
			}
		});

		return {
			isValid: errors.length === 0,
			errors,
		};
	}

	protected transformData(nodes: XMLNode[]): StandardRecord[] {
		const batchId = this.generateId();

		return nodes.map((node) => {
			const nameNode = node.children.find((child) => child.tag === "name");
			const valueNode = node.children.find((child) => child.tag === "value");

			return {
				id: node.attributes.id,
				name: nameNode?.text || "",
				value: parseFloat(valueNode?.text || "0"),
				processedAt: new Date(),
				source: "XML",
				batchId,
			};
		});
	}

	protected saveData(data: StandardRecord[]): StandardRecord[] {
		this.logProgress(`Salvando ${data.length} registros XML processados`);
		return data;
	}

	// XML-specific utility method
	private parseXML(xmlString: string): XMLNode[] {
		// Simplified XML parsing - in real world, use proper XML parser
		const records: XMLNode[] = [];

		// Simulate parsing <record id="1"><name>Alice</name><value>100</value></record>
		const recordRegex = /<record[^>]*id="([^"]*)"[^>]*>(.*?)<\/record>/g;
		let match;

		while ((match = recordRegex.exec(xmlString)) !== null) {
			const [, id, content] = match;
			const nameMatch = content.match(/<name>(.*?)<\/name>/);
			const valueMatch = content.match(/<value>(.*?)<\/value>/);

			records.push({
				tag: "record",
				attributes: { id },
				children: [
					{
						tag: "name",
						attributes: {},
						children: [],
						text: nameMatch?.[1] || "",
					},
					{
						tag: "value",
						attributes: {},
						children: [],
						text: valueMatch?.[1] || "",
					},
				],
				text: "",
			});
		}

		return records;
	}
}

// XML Node interface for demonstration
interface XMLNode {
	tag: string;
	attributes: Record<string, string>;
	children: XMLNode[];
	text: string;
}

// Advanced processor with multiple processing strategies
export class BatchDataProcessor extends DataProcessor<
	BatchInput,
	any,
	StandardRecord
> {
	private strategies: Map<string, DataProcessor<any, any, StandardRecord>> =
		new Map();

	constructor() {
		super();
		this.strategies.set("csv", new CSVDataProcessor());
		this.strategies.set("json", new JSONDataProcessor());
		this.strategies.set("xml", new XMLDataProcessor());
	}

	protected getProcessorName(): string {
		return "Batch";
	}

	protected loadData(input: BatchInput): any[] {
		this.logProgress(`Processando lote com ${input.items.length} itens`);
		const allData: any[] = [];

		input.items.forEach((item) => {
			const processor = this.strategies.get(item.type);
			if (processor) {
				// Process each item type with appropriate processor
				const result = processor.processData(item.data);
				if (result.success && result.data) {
					allData.push(...result.data);
				}
			}
		});

		return allData;
	}

	protected validateData(data: any[]): ValidationResult {
		// Batch validation can aggregate results from individual processors
		return {
			isValid: data.length > 0,
			errors: data.length === 0 ? ["Nenhum dado válido encontrado"] : [],
		};
	}

	protected transformData(data: any[]): StandardRecord[] {
		// Data is already transformed by individual processors
		return data;
	}

	protected saveData(data: StandardRecord[]): StandardRecord[] {
		this.logProgress(`Salvando lote consolidado com ${data.length} registros`);
		return data;
	}
}

interface BatchInput {
	items: Array<{
		type: "csv" | "json" | "xml";
		data: any;
	}>;
}

export function demonstrateSolution() {
	console.log(
		"DEPOIS (Solução Template Method) - Algoritmo reutilizável com variações",
	);

	// CSV Processing
	const csvProcessor = new CSVDataProcessor();
	const csvData = [
		["1", "Alice", "100.50"],
		["2", "Bob", "200.75"],
		["3", "Charlie", "150.25"],
	];

	const csvResult = csvProcessor.processData(csvData);
	console.log(
		"Resultado CSV:",
		csvResult.success
			? `${csvResult.recordsProcessed} registros`
			: csvResult.error,
	);

	// JSON Processing
	const jsonProcessor = new JSONDataProcessor();
	const jsonData = [
		{ id: 4, name: "Diana", value: 300.33 },
		{ id: 5, name: "Eve", value: 250.67 },
	];

	const jsonResult = jsonProcessor.processData(jsonData);
	console.log(
		"Resultado JSON:",
		jsonResult.success
			? `${jsonResult.recordsProcessed} registros`
			: jsonResult.error,
	);

	// XML Processing
	const xmlProcessor = new XMLDataProcessor();
	const xmlData = `
    <record id="6"><name>Frank</name><value>400.50</value></record>
    <record id="7"><name>Grace</name><value>350.25</value></record>
  `;

	const xmlResult = xmlProcessor.processData(xmlData);
	console.log(
		"Resultado XML:",
		xmlResult.success
			? `${xmlResult.recordsProcessed} registros`
			: xmlResult.error,
	);

	// Batch Processing
	console.log("\n=== Processamento em Lote ===");
	const batchProcessor = new BatchDataProcessor();
	const batchData: BatchInput = {
		items: [
			{ type: "csv", data: [["8", "Henry", "180"]] },
			{ type: "json", data: [{ id: 9, name: "Ivy", value: 220 }] },
		],
	};

	const batchResult = batchProcessor.processData(batchData);
	console.log(
		"Resultado Batch:",
		batchResult.success
			? `${batchResult.recordsProcessed} registros`
			: batchResult.error,
	);

	// Error handling
	console.log("\n=== Tratamento de Erro ===");
	const invalidData = [["invalid", "", "not-a-number"]];
	const errorResult = csvProcessor.processData(invalidData);
	console.log("Resultado com erro:", errorResult.error);
}
