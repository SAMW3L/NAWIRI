import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { DataTable } from '../components/DataTable';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import type { Product, ProductCategory, WeightCategory } from '../types/database';

const productCategories = [
  { value: 'unga_sembe', label: 'Unga Sembe' },
  { value: 'unga_dona', label: 'Unga Dona' },
  { value: 'pumba', label: 'Pumba' },
];

const weightCategories = [
  { value: '5kg', label: '5 KG' },
  { value: '10kg', label: '10 KG' },
  { value: '25kg', label: '25 KG' },
];

export function Products() {
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'unga_sembe' as ProductCategory,
    weight: '5kg' as WeightCategory,
    price: 0,
    stock_quantity: 0,
    reorder_level: 10,
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProduct) {
      updateProduct(selectedProduct.id, formData);
    } else {
      addProduct(formData);
    }
    handleCloseModal();
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setSelectedProduct(product);
      setFormData({
        name: product.name,
        category: product.category,
        weight: product.weight || '5kg',
        price: product.price,
        stock_quantity: product.stock_quantity,
        reorder_level: product.reorder_level,
        description: product.description || '',
      });
    } else {
      setSelectedProduct(null);
      setFormData({
        name: '',
        category: 'unga_sembe',
        weight: '5kg',
        price: 0,
        stock_quantity: 0,
        reorder_level: 10,
        description: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setFormData({
      name: '',
      category: 'unga_sembe',
      weight: '5kg',
      price: 0,
      stock_quantity: 0,
      reorder_level: 10,
      description: '',
    });
  };

  const columns = [
    { header: 'Name', accessor: 'name' },
    {
      header: 'Category',
      accessor: (product: Product) =>
        productCategories.find((c) => c.value === product.category)?.label,
    },
    {
      header: 'Weight',
      accessor: (product: Product) =>
        product.weight
          ? weightCategories.find((w) => w.value === product.weight)?.label
          : 'N/A',
    },
    {
      header: 'Price',
      accessor: (product: Product) => `KES ${product.price.toLocaleString()}`,
    },
    { header: 'Stock', accessor: 'stock_quantity' },
    { header: 'Reorder Level', accessor: 'reorder_level' },
    {
      header: 'Actions',
      accessor: (product: Product) => (
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<Edit2 className="h-4 w-4" />}
            onClick={(e) => {
              e.stopPropagation();
              handleOpenModal(product);
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
              if (confirm('Are you sure you want to delete this product?')) {
                deleteProduct(product.id);
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
        <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
        <Button
          variant="primary"
          icon={<Plus className="h-5 w-5" />}
          onClick={() => handleOpenModal()}
        >
          Add Product
        </Button>
      </div>

      <DataTable data={products} columns={columns} />

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedProduct ? 'Edit Product' : 'Add Product'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Select
            label="Category"
            options={productCategories}
            value={formData.category}
            onChange={(value) =>
              setFormData({ ...formData, category: value as ProductCategory })
            }
          />
          <Select
            label="Weight"
            options={weightCategories}
            value={formData.weight}
            onChange={(value) =>
              setFormData({ ...formData, weight: value as WeightCategory })
            }
          />
          <Input
            label="Price"
            type="number"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: parseFloat(e.target.value) })
            }
            required
          />
          <Input
            label="Stock Quantity"
            type="number"
            min="0"
            value={formData.stock_quantity}
            onChange={(e) =>
              setFormData({
                ...formData,
                stock_quantity: parseInt(e.target.value, 10),
              })
            }
            required
          />
          <Input
            label="Reorder Level"
            type="number"
            min="0"
            value={formData.reorder_level}
            onChange={(e) =>
              setFormData({
                ...formData,
                reorder_level: parseInt(e.target.value, 10),
              })
            }
            required
          />
          <Input
            label="Description"
            as="textarea"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={handleCloseModal} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {selectedProduct ? 'Update' : 'Add'} Product
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}