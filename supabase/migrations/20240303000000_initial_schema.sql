-- YesWeDo System - Initial Schema
-- Sistema de gestión para barberías/salones

-- ============================================
-- STORES (Sucursales)
-- ============================================
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

-- ============================================
-- USERS (Usuarios del sistema)
-- ============================================
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USER_STORES (Relación usuario-sucursal)
-- ============================================
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

-- ============================================
-- CLIENTS (Clientes)
-- ============================================
CREATE TABLE clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
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

-- ============================================
-- SERVICES (Servicios)
-- ============================================
CREATE TABLE services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
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

CREATE INDEX idx_services_store ON services(store_id) WHERE deleted_at IS NULL;

-- ============================================
-- PRODUCTS (Productos)
-- ============================================
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
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

CREATE INDEX idx_products_store ON products(store_id) WHERE deleted_at IS NULL;

-- ============================================
-- MEMBERSHIP_PLANS (Planes de membresía)
-- ============================================
CREATE TABLE membership_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
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

CREATE INDEX idx_membership_plans_store ON membership_plans(store_id);

-- ============================================
-- CLIENT_MEMBERSHIPS (Membresías activas)
-- ============================================
CREATE TABLE client_memberships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
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

CREATE INDEX idx_client_memberships_client ON client_memberships(client_id);
CREATE INDEX idx_client_memberships_store ON client_memberships(store_id);

-- ============================================
-- APPOINTMENTS (Citas)
-- ============================================
CREATE TABLE appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
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

-- ============================================
-- CLOCK_RECORDS (Control de asistencia)
-- ============================================
CREATE TABLE clock_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

CREATE INDEX idx_clock_user_date ON clock_records(user_id, clock_in);
CREATE INDEX idx_clock_store_date ON clock_records(store_id, clock_in);

-- ============================================
-- TRANSACTIONS (Transacciones de pago)
-- ============================================
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id),
  appointment_id UUID REFERENCES appointments(id),
  membership_id UUID REFERENCES client_memberships(id),
  type TEXT NOT NULL CHECK (type IN ('sale', 'membership', 'refund', 'product')),
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
CREATE INDEX idx_transactions_client ON transactions(client_id);

-- ============================================
-- MEMBERSHIP_VISITS (Historial de visitas)
-- ============================================
CREATE TABLE membership_visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  membership_id UUID NOT NULL REFERENCES client_memberships(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id),
  visit_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  services_used JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_membership_visits_membership ON membership_visits(membership_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE clock_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_visits ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id);

-- Users can view their store associations
CREATE POLICY "Users can view own store associations"
ON user_stores FOR SELECT
USING (user_id = auth.uid());

-- Store isolation policy for stores table
CREATE POLICY "Users can view their stores"
ON stores FOR SELECT
USING (
  id IN (
    SELECT store_id FROM user_stores
    WHERE user_id = auth.uid() AND is_active = true
  )
);

-- Generic store isolation policies for data tables
CREATE POLICY "Store isolation - clients"
ON clients FOR ALL
USING (
  store_id IN (
    SELECT store_id FROM user_stores
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Store isolation - services"
ON services FOR ALL
USING (
  store_id IN (
    SELECT store_id FROM user_stores
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Store isolation - products"
ON products FOR ALL
USING (
  store_id IN (
    SELECT store_id FROM user_stores
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Store isolation - membership_plans"
ON membership_plans FOR ALL
USING (
  store_id IN (
    SELECT store_id FROM user_stores
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Store isolation - client_memberships"
ON client_memberships FOR ALL
USING (
  store_id IN (
    SELECT store_id FROM user_stores
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Store isolation - appointments"
ON appointments FOR ALL
USING (
  store_id IN (
    SELECT store_id FROM user_stores
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Store isolation - clock_records"
ON clock_records FOR ALL
USING (
  store_id IN (
    SELECT store_id FROM user_stores
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Store isolation - transactions"
ON transactions FOR ALL
USING (
  store_id IN (
    SELECT store_id FROM user_stores
    WHERE user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Store isolation - membership_visits"
ON membership_visits FOR ALL
USING (
  membership_id IN (
    SELECT id FROM client_memberships
    WHERE store_id IN (
      SELECT store_id FROM user_stores
      WHERE user_id = auth.uid() AND is_active = true
    )
  )
);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_membership_plans_updated_at BEFORE UPDATE ON membership_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_client_memberships_updated_at BEFORE UPDATE ON client_memberships FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_clock_records_updated_at BEFORE UPDATE ON clock_records FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to increment membership visits
CREATE OR REPLACE FUNCTION increment_membership_visits(membership_uuid UUID)
RETURNS void AS $$
  UPDATE client_memberships
  SET visits_used = visits_used + 1,
      updated_at = NOW()
  WHERE id = membership_uuid;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Function to get current store for user
CREATE OR REPLACE FUNCTION get_current_store_id()
RETURNS UUID AS $$
  SELECT store_id FROM user_stores
  WHERE user_id = auth.uid()
  AND is_active = true
  AND is_default = true
  LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER;
