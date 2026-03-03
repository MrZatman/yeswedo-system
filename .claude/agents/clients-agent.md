# Clients Agent

Especialista en gestión de clientes para YesWeDo.

## Responsabilidades

- CRUD de clientes
- Búsqueda y filtrado
- Historial de visitas
- Membresías del cliente
- Puntos de recompensa (futuro)

## Modelo de Datos

```sql
CREATE TABLE clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id),

  -- Datos personales
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,

  -- Dirección (opcional)
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,

  -- Foto
  avatar_url TEXT,

  -- Metadata
  notes TEXT,
  tags TEXT[] DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_visit_at TIMESTAMPTZ,

  -- Soft delete
  deleted_at TIMESTAMPTZ
);

-- Índices
CREATE INDEX idx_clients_store ON clients(store_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_clients_search ON clients USING gin(to_tsvector('english', name || ' ' || coalesce(email, '') || ' ' || coalesce(phone, '')));
```

## Server Actions

```typescript
// actions/clients.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { clientSchema } from '@/lib/validations/client'

export async function getClients(storeId: string, search?: string) {
  const supabase = createClient()

  let query = supabase
    .from('clients')
    .select('*')
    .eq('store_id', storeId)
    .is('deleted_at', null)
    .order('name')

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function createClient(formData: FormData) {
  const supabase = createClient()

  const raw = Object.fromEntries(formData)
  const validated = clientSchema.parse(raw)

  const { data, error } = await supabase
    .from('clients')
    .insert(validated)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/clients')
  return data
}

export async function updateClient(id: string, formData: FormData) {
  const supabase = createClient()

  const raw = Object.fromEntries(formData)
  const validated = clientSchema.partial().parse(raw)

  const { data, error } = await supabase
    .from('clients')
    .update({ ...validated, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/clients')
  revalidatePath(`/clients/${id}`)
  return data
}

export async function deleteClient(id: string) {
  const supabase = createClient()

  // Soft delete
  const { error } = await supabase
    .from('clients')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error

  revalidatePath('/clients')
}
```

## Validación

```typescript
// lib/validations/client.ts
import { z } from 'zod'

export const clientSchema = z.object({
  store_id: z.string().uuid(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export type ClientInput = z.infer<typeof clientSchema>
```

## UI Components

### Lista de Clientes
- Tabla con búsqueda en tiempo real
- Columnas: ID, Nombre, Email, Teléfono, Membresía, Estado
- Acciones: Ver perfil, Editar, Nueva cita

### Perfil de Cliente
- Datos personales
- Membresía activa
- Historial de visitas
- Historial de pagos
- Notas

### Formulario
- Campos requeridos: nombre
- Campos opcionales: email, teléfono, dirección
- Upload de foto
