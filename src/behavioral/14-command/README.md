# Command (Comando)

## O que é

O padrão Command encapsula uma solicitação como um objeto, permitindo parametrizar clientes com diferentes solicitações, enfileirar ou registrar solicitações e suportar operações que podem ser desfeitas.

## Problema

Quando operações são chamadas diretamente, não há como:
- Desfazer operações (undo/redo)
- Manter histórico de ações
- Enfileirar operações para execução posterior
- Registrar operações para auditoria
- Parametrizar objetos com operações

## Solução

Transformar solicitações em objetos independentes que contêm toda informação sobre a solicitação. Isso permite:
- Encapsular operações como objetos
- Manter histórico de comandos
- Implementar undo/redo facilmente
- Executar comandos de forma assíncrona ou em lote

## Estrutura

- **Command**: Interface que declara método `execute()`
- **ConcreteCommand**: Implementa operações específicas
- **Receiver**: Sabe como executar operações
- **Invoker**: Invoca comandos e mantém histórico
- **Client**: Cria objetos de comando

## Exemplo no projeto

Sistema de editor de texto com undo/redo:

- `TextEditor` (Receiver): Executa operações de texto
- `AddTextCommand`, `DeleteTextCommand`, `InsertAtCommand` (ConcreteCommands)
- `EditorInvoker` (Invoker): Controla execução e histórico
- `MacroCommand`: Executa múltiplos comandos

## Quando usar

- Quando quer parametrizar objetos com operações
- Para implementar undo/redo
- Para enfileirar, agendar ou registrar operações
- Para suportar transações
- Para implementar wizards ou assistentes

## Vantagens

- Desacopla objeto que invoca da operação
- Permite undo/redo facilmente
- Permite composição de comandos (macro)
- Fácil adicionar novos comandos
- Suporta logging e transações

## Desvantagens

- Pode aumentar complexidade para operações simples
- Número de classes pode crescer rapidamente

## Observações

Este exemplo mostra um editor básico, mas o padrão é muito usado em:
- GUIs (botões, menus)
- Sistemas de fila de tarefas
- Wizards multi-step
- Sistemas de transação
- APIs com rate limiting