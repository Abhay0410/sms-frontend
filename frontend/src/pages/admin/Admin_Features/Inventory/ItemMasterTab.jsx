import React, { useState, useEffect } from 'react';
import { FaPlus, FaShoppingCart, FaSpinner, FaBox, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../../../services/api';
import { API_ENDPOINTS } from '../../../../constants/apiEndpoints';
import AddItemModal from './AddItemModal';
import PurchaseStockModal from './PurchaseStockModal';

const ItemMasterTab = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inStorageOnly, setInStorageOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [purchaseModalItem, setPurchaseModalItem] = useState(null);

  useEffect(() => {
    fetchItems();
  }, [inStorageOnly]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const url = inStorageOnly 
        ? `${API_ENDPOINTS.ADMIN.INVENTORY.ITEMS}?inStorageOnly=true`
        : API_ENDPOINTS.ADMIN.INVENTORY.ITEMS;
      const res = await api.get(url);
      setItems(res.data?.data || res.data || []);
    } catch {
      toast.error('Failed to fetch inventory items');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => 
    item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-lg font-bold text-black">Master Catalog</h2>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search items or categories..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap">
              <input type="checkbox" checked={inStorageOnly} onChange={(e) => setInStorageOnly(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
              In Storage Only
            </label>
            
            <button onClick={() => setIsAddModalOpen(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm text-sm font-medium whitespace-nowrap w-full sm:w-auto">
              <FaPlus /> Add Item
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><FaSpinner className="animate-spin text-indigo-600 text-3xl" /></div>
      ) : filteredItems.length > 0 ? (
        <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Item Name</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Unit</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">In Storage</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">In Use</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-800 text-sm">{item.itemName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.category}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${item.itemType === 'ASSET' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>{item.itemType}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.unit}</td>
                  <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-bold ${item.inStorage <= (item.minimumStockLevel || 0) ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-700 border border-green-200'}`}>{item.inStorage}</span></td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-700">{item.inUse}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => setPurchaseModalItem(item)} className="px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-xs font-bold flex items-center gap-1.5 ml-auto transition-colors border border-green-200"><FaShoppingCart /> Purchase Stock</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-16 text-center bg-gray-50 rounded-xl border border-gray-200"><FaBox className="text-4xl text-gray-300 mx-auto mb-3" /><h3 className="text-lg font-bold text-gray-700">No items found</h3><p className="text-gray-500 mt-1 text-sm">Start by adding items to your master catalog.</p></div>
      )}
      <AddItemModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSuccess={fetchItems} />
      <PurchaseStockModal item={purchaseModalItem} onClose={() => setPurchaseModalItem(null)} onSuccess={fetchItems} />
    </div>
  );
};
export default ItemMasterTab;