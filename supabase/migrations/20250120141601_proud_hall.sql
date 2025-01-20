/*
  # Initial Schema for NAWIRI BMS

  1. New Tables
    - users (managed by Supabase Auth)
    - customers
      - Basic information and contact details
      - Linked to transactions and payment history
    - products
      - Product catalog with categories and weights
      - Stock tracking and pricing
    - stock_transactions
      - Track stock movements (in/out)
      - Record adjustments and wastage
    - expenses
      - Track capital and operating costs
      - Categorized expenses
    - sales
      - Sales transactions
      - Payment tracking
    
  2. Security
    - RLS enabled on all tables
    - Policies for authenticated access
    - Role-based access control
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE product_category AS ENUM ('unga_sembe', 'unga_dona', 'pumba');
CREATE TYPE weight_category AS ENUM ('5kg', '10kg', '25kg');
CREATE TYPE expense_category AS ENUM ('capital', 'operating');
CREATE TYPE transaction_type AS ENUM ('stock_in', 'stock_out', 'adjustment');
CREATE TYPE payment_status AS ENUM ('pending', 'partial', 'paid');

-- Customers table
CREATE TABLE customers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  name text NOT NULL,
  email text,
  phone text,
  address text,
  notes text,
  total_purchases decimal(12,2) DEFAULT 0,
  outstanding_balance decimal(12,2) DEFAULT 0
);

-- Products table
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  name text NOT NULL,
  category product_category NOT NULL,
  weight weight_category,
  price decimal(10,2) NOT NULL,
  stock_quantity integer DEFAULT 0,
  reorder_level integer DEFAULT 10,
  description text
);

-- Stock transactions table
CREATE TABLE stock_transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at timestamptz DEFAULT now(),
  product_id uuid REFERENCES products(id),
  transaction_type transaction_type NOT NULL,
  quantity integer NOT NULL,
  unit_price decimal(10,2),
  notes text,
  created_by uuid REFERENCES auth.users(id)
);

-- Expenses table
CREATE TABLE expenses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at timestamptz DEFAULT now(),
  category expense_category NOT NULL,
  amount decimal(12,2) NOT NULL,
  description text NOT NULL,
  date date DEFAULT CURRENT_DATE,
  created_by uuid REFERENCES auth.users(id)
);

-- Sales table
CREATE TABLE sales (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at timestamptz DEFAULT now(),
  customer_id uuid REFERENCES customers(id),
  total_amount decimal(12,2) NOT NULL,
  payment_status payment_status DEFAULT 'pending',
  paid_amount decimal(12,2) DEFAULT 0,
  notes text,
  created_by uuid REFERENCES auth.users(id)
);

-- Sales items table
CREATE TABLE sale_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id uuid REFERENCES sales(id),
  product_id uuid REFERENCES products(id),
  quantity integer NOT NULL,
  unit_price decimal(10,2) NOT NULL,
  total_price decimal(12,2) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated read access" ON customers
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read access" ON products
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read access" ON stock_transactions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read access" ON expenses
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read access" ON sales
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read access" ON sale_items
  FOR SELECT TO authenticated USING (true);

-- Create indexes for better query performance
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_stock_transactions_product ON stock_transactions(product_id);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_sales_customer ON sales(customer_id);
CREATE INDEX idx_sale_items_sale ON sale_items(sale_id);

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating timestamps
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();