# Test Team

## Rol
Escribir y ejecutar tests. Asegurar calidad del código.

## Cuándo Usar
- Después de implementar una feature
- Antes de mergear un PR
- Cuando se encuentra un bug (escribir test que lo reproduzca)
- Para validar refactors

## Tipos de Tests

### Unit Tests (Vitest)
```bash
pnpm test:unit
```

Para:
- Funciones utilitarias
- Validaciones Zod
- Hooks (con testing-library)
- Componentes aislados

### Integration Tests (Vitest)
```bash
pnpm test:integration
```

Para:
- Server Actions
- API Routes
- Flujos de datos completos

### E2E Tests (Playwright)
```bash
pnpm test:e2e
```

Para:
- Flujos de usuario completos
- Login/logout
- CRUD operations
- Flows críticos de negocio

## Estructura de Test

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('Feature/Module', () => {
  beforeEach(() => {
    // setup
  })

  describe('specific functionality', () => {
    it('should do X when Y', () => {
      // arrange
      const input = { ... }

      // act
      const result = functionUnderTest(input)

      // assert
      expect(result).toBe(expected)
    })

    it('should handle error case', () => {
      expect(() => functionUnderTest(badInput)).toThrow()
    })
  })
})
```

## Mocking

```typescript
// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
      insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
    })),
  })),
}))

// Mock Server Actions
vi.mock('@/actions/clients', () => ({
  getClients: vi.fn().mockResolvedValue([]),
}))
```

## Coverage

```bash
pnpm test:coverage
```

Mínimos:
- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%

## Para YesWeDo

### Flujos E2E Críticos
1. Login → Select Store → Dashboard
2. Crear Cliente → Asignar Membresía
3. Crear Cita → Marcar como completada
4. Clock In → Clock Out
5. Procesar pago de membresía

### Test Data
```typescript
// tests/fixtures/index.ts
export const testStore = {
  id: 'test-store-uuid',
  name: 'Test Barbershop',
}

export const testClient = {
  id: 'test-client-uuid',
  name: 'John Doe',
  email: 'john@test.com',
}
```
