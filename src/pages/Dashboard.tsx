import React from 'react';
import { useStore } from '../lib/store';
import { Card } from '../components/Card';
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Package,
  AlertTriangle,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

export function Dashboard() {
  const { sales, expenses, products } = useStore();

  // Calculate total sales
  const totalSales = sales.reduce((sum, sale) => sum + sale.total_amount, 0);

  // Calculate total expenses
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Calculate profit
  const profit = totalSales - totalExpenses;

  // Get low stock products
  const lowStockProducts = products.filter(
    (product) => product.stock_quantity <= product.reorder_level
  );

  // Prepare sales data for chart
  const salesData = sales.reduce((acc: any[], sale) => {
    const date = new Date(sale.created_at).toLocaleDateString();
    const existingDate = acc.find((item) => item.date === date);
    if (existingDate) {
      existingDate.amount += sale.total_amount;
    } else {
      acc.push({ date, amount: sale.total_amount });
    }
    return acc;
  }, []);

  // Prepare expense data by category
  const expensesByCategory = expenses.reduce((acc: any[], expense) => {
    const existingCategory = acc.find((item) => item.category === expense.category);
    if (existingCategory) {
      existingCategory.amount += expense.amount;
    } else {
      acc.push({
        category: expense.category === 'capital' ? 'Capital' : 'Operating',
        amount: expense.amount,
      });
    }
    return acc;
  }, []);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card
          title="Total Sales"
          value={`Tsh ${totalSales.toLocaleString()}`}
          icon={<ShoppingCart />}
          trend={{ value: 12, label: 'vs last month' }}
        />
        <Card
          title="Total Expenses"
          value={`Tsh ${totalExpenses.toLocaleString()}`}
          icon={<DollarSign />}
          trend={{ value: -5, label: 'vs last month' }}
        />
        <Card
          title="Net Profit"
          value={`Tsh ${profit.toLocaleString()}`}
          icon={<TrendingUp />}
          trend={{ value: 8, label: 'vs last month' }}
        />
        <Card
          title="Low Stock Items"
          value={lowStockProducts.length}
          icon={<AlertTriangle />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Sales Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="amount"
                  name="Sales"
                  stroke="#2563eb"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expenses by Category */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Expenses by Category
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expensesByCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="amount" name="Amount" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Low Stock Alerts
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reorder Level
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {lowStockProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.stock_quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.reorder_level}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}