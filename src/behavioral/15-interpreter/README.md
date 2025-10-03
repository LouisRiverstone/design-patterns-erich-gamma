# Interpreter (Interpretador)

## O que é

O padrão Interpreter define uma representação para a gramática de uma linguagem junto com um interpretador que usa essa representação para interpretar sentenças da linguagem.

## Problema

Quando você precisa avaliar expressões de uma linguagem específica (como fórmulas matemáticas, regras de negócio, ou comandos), implementações ingênuas como:
- Usar `eval()` é inseguro e limitado
- Parsing manual é complexo e difícil de manter
- Adicionar novas operações requer modificar código existente

## Solução

Criar uma gramática usando classes que representam:
- **Terminal expressions**: elementos básicos (números, variáveis)
- **Non-terminal expressions**: operações compostas (adição, multiplicação)
- **Context**: armazena estado global (variáveis)
- **Parser**: converte string em árvore de expressões

## Estrutura

- **AbstractExpression**: Interface para interpretação
- **TerminalExpression**: Implementa terminal da gramática
- **NonterminalExpression**: Implementa regras da gramática
- **Context**: Contém informações globais
- **Client**: Constrói árvore sintática abstrata (AST)

## Exemplo no projeto

Calculadora de expressões aritméticas:

**Grammar:**
```
Expression := Term (('+' | '-') Term)*
Term := Factor (('*' | '/') Factor)*
Factor := Number | Variable | '(' Expression ')'
```

**Classes:**
- `NumberExpression`, `VariableExpression` (terminais)
- `AddExpression`, `SubtractExpression`, etc. (não-terminais)
- `Context` (variáveis)
- `ExpressionParser` (parser)

## Quando usar

- Quando tem uma linguagem simples para interpretar
- A gramática é simples e estável
- Eficiência não é prioridade crítica
- Para DSLs (Domain-Specific Languages)
- Configurações complexas
- Regras de validação

## Vantagens

- Fácil implementar gramática simples
- Fácil adicionar novas regras
- Cada regra de gramática é uma classe
- Reutilização de expressões

## Desvantagens

- Gramáticas complexas podem gerar muitas classes
- Performance pode ser problema
- Difícil manter gramáticas que mudam frequentemente
- Para gramáticas complexas, considere parser generators

## Observações

Este exemplo implementa uma calculadora básica. Para linguagens mais complexas, considere usar:
- ANTLR ou outros parser generators
- Visitor pattern para operações adicionais
- Compilação para bytecode para melhor performance

O padrão é mais adequado para linguagens simples e DSLs específicos.