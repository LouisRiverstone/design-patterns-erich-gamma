/**
 * Suite de testes completa para todos os padrões de design implementados
 */

// =================== PADRÕES CRIACIONAIS ===================
console.log("Testando Padrões Criacionais...");
import "./src/creational/01-abstract-factory/test";
import "./src/creational/02-builder/test";
import "./src/creational/03-factory-method/test";
import "./src/creational/04-prototype/test";
import "./src/creational/05-singleton/test";

// =================== PADRÕES ESTRUTURAIS ===================
console.log("Testando Padrões Estruturais...");
import "./src/structural/06-adapter/test";
import "./src/structural/07-bridge/test";
import "./src/structural/08-composite/test";
import "./src/structural/09-decorator/test";
import "./src/structural/10-facade/test";
import "./src/structural/11-flyweight/test";
import "./src/structural/12-proxy/test";

// =================== PADRÕES COMPORTAMENTAIS ===================
console.log("Testando Padrões Comportamentais...");
import "./src/behavioral/13-chain-of-responsibility/test";
import "./src/behavioral/14-command/test";
import "./src/behavioral/15-interpreter/test";
import "./src/behavioral/16-iterator/test";
import "./src/behavioral/17-mediator/test";
import "./src/behavioral/18-memento/test";
import "./src/behavioral/19-observer/test";
import "./src/behavioral/20-state/test";
import "./src/behavioral/21-strategy/test";
import "./src/behavioral/22-template-method/test";
import "./src/behavioral/23-visitor/test";

console.log("Todos os 23 padrões GoF carregados e testados com sucesso!");
