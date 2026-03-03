-- Seed data for YesWeDo System
-- Run this after the initial migration

-- Create initial stores (based on legacy data)
INSERT INTO stores (id, name, slug, address, city, state, zip_code, phone, email, timezone)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'YesWeDo Edgemere', 'edgemere', '7365 Remcon Suite B 206', 'El Paso', 'TX', '79912', '(915) 585-0713', 'info@yeswedoapp.com', 'America/Chicago'),
  ('22222222-2222-2222-2222-222222222222', 'YesWeDo Resler', 'resler', NULL, 'El Paso', 'TX', NULL, NULL, NULL, 'America/Chicago'),
  ('33333333-3333-3333-3333-333333333333', 'YesWeDo Zaragosa', 'zaragosa', NULL, 'El Paso', 'TX', NULL, NULL, NULL, 'America/Chicago');

-- Create some default services
INSERT INTO services (store_id, name, description, price, duration_minutes, category)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Haircut Man', 'Standard men''s haircut', 25.00, 30, 'Haircuts'),
  ('11111111-1111-1111-1111-111111111111', 'Haircut Woman', 'Standard women''s haircut', 35.00, 45, 'Haircuts'),
  ('11111111-1111-1111-1111-111111111111', 'Shave', 'Traditional straight razor shave', 20.00, 20, 'Shaves'),
  ('11111111-1111-1111-1111-111111111111', 'Beard Trim', 'Beard shaping and trimming', 15.00, 15, 'Beards'),
  ('11111111-1111-1111-1111-111111111111', 'Color', 'Hair coloring service', 50.00, 60, 'Color'),
  ('11111111-1111-1111-1111-111111111111', 'Highlights', 'Hair highlights', 75.00, 90, 'Color'),
  ('11111111-1111-1111-1111-111111111111', 'Perm', 'Permanent wave', 80.00, 120, 'Styling'),
  ('11111111-1111-1111-1111-111111111111', 'Wash', 'Hair wash and conditioning', 10.00, 15, 'Wash');

-- Copy services to other stores
INSERT INTO services (store_id, name, description, price, duration_minutes, category)
SELECT '22222222-2222-2222-2222-222222222222', name, description, price, duration_minutes, category
FROM services WHERE store_id = '11111111-1111-1111-1111-111111111111';

INSERT INTO services (store_id, name, description, price, duration_minutes, category)
SELECT '33333333-3333-3333-3333-333333333333', name, description, price, duration_minutes, category
FROM services WHERE store_id = '11111111-1111-1111-1111-111111111111';

-- Create default membership plans
INSERT INTO membership_plans (store_id, name, shortcode, description, price, haircuts_included, discount_percentage)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Basic', 'BASIC', '2 haircuts per month', 39.99, 2, 0),
  ('11111111-1111-1111-1111-111111111111', 'Silver', 'SILVER', '4 haircuts per month', 69.99, 4, 10),
  ('11111111-1111-1111-1111-111111111111', 'Gold', 'GOLD', 'Unlimited haircuts', 99.99, 0, 15),
  ('11111111-1111-1111-1111-111111111111', 'Platinum', 'PLATINUM', 'Unlimited haircuts + products discount', 149.99, 0, 25);

-- Copy plans to other stores
INSERT INTO membership_plans (store_id, name, shortcode, description, price, haircuts_included, discount_percentage)
SELECT '22222222-2222-2222-2222-222222222222', name, shortcode, description, price, haircuts_included, discount_percentage
FROM membership_plans WHERE store_id = '11111111-1111-1111-1111-111111111111';

INSERT INTO membership_plans (store_id, name, shortcode, description, price, haircuts_included, discount_percentage)
SELECT '33333333-3333-3333-3333-333333333333', name, shortcode, description, price, haircuts_included, discount_percentage
FROM membership_plans WHERE store_id = '11111111-1111-1111-1111-111111111111';
