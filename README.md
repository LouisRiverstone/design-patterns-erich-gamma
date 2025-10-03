# 🎯 Design Patterns: Gang of Four

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-1.2.0+-orange.svg)](https://bun.sh)
[![Tests](https://img.shields.io/badge/tests-23%2F23-brightgreen.svg)](#-qualidade-dos-testes)
[![Patterns](https://img.shields.io/badge/patterns-23%2F23-brightgreen.svg)](#-progresso-atual)

> Implementação completa dos **23 padrões de design** do livro clássico "Design Patterns: Elements of Reusable Object-Oriented Software" (Gang of Four) em TypeScript moderno usando Bun.

## 📋 Índice

- [🎯 Objetivo](#-objetivo)
- [🏗️ Estrutura do Projeto](#️-estrutura-do-projeto)
- [📊 Progresso Atual](#-progresso-atual)
- [🚀 Como Executar](#-como-executar)
- [🧪 Qualidade dos Testes](#-qualidade-dos-testes)
- [🛠️ Tecnologias](#️-tecnologias)
- [📚 Documentação](#-documentação)
- [🎓 Aprendizados](#-aprendizados)
- [🤝 Contribuição](#-contribuição)

## 🎯 Objetivo

Este projeto demonstra cada padrão de design através de:

- ✅ **Implementações práticas** com cenários reais
- ✅ **Comparações "antes/depois"** mostrando problemas e soluções  
- ✅ **Testes abrangentes** validando cada implementação
- ✅ **Documentação detalhada** explicando conceitos e aplicações

## 🏗️ Estrutura do Projeto

```
design-pattern-erich-gama/
├── src/
│   ├── creational/          # Padrões Criacionais (5/5) ✅
│   │   ├── 01-abstract-factory/
│   │   ├── 02-builder/
│   │   ├── 03-factory-method/
│   │   ├── 04-prototype/
│   │   └── 05-singleton/
│   ├── structural/          # Padrões Estruturais (7/7) ✅
│   │   ├── 06-adapter/
│   │   ├── 07-bridge/
│   │   ├── 08-composite/
│   │   ├── 09-decorator/
│   │   ├── 10-facade/
│   │   ├── 11-flyweight/
│   │   └── 12-proxy/
│   └── behavioral/          # Padrões Comportamentais (11/11) ✅
│       ├── 13-chain-of-responsibility/
│       ├── 14-command/
│       ├── 15-interpreter/
│       ├── 16-iterator/
│       ├── 17-mediator/
│       ├── 18-memento/
│       ├── 19-observer/
│       ├── 20-state/
│       ├── 21-strategy/
│       ├── 22-template-method/
│       └── 23-visitor/
├── index.ts                 # Demonstração de todos os padrões
├── all-patterns.test.ts     # Suite de testes completa
└── README.md
```

### 📁 Estrutura de Cada Padrão

Cada padrão segue uma estrutura consistente:

```
XX-pattern-name/
├── before.ts          # ❌ Implementação problemática (sem o padrão)
├── after.ts           # ✅ Solução usando o padrão
├── test.ts            # 🧪 Testes abrangentes (15-40 testes por padrão)
└── README.md          # 📖 Documentação detalhada
```

## 📊 Progresso Atual

### 🏭 Padrões Criacionais (5/5 - 100%)

| Padrão | Status | Testes | Descrição |
|--------|---------|--------|-----------|
| 01. Abstract Factory | ✅ | 25 | Criação de famílias de objetos relacionados |
| 02. Builder | ✅ | 21 | Construção passo a passo de objetos complexos |
| 03. Factory Method | ✅ | 28 | Criação de objetos através de subclasses |
| 04. Prototype | ✅ | 30 | Clonagem eficiente de objetos |
| 05. Singleton | ✅ | 25 | Garantia de instância única |

### 🏗️ Padrões Estruturais (7/7 - 100%)

| Padrão | Status | Testes | Descrição |
|--------|---------|--------|-----------|
| 06. Adapter | ✅ | 25 | Compatibilidade entre interfaces incompatíveis |
| 07. Bridge | ✅ | 28 | Separação entre abstração e implementação |
| 08. Composite | ✅ | 18 | Estruturas hierárquicas em árvore |
| 09. Decorator | ✅ | 23 | Adição dinâmica de comportamentos |
| 10. Facade | ✅ | 31 | Interface simplificada para subsistemas |
| 11. Flyweight | ✅ | 35 | Compartilhamento eficiente de objetos |
| 12. Proxy | ✅ | 36 | Controle de acesso e lazy loading |

### 🧠 Padrões Comportamentais (11/11 - 100%)

| Padrão | Status | Testes | Descrição |
|--------|--------|--------|-----------|
| 13. Chain of Responsibility | ✅ | 6 | Cadeia de processadores |
| 14. Command | ✅ | 19 | Encapsulamento de operações |
| 15. Interpreter | ✅ | 27 | Interpretação de linguagens |
| 16. Iterator | ✅ | 30 | Acesso sequencial a elementos |
| 17. Mediator | ✅ | 18 | Comunicação centralizada |
| 18. Memento | ✅ | 19 | Captura e restauração de estado |
| 19. Observer | ✅ | 17 | Notificação de mudanças |
| 20. State | ✅ | 22 | Comportamento baseado em estado |
| 21. Strategy | ✅ | 22 | Algoritmos intercambiáveis |
| 22. Template Method | ✅ | 16 | Algoritmo com etapas customizáveis |
| 23. Visitor | ✅ | 27 | Operações sobre estruturas de objetos |

> **📈 Total: 23/23 padrões implementados (100%)**

## 🚀 Como Executar

### 📋 Pré-requisitos

- [Bun](https://bun.sh) v1.2.0 ou superior

###  Padrões Estruturais (7/7 - 100%)

| Padrão | Status | Testes | Descrição |
|--------|---------|--------|-----------|
| 06. Adapter | ✓ | 25 | Compatibilidade entre interfaces incompatíveis |
| 07. Bridge | ✓ | 28 | Separação entre abstração e implementação |
| 08. Composite | ✓ | 18 | Estruturas hierárquicas em árvore |
| 09. Decorator | ✓ | 23 | Adição dinâmica de comportamentos |
| 10. Facade | ✓ | 31 | Interface simplificada para subsistemas |
| 11. Flyweight | ✓ | 35 | Compartilhamento eficiente de objetos |
| 12. Proxy | ✓ | 36 | Controle de acesso e lazy loading |

### Padrões Comportamentais (11/11 - 100%)

| Padrão | Status | Testes | Descrição |
|--------|--------|--------|-----------|
| 13. Chain of Responsibility | ✓ | 6 | Cadeia de processadores |
| 14. Command | ✓ | 19 | Encapsulamento de operações |
| 15. Interpreter | ✓ | 27 | Interpretação de linguagens |
| 16. Iterator | ✓ | 30 | Acesso sequencial a elementos |
| 17. Mediator | ✓ | 18 | Comunicação centralizada |
| 18. Memento | ✓ | 19 | Captura e restauração de estado |
| 19. Observer | ✓ | 17 | Notificação de mudanças |
| 20. State | ✓ | 22 | Comportamento baseado em estado |
| 21. Strategy | ✓ | 22 | Algoritmos intercambiáveis |
| 22. Template Method | ✓ | 16 | Algoritmo com etapas customizáveis |
| 23. Visitor | ✓ | 27 | Operações sobre estruturas de objetos |
| 13. Chain of Responsibility | ⏳ | Cadeia de processadores |
| 14. Command | ⏳ | Encapsulamento de operações |
| 15. Interpreter | ⏳ | Interpretação de linguagens |
| 16. Iterator | ⏳ | Acesso sequencial a elementos |
| 17. Mediator | ⏳ | Comunicação entre objetos |
| 18. Memento | ⏳ | Captura e restauração de estado |
| 19. Observer | ⏳ | Notificação de mudanças |
| 20. State | ⏳ | Comportamento baseado em estado |
| 21. Strategy | ⏳ | Algoritmos intercambiáveis |
| 22. Template Method | ⏳ | Esqueleto de algoritmos |
| 23. Visitor | ⏳ | Operações sobre estruturas |

**Total: 12/23 padrões implementados (52%)**

## Como Executar

### Pré-requisitos

- [Bun](https://bun.sh) v1.2.0 ou superior

### ⚡ Instalação

```bash
# Clone o repositório
git clone https://github.com/LouisRiverstone/design-patterns-erich-gamma.git
cd design-pattern-erich-gama

# Instale as dependências
bun install
```

### ▶️ Execução

```bash
# Demonstrar todos os padrões implementados
bun index.ts

# Executar todos os testes
bun test

# Executar testes de um padrão específico
bun test ./src/creational/01-abstract-factory/test.ts
bun test ./src/structural/12-proxy/test.ts

# Modo desenvolvimento (watch)
bun --watch index.ts

# Executar testes em modo watch
bun test --watch
```

## 🧪 Qualidade dos Testes

| Métrica | Valor |
|---------|-------|
| **Testes Totais** | 300+ testes |
| **Asserções** | 800+ asserções |
| **Taxa de Aprovação** | 100% ✅ |
| **Cobertura** | Casos de sucesso, falha e edge cases |

### 🎯 Exemplos de Cenários Testados

- **Abstract Factory**: E-commerce com produtos físicos/digitais
- **Builder**: Sistema de pedidos de pizza personalizada
- **Factory Method**: Sistema de notificações multi-canal
- **Prototype**: RPG com clonagem de personagens
- **Singleton**: Compartilhamento de recursos globais
- **Adapter**: Gateway de pagamento unificado
- **Bridge**: Sistema de notificações multi-plataforma
- **Composite**: Sistema de arquivos hierárquico
- **Decorator**: Pipeline de notificações dinâmico
- **Facade**: Sistema de autenticação e autorização
- **Flyweight**: Editor de texto e sistema de partículas
- **Proxy**: Controle de acesso e cache inteligente

## 🛠️ Tecnologias

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **[Bun](https://bun.sh)** | 1.2.0+ | Runtime JavaScript/TypeScript ultrarrápido |
| **[TypeScript](https://www.typescriptlang.org/)** | 5.0+ | Tipagem estática para JavaScript |
| **[Biome](https://biomejs.dev/)** | - | Linting e formatação de código |

## 📚 Documentação

Cada padrão inclui documentação completa:

### 📖 README.md

- ✅ **Definição** do padrão
- ✅ **Problema** que resolve
- ✅ **Estrutura** e participantes
- ✅ **Vantagens** e desvantagens
- ✅ **Casos de uso** reais
- ✅ **Comparação** com outros padrões
- ✅ **Exemplos** de código

### ❌ before.ts

- Implementação **problemática**
- Demonstra **por que** o padrão é necessário
- Mostra **limitações** da abordagem convencional

### ✅ after.ts

- **Solução** usando o padrão
- Implementação **completa** e **funcional**
- **Comentários** explicativos
- **Casos de uso** realistas

### 🧪 test.ts

- **Testes unitários** abrangentes
- **Validação** de comportamentos
- **Casos edge** e tratamento de erros
- **Métricas** de qualidade

## 🎓 Aprendizados

### 🏭 Padrões Criacionais

- ✅ **Flexibilidade** na criação de objetos
- ✅ **Desacoplamento** entre criação e uso
- ✅ **Reutilização** de código
- ✅ **Configuração** dinâmica

### 🏗️ Padrões Estruturais

- ✅ **Composição** sobre herança
- ✅ **Flexibilidade** em tempo de execução
- ✅ **Interfaces** limpas e consistentes
- ✅ **Otimização** de recursos

### 🧠 Padrões Comportamentais

- ✅ **Comunicação** entre objetos
- ✅ **Algoritmos** intercambiáveis
- ✅ **Responsabilidades** bem definidas
- ✅ **Flexibilidade** comportamental

## 📖 Referências

- 📚 **Livro Principal**: "Design Patterns: Elements of Reusable Object-Oriented Software" - Gang of Four
- 🌐 **Documentação**: [Refactoring Guru - Design Patterns](https://refactoring.guru/design-patterns)
- 🔧 **TypeScript**: [Handbook](https://www.typescriptlang.org/docs/)
- ⚡ **Bun**: [Documentation](https://bun.sh/docs)

## 🤝 Contribuição

Contribuições são bem-vindas! Para contribuir:

1. 🍴 Faça um fork do projeto
2. 🌿 Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. 💾 Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. 📤 Push para a branch (`git push origin feature/nova-feature`)
5. 🔄 Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<div align="center">

**🎉 Projeto Completo - Todos os 23 padrões GoF implementados!**

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Bun](https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white)

**Última atualização**: Outubro 2025

</div>
