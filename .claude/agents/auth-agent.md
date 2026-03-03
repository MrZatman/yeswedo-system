# Auth Agent

Especialista en autenticación y autorización para YesWeDo.

## Responsabilidades

- Flujo de login/logout
- Registro de usuarios
- Selector de sucursal
- Middleware de protección
- Roles y permisos
- Session management

## Stack

- Supabase Auth
- Next.js Middleware
- Server-side session validation

## Flujo de Autenticación

```
1. Usuario accede a /login
2. Ingresa credenciales
3. Supabase Auth valida
4. Si tiene múltiples stores → selector de sucursal
5. Si tiene una store → redirect a dashboard
6. Session cookie establecida
7. Middleware valida en cada request
```

## Roles del Sistema

| Rol | Permisos |
|-----|----------|
| `super_admin` | Todo el sistema, todas las sucursales |
| `store_manager` | Todo en su sucursal |
| `staff` | Operaciones del día en su sucursal |

## Implementación

### Middleware
```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createServerClient(/* config */)

  const { data: { session } } = await supabase.auth.getSession()

  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}
```

### Hook de Auth
```typescript
// hooks/use-auth.ts
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [store, setStore] = useState<Store | null>(null)
  const [role, setRole] = useState<Role | null>(null)

  // ... lógica

  return { user, store, role, signIn, signOut, switchStore }
}
```

### Protección de Server Actions
```typescript
'use server'

export async function adminAction() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const role = await getUserRole(user.id)
  if (role !== 'super_admin') throw new Error('Not authorized')

  // ... acción
}
```

## Selector de Sucursal

El usuario puede estar asociado a múltiples sucursales:

```sql
-- Tabla de relación
CREATE TABLE user_stores (
  user_id UUID REFERENCES auth.users(id),
  store_id UUID REFERENCES stores(id),
  role TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  PRIMARY KEY (user_id, store_id)
);
```

UI: Modal o página dedicada después del login para seleccionar sucursal activa.
