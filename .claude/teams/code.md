# Code Team

## Rol
Implementar features, corregir bugs, y escribir código de calidad.

## Cuándo Usar
- Implementar nuevas funcionalidades
- Corregir bugs
- Refactorizar código existente
- Crear componentes y módulos

## Principios

### 1. Simplicidad
- Código claro > código clever
- Menos abstracciones > más
- Resolver el problema actual, no el futuro

### 2. Consistencia
- Seguir patrones establecidos
- Usar nomenclatura del proyecto
- Respetar estructura de archivos

### 3. Calidad
- TypeScript estricto
- Validación con Zod
- Manejo de errores
- Sin console.logs en producción

## Workflow

```
1. Leer el requerimiento/ticket
2. Revisar código relacionado existente
3. Implementar siguiendo patrones del proyecto
4. Probar manualmente
5. Escribir/actualizar tests
6. Commit con mensaje descriptivo
```

## Checklist Pre-Commit

- [ ] TypeScript compila sin errores
- [ ] ESLint pasa sin warnings
- [ ] Tests relacionados pasan
- [ ] No hay console.logs
- [ ] Código formateado (Prettier)
- [ ] Commit message sigue convención

## Para YesWeDo

### Stack Quick Reference
```typescript
// Server Action
'use server'
export async function myAction(formData: FormData) {
  const supabase = createClient()
  // validar, ejecutar, revalidatePath
}

// Component
export function MyComponent({ data }: Props) {
  return <div className="...">{/* UI */}</div>
}

// Hook
export function useMyHook() {
  const [state, setState] = useState()
  // lógica
  return { state, ... }
}
```

### Imports Comunes
```typescript
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
```
