# Composite Pattern

##  Quando usar

- **Hierarquias parte-todo** (árvores de objetos)
- **Tratar objetos individuais e composições uniformemente**
- **Operações recursivas** em estruturas de árvore
- **UI com componentes aninhados**
- **Estruturas matemáticas** (expressões, geometria)

##  Problema

Clientes precisam tratar objetos simples e composições de forma diferente:
- Lógica duplicada para folhas vs composições
- Type checking constante 
- Operações recursivas complexas

##  Solução

Interface única para objetos simples e composições:
- Cliente usa mesma interface para tudo
- Polimorfismo resolve recursão
- Transparência total

##  Estrutura

```
FileSystemItem (Component)
├── getName()
├── getSize()
├── display()
└── find()

File (Leaf)          Directory (Composite)
└── implementa       ├── implementa
    operações            operações
    simples          └── delega para filhos
```

##  Cenários reais

- **Sistema de arquivos**: Arquivos e diretórios
- **Interface gráfica**: Componentes e containers  
- **Documentos**: Parágrafos, seções, capítulos
- **Organizações**: Funcionários e departamentos
- **Expressões matemáticas**: Números e operadores