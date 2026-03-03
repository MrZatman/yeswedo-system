# Command: new-module

Crear un nuevo módulo completo para el sistema.

## Uso

```
/new-module [nombre-del-modulo]
```

## Qué Genera

```
src/
├── app/(dashboard)/[module]/
│   ├── page.tsx           # Lista/tabla principal
│   ├── [id]/
│   │   └── page.tsx       # Detalle individual
│   └── new/
│       └── page.tsx       # Formulario de creación
├── actions/
│   └── [module].ts        # Server Actions
├── components/[module]/
│   ├── [Module]Form.tsx   # Formulario
│   ├── [Module]Card.tsx   # Card para lista
│   └── [Module]Table.tsx  # Columnas de tabla
├── lib/validations/
│   └── [module].ts        # Schema Zod
└── types/
    └── [module].ts        # Tipos TypeScript
```

## Ejemplo: Crear módulo "services"

### 1. Schema de Validación
```typescript
// lib/validations/service.ts
import { z } from 'zod'

export const serviceSchema = z.object({
  store_id: z.string().uuid(),
  name: z.string().min(2),
  description: z.string().optional(),
  price: z.coerce.number().min(0),
  duration_minutes: z.coerce.number().min(5),
  is_active: z.boolean().default(true),
})

export type ServiceFormData = z.infer<typeof serviceSchema>
```

### 2. Server Actions
```typescript
// actions/services.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { serviceSchema } from '@/lib/validations/service'

export async function getServices(storeId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('services')
    .select('*')
    .eq('store_id', storeId)
    .is('deleted_at', null)
    .order('name')
  return data ?? []
}

export async function createService(formData: FormData) {
  // ... validación e inserción
  revalidatePath('/services')
}

export async function updateService(id: string, formData: FormData) {
  // ... validación y actualización
  revalidatePath('/services')
  revalidatePath(`/services/${id}`)
}

export async function deleteService(id: string) {
  // ... soft delete
  revalidatePath('/services')
}
```

### 3. Página Principal
```tsx
// app/(dashboard)/services/page.tsx
import { getServices } from '@/actions/services'
import { DataTable } from '@/components/ui/data-table'
import { serviceColumns } from '@/components/services/columns'
import { ServiceModal } from '@/components/services/ServiceModal'
import { getCurrentStore } from '@/lib/supabase/helpers'

export default async function ServicesPage() {
  const storeId = await getCurrentStore()
  const services = await getServices(storeId)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Services</h1>
        <ServiceModal storeId={storeId} />
      </div>
      <DataTable
        columns={serviceColumns}
        data={services}
        searchKey="name"
      />
    </div>
  )
}
```

### 4. Formulario
```tsx
// components/services/ServiceForm.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { serviceSchema, type ServiceFormData } from '@/lib/validations/service'
// ... implementación del formulario
```

### 5. Migración SQL
```sql
-- supabase/migrations/xxx_create_services.sql
CREATE TABLE services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store isolation" ON services
  FOR ALL USING (
    store_id IN (SELECT store_id FROM user_stores WHERE user_id = auth.uid())
  );

CREATE INDEX idx_services_store ON services(store_id) WHERE deleted_at IS NULL;
```

## Checklist Post-Creación

- [ ] Migración SQL creada y aplicada
- [ ] RLS policies configuradas
- [ ] Tipos generados (`npx supabase gen types`)
- [ ] Server Actions implementadas
- [ ] Validación Zod creada
- [ ] Formulario creado
- [ ] Tabla/lista creada
- [ ] Página de detalle creada
- [ ] Tests básicos agregados
- [ ] Link en sidebar agregado
