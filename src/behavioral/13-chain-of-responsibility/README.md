# Chain of Responsibility (Cadeia de Responsabilidade)

## O que é

O padrão Chain of Responsibility permite que uma solicitação seja passada por uma cadeia de objetos (handlers) até que algum objeto a trate. Evita o acoplamento entre o remetente da requisição e o receptor, e permite adicionar/remover handlers dinamicamente.

## Problema

Implementações ingênuas tomam decisões em pontos centrais (if/else) sobre quem deve realizar cada operação. Isso causa duplicação de código, difícil extensão e baixa testabilidade.

## Solução

Separar a lógica de processamento em handlers, cada um responsável por um tipo de requisição. O cliente apenas envia a requisição para o primeiro handler da cadeia.

## Exemplo no projeto

Cenário: sistema de suporte técnico com níveis de atendimento:

- `Level1Handler`: resolve problemas simples
- `Level2Handler`: resolve problemas de complexidade média
- `ManagerHandler`: resolve problemas críticos

Files:
- `before.ts` — Implementação problemática (lógica centralizada)
- `after.ts` — Implementação com handlers encadeados
- `test.ts` — Testes que validam resolução local, escalonamento e fallback

## Quando usar

- Quando várias classes podem tratar uma requisição e o handler concreto não é conhecido antecipadamente
- Quando quer evitar acoplamento entre remetente e receptor
- Quando quer permitir que múltiplos handlers processem ou possam recusar a requisição

## Vantagens

- Desacoplamento do remetente e receptor
- Extensível: adicionar handlers sem alterar o cliente
- Permite composição dinâmica de responsabilidades

## Desvantagens

- A requisição pode atravessar muitos objetos antes de ser tratada
- Pode ser mais difícil rastrear o fluxo de controle em tempo de execução

## Observações

Este exemplo demonstra um fluxo de suporte com regras simples de prioridade/complexidade. Em sistemas reais usaríamos logging, métricas e políticas de retry/escalation mais ricas.
