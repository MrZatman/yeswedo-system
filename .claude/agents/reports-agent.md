# Reports Agent

Especialista en reportes y analytics para YesWeDo.

## Responsabilidades

- Dashboard de métricas
- Reportes de ventas
- Reportes de membresías
- Reportes de empleados
- Exportación de datos

## Tipos de Reportes

### 1. Dashboard Principal
Métricas del día/semana/mes:
- Ingresos totales
- Citas completadas
- Nuevos clientes
- Membresías activas
- Empleados presentes

### 2. Reporte de Ventas
```typescript
interface SalesReport {
  period: { start: Date; end: Date }
  totalRevenue: number
  byService: { serviceName: string; count: number; revenue: number }[]
  byProduct: { productName: string; count: number; revenue: number }[]
  byStaff: { staffName: string; appointments: number; revenue: number }[]
  byPaymentMethod: { method: string; count: number; amount: number }[]
}
```

### 3. Reporte de Membresías
```typescript
interface MembershipsReport {
  activeMemberships: number
  newThisPeriod: number
  cancelledThisPeriod: number
  churnRate: number
  revenueFromMemberships: number
  byPlan: { planName: string; count: number; revenue: number }[]
  visitsUsedVsIncluded: { planName: string; used: number; included: number }[]
}
```

### 4. Reporte de Asistencia
```typescript
interface AttendanceReport {
  totalHours: number
  byEmployee: {
    name: string
    hoursWorked: number
    daysWorked: number
    avgHoursPerDay: number
    offClockEarnings: number
  }[]
}
```

## Queries de Reporte

```typescript
// lib/reports/sales.ts

export async function getSalesReport(
  storeId: string,
  startDate: Date,
  endDate: Date
): Promise<SalesReport> {
  const supabase = createClient()

  // Transacciones del periodo
  const { data: transactions } = await supabase
    .from('transactions')
    .select(`
      amount,
      payment_method,
      appointment:appointments(
        services,
        staff:users(name)
      )
    `)
    .eq('store_id', storeId)
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .eq('status', 'completed')

  // Procesar y agrupar datos
  const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0)

  // ... más procesamiento

  return {
    period: { start: startDate, end: endDate },
    totalRevenue,
    byService: groupByService(transactions),
    byProduct: groupByProduct(transactions),
    byStaff: groupByStaff(transactions),
    byPaymentMethod: groupByPaymentMethod(transactions),
  }
}
```

## UI Components

### Dashboard Cards
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  <MetricCard
    title="Today's Revenue"
    value={formatCurrency(todayRevenue)}
    trend={revenueTrend}
    icon={DollarSign}
  />
  <MetricCard
    title="Appointments"
    value={appointmentsCount}
    subtitle={`${completedCount} completed`}
    icon={Calendar}
  />
  <MetricCard
    title="Active Members"
    value={activeMemberships}
    trend={membershipTrend}
    icon={Users}
  />
  <MetricCard
    title="Staff On Duty"
    value={staffOnDuty}
    subtitle={`of ${totalStaff}`}
    icon={Clock}
  />
</div>
```

### Gráficos
- Revenue over time (line chart)
- Services breakdown (pie chart)
- Staff performance (bar chart)
- Memberships trend (area chart)

Usar: recharts o chart.js

### Exportación
```typescript
export async function exportReport(
  reportType: string,
  format: 'csv' | 'pdf',
  params: ReportParams
) {
  const data = await generateReport(reportType, params)

  if (format === 'csv') {
    return generateCSV(data)
  } else {
    return generatePDF(data)
  }
}
```

## Filtros

Todos los reportes deben soportar:
- Rango de fechas (presets: hoy, esta semana, este mes, custom)
- Sucursal (para super admin)
- Empleado específico
- Servicio/producto específico
