# Memberships Agent

Especialista en gestión de membresías para YesWeDo.

## Responsabilidades

- Planes de membresía (configuración)
- Membresías de clientes
- Control de visitas/servicios incluidos
- Renovaciones y cancelaciones
- Integración con pagos recurrentes

## Modelo de Datos

```sql
-- Planes disponibles
CREATE TABLE membership_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id),

  -- Info del plan
  name TEXT NOT NULL,
  shortcode TEXT NOT NULL,  -- Ej: "GOLD", "SILVER"
  description TEXT,

  -- Pricing
  price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  billing_period TEXT NOT NULL DEFAULT 'monthly',  -- monthly, yearly

  -- Beneficios
  haircuts_included INT DEFAULT 0,  -- 0 = unlimited
  services_included JSONB DEFAULT '[]',
  discount_percentage INT DEFAULT 0,

  -- Estado
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Membresías activas de clientes
CREATE TABLE client_memberships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id),
  client_id UUID NOT NULL REFERENCES clients(id),
  plan_id UUID NOT NULL REFERENCES membership_plans(id),

  -- Estado
  status TEXT NOT NULL DEFAULT 'active',
  -- active, paused, cancelled, expired

  -- Fechas
  start_date DATE NOT NULL,
  end_date DATE,
  cancelled_at TIMESTAMPTZ,

  -- Pago
  payment_provider TEXT,  -- stripe, square, etc.
  subscription_id TEXT,   -- ID en el procesador

  -- Uso del periodo actual
  visits_used INT DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Historial de visitas por membresía
CREATE TABLE membership_visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  membership_id UUID NOT NULL REFERENCES client_memberships(id),
  appointment_id UUID REFERENCES appointments(id),

  visit_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  services_used JSONB NOT NULL DEFAULT '[]',

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Lógica de Negocio

### Verificar Visitas Disponibles
```typescript
async function checkVisitsAvailable(membershipId: string): Promise<{
  available: boolean
  used: number
  total: number | 'unlimited'
}> {
  const { data: membership } = await supabase
    .from('client_memberships')
    .select(`
      visits_used,
      plan:membership_plans(haircuts_included)
    `)
    .eq('id', membershipId)
    .single()

  const total = membership.plan.haircuts_included
  const used = membership.visits_used

  if (total === 0) {
    return { available: true, used, total: 'unlimited' }
  }

  return {
    available: used < total,
    used,
    total
  }
}
```

### Registrar Visita
```typescript
'use server'

export async function recordMembershipVisit(
  membershipId: string,
  appointmentId: string,
  services: Service[]
) {
  const supabase = createClient()

  // 1. Verificar disponibilidad
  const availability = await checkVisitsAvailable(membershipId)
  if (!availability.available) {
    throw new Error('No visits available in current period')
  }

  // 2. Registrar visita
  await supabase.from('membership_visits').insert({
    membership_id: membershipId,
    appointment_id: appointmentId,
    services_used: services,
  })

  // 3. Incrementar contador
  await supabase.rpc('increment_membership_visits', {
    membership_id: membershipId
  })

  revalidatePath('/clients')
}
```

### Reset Mensual de Visitas
```sql
-- Edge Function o Cron Job
CREATE OR REPLACE FUNCTION reset_monthly_visits()
RETURNS void AS $$
BEGIN
  UPDATE client_memberships
  SET
    visits_used = 0,
    period_start = CURRENT_DATE,
    period_end = CURRENT_DATE + INTERVAL '1 month'
  WHERE
    status = 'active'
    AND period_end <= CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;
```

## UI Components

### Configuración de Planes (Admin)
- Lista de planes con precios
- Crear/editar plan
- Activar/desactivar plan

### Membresía del Cliente
- Plan actual
- Visitas usadas / disponibles (indicador visual)
- Fecha de renovación
- Historial de visitas
- Botón para upgrade/cancelar

### Asignar Membresía
- Selector de plan
- Método de pago
- Fecha de inicio
