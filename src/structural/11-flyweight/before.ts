// ANTES: Sem o padrão Flyweight
// Criação individual de objetos similares desperdiça memória

// Sistema de renderização de texto sem Flyweight
class Character {
	private char: string;
	private font: string;
	private size: number;
	private color: string;
	private x: number;
	private y: number;
	private style: string;

	constructor(
		char: string,
		font: string,
		size: number,
		color: string,
		x: number,
		y: number,
		style: string = "normal",
	) {
		this.char = char;
		this.font = font;
		this.size = size;
		this.color = color;
		this.x = x;
		this.y = y;
		this.style = style;
	}

	render(): string {
		return `Char '${this.char}' at (${this.x}, ${this.y}) - ${this.font} ${this.size}px ${this.color} ${this.style}`;
	}

	getMemoryFootprint(): string {
		// Simula o tamanho de memória do objeto
		const charSize = this.char.length * 2; // Unicode chars
		const fontSize = this.font.length * 2;
		const styleSize = this.style.length * 2;
		const numberSize = 8; // cada número (x, y, size) = 8 bytes
		const colorSize = this.color.length * 2;

		const total = charSize + fontSize + styleSize + numberSize * 3 + colorSize;
		return `${total} bytes`;
	}

	move(x: number, y: number): void {
		this.x = x;
		this.y = y;
	}
}

// Editor de texto problemático
class TextEditorWithoutFlyweight {
	private characters: Character[] = [];

	addText(
		text: string,
		x: number,
		y: number,
		font: string = "Arial",
		size: number = 12,
		color: string = "black",
	): void {
		for (let i = 0; i < text.length; i++) {
			const char = new Character(
				text[i],
				font,
				size,
				color,
				x + i * size * 0.6, // Espaçamento horizontal
				y,
				"normal",
			);
			this.characters.push(char);
		}
	}

	addStyledText(
		text: string,
		x: number,
		y: number,
		font: string,
		size: number,
		color: string,
		style: string,
	): void {
		for (let i = 0; i < text.length; i++) {
			const char = new Character(
				text[i],
				font,
				size,
				color,
				x + i * size * 0.6,
				y,
				style,
			);
			this.characters.push(char);
		}
	}

	render(): string {
		let output = "Renderizando documento:\n";
		this.characters.forEach((char, index) => {
			output += `${index + 1}: ${char.render()}\n`;
		});
		return output;
	}

	getMemoryUsage(): {
		totalCharacters: number;
		totalMemory: string;
		averagePerChar: string;
	} {
		let totalBytes = 0;

		this.characters.forEach((char) => {
			const footprint = char.getMemoryFootprint();
			totalBytes += parseInt(footprint.split(" ")[0]);
		});

		return {
			totalCharacters: this.characters.length,
			totalMemory: `${totalBytes} bytes`,
			averagePerChar: `${Math.round(totalBytes / this.characters.length)} bytes`,
		};
	}

	clear(): void {
		this.characters = [];
	}
}

// Sistema de partículas sem Flyweight
class Particle {
	private type: string;
	private color: string;
	private sprite: string; // URL da imagem
	private x: number;
	private y: number;
	private velocityX: number;
	private velocityY: number;
	private life: number;

	constructor(
		type: string,
		color: string,
		sprite: string,
		x: number,
		y: number,
		velocityX: number,
		velocityY: number,
		life: number = 100,
	) {
		this.type = type;
		this.color = color;
		this.sprite = sprite;
		this.x = x;
		this.y = y;
		this.velocityX = velocityX;
		this.velocityY = velocityY;
		this.life = life;
	}

	update(): void {
		this.x += this.velocityX;
		this.y += this.velocityY;
		this.life--;
	}

	render(): string {
		return `${this.type} particle at (${this.x.toFixed(1)}, ${this.y.toFixed(1)}) - ${this.color} (life: ${this.life})`;
	}

	isAlive(): boolean {
		return this.life > 0;
	}

	getMemorySize(): number {
		// Simula tamanho em bytes
		return (
			this.type.length * 2 +
			this.color.length * 2 +
			this.sprite.length * 2 +
			8 * 5
		); // 5 números
	}
}

class ParticleSystemWithoutFlyweight {
	private particles: Particle[] = [];

	createFireworks(x: number, y: number, count: number = 50): void {
		for (let i = 0; i < count; i++) {
			const particle = new Particle(
				"firework",
				this.getRandomColor(),
				"firework.png",
				x,
				y,
				(Math.random() - 0.5) * 10,
				(Math.random() - 0.5) * 10,
				Math.random() * 100 + 50,
			);
			this.particles.push(particle);
		}
	}

