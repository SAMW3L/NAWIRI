import React from 'react';
import { format } from 'date-fns';
import { useStore } from '../lib/store';
import { Button } from './Button';
import { Printer } from 'lucide-react';
import type { Sale, SaleItem } from '../types/database';

interface SaleReceiptProps {
  sale: Sale;
  onClose: () => void;
}

export function SaleReceipt({ sale, onClose }: SaleReceiptProps) {
  const { customers, products, saleItems } = useStore();
  const customer = customers.find((c) => c.id === sale.customer_id);
  const items = saleItems.filter((item) => item.sale_id === sale.id);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white p-8 max-w-2xl mx-auto">
      {/* Print-only styles */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #receipt, #receipt * {
              visibility: visible;
            }
            #receipt {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .no-print {
              display: none;
            }
          }
        `}
      </style>

      <div id="receipt" className="space-y-6">
        {/* Header */}
        <div className="text-center border-b pb-4">
          <h1 className="text-2xl font-bold">NAWIRI BMS</h1>
          <p className="text-gray-600">Sales Receipt</p>
        </div>

        {/* Receipt Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p>
              <span className="font-semibold">Receipt No:</span>{' '}
              {sale.id.slice(0, 8)}
            </p>
            <p>
              <span className="font-semibold">Date:</span>{' '}
              {format(new Date(sale.created_at), 'dd/MM/yyyy HH:mm')}
            </p>
          </div>
          <div>
            <p>
              <span className="font-semibold">Customer:</span> {customer?.name}
            </p>
            {customer?.phone && (
              <p>
                <span className="font-semibold">Phone:</span> {customer.phone}
              </p>
            )}
          </div>
        </div>

        {/* Items Table */}
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="text-left text-sm">
              <th className="py-2">Item</th>
              <th className="py-2 text-right">Qty</th>
              <th className="py-2 text-right">Price</th>
              <th className="py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map((item) => {
              const product = products.find((p) => p.id === item.product_id);
              return (
                <tr key={item.id} className="text-sm">
                  <td className="py-2">{product?.name}</td>
                  <td className="py-2 text-right">{item.quantity}</td>
                  <td className="py-2 text-right">
                    Tsh {item.unit_price.toLocaleString()}
                  </td>
                  <td className="py-2 text-right">
                    Tsh {item.total_price.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="border-t-2 border-gray-300">
            <tr className="text-sm">
              <td colSpan={3} className="py-2 font-semibold text-right">
                Total:
              </td>
              <td className="py-2 text-right font-semibold">
                Tsh {sale.total_amount.toLocaleString()}
              </td>
            </tr>
            <tr className="text-sm">
              <td colSpan={3} className="py-2 font-semibold text-right">
                Paid:
              </td>
              <td className="py-2 text-right">
                Tsh {sale.paid_amount.toLocaleString()}
              </td>
            </tr>
            <tr className="text-sm">
              <td colSpan={3} className="py-2 font-semibold text-right">
                Balance:
              </td>
              <td className="py-2 text-right">
                Tsh {(sale.total_amount - sale.paid_amount).toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>

        {/* Footer */}
        <div className="text-center text-sm border-t pt-4">
          <p>Thank you for your business!</p>
          <p className="text-gray-600">
            For any queries, please contact us at support@nawiribms.com
          </p>
        </div>

        {/* Print Button - Hidden in print */}
        <div className="flex justify-end space-x-3 no-print">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" icon={<Printer />} onClick={handlePrint}>
            Print Receipt
          </Button>
        </div>
      </div>
    </div>
  );
}