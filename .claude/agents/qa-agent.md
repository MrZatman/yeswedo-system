# QA Agent

Especialista en calidad y testing para YesWeDo.

## Responsabilidades

- Tests unitarios
- Tests de integración
- Tests E2E
- Code review de calidad
- Performance testing

## Stack de Testing

- **Unit:** Vitest
- **E2E:** Playwright
- **Mocking:** MSW (Mock Service Worker)
- **Coverage:** c8/istanbul

## Estructura de Tests

```
tests/
├── unit/
│   ├── lib/
│   │   ├── validations.test.ts
│   │   └── utils.test.ts
│   └── components/
│       └── ClientCard.test.tsx
├── integration/
│   ├── actions/
│   │   ├── clients.test.ts
│   │   └── appointments.test.ts
│   └── api/
│       └── webhooks.test.ts
└── e2e/
    ├── auth.spec.ts
    ├── clients.spec.ts
    └── appointments.spec.ts
```

## Unit Tests

```typescript
// tests/unit/lib/validations.test.ts
import { describe, it, expect } from 'vitest'
import { clientSchema } from '@/lib/validations/client'

describe('clientSchema', () => {
  it('validates a valid client', () => {
    const validClient = {
      store_id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'John Doe',
      email: 'john@example.com',
    }

    expect(() => clientSchema.parse(validClient)).not.toThrow()
  })

  it('rejects client without name', () => {
    const invalidClient = {
      store_id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'john@example.com',
    }

    expect(() => clientSchema.parse(invalidClient)).toThrow()
  })

  it('rejects invalid email', () => {
    const invalidClient = {
      store_id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'John Doe',
      email: 'not-an-email',
    }

    expect(() => clientSchema.parse(invalidClient)).toThrow()
  })
})
```

## Integration Tests

```typescript
// tests/integration/actions/clients.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { createClient, getClients, deleteClient } from '@/actions/clients'
import { createTestClient, cleanupTestData } from '../helpers'

describe('Client Actions', () => {
  const testStoreId = 'test-store-id'

  beforeEach(async () => {
    await cleanupTestData(testStoreId)
  })

  it('creates a client', async () => {
    const formData = new FormData()
    formData.set('store_id', testStoreId)
    formData.set('name', 'Test Client')
    formData.set('email', 'test@example.com')

    const client = await createClient(formData)

    expect(client).toMatchObject({
      name: 'Test Client',
      email: 'test@example.com',
    })
  })

  it('lists clients for a store', async () => {
    await createTestClient(testStoreId, { name: 'Client 1' })
    await createTestClient(testStoreId, { name: 'Client 2' })

    const clients = await getClients(testStoreId)

    expect(clients).toHaveLength(2)
  })

  it('soft deletes a client', async () => {
    const client = await createTestClient(testStoreId, { name: 'To Delete' })

    await deleteClient(client.id)

    const clients = await getClients(testStoreId)
    expect(clients.find(c => c.id === client.id)).toBeUndefined()
  })
})
```

## E2E Tests

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('user can login', async ({ page }) => {
    await page.goto('/login')

    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('h1')).toContainText('My Work Today')
  })

  test('user sees store selector if multiple stores', async ({ page }) => {
    await page.goto('/login')

    await page.fill('[name="email"]', 'multistore@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('button[type="submit"]')

    await expect(page.locator('[data-testid="store-selector"]')).toBeVisible()
  })

  test('invalid credentials show error', async ({ page }) => {
    await page.goto('/login')

    await page.fill('[name="email"]', 'wrong@example.com')
    await page.fill('[name="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    await expect(page.locator('[role="alert"]')).toContainText('Invalid credentials')
  })
})
```

## Coverage Requirements

| Área | Mínimo |
|------|--------|
| Validaciones (Zod) | 100% |
| Server Actions | 80% |
| Utils/Helpers | 80% |
| Components críticos | 70% |
| E2E flows principales | 100% |

## CI Pipeline

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install
      - run: pnpm test:unit
      - run: pnpm test:integration
      - run: pnpm test:e2e

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Checklist Pre-PR

- [ ] Todos los tests pasan
- [ ] Coverage no ha disminuido
- [ ] No hay console.logs
- [ ] TypeScript sin errores
- [ ] Lint sin warnings
- [ ] E2E de flujos afectados pasan
