# Database Schema - YesWeDo

Schema completo de la base de datos para el sistema.

## Diagrama ER

```
stores
  │
  ├── users ←──────────────┐
  │     │                  │
  │     └── user_stores ───┘
  │
  ├── clients
  │     │
  │     ├── client_memberships ──→ membership_plans
  │     │         │
  │     │         └── membership_visits
  │     │
  │     └── appointments ──→ services
  │               │
  │               └── transactions
  │
  ├── clock_records ──→ users
  │
  ├── services
  │
  ├── products
  │
  └── membership_plans
```

## Tablas

### stores
```sql
CREATE TABLE stores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  phone TEXT,
  email TEXT,
  logo_url TEXT,
  timezone TEXT DEFAULT 'America/Chicago',
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### users
```sql
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### user_stores
```sql
CREATE TABLE user_stores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'store_manager', 'staff')),
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, store_id)
);
```

### clients
```sql
CREATE TABLE clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  avatar_url TEXT,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  last_visit_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_clients_store ON clients(store_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_clients_email ON clients(store_id, email) WHERE deleted_at IS NULL;
CREATE INDEX idx_clients_phone ON clients(store_id, phone) WHERE deleted_at IS NULL;
```

### services
```sql
CREATE TABLE services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 30,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
```

### products
```sql
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id),
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT,
  price DECIMAL(10,2) NOT NULL,
  cost DECIMAL(10,2),
  quantity_in_stock INT DEFAULT 0,
  low_stock_threshold INT DEFAULT 5,
  category TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
```

### membership_plans
```sql
CREATE TABLE membership_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id),
  name TEXT NOT NULL,
  shortcode TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  billing_period TEXT DEFAULT 'monthly' CHECK (billing_period IN ('monthly', 'yearly')),
  haircuts_included INT DEFAULT 0,
  services_included JSONB DEFAULT '[]',
  discount_percentage INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  stripe_price_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### client_memberships
```sql
CREATE TABLE client_memberships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id),
  client_id UUID NOT NULL REFERENCES clients(id),
  plan_id UUID NOT NULL REFERENCES membership_plans(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'expired')),
  start_date DATE NOT NULL,
  end_date DATE,
  cancelled_at TIMESTAMPTZ,
  payment_provider TEXT,
  subscription_id TEXT,
  visits_used INT DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### appointments
```sql
CREATE TABLE appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id),
  client_id UUID NOT NULL REFERENCES clients(id),
  staff_id UUID NOT NULL REFERENCES users(id),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INT NOT NULL,
  services JSONB NOT NULL DEFAULT '[]',
  products JSONB DEFAULT '[]',
  subtotal DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_appointments_date ON appointments(store_id, date);
CREATE INDEX idx_appointments_staff ON appointments(staff_id, date);
CREATE INDEX idx_appointments_client ON appointments(client_id);
```

### clock_records
```sql
CREATE TABLE clock_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id),
  user_id UUID NOT NULL REFERENCES users(id),
  clock_in TIMESTAMPTZ NOT NULL,
  clock_out TIMESTAMPTZ,
  hours_worked DECIMAL(5,2),
  break_minutes INT DEFAULT 0,
  off_clock_amount DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'edited')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clock_user_date ON clock_records(user_id, DATE(clock_in));
CREATE INDEX idx_clock_store_date ON clock_records(store_id, DATE(clock_in));
```

### transactions
```sql
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id),
  client_id UUID REFERENCES clients(id),
  appointment_id UUID REFERENCES appointments(id),
  membership_id UUID REFERENCES client_memberships(id),
  type TEXT NOT NULL CHECK (type IN ('sale', 'membership', 'refund')),
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT,
  payment_provider TEXT,
  payment_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_store_date ON transactions(store_id, created_at);
```

## RLS Policies

Aplicar a todas las tablas principales:

```sql
-- Template para cada tabla
ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Store isolation" ON [table_name]
  FOR ALL USING (
    store_id IN (
      SELECT store_id FROM user_stores
      WHERE user_id = auth.uid() AND is_active = true
    )
  );
```

## Funciones Útiles

```sql
-- Obtener store_id actual del usuario
CREATE OR REPLACE FUNCTION get_current_store_id()
RETURNS UUID AS $$
  SELECT store_id FROM user_stores
  WHERE user_id = auth.uid()
  AND is_active = true
  AND is_default = true
  LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Incrementar visitas de membresía
CREATE OR REPLACE FUNCTION increment_membership_visits(membership_uuid UUID)
RETURNS void AS $$
  UPDATE client_memberships
  SET visits_used = visits_used + 1,
      updated_at = NOW()
  WHERE id = membership_uuid;
$$ LANGUAGE SQL;

-- Actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas
CREATE TRIGGER update_[table]_updated_at
  BEFORE UPDATE ON [table_name]
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```
