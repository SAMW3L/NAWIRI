import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { DataTable } from '../components/DataTable';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import type { Customer } from '../types/database';

export function Customers() {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCustomer) {
      updateCustomer(selectedCustomer.id, formData);
    } else {
      addCustomer({
        ...formData,
        total_purchases: 0,
        outstanding_balance: 0,
      });
    }
    handleCloseModal();
  };

  const handleOpenModal = (customer?: Customer) => {
    if (customer) {
      setSelectedCustomer(customer);
      setFormData({
        name: customer.name,
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        notes: customer.notes || '',
      });
    } else {
      setSelectedCustomer(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        notes: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCustomer(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      notes: '',
    });
  };

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Phone', accessor: 'phone' },
    { header: 'Email', accessor: 'email' },
    {
      header: 'Total Purchases',
      accessor: (customer: Customer) =>
        `Tsh ${customer.total_purchases.toLocaleString()}`,
    },
    {
      header: 'Outstanding Balance',
      accessor: (customer: Customer) =>
        `Tsh ${customer.outstanding_balance.toLocaleString()}`,
    },
    {
      header: 'Actions',
      accessor: (customer: Customer) => (
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<Edit2 className="h-4 w-4" />}
            onClick={(e) => {
              e.stopPropagation();
              handleOpenModal(customer);
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
              if (confirm('Are you sure you want to delete this customer?')) {
                deleteCustomer(customer.id);
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
        <h1 className="text-2xl font-semibold text-gray-900">Customers</h1>
        <Button
          variant="primary"
          icon={<Plus className="h-5 w-5" />}
          onClick={() => handleOpenModal()}
        >
          Add Customer
        </Button>
      </div>

      <DataTable data={customers} columns={columns} />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedCustomer ? 'Edit Customer' : 'Add Customer'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Input
            label="Phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <Input
            label="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
          <Input
            label="Notes"
            as="textarea"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={handleCloseModal} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {selectedCustomer ? 'Update' : 'Add'} Customer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}