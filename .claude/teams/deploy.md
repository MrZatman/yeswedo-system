# Deploy Team

## Rol
Despliegue a producción. CI/CD. Monitoreo.

## Cuándo Usar
- Preparar release
- Configurar CI/CD
- Troubleshoot issues de producción
- Configurar variables de entorno

## Entornos

| Entorno | Branch | URL | Propósito |
|---------|--------|-----|-----------|
| Development | `develop` | localhost:3000 | Desarrollo local |
| Staging | `staging` | staging.yeswedo.com | Testing pre-prod |
| Production | `main` | app.yeswedo.com | Producción |

## Stack de Deploy

- **Hosting:** Vercel
- **Database:** Supabase (hosted)
- **CI/CD:** GitHub Actions
- **Monitoring:** Vercel Analytics + Sentry

## Variables de Entorno

```bash
# .env.local (desarrollo)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Payments (cuando estén disponibles)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
SQUARE_ACCESS_TOKEN=
MERCADOPAGO_ACCESS_TOKEN=
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
```

## GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main, staging]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm type-check
      - run: pnpm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: ${{ github.ref == 'refs/heads/main' && '--prod' || '' }}
```

## Checklist Pre-Deploy

### Código
- [ ] Todos los tests pasan
- [ ] Build completa sin errores
- [ ] Sin console.logs
- [ ] TypeScript sin errores

### Base de Datos
- [ ] Migraciones aplicadas a staging
- [ ] Migraciones probadas
- [ ] Backup de producción (si es migration crítica)

### Configuración
- [ ] Variables de entorno configuradas
- [ ] Secrets actualizados
- [ ] Dominios configurados

### Post-Deploy
- [ ] Smoke test en producción
- [ ] Verificar funcionalidades críticas
- [ ] Monitorear errores en Sentry
- [ ] Verificar métricas de performance

## Rollback

Si algo sale mal:

```bash
# Vercel - revertir al deploy anterior
vercel rollback

# O desde el dashboard de Vercel
# Deployments → Previous deployment → Promote to Production
```

## Monitoreo

### Sentry (errores)
```typescript
// sentry.client.config.ts
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
})
```

### Vercel Analytics (performance)
```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

## Para YesWeDo

### Orden de Deploy
1. Supabase migrations
2. Vercel deploy
3. Verificar webhooks (Stripe, etc.)
4. Smoke test

### Funcionalidades Críticas a Verificar
- [ ] Login funciona
- [ ] Selector de sucursal funciona
- [ ] CRUD de clientes
- [ ] Sistema de citas
- [ ] Pagos (cuando estén activos)
