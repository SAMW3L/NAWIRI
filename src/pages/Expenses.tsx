import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { DataTable } from '../components/DataTable';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import type { Expense, ExpenseCategory } from '../types/database';

const expenseCategories = [
  { value: 'capital', label: 'Capital' },
  { value: 'operating', label: 'Operating' },
];

export function Expenses() {
  const { expenses, addExpense, updateExpense, deleteExpense } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState({
    category: 'operating' as ExpenseCategory,
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
    created_by: 'system', // In a real app, this would be the logged-in user's ID
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedExpense) {
      updateExpense(selectedExpense.id, formData);
    } else {
      addExpense(formData);
    }
    handleCloseModal();
  };

  const handleOpenModal = (expense?: Expense) => {
    if (expense) {
      setSelectedExpense(expense);
      setFormData({
        category: expense.category,
        amount: expense.amount,
        description: expense.description,
        date: expense.date,
        created_by: expense.created_by,
      });
    } else {
      setSelectedExpense(null);
      setFormData({
        category: 'operating',
        amount: 0,
        description: '',
        date: new Date().toISOString().split('T')[0],
        created_by: 'system',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedExpense(null);
    setFormData({
      category: 'operating',
      amount: 0,
      description: '',
      date: new Date().toISOString().split('T')[0],
      created_by: 'system',
    });
  };

  const columns = [
    {
      header: 'Category',
      accessor: (expense: Expense) =>
        expenseCategories.find((c) => c.value === expense.category)?.label,
    },
    {
      header: 'Amount',
      accessor: (expense: Expense) => `KES ${expense.amount.toLocaleString()}`,
    },
    { header: 'Description', accessor: 'description' },
    { header: 'Date', accessor: 'date' },
    {
      header: 'Actions',
      accessor: (expense: Expense) => (
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<Edit2 className="h-4 w-4" />}
            onClick={(e) => {
              e.stopPropagation();
              handleOpenModal(expense);
            }}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={<Trash2 className="h-4 w-4" />}
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Are you sure you want to delete this expense?')) {
                deleteExpense(expense.id);
              }
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Expenses</h1>
        <Button
          variant="primary"
          icon={<Plus className="h-5 w-5" />}
          onClick={() => handleOpenModal()}
        >
          Add Expense
        </Button>
      </div>

      <DataTable data={expenses} columns={columns} />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedExpense ? 'Edit Expense' : 'Add Expense'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Category"
            options={expenseCategories}
            value={formData.category}
            onChange={(value) =>
              setFormData({ ...formData, category: value as ExpenseCategory })
            }
          />
          <Input
            label="Amount"
            type="number"
            min="0"
            step="0.01"
            value={formData.amount}
            onChange={(e) =>
              setFormData({ ...formData, amount: parseFloat(e.target.value) })
            }
            required
          />
          <Input
            label="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            required
          />
          <Input
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={handleCloseModal} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {selectedExpense ?  'Update' : 'Add'} Expense
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}