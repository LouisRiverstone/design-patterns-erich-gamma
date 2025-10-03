/**
 * Design Patterns: Elements of Reusable Object-Oriented Software
 * Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides (Gang of Four)
 *
 * Este projeto demonstra todos os 23 padrões de design do livro clássico GoF
 * implementados em TypeScript com Bun.
 */

console.log(" Design Patterns - Gang of Four (GoF)");
console.log(" Implementação completa dos 23 padrões em TypeScript + Bun\n");

// ================== PADRÕES CRIACIONAIS (5/5) ==================
console.log(" PADRÕES CRIACIONAIS (5/5 implementados)");

// 1. Abstract Factory - Famílias de objetos relacionados
import { demonstrateSolution as abstractFactory } from "./src/creational/01-abstract-factory/after";
console.log("\n1. Abstract Factory - Criação de famílias de objetos");
abstractFactory();

// 2. Builder - Construção passo a passo de objetos complexos
import { demonstrateSolution as builder } from "./src/creational/02-builder/after";
console.log("\n2. Builder - Construção passo a passo");
builder();

// 3. Factory Method - Criação de objetos através de subclasses
import { demonstrateSolution as factoryMethod } from "./src/creational/03-factory-method/after";
console.log("\n3. Factory Method - Criação por subclasses");
factoryMethod();

// 4. Prototype - Clonagem de objetos
import { demonstrateSolution as prototype } from "./src/creational/04-prototype/after";
console.log("\n4. Prototype - Clonagem de objetos");
prototype();

// 5. Singleton - Uma única instância global
import { demonstrateSolution as singleton } from "./src/creational/05-singleton/after";
console.log("\n5. Singleton - Instância única");
singleton();

// ================== PADRÕES ESTRUTURAIS (7/7) ==================
console.log("\n\nPADRÕES ESTRUTURAIS (7/7 implementados)");

// 6. Adapter - Compatibilidade entre interfaces
import { demonstrateSolution as adapter } from "./src/structural/06-adapter/after";
console.log("\n6. Adapter - Compatibilidade de interfaces");
adapter();

// 7. Bridge - Separação entre abstração e implementação
import { demonstrateSolution as bridge } from "./src/structural/07-bridge/after";
console.log("\n7. Bridge - Separação abstração/implementação");
bridge();

// 8. Composite - Estruturas em árvore
import { demonstrateSolution as composite } from "./src/structural/08-composite/after";
console.log("\n8. Composite - Estruturas hierárquicas");
composite();

// 9. Decorator - Adição dinâmica de comportamentos
import { demonstrateSolution as decorator } from "./src/structural/09-decorator/after";
console.log("\n9. Decorator - Comportamentos dinâmicos");
decorator();

// 10. Facade - Interface simplificada
import { demonstrateSolution as facade } from "./src/structural/10-facade/after";
console.log("\n10. Facade - Interface simplificada");
facade();

// 11. Flyweight - Compartilhamento eficiente de objetos
import { demonstrateSolution as flyweight } from "./src/structural/11-flyweight/after";
console.log("\n11. Flyweight - Compartilhamento eficiente");
flyweight();

// 12. Proxy - Controle de acesso a objetos
import { demonstrateSolution as proxy } from "./src/structural/12-proxy/after";
console.log("\n12. Proxy - Controle de acesso");
proxy();

// ================== PADRÕES COMPORTAMENTAIS (11/11) ==================
console.log("\n\nPADRÕES COMPORTAMENTAIS (11/11 implementados)");

// 13. Chain of Responsibility - Cadeia de responsabilidade
import { demonstrateSolution as chainOfResponsibility } from "./src/behavioral/13-chain-of-responsibility/after";
console.log("\n13. Chain of Responsibility - Cadeia de responsabilidade");
chainOfResponsibility();

// 14. Command - Encapsulamento de comandos
import { demonstrateSolution as command } from "./src/behavioral/14-command/after";
console.log("\n14. Command - Encapsulamento de comandos");
command();

// 15. Interpreter - Interpretação de linguagens
import { demonstrateSolution as interpreter } from "./src/behavioral/15-interpreter/after";
console.log("\n15. Interpreter - Interpretação de linguagens");
interpreter();

// 16. Iterator - Acesso sequencial a elementos
import { demonstrateSolution as iterator } from "./src/behavioral/16-iterator/after";
console.log("\n16. Iterator - Acesso sequencial");
iterator();

// 17. Mediator - Comunicação entre objetos
import { demonstrateSolution as mediator } from "./src/behavioral/17-mediator/after";
console.log("\n17. Mediator - Comunicação centralizada");
mediator();

// 18. Memento - Captura e restauração de estado
import { demonstrateSolution as memento } from "./src/behavioral/18-memento/after";
console.log("\n18. Memento - Captura de estado");
memento();

// 19. Observer - Notificação de mudanças
import { demonstrateSolution as observer } from "./src/behavioral/19-observer/after";
console.log("\n19. Observer - Notificação de mudanças");
observer();

// 20. State - Comportamento baseado em estado
import { demonstrateSolution as state } from "./src/behavioral/20-state/after";
console.log("\n20. State - Comportamento por estado");
state();

// 21. Strategy - Algoritmos intercambiáveis
import { demonstrateSolution as strategy } from "./src/behavioral/21-strategy/after";
console.log("\n21. Strategy - Algoritmos intercambiáveis");
strategy();

// 22. Template Method - Algoritmo com etapas customizáveis
import { demonstrateSolution as templateMethod } from "./src/behavioral/22-template-method/after";
console.log("\n22. Template Method - Algoritmo template");
templateMethod();

// 23. Visitor - Operações sobre estruturas de objetos
import { demonstrateSolution as visitor } from "./src/behavioral/23-visitor/after";
console.log("\n23. Visitor - Operações sobre estruturas");
visitor();

console.log("\n\nRESUMO DO PROGRESSO");
console.log("Padrões Criacionais: 5/5 (100%)");
console.log("Padrões Estruturais: 7/7 (100%)");
console.log("Padrões Comportamentais: 11/11 (100%)");
console.log("Total Geral: 23/23 (100%)");
console.log("\nTodos os 23 padrões GoF implementados com sucesso!");

console.log("\nPara executar os testes de um padrão específico:");
console.log("bun test ./src/[categoria]/[numero-nome]/test.ts");
console.log("\nPara executar todos os testes:");
console.log("bun test");

export {
	// Criacionais
	abstractFactory,
	builder,
	factoryMethod,
	prototype,
	singleton,
	// Estruturais
	adapter,
	bridge,
	composite,
	decorator,
	facade,
	flyweight,
	proxy,
	// Comportamentais
	chainOfResponsibility,
	command,
	interpreter,
	iterator,
	mediator,
	memento,
	observer,
	state,
	strategy,
	templateMethod,
	visitor,
};
