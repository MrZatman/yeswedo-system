# Payments Agent

Especialista en integración de pagos para YesWeDo.

## Responsabilidades

- Integración con múltiples procesadores
- Pagos únicos y recurrentes
- Webhooks de pago
- Gestión de suscripciones
- Facturación

## Procesadores Soportados

| Procesador | Uso Principal | Recurrente |
|------------|---------------|------------|
| Stripe | Internacional, tarjetas | Sí |
| Square | POS, tarjetas | Sí |
| Mercado Pago | LATAM, múltiples métodos | Sí |
| PayPal | Internacional | Sí |

## Arquitectura

```
Cliente → Server Action → Payment Adapter → Procesador
                              ↓
                        Webhook Handler
                              ↓
                    Actualizar DB (transactions)
```

### Payment Adapter Pattern
```typescript
// lib/payments/adapter.ts
interface PaymentAdapter {
  createCustomer(data: CustomerData): Promise<string>
  createPayment(data: PaymentData): Promise<PaymentResult>
  createSubscription(data: SubscriptionData): Promise<SubscriptionResult>
  cancelSubscription(subscriptionId: string): Promise<void>
  handleWebhook(payload: unknown, signature: string): Promise<WebhookResult>
}

// lib/payments/stripe.ts
export class StripeAdapter implements PaymentAdapter {
  private stripe: Stripe

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  }

  async createPayment(data: PaymentData) {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: data.amount,
      currency: data.currency,
      customer: data.customerId,
    })
    return { id: paymentIntent.id, clientSecret: paymentIntent.client_secret }
  }

  // ... otros métodos
}
```

## Membresías con Pago Recurrente

```typescript
// Crear membresía con suscripción
async function createMembership(clientId: string, planId: string) {
  const adapter = getPaymentAdapter() // según config de la store

  // 1. Crear/obtener customer en procesador
  const customerId = await adapter.createCustomer({
    email: client.email,
    name: client.name,
  })

  // 2. Crear suscripción
  const subscription = await adapter.createSubscription({
    customerId,
    priceId: plan.priceId,
    metadata: { clientId, storeId }
  })

  // 3. Guardar en DB
  await supabase.from('client_memberships').insert({
    client_id: clientId,
    plan_id: planId,
    subscription_id: subscription.id,
    status: 'active',
  })
}
```

## Webhooks

```typescript
// app/api/webhooks/stripe/route.ts
export async function POST(request: Request) {
  const payload = await request.text()
  const signature = request.headers.get('stripe-signature')!

  const adapter = new StripeAdapter()
  const result = await adapter.handleWebhook(payload, signature)

  switch (result.type) {
    case 'payment.succeeded':
      await recordTransaction(result.data)
      break
    case 'subscription.canceled':
      await cancelMembership(result.data.subscriptionId)
      break
  }

  return new Response('OK')
}
```

## Seguridad

- Nunca loguear datos de tarjeta
- Usar tokens de procesadores, no datos raw
- Validar webhooks con signatures
- Variables de entorno para API keys
- PCI compliance via procesadores
