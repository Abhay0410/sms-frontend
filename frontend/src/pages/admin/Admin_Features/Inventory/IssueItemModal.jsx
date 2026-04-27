import React, { useState, useEffect } from 'react';
import { FaTimes, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../../../services/api';
import { API_ENDPOINTS } from '../../../../constants/apiEndpoints';

const IssueItemModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  
  const [formData, setFormData] = useState({
    itemId: '',
    quantity: 1,
    issuedToType: 'ROOM',
    issuedToRef: '', // Simple string to identify who/where
    serialNumbers: []
  });

  useEffect(() => {
    if (isOpen) fetchAvailableItems();
  }, [isOpen]);

  const fetchAvailableItems = async () => {
    try {
      // Only fetch items that have stock > 0
      const res = await api.get(`${API_ENDPOINTS.ADMIN.INVENTORY.ITEMS}?inStorageOnly=true`);
      setItems(res.data?.data || res.data || []);
    } catch {
      toast.error('Failed to fetch available items');
    }
  };

  if (!isOpen) return null;

  const selectedItem = items.find(i => i._id === formData.itemId);
  const isAsset = selectedItem?.itemType === 'ASSET';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      // Automatically adjust serial numbers array length if quantity changes for ASSETS
      if (name === 'quantity' && isAsset) {
        const q = parseInt(value) || 1;
        const currentSN = [...prev.serialNumbers];
        if (currentSN.length < q) {
          updated.serialNumbers = [...currentSN, ...Array(q - currentSN.length).fill('')];
        } else {
          updated.serialNumbers = currentSN.slice(0, q);
        }
      }
      return updated;
    });
  };

  const handleItemSelect = (e) => {
    const item = items.find(i => i._id === e.target.value);
    setFormData({
      ...formData,
      itemId: item._id,
      quantity: 1,
      serialNumbers: item.itemType === 'ASSET' ? [''] : []
    });
  };

  const handleSerialChange = (index, value) => {
    const newSerials = [...formData.serialNumbers];
    newSerials[index] = value;
    setFormData({ ...formData, serialNumbers: newSerials });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.quantity > (selectedItem?.inStorage || 0)) {
      toast.error(`Cannot issue more than available stock (${selectedItem.inStorage})`);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        itemId: formData.itemId,
        quantity: formData.quantity,
        issuedToType: formData.issuedToType,
        issuedToRef: formData.issuedToRef,
        allocationDetails: isAsset ? { serialNumbers: formData.serialNumbers } : {}
      };

      await api.post(API_ENDPOINTS.ADMIN.INVENTORY.ISSUES, payload);
      toast.success('Item allocated successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to issue item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg overflow-hidden animate-fade-in-up">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">Issue / Allocate Item</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><FaTimes /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">Select Item from Storage</label><select required name="itemId" value={formData.itemId} onChange={handleItemSelect} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"><option value="">-- Choose Available Item --</option>{items.map(item => (<option key={item._id} value={item._id}>{item.itemName} (Available: {item.inStorage} {item.unit})</option>))}</select></div>

          {selectedItem && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3 text-sm text-blue-800"><FaExclamationTriangle className="mt-0.5 text-blue-500" /><div><p><strong>Item Type:</strong> {selectedItem.itemType}</p><p className="text-xs mt-1">{selectedItem.itemType === 'ASSET' ? "Assets will be marked as 'In Use'." : "Consumables will be permanently deducted from storage and marked as 'Consumed'."}</p></div></div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Quantity to Issue</label><input required type="number" min="1" max={selectedItem?.inStorage || 1} name="quantity" value={formData.quantity} onChange={handleChange} disabled={!selectedItem} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-100" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Target Entity</label><select required name="issuedToType" value={formData.issuedToType} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"><option value="ROOM">Room / Lab</option><option value="CLASS">Class</option><option value="DEPARTMENT">Department</option><option value="USER">Staff / User</option></select></div>
          </div>

          <div><label className="block text-sm font-medium text-gray-700 mb-1">Recipient / Location Details</label><input required type="text" name="issuedToRef" value={formData.issuedToRef} onChange={handleChange} placeholder="e.g., Computer Lab 1, Mr. John Doe, Class 10A" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" /></div>

          {isAsset && formData.quantity > 0 && (
            <div className="pt-2 border-t border-gray-100 space-y-3">
              <label className="block text-sm font-bold text-gray-700 mb-2">Provide Serial Numbers / Mac Addresses</label>
              {Array.from({ length: formData.quantity }).map((_, idx) => (<div key={idx} className="flex items-center gap-3"><span className="text-xs font-bold text-gray-400 w-6">{idx + 1}.</span><input required type="text" value={formData.serialNumbers[idx] || ''} onChange={(e) => handleSerialChange(idx, e.target.value)} placeholder={`Identifier for item ${idx + 1}`} className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>))}
            </div>
          )}
          
          <div className="pt-4 flex justify-end gap-3"><button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 font-medium transition-colors">Cancel</button><button type="submit" disabled={loading || !selectedItem} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors flex items-center gap-2">{loading && <FaSpinner className="animate-spin" />} Confirm Allocation</button></div>
        </form>
      </div>
    </div>
  );
};
export default IssueItemModal;