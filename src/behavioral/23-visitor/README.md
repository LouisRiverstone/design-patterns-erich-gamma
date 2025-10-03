# Visitor (Visitante)

## O que é

O padrão Visitor permite definir novas operações sem mudar as classes dos elementos sobre os quais opera. Representa uma operação a ser executada nos elementos de uma estrutura de objetos.

## Problema

Quando precisamos adicionar operações a hierarquia de classes:
- Adicionar nova operação requer modificar todas as classes
- Operações ficam espalhadas pela hierarquia
- Viola princípio Open/Closed
- Lógica não relacionada misturada com estrutura de dados
- Dificulta manutenção de operações específicas

## Solução

Extrair operações para classes visitor separadas. Cada elemento aceita um visitor que implementa as operações. Novas operações são adicionadas criando novos visitors sem modificar elementos existentes.

## Estrutura

- **Visitor**: Interface que declara operações para cada tipo de elemento
- **ConcreteVisitor**: Implementa operações específicas
- **Element**: Interface que define método accept(visitor)
- **ConcreteElement**: Implementa accept e chama método apropriado do visitor

## Exemplo no projeto

Sistema de processamento de AST (Abstract Syntax Tree) para expressões matemáticas:

**Componentes:**
- `ASTVisitor<T>`: Interface visitor genérica
- `NumberNode`, `BinaryOpNode`, `VariableNode`, `FunctionNode`: Elementos da AST
- `EvaluatorVisitor`: Avalia expressões
- `PrinterVisitor`: Imprime expressões
- `ValidatorVisitor`: Valida estrutura
- `OptimizerVisitor`: Otimiza expressões
- `StatisticsVisitor`: Coleta estatísticas

**Funcionalidades:**
- Avaliação de expressões com variáveis e funções
- Impressão formatada e com indentação
- Validação de sintaxe e semântica
- Otimização algébrica e constant folding
- Análise estatística da árvore

## Quando usar

- Quando hierarquia de classes é estável mas operações mudam
- Para separar algoritmos dos dados que processam
- Quando operações não relacionadas precisam ser executadas
- Para implementar compiladores, interpretadores
- Em estruturas complexas como ASTs, DOM trees
- Quando quer evitar "god classes" com muitas responsabilidades

## Vantagens

- Facilita adicionar novas operações
- Agrupa operações relacionadas em uma classe
- Permite acumular estado durante travessia
- Pode trabalhar com hierarquias não relacionadas
- Facilita implementar operações complexas

## Desvantagens

- Dificulta adicionar novos tipos de elementos
- Pode quebrar encapsulamento se visitor precisa acessar internals
- Dependência circular entre visitors e elements
- Pode ser overkill para hierarquias simples

## Observações

Este exemplo mostra AST de expressões matemáticas, mas o padrão é essencial em:
- **Compilers**: Análise semântica, geração de código
- **Document processing**: HTML/XML parsing, PDF generation
- **Game engines**: Scene graph traversal, rendering
- **Business rules**: Validation, calculation engines
- **Serialization**: JSON/XML serializers
- **File systems**: Directory traversal operations

**Variações do padrão:**
- **Double Dispatch**: Visitor clássico com polimorfismo duplo
- **Acyclic Visitor**: Evita dependências circulares
- **Hierarchical Visitor**: Para estruturas hierárquicas
- **Reflective Visitor**: Usando reflection/metaprogramming

**Diferenças de outros padrões:**
- **Strategy**: Visitor para estruturas complexas, Strategy para algoritmos simples
- **Command**: Visitor processa estruturas, Command encapsula requisições
- **Iterator**: Visitor processa elementos, Iterator os percorre sequencialmente