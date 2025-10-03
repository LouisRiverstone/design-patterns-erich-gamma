# Memento (Lembrete)

## O que é

O padrão Memento captura e externaliza o estado interno de um objeto sem violar o encapsulamento, permitindo que o objeto seja restaurado para este estado posteriormente.

## Problema

Quando precisamos salvar/restaurar estado de objetos:
- Expor estado interno quebra encapsulamento
- Implementar undo/redo é complexo
- Salvar/carregar estados pode causar acoplamento
- Gerenciar histórico de mudanças é trabalhoso
- Serialização manual é propensa a erros

## Solução

Criar um objeto memento que armazena snapshot do estado interno do originator. O memento é opaco para outros objetos, mas o originator pode acessar seu conteúdo para restaurar seu estado.

## Estrutura

- **Originator**: Objeto cujo estado queremos salvar/restaurar
- **Memento**: Armazena estado interno do originator
- **Caretaker**: Gerencia mementos mas não acessa seu conteúdo
- **ConcreteMemento**: Implementação específica do memento

## Exemplo no projeto

Sistema de editor de texto com histórico avançado:

**Componentes:**
- `Document`: Originator que gerencia texto e formatação
- `DocumentMemento`: Interface opaca para estado
- `ConcreteDocumentMemento`: Implementação que armazena estado
- `DocumentHistory`: Caretaker que gerencia undo/redo
- `BranchingDocumentHistory`: Caretaker avançado com branches

**Funcionalidades:**
- Undo/redo com histórico limitado
- Branching de histórico (como Git)
- Estado opaco (não expõe internals)
- Cursor position, formatação, conteúdo

## Quando usar

- Para implementar undo/redo
- Para criar snapshots/checkpoints
- Para salvar/carregar estado de objetos
- Quando precisa voltar a estados anteriores
- Em sistemas de versionamento
- Para implementar transações

## Vantagens

- Preserva encapsulamento
- Simplifica originator (sem responsabilidade de histórico)
- Fácil adicionar novos tipos de caretaker
- Histórico pode ser persistido
- Não acopla originator com interface de usuário

## Desvantagens

- Pode consumir muita memória
- Caretakers devem rastrear lifecycle do originator
- Performance pode ser impactada com muitos mementos
- Pode ser complexo implementar se estado é muito grande

## Observações

Este exemplo mostra editor de texto, mas o padrão é usado em:
- **IDEs**: Undo/redo de código
- **Games**: Save/load, checkpoints
- **Databases**: Rollback, snapshots
- **Graphics**: História de operações
- **Forms**: Recuperar dados não salvos

**Variações do padrão:**
- **Narrow interface**: Memento com interface restrita
- **Wide interface**: Originator acessa estado completo
- **Incremental**: Salva apenas diferenças
- **Compressed**: Comprime estado para economizar memória

**Diferenças de outros padrões:**
- **Command**: Memento salva estado, Command salva operações
- **Prototype**: Memento para restaurar, Prototype para clonar
- **Serialization**: Memento mantém encapsulamento