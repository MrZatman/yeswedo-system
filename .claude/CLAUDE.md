# YesWeDo System - Instrucciones para Claude Code

> **IMPORTANTE:** Lee este documento completo antes de ejecutar cualquier tarea.

---

## CONTEXTO DEL PROYECTO

**YesWeDo** es un sistema de gestión para barberías/salones de belleza. Migración de sistema legacy PHP a arquitectura moderna.

### Stack Tecnológico
- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4
- **Backend:** Supabase (PostgreSQL, Auth, Realtime, Storage, Edge Functions)
- **Pagos:** Stripe, Square, Mercado Pago, PayPal (múltiples procesadores)
- **Deploy:** Vercel
- **Repo:** GitHub

### Arquitectura
- **Multi-tenant simple:** Una instancia, múltiples sucursales
- **Selector de sucursal al login** (no SaaS público)
- **Roles:** Super Admin, Store Manager, Staff

```
Usuario → Login (selecciona sucursal) → Dashboard según rol → Módulos
```

---

## MÓDULOS DEL SISTEMA

| Módulo | Descripción |
|--------|-------------|
| **Dashboard** | Vista general del día (My Work Today) |
| **Clients** | Base de datos de clientes |
| **Memberships** | Planes y membresías de clientes |
| **Appointments** | Gestión de citas |
| **Clock In/Out** | Control de asistencia de empleados |
| **Users** | Gestión de usuarios del sistema |
| **Products** | Inventario de productos |
| **Services** | Catálogo de servicios |
| **Reports** | Reportes y estadísticas |
| **Settings** | Configuración del sistema |

---

## REGLAS OBLIGATORIAS

### Código
1. **TypeScript estricto** - NUNCA usar `any`. Siempre tipar todo.
2. **Componentes funcionales** - No usar clases. Solo hooks.
3. **Tailwind CSS v4** - No CSS modules, no styled-components.
4. **Server Components** por defecto - 'use client' solo cuando necesario.
5. **Zod** para validación - Siempre validar input de usuarios.
6. **Server Actions** para mutaciones - No API routes para CRUD simple.

### Nomenclatura
```typescript
// Archivos
ComponentName.tsx       // Componentes: PascalCase
use-hook-name.ts       // Hooks: kebab-case con prefijo use-
utils-name.ts          // Utilidades: kebab-case
page.tsx, layout.tsx   // Next.js: lowercase

// Código
function ComponentName() {}     // Componentes: PascalCase
function utilityFunction() {}   // Funciones: camelCase
const MAX_ITEMS = 100          // Constantes: SCREAMING_SNAKE_CASE
interface UserData {}          // Interfaces: PascalCase
type ButtonProps = {}          // Types: PascalCase

// Base de datos (Supabase)
store_id                       // Columnas: snake_case
created_at, updated_at         // Timestamps obligatorios
```

### Estructura de Archivos
```
src/
├── app/                    # Pages y layouts (App Router)
│   ├── (auth)/            # Grupo: login, register
│   ├── (dashboard)/       # Grupo: páginas protegidas
│   │   ├── clients/
│   │   ├── appointments/
│   │   ├── clock/
│   │   ├── memberships/
│   │   ├── products/
│   │   ├── reports/
│   │   ├── services/
│   │   ├── settings/
│   │   └── users/
│   └── api/               # API routes (webhooks, etc.)
├── components/
│   ├── ui/                # Componentes base (shadcn/ui)
│   ├── forms/             # Formularios reutilizables
│   ├── tables/            # Tablas y data grids
│   └── [module]/          # Componentes por módulo
├── lib/
│   ├── supabase/          # Clientes y helpers Supabase
│   ├── payments/          # Adaptadores de pago
│   ├── validations/       # Schemas Zod
│   └── utils/             # Utilidades generales
├── hooks/                 # Custom hooks
├── stores/                # Zustand stores (estado cliente)
└── types/                 # Tipos TypeScript globales
```

### Commits
Usar Conventional Commits:
```
feat(clients): add client search functionality
fix(appointments): resolve double booking issue
refactor(auth): extract session validation logic
test(memberships): add unit tests for pricing
docs(readme): update installation instructions
chore(deps): upgrade to Next.js 15
```

---

## PROHIBIDO

- `any` en TypeScript
- Funciones de más de 50 líneas
- Componentes de más de 200 líneas
- `console.log` en producción
- Secrets/API keys en código
- SQL raw en cliente
- Fetch directo en componentes cliente
- Ignorar errores de TypeScript
- Skip tests

---

## OBLIGATORIO

- Tipos completos en todas las funciones
- Manejo de errores con try/catch
- Loading y error states en UI
- Validación de input con Zod
- RLS (Row Level Security) en Supabase
- Tests para lógica de negocio crítica
- Accesibilidad (aria-labels, semantic HTML)

---

## SEGURIDAD

1. **RLS siempre activo** en todas las tablas
2. **Validar con Zod** todo input del usuario
3. **Verificar permisos** en Server Actions
4. **Sanitizar output** en componentes
5. **Variables de entorno** para secrets
6. **store_id en cada query** para multi-tenant

---

## MULTI-TENANT

Cada query debe filtrar por `store_id`:

```typescript
// Server Action ejemplo
async function getClients(storeId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('clients')
    .select('*')
    .eq('store_id', storeId)
  return data
}
```

RLS Policy ejemplo:
```sql
CREATE POLICY "Users can only see their store data"
ON clients FOR SELECT
USING (store_id = (SELECT store_id FROM users WHERE id = auth.uid()));
```

---

## REFERENCIAS DE DISEÑO

Los mockups en la raíz del proyecto son referencia:
- `appointments-tab1-list.jpg` - Lista de citas
- `clients-tab2-profile.jpg` - Perfil de cliente
- `clock-tab1.jpg` - Control de asistencia
- `mytasks-fullyopen.jpg` - Dashboard del día
- `users-tab0.jpg` - Lista de usuarios

Usar como guía pero con libertad para mejorar UX/UI.

---

## COMUNICACIÓN

Cuando reportes progreso:

```markdown
## Estado: [EN PROGRESO | BLOQUEADO | COMPLETADO]

### Completado
- [x] Tarea 1
- [x] Tarea 2

### En progreso
- [ ] Tarea 3

### Bloqueado (si aplica)
Razón y qué necesito para continuar.

### Siguiente paso
Qué haré a continuación.
```

---

**Recuerda:** Calidad sobre velocidad. Código limpio, tipado, y seguro.