	createSmoke(x: number, y: number, count: number = 30): void {
		for (let i = 0; i < count; i++) {
			const particle = new Particle(
				"smoke",
				"gray",
				"smoke.png",
				x + Math.random() * 20 - 10,
				y,
				(Math.random() - 0.5) * 2,
				-Math.random() * 3,
				Math.random() * 200 + 100,
			);
			this.particles.push(particle);
		}
	}

	update(): void {
		this.particles.forEach((particle) => particle.update());
		this.particles = this.particles.filter((particle) => particle.isAlive());
	}

	render(): string {
		let output = `Renderizando ${this.particles.length} partículas:\n`;
		this.particles.slice(0, 10).forEach((particle, index) => {
			output += `${index + 1}: ${particle.render()}\n`;
		});
		if (this.particles.length > 10) {
			output += `... e mais ${this.particles.length - 10} partículas\n`;
		}
		return output;
	}

	getMemoryUsage(): {
		totalParticles: number;
		totalMemory: number;
		averagePerParticle: number;
	} {
		const totalMemory = this.particles.reduce(
			(sum, particle) => sum + particle.getMemorySize(),
			0,
		);

		return {
			totalParticles: this.particles.length,
			totalMemory,
			averagePerParticle: Math.round(totalMemory / this.particles.length) || 0,
		};
	}

	clear(): void {
		this.particles = [];
	}

	private getRandomColor(): string {
		const colors = [
			"red",
			"blue",
			"green",
			"yellow",
			"purple",
			"orange",
			"pink",
		];
		return colors[Math.floor(Math.random() * colors.length)];
	}
}

export function demonstrateProblems() {
	console.log("🚨 ANTES (Problemático): Sem padrão Flyweight");
	console.log("Cada objeto armazena TODOS os dados, incluindo os repetidos...");
	console.log("");

	// Problema 1: Editor de texto
	console.log("=== PROBLEMA 1: EDITOR DE TEXTO ===");
	const editor = new TextEditorWithoutFlyweight();

	// Adicionando texto repetitivo
	editor.addText("Hello World! ", 10, 20, "Arial", 12, "black");
	editor.addText("Hello World! ", 10, 40, "Arial", 12, "black");
	editor.addText("Hello World! ", 10, 60, "Arial", 12, "red");
	editor.addStyledText("BOLD TEXT", 10, 80, "Arial", 14, "black", "bold");

	console.log("Texto renderizado (primeiros 10 caracteres):");
	const rendered = editor.render();
	console.log(rendered.split("\n").slice(0, 12).join("\n"));

	const memoryUsage = editor.getMemoryUsage();
	console.log("\n Uso de memória:");
	console.log(`Total de caracteres: ${memoryUsage.totalCharacters}`);
	console.log(`Memória total: ${memoryUsage.totalMemory}`);
	console.log(`Média por caractere: ${memoryUsage.averagePerChar}`);

	// Problema 2: Sistema de partículas
	console.log("\n=== PROBLEMA 2: SISTEMA DE PARTÍCULAS ===");
	const particleSystem = new ParticleSystemWithoutFlyweight();

	// Criando múltiplos efeitos
	particleSystem.createFireworks(100, 100, 20);
	particleSystem.createFireworks(200, 150, 15);
	particleSystem.createSmoke(150, 200, 25);

	console.log("Partículas iniciais:");
	console.log(particleSystem.render());

	const particleMemory = particleSystem.getMemoryUsage();
	console.log("\n Uso de memória das partículas:");
	console.log(`Total de partículas: ${particleMemory.totalParticles}`);
	console.log(`Memória total: ${particleMemory.totalMemory} bytes`);
	console.log(
		`Média por partícula: ${particleMemory.averagePerParticle} bytes`,
	);

	// Simulando evolução
	console.log("\nApós algumas atualizações:");
	for (let i = 0; i < 5; i++) {
		particleSystem.update();
	}

	const finalMemory = particleSystem.getMemoryUsage();
	console.log(`Partículas restantes: ${finalMemory.totalParticles}`);
	console.log(`Memória restante: ${finalMemory.totalMemory} bytes`);

	console.log("\nProblemas identificados:");
	console.log("- Muitos objetos similares com dados duplicados");
	console.log('- Font "Arial", cor "black" repetidas centenas de vezes');
	console.log('- Sprite "firework.png" duplicado para cada partícula');
	console.log("- Uso excessivo de memória");
	console.log("- Performance ruim com muitos objetos");
	console.log("- Desperdício de recursos do sistema");
}
