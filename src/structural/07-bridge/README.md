# Bridge Pattern

##  Quando usar

- **Evitar explosão de classes** em hierarquias complexas
- **Separar abstração da implementação** para evolução independente
- **Trocar implementação em runtime** sem afetar cliente
- **Herança múltipla** em linguagens que não suportam
- **Plataformas múltiplas** com funcionalidades similares

##  Problema

Combinações de abstrações e implementações criam hierarquias exponenciais:
- 3 tipos × 3 plataformas = 9 classes
- Adicionar 1 tipo = +3 classes  
- Adicionar 1 plataforma = +3 classes

##  Solução

Bridge separa "o que fazer" (abstração) de "como fazer" (implementação):
- 3 tipos + 3 plataformas = 6 classes
- Adicionar tipo = +1 classe
- Adicionar plataforma = +1 classe

##  Estrutura

```
Notification (Abstração)
├── UrgentNotification
├── NormalNotification  
└── MarketingNotification

NotificationSender (Implementação)
├── EmailSender
├── SMSSender
└── PushSender
```

##  Cenários reais

- **UI Frameworks**: Componentes × Plataformas (Web, Mobile, Desktop)
- **Bancos de dados**: Queries × SGBDs (MySQL, PostgreSQL, MongoDB)  
- **Renderização**: Formas × Engines (Canvas, SVG, WebGL)
- **Drivers**: Operações × Hardware (Impressoras, Scanners)