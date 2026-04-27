import React, { useState, useEffect } from 'react';
import { FaTimes, FaSpinner, FaInfoCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../../../services/api';
import { API_ENDPOINTS } from '../../../../constants/apiEndpoints';

const PurchaseStockModal = ({ item, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    quantity: '',
    unitPrice: '',
    totalAmount: 0,
    vendorName: '',
    billDate: new Date().toISOString().split('T')[0],
    receiptNumber: ''
  });

  useEffect(() => {
    const q = parseFloat(formData.quantity) || 0;
    const p = parseFloat(formData.unitPrice) || 0;
    setFormData(prev => ({ ...prev, totalAmount: q * p }));
  }, [formData.quantity, formData.unitPrice]);

  if (!item) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(API_ENDPOINTS.ADMIN.INVENTORY.PURCHASES, {
        itemId: item._id,
        ...formData
      });
      toast.success('Stock purchased and expense logged successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to record purchase');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg overflow-hidden animate-fade-in-up">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Purchase Stock</h3>
            <p className="text-sm text-gray-500">Add stock for <span className="font-bold text-indigo-600">{item.itemName}</span></p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><FaTimes /></button>
        </div>

        <div className="bg-blue-50 px-6 py-3 border-b border-blue-100 flex items-start gap-3">
          <FaInfoCircle className="text-blue-500 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-800 leading-relaxed">
            Recording this purchase will automatically increment the inventory stock and create a corresponding entry in the <strong>Financial Ledger (Expenses)</strong>.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Quantity ({item.unit})</label><input required type="number" min="1" step="0.01" name="quantity" value={formData.quantity} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Unit Price (₹)</label><input required type="number" min="0" step="0.01" name="unitPrice" value={formData.unitPrice} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Total Auto-Calculated Cost:</span>
            <span className="text-xl font-bold text-gray-800">₹ {formData.totalAmount.toFixed(2)}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name</label><input required type="text" name="vendorName" value={formData.vendorName} onChange={handleChange} placeholder="Supplier ABC" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Bill Date</label><input required type="date" name="billDate" value={formData.billDate} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
          </div>
          
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Receipt Number (Optional)</label><input type="text" name="receiptNumber" value={formData.receiptNumber} onChange={handleChange} placeholder="e.g. INV-2023-100" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" /></div>

          <div className="pt-4 flex justify-end gap-3"><button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 font-medium transition-colors">Cancel</button><button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors flex items-center gap-2">{loading && <FaSpinner className="animate-spin" />} Confirm Purchase</button></div>
        </form>
      </div>
    </div>
  );
};
export default PurchaseStockModal;