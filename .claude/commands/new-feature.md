# Command: new-feature

Implementar una nueva feature siguiendo el flujo completo.

## Uso

```
/new-feature [descripción de la feature]
```

## Flujo

```
1. Research → 2. Plan → 3. Code → 4. Test → 5. Review
```

## Proceso Detallado

### 1. Research
- Entender el requerimiento completo
- Identificar módulos/archivos afectados
- Verificar si hay código reutilizable
- Documentar decisiones técnicas

### 2. Plan
Crear plan de implementación:

```markdown
## Feature: [Nombre]

### Descripción
[Qué hace la feature]

### Cambios Necesarios

#### Database
- [ ] Nueva tabla / columnas
- [ ] Migración SQL
- [ ] RLS policies

#### Backend
- [ ] Server Actions
- [ ] Validaciones Zod

#### Frontend
- [ ] Componentes nuevos
- [ ] Modificación de componentes existentes
- [ ] Nuevas rutas

#### Tests
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests

### Orden de Implementación
1. ...
2. ...
3. ...
```

### 3. Code
Implementar siguiendo el plan:
- Un commit por cada paso lógico
- Seguir patrones existentes
- TypeScript estricto
- Sin console.logs

### 4. Test
- Escribir tests para la nueva funcionalidad
- Ejecutar tests existentes para verificar que nada se rompió
- Probar manualmente flujos críticos

### 5. Review
- Auto-review del código
- Verificar checklist de calidad
- Documentar si es necesario

## Ejemplo: Feature "Historial de Visitas del Cliente"

### Research
- Se necesita mostrar historial de citas completadas
- Relacionado con: `appointments`, `client_memberships`
- UI: tabla en perfil del cliente

### Plan
```markdown
## Feature: Historial de Visitas

### Database
- [x] Query de appointments con status='completed'
- [x] Incluir servicios y staff

### Backend
- [x] getClientVisitHistory(clientId)
- [x] Tipos para VisitHistory

### Frontend
- [x] VisitHistoryTable component
- [x] Agregar a página de cliente
- [x] Loading state

### Tests
- [x] Test de getClientVisitHistory
```

### Implementación
```typescript
// actions/clients.ts
export async function getClientVisitHistory(clientId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('appointments')
    .select(`
      id,
      date,
      services,
      staff:users(name),
      created_at
    `)
    .eq('client_id', clientId)
    .eq('status', 'completed')
    .order('date', { ascending: false })

  return data
}
```

```tsx
// components/clients/VisitHistoryTable.tsx
export function VisitHistoryTable({ visits }: { visits: Visit[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Services</TableHead>
          <TableHead>Staff</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {visits.map((visit) => (
          <TableRow key={visit.id}>
            <TableCell>{format(visit.date, 'MMM d, yyyy')}</TableCell>
            <TableCell>{visit.services.map(s => s.name).join(', ')}</TableCell>
            <TableCell>{visit.staff.name}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

## Checklist Pre-Merge

- [ ] Feature funciona según spec
- [ ] Tests pasan
- [ ] TypeScript sin errores
- [ ] Lint sin warnings
- [ ] UI responsive
- [ ] Loading/error states
- [ ] Documentación actualizada (si necesario)
