export function demonstrateProblems() {
	console.log("ANTES (Problemático) - Código duplicado em classes similares");

	class CSVDataProcessor {
		processData(data: string[][]): void {
			console.log("Processando dados CSV...");

			// Lógica específica CSV
			console.log("Carregando dados CSV...");
			const loadedData = this.loadCSVData(data);

			console.log("Validando dados CSV...");
			if (!this.validateCSVData(loadedData)) {
				throw new Error("Dados CSV inválidos");
			}

			console.log("Transformando dados CSV...");
			const transformedData = this.transformCSVData(loadedData);

			console.log("Salvando dados CSV...");
			this.saveCSVData(transformedData);

			console.log("Processamento CSV concluído!");
		}

		private loadCSVData(data: string[][]): any[] {
			return data.map((row) => ({
				id: row[0],
				name: row[1],
				value: parseFloat(row[2]),
			}));
		}

		private validateCSVData(data: any[]): boolean {
			return data.every((item) => item.id && item.name && !isNaN(item.value));
		}

		private transformCSVData(data: any[]): any[] {
			return data.map((item) => ({
				...item,
				processedAt: new Date(),
				source: "CSV",
			}));
		}

		private saveCSVData(data: any[]): void {
			console.log(`Salvando ${data.length} registros CSV`);
		}
	}

	class JSONDataProcessor {
		processData(data: any[]): void {
			console.log("Processando dados JSON...");

			// Lógica específica JSON (muito similar ao CSV!)
			console.log("Carregando dados JSON...");
			const loadedData = this.loadJSONData(data);

			console.log("Validando dados JSON...");
			if (!this.validateJSONData(loadedData)) {
				throw new Error("Dados JSON inválidos");
			}

			console.log("Transformando dados JSON...");
			const transformedData = this.transformJSONData(loadedData);

			console.log("Salvando dados JSON...");
			this.saveJSONData(transformedData);

			console.log("Processamento JSON concluído!");
		}

		private loadJSONData(data: any[]): any[] {
			return data.map((item) => ({
				id: item.id,
				name: item.name,
				value: item.value,
			}));
		}

		private validateJSONData(data: any[]): boolean {
			return data.every(
				(item) => item.id && item.name && typeof item.value === "number",
			);
		}

		private transformJSONData(data: any[]): any[] {
			return data.map((item) => ({
				...item,
				processedAt: new Date(),
				source: "JSON",
			}));
		}

		private saveJSONData(data: any[]): void {
			console.log(`Salvando ${data.length} registros JSON`);
		}
	}

	const csvProcessor = new CSVDataProcessor();
	const jsonProcessor = new JSONDataProcessor();

	const csvData = [
		["1", "Alice", "100"],
		["2", "Bob", "200"],
	];
	const jsonData = [
		{ id: "1", name: "Alice", value: 100 },
		{ id: "2", name: "Bob", value: 200 },
	];

	csvProcessor.processData(csvData);
	jsonProcessor.processData(jsonData);

	console.log(
		"Problemas: código duplicado, estrutura similar, difícil manutenção",
	);
}
