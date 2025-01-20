import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { FileDown, FileSpreadsheet, File as FilePdf } from 'lucide-react';
import { format, parse, isWithinInterval } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

type ReportType = 'sales' | 'expiring' | 'lowStock' | 'performance';

const reportTypes = [
  { value: 'sales', label: 'Sales Report' },
  { value: 'expiring', label: 'Expiring Items Report' },
  { value: 'lowStock', label: 'Low Stock Items Report' },
  { value: 'performance', label: 'Employee Performance Report' },
];

export function Reports() {
  const { sales, products, stockTransactions } = useStore();
  const [reportType, setReportType] = useState<ReportType>('sales');
  const [startDate, setStartDate] = useState(
    format(new Date().setDate(1), 'yyyy-MM-dd')
  );
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const generateReportData = () => {
    const start = parse(startDate, 'yyyy-MM-dd', new Date());
    const end = parse(endDate, 'yyyy-MM-dd', new Date());

    switch (reportType) {
      case 'sales':
        return sales
          .filter((sale) =>
            isWithinInterval(new Date(sale.created_at), { start, end })
          )
          .map((sale) => ({
            Date: format(new Date(sale.created_at), 'dd/MM/yyyy'),
            'Invoice No': sale.id.slice(0, 8),
            Amount: `KES ${sale.total_amount.toLocaleString()}`,
            Status: sale.payment_status,
            'Paid Amount': `KES ${sale.paid_amount.toLocaleString()}`,
          }));

      case 'lowStock':
        return products
          .filter((product) => product.stock_quantity <= product.reorder_level)
          .map((product) => ({
            Product: product.name,
            Category: product.category,
            'Current Stock': product.stock_quantity,
            'Reorder Level': product.reorder_level,
            Status:
              product.stock_quantity === 0
                ? 'Out of Stock'
                : 'Low Stock',
          }));

      case 'expiring':
        // This would need expiry date tracking - placeholder for now
        return products.map((product) => ({
          Product: product.name,
          Category: product.category,
          'Stock Quantity': product.stock_quantity,
          'Last Restocked': format(
            new Date(
              stockTransactions
                .filter(
                  (t) =>
                    t.product_id === product.id &&
                    t.transaction_type === 'stock_in'
                )
                .sort(
                  (a, b) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime()
                )[0]?.created_at || new Date()
            ),
            'dd/MM/yyyy'
          ),
        }));

      case 'performance':
        // Group sales by created_by
        const performanceData = sales.reduce((acc, sale) => {
          if (!acc[sale.created_by]) {
            acc[sale.created_by] = {
              totalSales: 0,
              transactions: 0,
              averageValue: 0,
            };
          }
          acc[sale.created_by].totalSales += sale.total_amount;
          acc[sale.created_by].transactions += 1;
          acc[sale.created_by].averageValue =
            acc[sale.created_by].totalSales / acc[sale.created_by].transactions;
          return acc;
        }, {} as Record<string, { totalSales: number; transactions: number; averageValue: number }>);

        return Object.entries(performanceData).map(([employee, data]) => ({
          Employee: employee,
          'Total Sales': `KES ${data.totalSales.toLocaleString()}`,
          Transactions: data.transactions,
          'Average Sale Value': `KES ${data.averageValue.toLocaleString()}`,
        }));

      default:
        return [];
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const data = generateReportData();
    const title = reportTypes.find((r) => r.value === reportType)?.label || '';

    // Add title
    doc.setFontSize(16);
    doc.text(title, 14, 15);
    doc.setFontSize(10);
    doc.text(`${startDate} to ${endDate}`, 14, 25);

    // Add table
    autoTable(doc, {
      head: [Object.keys(data[0] || {})],
      body: data.map((item) => Object.values(item)),
      startY: 30,
    });

    doc.save(`${reportType}-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const exportToExcel = () => {
    const data = generateReportData();
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(
      wb,
      `${reportType}-report-${format(new Date(), 'yyyy-MM-dd')}.xlsx`
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select
            label="Report Type"
            options={reportTypes}
            value={reportType}
            onChange={(value) => setReportType(value as ReportType)}
          />
          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <div className="flex items-end space-x-2">
            <Button
              variant="secondary"
              icon={<FilePdf className="h-5 w-5" />}
              onClick={exportToPDF}
            >
              Export PDF
            </Button>
            <Button
              variant="secondary"
              icon={<FileSpreadsheet className="h-5 w-5" />}
              onClick={exportToExcel}
            >
              Export Excel
            </Button>
          </div>
        </div>

        <div className="mt-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {generateReportData()[0] &&
                    Object.keys(generateReportData()[0]).map((header) => (
                      <th
                        key={header}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {generateReportData().map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {Object.values(row).map((value, colIndex) => (
                      <td
                        key={colIndex}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}