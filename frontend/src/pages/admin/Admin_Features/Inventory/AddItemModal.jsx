import React, { useState } from 'react';
import { FaTimes, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../../../services/api';
import { API_ENDPOINTS } from '../../../../constants/apiEndpoints';

const AddItemModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    itemName: '',
    category: '',
    itemType: 'CONSUMABLE',
    unit: 'Pcs',
    minimumStockLevel: 0
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(API_ENDPOINTS.ADMIN.INVENTORY.ITEMS, formData);
      toast.success('Item added to master catalog successfully');
      onSuccess();
      onClose();
      setFormData({ itemName: '', category: '', itemType: 'CONSUMABLE', unit: 'Pcs', minimumStockLevel: 0 });
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden animate-fade-in-up">
        <div className="flex justify-between items-center p-6 border-b bg-slate-800 border-gray-100">
          <h3 className="text-lg font-bold text-white">Add New Catalog Item</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
            <input required type="text" name="itemName" value={formData.itemName} onChange={handleChange} placeholder="e.g., Whiteboard Marker" className="w-full px-4 py-2 border text-slate-700 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input required type="text" name="category" value={formData.category} onChange={handleChange} placeholder="e.g., Stationery" className="w-full px-4 py-2  text-slate-700 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select required name="itemType" value={formData.itemType} onChange={handleChange} className="w-full px-4 py-2 border text-slate-700 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"><option value="CONSUMABLE">Consumable</option><option value="ASSET">Fixed Asset</option></select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Unit</label><select required name="unit" value={formData.unit} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 text-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"><option value="Pcs">Pieces (Pcs)</option><option value="Boxes">Boxes</option><option value="Liters">Liters</option><option value="Kgs">Kilograms</option><option value="Sets">Sets</option></select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Min Stock Alert</label><input required type="number" min="0" name="minimumStockLevel" value={formData.minimumStockLevel} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200  text-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
          </div>

          <div className="pt-4 flex justify-end gap-3"><button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 font-medium transition-colors">Cancel</button><button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors flex items-center gap-2">{loading && <FaSpinner className="animate-spin" />} Save Item</button></div>
        </form>
      </div>
    </div>
  );
};
export default AddItemModal;