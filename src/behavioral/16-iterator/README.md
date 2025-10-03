# Iterator (Iterador)

## O que é

O padrão Iterator fornece uma maneira de acessar elementos de uma coleção agregada sequencialmente sem expor sua representação subjacente. Permite percorrer elementos sem conhecer a estrutura interna da coleção.

## Problema

Quando clientes precisam acessar elementos de uma coleção, implementações diretas apresentam problemas:
- Exposição da estrutura interna da coleção
- Múltiplas formas de percorrer exigem vários métodos
- Cliente acoplado à implementação específica
- Difícil adicionar novos algoritmos de travessia
- Quebra de encapsulamento

## Solução

Extrair comportamento de travessia para objetos separados (iteradores) que implementam interface padrão. Cada coleção pode fornecer diferentes tipos de iteradores sem expor sua estrutura interna.

## Estrutura

- **Iterator**: Interface que declara operações de travessia
- **ConcreteIterator**: Implementa algoritmo específico de travessia
- **Aggregate**: Interface que declara método para criar iterator
- **ConcreteAggregate**: Implementa coleção e retorna iterators específicos

## Exemplo no projeto

Sistema de coleções com múltiplos tipos de iteração:

**Coleções:**
- `SmartCollection`: Lista com iteradores normal, reverso e filtrado
- `TreeCollection`: Árvore com iteradores depth-first e breadth-first

**Iteradores:**
- `ArrayIterator`: Percorre sequencialmente
- `ReverseArrayIterator`: Percorre em ordem reversa
- `FilterIterator`: Percorre apenas elementos que atendem critério
- `DepthFirstIterator`: Percorre árvore em profundidade
- `BreadthFirstIterator`: Percorre árvore em largura

## Quando usar

- Quando quer acessar elementos sem expor estrutura interna
- Para suportar múltiplas formas de traversal na mesma coleção
- Para fornecer interface uniforme para percorrer diferentes estruturas
- Quando quer implementar operações complexas sobre agregados
- Para permitir múltiplas traversals simultâneas

## Vantagens

- Suporta diferentes algoritmos de travessia
- Simplifica interface do agregado
- Múltiplas traversals podem ocorrer simultaneamente
- Permite lazy loading de elementos
- Facilita adição de novos tipos de travessia

## Desvantagens

- Pode ser desnecessário para coleções simples
- Pode ser menos eficiente que acesso direto
- Aumenta número de classes

## Observações

Este exemplo mostra diferentes tipos de iteradores:
- **External iterators**: Cliente controla a iteração
- **Múltiplos algoritmos**: Normal, reverso, filtrado, DFS, BFS
- **Type safety**: Generics garantem tipo dos elementos
- **Encapsulamento**: Estrutura interna protegida

Em JavaScript/TypeScript moderno, muitas dessas funcionalidades são fornecidas nativamente através de:
- `Symbol.iterator`
- Generators (`function*`)
- `for...of` loops
- Array methods (`map`, `filter`, `reduce`)

O padrão é especialmente útil para estruturas de dados customizadas ou algoritmos de traversal complexos.