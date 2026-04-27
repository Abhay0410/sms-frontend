import React, { useState } from 'react';
import { FaTimes, FaSpinner, FaInfoCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../../../services/api';
import { API_ENDPOINTS } from '../../../../constants/apiEndpoints';

const AssetReturnModal = ({ issue, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');

  if (!issue) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch(API_ENDPOINTS.ADMIN.INVENTORY.UPDATE_ISSUE_STATUS(issue._id), {
        status: 'RETURNED',
        notes
      });
      toast.success('Asset returned successfully. Stock updated.');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to process return');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden animate-fade-in-up">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">Process Asset Return</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <FaTimes />
          </button>
        </div>

        <div className="bg-blue-50 px-6 py-4 border-b border-blue-100 flex gap-3 text-sm text-blue-800">
          <FaInfoCircle className="mt-0.5 text-blue-500 shrink-0" />
          <div>
            <p>You are returning <strong>{issue.quantity}x {issue.item?.itemName}</strong>.</p>
            <p className="text-xs mt-1">This will change the status to 'RETURNED' and move the stock from 'In Use' back to 'In Storage'.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Return Condition / Notes (Optional)</label>
            <textarea rows="3" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Asset looks good, returned by Mr. Doe..." className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"></textarea>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 font-medium transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors flex items-center gap-2">
              {loading && <FaSpinner className="animate-spin" />} Confirm Return
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default AssetReturnModal;