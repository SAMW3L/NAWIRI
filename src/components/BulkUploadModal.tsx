import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { FileUp, Download, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { z } from 'zod';

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (data: any[]) => void;
  type: 'products' | 'stock';
}

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.enum(['unga_sembe', 'unga_dona', 'pumba']),
  weight: z.enum(['5kg', '10kg', '25kg']).optional(),
  price: z.number().min(0),
  stock_quantity: z.number().min(0),
  reorder_level: z.number().min(0),
  description: z.string().optional(),
});

const stockSchema = z.object({
  product_name: z.string().min(1, 'Product name is required'),
  transaction_type: z.enum(['stock_in', 'stock_out', 'adjustment']),
  quantity: z.number().min(1),
  unit_price: z.number().min(0).optional(),
  notes: z.string().optional(),
});

export function BulkUploadModal({
  isOpen,
  onClose,
  onUpload,
  type,
}: BulkUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrors([]);
    }
  };

  const downloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    let data: any[] = [];

    if (type === 'products') {
      data = [
        {
          name: 'Example Product',
          category: 'unga_sembe',
          weight: '5kg',
          price: 100,
          stock_quantity: 50,
          reorder_level: 10,
          description: 'Product description',
        },
      ];
    } else {
      data = [
        {
          product_name: 'Example Product',
          transaction_type: 'stock_in',
          quantity: 10,
          unit_price: 100,
          notes: 'Stock transaction notes',
        },
      ];
    }

    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, `${type}-template.xlsx`);
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const validationErrors: string[] = [];

      const validatedData = jsonData.map((row: any, index) => {
        try {
          if (type === 'products') {
            productSchema.parse(row);
          } else {
            stockSchema.parse(row);
          }
          return row;
        } catch (error) {
          if (error instanceof z.ZodError) {
            error.errors.forEach((err) => {
              validationErrors.push(
                `Row ${index + 1}: ${err.path.join('.')} - ${err.message}`
              );
            });
          }
          return null;
        }
      });

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return;
      }

      const validRows = validatedData.filter((row) => row !== null);
      onUpload(validRows);
      onClose();
    } catch (error) {
      setErrors(['Failed to process the file. Please check the format.']);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Bulk Upload ${type === 'products' ? 'Products' : 'Stock'}`}
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900">Instructions</h3>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            {type === 'products' ? (
              <>
                <li>File must be in Excel format (.xlsx)</li>
                <li>Required columns: name, category, price, stock_quantity, reorder_level</li>
                <li>Optional columns: weight, description</li>
                <li>Categories: unga_sembe, unga_dona, pumba</li>
                <li>Weights: 5kg, 10kg, 25kg</li>
              </>
            ) : (
              <>
                <li>File must be in Excel format (.xlsx)</li>
                <li>Required columns: product_name, transaction_type, quantity</li>
                <li>Optional columns: unit_price, notes</li>
                <li>Transaction types: stock_in, stock_out, adjustment</li>
                <li>Product names must match existing products</li>
              </>
            )}
          </ul>
        </div>

        <div className="space-y-4">
          <Button
            variant="secondary"
            icon={<Download className="h-5 w-5" />}
            onClick={downloadTemplate}
            className="w-full"
          >
            Download Template
          </Button>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <input
              type="file"
              accept=".xlsx"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="flex flex-col items-center cursor-pointer"
            >
              <FileUp className="h-8 w-8 text-gray-400" />
              <span className="mt-2 text-sm text-gray-600">
                {file ? file.name : 'Click to upload or drag and drop'}
              </span>
              <span className="mt-1 text-xs text-gray-500">XLSX files only</span>
            </label>
          </div>

          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <h4 className="text-sm font-medium text-red-800">
                  Validation Errors
                </h4>
              </div>
              <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUpload}
            disabled={!file || errors.length > 0}
          >
            Upload
          </Button>
        </div>
      </div>
    </Modal>
  );
}