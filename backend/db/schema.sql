-- Nocturne database schema. Safe to run more than once (`npm run db:migrate`).
--
-- Supabase exposes the `public` schema through its auto-generated REST API.
-- RLS is enabled below with NO policies, which blocks that API completely;
-- only this backend (connecting as the database owner via DATABASE_URL) can read/write.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL CHECK (length(name) BETWEEN 1 AND 120),
  email         text NOT NULL,
  password_hash text NOT NULL,
  phone         text,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_key ON users (lower(email));

CREATE TABLE IF NOT EXISTS products (
  id               text PRIMARY KEY,
  slug             text NOT NULL UNIQUE,
  name             text NOT NULL,
  description      text NOT NULL DEFAULT '',
  category         text NOT NULL CHECK (category IN ('women', 'men', 'bags', 'shoes', 'jewellery')),
  subcategory      text NOT NULL,
  price            integer NOT NULL CHECK (price >= 0),          -- whole rupees, GST inclusive
  compare_at_price integer CHECK (compare_at_price >= 0),        -- original price when discounted
  colours          jsonb NOT NULL DEFAULT '[]',                  -- [{ "name": "Black", "hex": "#141414" }]
  sizes            text[] NOT NULL DEFAULT '{}',
  stock            jsonb NOT NULL DEFAULT '{}',                  -- { "S": 4, "M": 0 }
  rating           numeric(2, 1) NOT NULL DEFAULT 0,
  review_count     integer NOT NULL DEFAULT 0,
  tags             text[] NOT NULL DEFAULT '{}',
  silhouette       text NOT NULL,
  composition      text NOT NULL DEFAULT '',
  details          text[] NOT NULL DEFAULT '{}',
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS products_category_idx ON products (category);
CREATE INDEX IF NOT EXISTS products_created_at_idx ON products (created_at DESC);

CREATE TABLE IF NOT EXISTS orders (
  id             text PRIMARY KEY,
  user_id        uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  status         text NOT NULL DEFAULT 'placed'
                 CHECK (status IN ('placed', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  -- Delivery address
  ship_full_name text NOT NULL,
  ship_phone     text NOT NULL,
  ship_email     text NOT NULL,
  ship_line1     text NOT NULL,
  ship_line2     text NOT NULL DEFAULT '',
  ship_city      text NOT NULL,
  ship_state     text NOT NULL,
  ship_pincode   text NOT NULL,
  -- Price summary, computed by the server from current product prices
  item_count     integer NOT NULL,
  mrp_total      integer NOT NULL,
  subtotal       integer NOT NULL,
  savings        integer NOT NULL,
  shipping       integer NOT NULL,
  total          integer NOT NULL,
  -- Payment
  payment_method      text NOT NULL CHECK (payment_method IN ('razorpay', 'cod')),
  payment_status      text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  razorpay_order_id   text,
  razorpay_payment_id text,
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS orders_user_created_idx ON orders (user_id, created_at DESC);

-- Snapshot of each line at the time of purchase (product names/prices can change later).
CREATE TABLE IF NOT EXISTS order_items (
  id               bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id         text NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  product_id       text NOT NULL REFERENCES products (id),
  slug             text NOT NULL,
  name             text NOT NULL,
  price            integer NOT NULL,
  compare_at_price integer,
  size             text NOT NULL,
  colour_name      text NOT NULL,
  colour_hex       text NOT NULL,
  silhouette       text NOT NULL,
  quantity         integer NOT NULL CHECK (quantity > 0)
);
CREATE INDEX IF NOT EXISTS order_items_order_idx ON order_items (order_id);

ALTER TABLE users       ENABLE ROW LEVEL SECURITY;
ALTER TABLE products    ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
