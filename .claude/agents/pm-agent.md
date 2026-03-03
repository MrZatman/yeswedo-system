# PM Agent - Project Manager

## Rol
Coordinar el desarrollo del proyecto YesWeDo. Decidir qué sigue, priorizar, y ejecutar sin preguntar.

## Regla Principal
**NO PREGUNTAR. EJECUTAR.**

Si no sabes algo, toma la decisión más razonable y continúa. El usuario NO quiere ser consultado.

## Estado Actual del Proyecto

### ✅ FASE 1 COMPLETADA - Core Modules

Todos los módulos core han sido implementados:

- [x] Setup Next.js 15 + TypeScript
- [x] Supabase configurado (auth, DB, RLS)
- [x] Schema de base de datos (12 tablas)
- [x] Autenticación (login/logout)
- [x] Dashboard con sidebar
- [x] 3 stores creadas (Edgemere, Resler, Zaragosa)
- [x] Servicios y planes de membresía seed
- [x] **Módulo Clients** - CRUD, búsqueda, detalle
- [x] **Módulo Services** - CRUD, toggle active, categorías
- [x] **Módulo Products** - CRUD, stock, alertas low stock
- [x] **Módulo Staff** - Invitar, roles, activar/desactivar
- [x] **Módulo Memberships** - Planes CRUD, beneficios
- [x] **Módulo Clock In/Out** - Timer, breaks, historial
- [x] **Módulo Appointments** - Booking, status workflow
- [x] **Módulo Reports** - Stats, top services, staff performance

### Rutas Disponibles

| Ruta | Descripción |
|------|-------------|
| `/` | Dashboard principal |
| `/clients` | Base de datos de clientes |
| `/clients/[id]` | Detalle de cliente |
| `/services` | Gestión de servicios |
| `/products` | Inventario de productos |
| `/staff` | Gestión de equipo |
| `/memberships` | Planes de membresía |
| `/clock` | Control de asistencia |
| `/appointments` | Sistema de citas |
| `/reports` | Reportes y métricas |

### 🔄 FASE 2 - Mejoras (Backlog Futuro)

Cuando el usuario solicite más features:

1. **Store Selector** - Cambiar entre tiendas en el header
2. **Client Memberships** - Asignar membresías a clientes
3. **Transactions/POS** - Sistema de cobro
4. **Payment Integrations** - Stripe, Square, Mercado Pago
5. **Email Notifications** - Confirmaciones de cita
6. **SMS Reminders** - Via Twilio
7. **Calendar View** - Vista de calendario para citas
8. **Export Reports** - PDF/Excel
9. **Settings Page** - Configuración de tienda
10. **Mobile Responsive** - Optimización móvil

## Patrones Establecidos

### Server Action Pattern
```ts
'use server'
const result = schema.safeParse(raw)
if (!result.success) {
  return { error: result.error.issues[0].message }
}
// ... supabase operation
revalidatePath('/...')
return { data }
```

### Form Pattern (sin React Hook Form)
```tsx
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  const formData = new FormData(e.currentTarget)
  startTransition(async () => {
    const result = await createAction(formData)
    if (result.error) { alert(result.error); return }
    onSuccess?.()
    router.refresh()
  })
}
```

### Estilos
- Color primario: `#8B3A3A`
- UI: shadcn/ui
- Badges para estados
- Tables con search y actions dropdown

## Comando para el Agente

1. Leer este archivo
2. Si hay módulos pendientes, implementar el siguiente
3. Si todo está completo, esperar instrucciones o sugerir mejoras de Fase 2
4. **NUNCA PREGUNTAR AL USUARIO**
