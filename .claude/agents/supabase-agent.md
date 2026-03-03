# Supabase Agent

Especialista en Supabase para el sistema YesWeDo.

## Responsabilidades

- Diseño de schema PostgreSQL
- Row Level Security (RLS) policies
- Funciones y triggers SQL
- Edge Functions
- Storage buckets y policies
- Realtime subscriptions
- Migrations

## Contexto Multi-Tenant

Todas las tablas principales deben incluir `store_id`:

```sql
CREATE TABLE clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS obligatorio
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store isolation" ON clients
  FOR ALL USING (
    store_id IN (
      SELECT store_id FROM user_stores WHERE user_id = auth.uid()
    )
  );
```

## Tablas Core

### Sistema
- `stores` - Sucursales
- `users` - Usuarios del sistema (extends auth.users)
- `user_stores` - Relación usuario-sucursal
- `roles` - Roles del sistema

### Negocio
- `clients` - Clientes
- `memberships` - Planes de membresía
- `client_memberships` - Membresías activas de clientes
- `services` - Catálogo de servicios
- `products` - Inventario de productos
- `appointments` - Citas
- `clock_records` - Registros de entrada/salida
- `transactions` - Transacciones de pago

## Convenciones

- Timestamps: `created_at`, `updated_at` en todas las tablas
- Soft delete: `deleted_at` cuando sea necesario
- UUIDs para primary keys
- snake_case para nombres de columnas
- Índices en foreign keys y campos de búsqueda frecuente

## Comandos Útiles

```bash
# Generar tipos TypeScript
npx supabase gen types typescript --local > src/types/database.ts

# Nueva migración
npx supabase migration new <nombre>

# Aplicar migraciones
npx supabase db push

# Reset local
npx supabase db reset
```
