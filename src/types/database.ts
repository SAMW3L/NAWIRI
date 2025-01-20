export type Customer = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  total_purchases: number;
  outstanding_balance: number;
};

export type ProductCategory = 'unga_sembe' | 'unga_dona' | 'pumba';
export type WeightCategory = '5kg' | '10kg' | '25kg';

export type Product = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  category: ProductCategory;
  weight: WeightCategory | null;
  price: number;
  stock_quantity: number;
  reorder_level: number;
  description: string | null;
};

export type TransactionType = 'stock_in' | 'stock_out' | 'adjustment';

export type StockTransaction = {
  id: string;
  created_at: string;
  product_id: string;
  transaction_type: TransactionType;
  quantity: number;
  unit_price: number | null;
  notes: string | null;
  created_by: string;
};

export type ExpenseCategory = 'capital' | 'operating';

export type Expense = {
  id: string;
  created_at: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  date: string;
  created_by: string;
};

export type PaymentStatus = 'pending' | 'partial' | 'paid';

export type Sale = {
  id: string;
  created_at: string;
  customer_id: string;
  total_amount: number;
  payment_status: PaymentStatus;
  paid_amount: number;
  notes: string | null;
  created_by: string;
};

export type SaleItem = {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
};