# Adapter Pattern

##  Quando usar

Use o Adapter quando você precisa:

- **Integrar sistemas legados** com código moderno
- **Usar bibliotecas** com interfaces incompatíveis
- **Padronizar** acesso a diferentes APIs
- **Reutilizar código existente** que não pode ser modificado
- **Criar interface unificada** para serviços similares

##  Problema que resolve

No sistema de pagamentos, diferentes provedores têm interfaces incompatíveis. Sem o padrão:

**Problemas:**
- Código cliente precisa conhecer múltiplas interfaces diferentes
- Lógica de conversão espalhada por toda aplicação
- Dificulta adição de novos provedores de pagamento
- Código duplicado para operações similares
- Manutenção complexa quando interfaces mudam

##  Solução com Adapter

 **Benefícios:**
- **Interface única**: Cliente usa apenas uma interface padronizada
- **Reutilização**: Sistemas legados podem ser reutilizados sem modificação
- **Extensibilidade**: Fácil adicionar novos provedores
- **Manutenibilidade**: Mudanças isoladas nos adapters
- **Fallback**: Possibilidade de usar múltiplos provedores

##  Estrutura

```
PaymentProcessor (Interface)
├── processPayment()
├── validateCard()
└── refundPayment()

LegacyPaymentAdapter          ExternalPaymentAdapter
├── LegacyPaymentGateway     ├── ExternalPaymentAPI
└── converts to standard     └── converts to standard
    interface                    interface

PaymentAdapterFactory
├── registerAdapter()
├── createAdapter()
└── manages all adapters
```

##  Cenários de uso real

- **APIs de pagamento**: Stripe, PayPal, Square com interface única
- **Bancos de dados**: Adaptadores para MySQL, PostgreSQL, MongoDB
- **Serviços de email**: SendGrid, Mailgun, Amazon SES
- **Sistemas de autenticação**: OAuth, SAML, JWT
- **APIs de terceiros**: Google Maps, weather services, social media
- **Formatos de arquivo**: JSON, XML, CSV para estrutura única

##  Exemplo prático

```typescript
//  Interface única para todos os provedores
const paymentService = new UnifiedPaymentService();

//  Mesmo código funciona com qualquer provedor
const result = await paymentService.processPayment(
  "stripe", // ou "paypal", "square", etc.
  100.00,
  "USD",
  "4111111111111111"
);

//  Fácil adicionar novos provedores
PaymentAdapterFactory.registerAdapter("new-provider", () => new NewAdapter());

//  Fallback automático
if (!result.success) {
  // Tenta com outro provedor automaticamente
}
```

##  Relação com outros padrões

- **Factory Method**: Usado para criar diferentes adapters
- **Strategy**: Adapter pode ser implementado como Strategy
- **Facade**: Adapter pode usar Facade para simplificar subsistemas
- **Bridge**: Similar, mas Bridge separa abstração da implementação desde o início