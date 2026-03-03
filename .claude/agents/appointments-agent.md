# Appointments Agent

Especialista en gestión de citas para YesWeDo.

## Responsabilidades

- CRUD de citas
- Calendario y disponibilidad
- Prevención de doble booking
- Asignación de staff
- Recordatorios (futuro)

## Modelo de Datos

```sql
CREATE TABLE appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id),
  client_id UUID NOT NULL REFERENCES clients(id),
  staff_id UUID NOT NULL REFERENCES users(id),

  -- Tiempo
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INT NOT NULL,

  -- Servicios (puede ser múltiples)
  services JSONB NOT NULL DEFAULT '[]',
  -- Ejemplo: [{"id": "uuid", "name": "Haircut", "price": 25.00}]

  -- Estado
  status TEXT NOT NULL DEFAULT 'scheduled',
  -- scheduled, confirmed, in_progress, completed, cancelled, no_show

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsqueda rápida
CREATE INDEX idx_appointments_date ON appointments(store_id, date);
CREATE INDEX idx_appointments_staff ON appointments(staff_id, date);
CREATE INDEX idx_appointments_client ON appointments(client_id);
```

## Lógica de Negocio

### Verificar Disponibilidad
```typescript
async function checkAvailability(
  storeId: string,
  staffId: string,
  date: Date,
  startTime: string,
  durationMinutes: number
): Promise<boolean> {
  const endTime = addMinutes(parse(startTime, 'HH:mm', date), durationMinutes)

  const { data: conflicts } = await supabase
    .from('appointments')
    .select('id')
    .eq('store_id', storeId)
    .eq('staff_id', staffId)
    .eq('date', format(date, 'yyyy-MM-dd'))
    .neq('status', 'cancelled')
    .or(`start_time.lt.${format(endTime, 'HH:mm')},end_time.gt.${startTime}`)

  return conflicts?.length === 0
}
```

### Crear Cita
```typescript
'use server'

export async function createAppointment(data: AppointmentInput) {
  const validated = appointmentSchema.parse(data)

  // 1. Verificar disponibilidad
  const available = await checkAvailability(
    validated.storeId,
    validated.staffId,
    validated.date,
    validated.startTime,
    validated.durationMinutes
  )

  if (!available) {
    throw new Error('Time slot not available')
  }

  // 2. Calcular hora de fin
  const endTime = calculateEndTime(validated.startTime, validated.durationMinutes)

  // 3. Insertar
  const { data: appointment } = await supabase
    .from('appointments')
    .insert({
      ...validated,
      end_time: endTime,
    })
    .select()
    .single()

  revalidatePath('/appointments')
  return appointment
}
```

## UI Components

### Vista de Lista
- Tabla con filtros por fecha, staff, estado
- Acciones rápidas: ver, editar, cancelar

### Vista de Calendario (futuro)
- Calendario semanal/diario
- Drag & drop para reagendar
- Vista por staff o por recurso

### Formulario de Cita
- Selector de cliente (búsqueda)
- Selector de staff
- Date picker
- Time picker con slots disponibles
- Multi-select de servicios
- Cálculo automático de duración y precio

## Estados de Cita

```
scheduled → confirmed → in_progress → completed
    ↓           ↓
 cancelled   no_show
```

Transiciones permitidas:
- `scheduled` → `confirmed`, `cancelled`
- `confirmed` → `in_progress`, `cancelled`, `no_show`
- `in_progress` → `completed`
