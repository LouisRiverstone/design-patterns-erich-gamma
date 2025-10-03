# Abstract Factory Pattern

##  Quando usar

Use o Abstract Factory quando você precisa:

- **Criar famílias de objetos relacionados** que devem ser usados juntos
- **Garantir compatibilidade** entre objetos criados
- **Trocar famílias inteiras** de produtos sem modificar código cliente
- **Isolar a criação** de objetos complexos do código que os usa

##  Problema que resolve

No exemplo do e-commerce, temos diferentes tipos de produtos (digitais vs físicos) que requerem diferentes métodos de pagamento e entrega. Sem o padrão:

**Problemas:**
- Fácil criar combinações incompatíveis (ex: produto físico com entrega digital)
- Cliente precisa conhecer todas as classes concretas
- Difícil adicionar novos tipos de produto
- Sem garantia de consistência entre objetos relacionados

##  Solução com Abstract Factory

 **Benefícios:**
- **Compatibilidade garantida**: Produtos e pagamentos sempre compatíveis
- **Facilidade de extensão**: Adicionar nova família é simples
- **Baixo acoplamento**: Cliente usa apenas interfaces
- **Consistência**: Objetos de uma família sempre funcionam juntos

##  Estrutura

```
ECommerceFactory (Abstract)
├── createProduct()
├── createPaymentMethod()
└── createOrder()

DigitalECommerceFactory          PhysicalECommerceFactory
├── DigitalProduct               ├── PhysicalProduct  
└── PixPayment                   └── CreditCardPayment
```

##  Cenários de uso real

- **Interfaces gráficas**: Factory para widgets Windows/Mac/Linux
- **Bancos de dados**: Factory para diferentes SGBDs (MySQL, PostgreSQL)
- **Jogos**: Factory para diferentes níveis de dificuldade
- **APIs**: Factory para diferentes versões de endpoints

##  Exemplo prático

```typescript
//  Uso correto
const digitalFactory = new DigitalECommerceFactory();
const order = digitalFactory.createOrder("E-book", 29.90);
// Garante: produto digital + PIX + download imediato

//  Fácil trocar contexto
const physicalFactory = new PhysicalECommerceFactory();  
const physicalOrder = physicalFactory.createOrder("Livro", 49.90);
// Garante: produto físico + cartão + entrega correios
```

##  Relação com outros padrões

- **Factory Method**: Abstract Factory usa vários Factory Methods
- **Singleton**: Factories costumam ser Singletons
- **Prototype**: Pode usar Prototype para criar objetos