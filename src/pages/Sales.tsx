import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { DataTable } from '../components/DataTable';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import type { Sale, SaleItem, PaymentStatus } from '../types/database';

const paymentStatuses = [
  { value: 'pending', label: 'Pending' },
  { value: 'partial', label: 'Partial' },
  { value: 'paid', label: 'Paid' },
];

export function Sales() {
  const {
    sales,
    saleItems,
    customers,
    products,
    addSale,
    updateSale,
    deleteSale,
  } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [formData, setFormData] = useState({
    customer_id: '',
    total_amount: 0,
    payment_status: 'pending' as PaymentStatus,
    paid_amount: 0,
    notes: '',
    created_by: 'system', // In a real app, this would be the logged-in user's ID
  });
  const [saleItemsData, setSaleItemsData] = useState<
    Array<{
      product_id: string;
      quantity: number;
      unit_price: number;
      total_price: number;
    }>
  >([]);

  const handleAddSaleItem = () => {
    setSaleItemsData([
      ...saleItemsData,
      {
        product_id: '',
        quantity: 1,
        unit_price: 0,
        total_price: 0,
      },
    ]);
  };

  const handleRemoveSaleItem = (index: number) => {
    setSaleItemsData(saleItemsData.filter((_, i) => i !== index));
  };

  const handleSaleItemChange = (
    index: number,
    field: keyof (typeof saleItemsData)[0],
    value: string | number
  ) => {
    const newSaleItems = [...saleItemsData];
    const item = newSaleItems[index];

    if (field === 'product_id') {
      const product = products.find((p) => p.id === value);
      item.product_id = value as string;
      item.unit_price = product?.price || 0;
    } else {
      item[field] = value as number;
    }

    item.total_price = item.quantity * item.unit_price;
    setSaleItemsData(newSaleItems);

    // Update total amount
    const totalAmount = newSaleItems.reduce(
      (sum, item) => sum + item.total_price,
      0
    );
    setFormData({ ...formData, total_amount: totalAmount });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSale) {
      updateSale(selectedSale.id, formData);
    } else {
      addSale(formData, saleItemsData);
    }
    handleCloseModal();
  };

  const handleOpenModal = (sale?: Sale) => {
    if (sale) {
      setSelectedSale(sale);
      setFormData({
        customer_id: sale.customer_id,
        total_amount: sale.total_amount,
        payment_status: sale.payment_status,
        paid_amount: sale.paid_amount,
        notes: sale.notes || '',
        created_by: sale.created_by,
      });
      const items = saleItems.filter((item) => item.sale_id === sale.id);
      setSaleItemsData(
        items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
        }))
      );
    } else {
      setSelectedSale(null);
      setFormData({
        customer_id: '',
        total_amount: 0,
        payment_status: 'pending',
        paid_amount: 0,
        notes: '',
        created_by: 'system',
      });
      setSaleItemsData([]);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSale(null);
    setFormData({
      customer_id: '',
      total_amount: 0,
      payment_status: 'pending',
      paid_amount: 0,
      notes: '',
      created_by: 'system',
    });
    setSaleItemsData([]);
  };

  const columns = [
    {
      header: 'Customer',
      accessor: (sale: Sale) =>
        customers.find((c) => c.id === sale.customer_id)?.name,
    },
    {
      header: 'Total Amount',
      accessor: (sale: Sale) => `KES ${sale.total_amount.toLocaleString()}`,
    },
    {
      header: 'Payment Status',
      accessor: (sale: Sale) =>
        paymentStatuses.find((s) => s.value === sale.payment_status)?.label,
    },
    {
      header: 'Paid Amount',
      accessor: (sale: Sale) => `KES ${sale.paid_amount.toLocaleString()}`,
    },
    {
      header: 'Date',
      accessor: (sale: Sale) =>
        new Date(sale.created_at).toLocaleDateString(),
    },
    {
      header: 'Actions',
      accessor: (sale: Sale) => (
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<Edit2 className="h-4 w-4" />}
            onClick={(e) => {
              e.stopPropagation();
              handleOpenModal(sale);
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
              if (confirm('Are you sure you want to delete this sale?')) {
                deleteSale(sale.id);
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
        <h1 className="text-2xl font-semibold text-gray-900">Sales</h1>
        <Button
          variant="primary"
          icon={<Plus className="h-5 w-5" />}
          onClick={() => handleOpenModal()}
        >
          New Sale
        </Button>
      </div>

      <DataTable data={sales} columns={columns} />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedSale ? 'Edit Sale' : 'New Sale'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Customer"
            options={customers.map((c) => ({ value: c.id, label: c.name }))}
            value={formData.customer_id}
            onChange={(value) => setFormData({ ...formData, customer_id: value })}
            required
          />

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium text-gray-700">Items</h4>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAddSaleItem}
              >
                Add Item
              </Button>
            </div>

            {saleItemsData.map((item, index) => (
              <div key={index} className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between">
                  <h5 className="text-sm font-medium text-gray-700">
                    Item {index + 1}
                  </h5>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => handleRemoveSaleItem(index)}
                  >
                    Remove
                  </Button>
                </div>
                <Select
                  label="Product"
                  options={products.map((p) => ({ value: p.id, label: p.name }))}
                  value={item.product_id}
                  onChange={(value) =>
                    handleSaleItemChange(index, 'product_id', value)
                  }
                  required
                />
                <Input
                  label="Quantity"
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    handleSaleItemChange(
                      index,
                      'quantity',
                      parseInt(e.target.value, 10)
                    )
                  }
                  required
                />
                <Input
                  label="Unit Price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unit_price}
                  onChange={(e) =>
                    handleSaleItemChange(
                      index,
                      'unit_price',
                      parseFloat(e.target.value)
                    )
                  }
                  required
                />
                <Input
                  label="Total Price"
                  type="number"
                  value={item.total_price}
                  readOnly
                  disabled
                />
              </div>
            ))}
          </div>

          <Input
            label="Total Amount"
            type="number"
            value={formData.total_amount}
            readOnly
            disabled
          />

          <Select
            label="Payment Status"
            options={paymentStatuses}
            value={formData.payment_status}
            onChange={(value) =>
              setFormData({
                ...formData,
                payment_status: value as PaymentStatus,
              })
            }
          />

          <Input
            label="Paid Amount"
            type="number"
            min="0"
            step="0.01"
            value={formData.paid_amount}
            onChange={(e) =>
              setFormData({
                ...formData,
                paid_amount: parseFloat(e.target.value),
              })
            }
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
              {selectedSale ? 'Update' : 'Create'} Sale
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}