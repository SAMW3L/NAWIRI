import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  Customer, 
  Product, 
  StockTransaction, 
  Expense, 
  Sale, 
  SaleItem 
} from '../types/database';

interface AppState {
  customers: Customer[];
  products: Product[];
  stockTransactions: StockTransaction[];
  expenses: Expense[];
  sales: Sale[];
  saleItems: SaleItem[];
  
  // Customer actions
  addCustomer: (customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  
  // Product actions
  addProduct: (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  // Stock actions
  addStockTransaction: (transaction: Omit<StockTransaction, 'id' | 'created_at'>) => void;
  
  // Expense actions
  addExpense: (expense: Omit<Expense, 'id' | 'created_at'>) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  
  // Sale actions
  addSale: (sale: Omit<Sale, 'id' | 'created_at'>, items: Omit<SaleItem, 'id' | 'sale_id'>[]) => void;
  updateSale: (id: string, sale: Partial<Sale>) => void;
  deleteSale: (id: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      customers: [],
      products: [],
      stockTransactions: [],
      expenses: [],
      sales: [],
      saleItems: [],

      addCustomer: (customer) =>
        set((state) => ({
          customers: [
            ...state.customers,
            {
              id: crypto.randomUUID(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              ...customer,
            },
          ],
        })),

      updateCustomer: (id, customer) =>
        set((state) => ({
          customers: state.customers.map((c) =>
            c.id === id
              ? { ...c, ...customer, updated_at: new Date().toISOString() }
              : c
          ),
        })),

      deleteCustomer: (id) =>
        set((state) => ({
          customers: state.customers.filter((c) => c.id !== id),
        })),

      addProduct: (product) =>
        set((state) => ({
          products: [
            ...state.products,
            {
              id: crypto.randomUUID(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              ...product,
            },
          ],
        })),

      updateProduct: (id, product) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id
              ? { ...p, ...product, updated_at: new Date().toISOString() }
              : p
          ),
        })),

      deleteProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        })),

      addStockTransaction: (transaction) =>
        set((state) => {
          const newTransaction = {
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
            ...transaction,
          };

          // Update product stock quantity
          const updatedProducts = state.products.map((product) => {
            if (product.id === transaction.product_id) {
              const quantityChange =
                transaction.transaction_type === 'stock_in'
                  ? transaction.quantity
                  : -transaction.quantity;
              return {
                ...product,
                stock_quantity: product.stock_quantity + quantityChange,
                updated_at: new Date().toISOString(),
              };
            }
            return product;
          });

          return {
            stockTransactions: [...state.stockTransactions, newTransaction],
            products: updatedProducts,
          };
        }),

      addExpense: (expense) =>
        set((state) => ({
          expenses: [
            ...state.expenses,
            {
              id: crypto.randomUUID(),
              created_at: new Date().toISOString(),
              ...expense,
            },
          ],
        })),

      updateExpense: (id, expense) =>
        set((state) => ({
          expenses: state.expenses.map((e) =>
            e.id === id ? { ...e, ...expense } : e
          ),
        })),

      deleteExpense: (id) =>
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        })),

      addSale: (sale, items) =>
        set((state) => {
          const saleId = crypto.randomUUID();
          const newSale = {
            id: saleId,
            created_at: new Date().toISOString(),
            ...sale,
          };

          const newSaleItems = items.map((item) => ({
            id: crypto.randomUUID(),
            sale_id: saleId,
            ...item,
          }));

          // Update product stock quantities
          const updatedProducts = state.products.map((product) => {
            const saleItem = newSaleItems.find((item) => item.product_id === product.id);
            if (saleItem) {
              return {
                ...product,
                stock_quantity: product.stock_quantity - saleItem.quantity,
                updated_at: new Date().toISOString(),
              };
            }
            return product;
          });

          // Update customer total purchases and outstanding balance
          const updatedCustomers = state.customers.map((customer) => {
            if (customer.id === sale.customer_id) {
              return {
                ...customer,
                total_purchases: customer.total_purchases + sale.total_amount,
                outstanding_balance:
                  customer.outstanding_balance +
                  (sale.total_amount - (sale.paid_amount || 0)),
                updated_at: new Date().toISOString(),
              };
            }
            return customer;
          });

          return {
            sales: [...state.sales, newSale],
            saleItems: [...state.saleItems, ...newSaleItems],
            products: updatedProducts,
            customers: updatedCustomers,
          };
        }),

      updateSale: (id, sale) =>
        set((state) => {
          const oldSale = state.sales.find((s) => s.id === id);
          const updatedSales = state.sales.map((s) =>
            s.id === id ? { ...s, ...sale } : s
          );

          // Update customer outstanding balance if payment status or amount changed
          const updatedCustomers = state.customers.map((customer) => {
            if (customer.id === oldSale?.customer_id) {
              const oldOutstanding =
                oldSale.total_amount - (oldSale.paid_amount || 0);
              const newOutstanding =
                oldSale.total_amount - ((sale.paid_amount || oldSale.paid_amount) || 0);
              return {
                ...customer,
                outstanding_balance:
                  customer.outstanding_balance - oldOutstanding + newOutstanding,
                updated_at: new Date().toISOString(),
              };
            }
            return customer;
          });

          return {
            sales: updatedSales,
            customers: updatedCustomers,
          };
        }),

      deleteSale: (id) =>
        set((state) => {
          const saleToDelete = state.sales.find((s) => s.id === id);
          const saleItems = state.saleItems.filter(
            (item) => item.sale_id === id
          );

          // Restore product stock quantities
          const updatedProducts = state.products.map((product) => {
            const saleItem = saleItems.find(
              (item) => item.product_id === product.id
            );
            if (saleItem) {
              return {
                ...product,
                stock_quantity: product.stock_quantity + saleItem.quantity,
                updated_at: new Date().toISOString(),
              };
            }
            return product;
          });

          // Update customer total purchases and outstanding balance
          const updatedCustomers = state.customers.map((customer) => {
            if (customer.id === saleToDelete?.customer_id) {
              return {
                ...customer,
                total_purchases:
                  customer.total_purchases - (saleToDelete.total_amount || 0),
                outstanding_balance:
                  customer.outstanding_balance -
                  (saleToDelete.total_amount - (saleToDelete.paid_amount || 0)),
                updated_at: new Date().toISOString(),
              };
            }
            return customer;
          });

          return {
            sales: state.sales.filter((s) => s.id !== id),
            saleItems: state.saleItems.filter((item) => item.sale_id !== id),
            products: updatedProducts,
            customers: updatedCustomers,
          };
        }),
    }),
    {
      name: 'nawiri-bms-storage',
    }
  )
);