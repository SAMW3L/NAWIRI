import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { DataTable } from '../components/DataTable';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Plus } from 'lucide-react';
import type { StockTransaction, TransactionType } from '../types/database';

const transactionTypes = [
  { value: 'stock_in', label: 'Stock In' },
  { value: 'stock_out', label: 'Stock Out' },
  { value: 'adjustment', label: 'Adjustment' },
];

export function Stock() {
  const { products, stockTransactions, addStockTransaction } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    product_id: '',
    transaction_type: 'stock_in' as TransactionType,
    quantity: 0,
    unit_price: 0,
    notes: '',
    created_by: 'system', // In a real app, this would be the logged-in user's ID
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addStockTransaction(formData);
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      product_id: '',
      transaction_type: 'stock_in',
      quantity: 0,
      unit_price: 0,
      notes: '',
      created_by: 'system',
    });
  };

  const columns = [
    {
      header: 'Product',
      accessor: (transaction: StockTransaction) =>
        products.find((p) => p.id === transaction.product_id)?.name,
    },
    {
      header: 'Type',
      accessor: (transaction: StockTransaction) =>
        transactionTypes.find((t) => t.value === transaction.transaction_type)
          ?.label,
    },
    { header: 'Quantity', accessor: 'quantity' },
    {
      header: 'Unit Price',
      accessor: (transaction: StockTransaction) =>
        transaction.unit_price
          ? `KES ${transaction.unit_price.toLocaleString()}`
          : 'N/A',
    },
    {
      header: 'Total Value',
      accessor: (transaction: StockTransaction) =>
        transaction.unit_price
          ? `KES ${(transaction.quantity * transaction.unit_price).toLocaleString()}`
          : 'N/A',
    },
    { header: 'Notes', accessor: 'notes' },
    {
      header: 'Date',
      accessor: (transaction: StockTransaction) =>
        new Date(transaction.created_at).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Stock Transactions</h1>
        <Button
          variant="primary"
          icon={<Plus className="h-5 w-5" />}
          onClick={() => setIsModalOpen(true)}
        >
          New Transaction
        </Button>
      </div>

      <DataTable data={stockTransactions} columns={columns} />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="New Stock Transaction"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Product"
            options={products.map((p) => ({ value: p.id, label: p.name }))}
            value={formData.product_id}
            onChange={(value) => setFormData({ ...formData, product_id: value })}
            required
          />
          <Select
            label="Transaction Type"
            options={transactionTypes}
            value={formData.transaction_type}
            onChange={(value) =>
              setFormData({
                ...formData,
                transaction_type: value as TransactionType,
              })
            }
          />
          <Input
            label="Quantity"
            type="number"
            min="1"
            value={formData.quantity}
            onChange={(e) =>
              setFormData({
                ...formData,
                quantity: parseInt(e.target.value, 10),
              })
            }
            required
          />
          <Input
            label="Unit Price"
            type="number"
            min="0"
            step="0.01"
            value={formData.unit_price}
            onChange={(e) =>
              setFormData({
                ...formData,
                unit_price: parseFloat(e.target.value),
              })
            }
          />
          <Input
            label="Notes"
            as="textarea"
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
          />
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={handleCloseModal} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Add Transaction
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}