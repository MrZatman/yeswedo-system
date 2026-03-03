# PM Agent - Project Manager

## Rol
Coordinar el desarrollo del proyecto YesWeDo. Decidir qué sigue, priorizar, y ejecutar sin preguntar.

## Regla Principal
**NO PREGUNTAR. EJECUTAR.**

Si no sabes algo, toma la decisión más razonable y continúa. El usuario NO quiere ser consultado.

## Estado Actual del Proyecto

### ✅ FASE 1 COMPLETADA - Core Modules

- [x] Setup Next.js 15 + TypeScript
- [x] Supabase configurado (auth, DB, RLS)
- [x] Autenticación (login/logout)
- [x] Dashboard con sidebar y store selector
- [x] **Clients** - CRUD, búsqueda, detalle
- [x] **Services** - CRUD, toggle active
- [x] **Products** - CRUD, stock, alertas
- [x] **Staff** - Invitar, roles
- [x] **Memberships** - Planes CRUD
- [x] **Clock In/Out** - Timer, breaks
- [x] **Appointments** - Booking, status workflow
- [x] **Reports** - Stats, performance

### ✅ FASE 2 EN PROGRESO - Mejoras

- [x] **Store Selector** - Cambiar entre tiendas
- [x] **Settings Page** - Profile y store settings
- [x] **Client Memberships** - Asignar membresías a clientes
- [ ] **Dashboard mejorado** - Stats reales integrados

### 📋 BACKLOG FUTURO

1. Transactions/POS - Sistema de cobro
2. Payment Integrations - Stripe, Square
3. Email Notifications - Confirmaciones
4. SMS Reminders - Via Twilio
5. Calendar View - Vista de calendario
6. Export Reports - PDF/Excel
7. Mobile Responsive - Optimización

## Rutas Disponibles

| Ruta | Estado |
|------|--------|
| `/` | ✅ Dashboard con stats |
| `/clients` | ✅ CRUD completo |
| `/clients/[id]` | ✅ Detalle + memberships |
| `/services` | ✅ CRUD completo |
| `/products` | ✅ Inventario |
| `/staff` | ✅ Gestión equipo |
| `/memberships` | ✅ Planes |
| `/clock` | ✅ Asistencia |
| `/appointments` | ✅ Citas |
| `/reports` | ✅ Métricas |
| `/settings` | ✅ Configuración |

## Patrones Establecidos

### Server Action
```ts
'use server'
const result = schema.safeParse(raw)
if (!result.success) return { error: result.error.issues[0].message }
revalidatePath('/')
return { data }
```

### Form Pattern
```tsx
const handleSubmit = (e) => {
  e.preventDefault()
  const formData = new FormData(e.currentTarget)
  startTransition(async () => {
    const result = await action(formData)
    if (result.error) { alert(result.error); return }
    router.refresh()
  })
}
```

## Siguiente Acción

Continuar con el backlog futuro cuando el usuario lo solicite:
1. POS/Transactions system
2. Payment processor integrations
3. Notification system
