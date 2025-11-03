/*
  # Digital Product Marketplace Schema
  
  ## Overview
  Complete database schema for a digital product key marketplace with advanced admin features
  
  ## New Tables
  
  ### 1. categories
  - `id` (uuid, primary key)
  - `name` (text) - Category name
  - `slug` (text, unique) - URL-friendly identifier
  - `description` (text) - Category description
  - `image_url` (text) - Category image
  - `is_active` (boolean) - Active/inactive status
  - `display_order` (integer) - Sort order
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### 2. products
  - `id` (uuid, primary key)
  - `category_id` (uuid, foreign key)
  - `name` (text) - Product name
  - `slug` (text, unique) - URL-friendly identifier
  - `description` (text) - Product description
  - `price` (decimal) - Product price
  - `image_url` (text) - Product image
  - `is_active` (boolean) - Active/inactive status
  - `is_featured` (boolean) - Featured product flag
  - `stock_count` (integer) - Available keys count
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### 3. product_keys
  - `id` (uuid, primary key)
  - `product_id` (uuid, foreign key)
  - `key_value` (text, encrypted) - The actual product key
  - `is_sold` (boolean) - Sold status
  - `sold_to_user_id` (uuid, nullable) - User who purchased
  - `sold_at` (timestamptz, nullable) - Sale timestamp
  - `created_at` (timestamptz)
  
  ### 4. users_profile
  - `id` (uuid, primary key, references auth.users)
  - `username` (text, unique)
  - `full_name` (text)
  - `role` (text) - 'admin' or 'customer'
  - `is_blocked` (boolean) - Block/unblock status
  - `last_ip` (text) - Last login IP
  - `country` (text) - User country
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### 5. orders
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `order_number` (text, unique) - Human-readable order ID
  - `total_amount` (decimal) - Total order value
  - `status` (text) - Order status
  - `payment_method` (text) - Payment method used
  - `ip_address` (text) - Purchase IP
  - `country` (text) - Purchase country
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### 6. order_items
  - `id` (uuid, primary key)
  - `order_id` (uuid, foreign key)
  - `product_id` (uuid, foreign key)
  - `product_key_id` (uuid, foreign key)
  - `product_name` (text) - Snapshot of product name
  - `price` (decimal) - Price at time of purchase
  - `created_at` (timestamptz)
  
  ### 7. user_sessions
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `ip_address` (text)
  - `country` (text)
  - `user_agent` (text)
  - `created_at` (timestamptz)
  
  ## Security
  - RLS enabled on all tables
  - Admin policies for full access
  - Customer policies for restricted access
  - Public read access for active products/categories
*/

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  image_url text DEFAULT '',
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text DEFAULT '',
  price decimal(10,2) NOT NULL DEFAULT 0,
  image_url text DEFAULT '',
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  stock_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  key_value text NOT NULL,
  is_sold boolean DEFAULT false,
  sold_to_user_id uuid REFERENCES auth.users(id),
  sold_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users_profile (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  full_name text DEFAULT '',
  role text DEFAULT 'customer',
  is_blocked boolean DEFAULT false,
  last_ip text DEFAULT '',
  country text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  order_number text UNIQUE NOT NULL,
  total_amount decimal(10,2) NOT NULL DEFAULT 0,
  status text DEFAULT 'pending',
  payment_method text DEFAULT '',
  ip_address text DEFAULT '',
  country text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_key_id uuid REFERENCES product_keys(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  price decimal(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address text DEFAULT '',
  country text DEFAULT '',
  user_agent text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_product_keys_product ON product_keys(product_id);
CREATE INDEX IF NOT EXISTS idx_product_keys_sold ON product_keys(is_sold);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active categories"
  ON categories FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.role = 'admin'
    )
  );

CREATE POLICY "Public can view active products"
  ON products FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.role = 'admin'
    )
  );

CREATE POLICY "Admins can view product keys"
  ON product_keys FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage product keys"
  ON product_keys FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.role = 'admin'
    )
  );

CREATE POLICY "Users can view purchased keys"
  ON product_keys FOR SELECT
  TO authenticated
  USING (sold_to_user_id = auth.uid() AND is_sold = true);

CREATE POLICY "Users can view own profile"
  ON users_profile FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON users_profile FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND role = 'customer');

CREATE POLICY "Admins can view all profiles"
  ON users_profile FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile up
      WHERE up.id = auth.uid()
      AND up.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage profiles"
  ON users_profile FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.role = 'admin'
    )
  );

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage orders"
  ON orders FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.role = 'admin'
    )
  );

CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage order items"
  ON order_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.role = 'admin'
    )
  );

CREATE POLICY "Users can view own sessions"
  ON user_sessions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own sessions"
  ON user_sessions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all sessions"
  ON user_sessions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE users_profile.id = auth.uid()
      AND users_profile.role = 'admin'
    )
  );

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_profile_updated_at BEFORE UPDATE ON users_profile
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();