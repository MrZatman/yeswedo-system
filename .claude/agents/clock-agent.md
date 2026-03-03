# Clock Agent

Especialista en control de asistencia para YesWeDo.

## Responsabilidades

- Clock In / Clock Out de empleados
- Cálculo de horas trabajadas
- Reportes de asistencia
- Servicios fuera de horario (off-clock)

## Modelo de Datos

```sql
CREATE TABLE clock_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id),
  user_id UUID NOT NULL REFERENCES users(id),

  -- Tiempos
  clock_in TIMESTAMPTZ NOT NULL,
  clock_out TIMESTAMPTZ,

  -- Calculado
  hours_worked DECIMAL(5,2),
  break_minutes INT DEFAULT 0,

  -- Off-clock earnings (servicios sin estar en horario)
  off_clock_amount DECIMAL(10,2) DEFAULT 0,

  -- Estado
  status TEXT NOT NULL DEFAULT 'active',
  -- active (clocked in), completed, edited

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_clock_records_user_date
  ON clock_records(user_id, DATE(clock_in));
CREATE INDEX idx_clock_records_store_date
  ON clock_records(store_id, DATE(clock_in));
```

## Server Actions

```typescript
// actions/clock.ts
'use server'

export async function clockIn(userId: string, storeId: string) {
  const supabase = createClient()

  // Verificar que no esté ya clockeado
  const { data: existing } = await supabase
    .from('clock_records')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()

  if (existing) {
    throw new Error('Already clocked in')
  }

  const { data, error } = await supabase
    .from('clock_records')
    .insert({
      store_id: storeId,
      user_id: userId,
      clock_in: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath('/clock')
  return data
}

export async function clockOut(recordId: string) {
  const supabase = createClient()

  const clockOut = new Date()

  // Obtener clock in
  const { data: record } = await supabase
    .from('clock_records')
    .select('clock_in')
    .eq('id', recordId)
    .single()

  // Calcular horas
  const clockIn = new Date(record.clock_in)
  const hoursWorked = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60)

  const { data, error } = await supabase
    .from('clock_records')
    .update({
      clock_out: clockOut.toISOString(),
      hours_worked: Math.round(hoursWorked * 100) / 100,
      status: 'completed',
    })
    .eq('id', recordId)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/clock')
  return data
}

export async function getTodayClockRecords(storeId: string) {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data } = await supabase
    .from('clock_records')
    .select(`
      *,
      user:users(id, name, avatar_url)
    `)
    .eq('store_id', storeId)
    .gte('clock_in', `${today}T00:00:00`)
    .lte('clock_in', `${today}T23:59:59`)
    .order('clock_in', { ascending: false })

  return data
}
```

## UI Components

### Vista Principal (Clock In & Out Report)
Según mockup `clock-tab1.jpg`:
- Tabla de empleados del día
- Columnas: Employee Name, Check-in Today, Check-out Today, Hours, Off-clock $
- Botón "More Details" para cada registro

### Detalle de Empleado
Según mockup `clock-tab2-personaldetail.jpg`:
- Info del empleado
- Historial de clockeos
- Resumen semanal/mensual

### Botón Clock In/Out
- Prominente en el dashboard del empleado
- Estado visual: clockeado o no
- Timestamp visible

## Reportes

### Reporte Diario
```typescript
export async function getDailyReport(storeId: string, date: Date) {
  const { data } = await supabase
    .from('clock_records')
    .select(`
      user:users(name),
      clock_in,
      clock_out,
      hours_worked,
      off_clock_amount
    `)
    .eq('store_id', storeId)
    .eq('DATE(clock_in)', format(date, 'yyyy-MM-dd'))

  const totalHours = data.reduce((sum, r) => sum + (r.hours_worked || 0), 0)
  const totalOffClock = data.reduce((sum, r) => sum + (r.off_clock_amount || 0), 0)

  return { records: data, totalHours, totalOffClock }
}
```

### Reporte Semanal/Mensual
- Horas por empleado
- Promedio de horas
- Días trabajados
- Ingresos off-clock
