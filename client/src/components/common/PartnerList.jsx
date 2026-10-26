import React, { useState, useEffect, useContext, useMemo } from 'react';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer, getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../../services/partnerService';
import DataTable from './DataTable';
import Modal from './Modal';
import { useForm } from 'react-hook-form';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const PartnerList = ({ type }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const { user } = useContext(AuthContext);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  
  const isCustomer = type === 'customer';
  const Title = isCustomer ? 'Customers' : 'Suppliers';
  const canEdit = isCustomer ? true : ['admin', 'manager'].includes(user.role);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = isCustomer ? await getCustomers() : await getSuppliers();
      setData(res.data || []);
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    fetchItems(); 
  }, [type]);

  const openForm = (item = null) => {
    setSelectedItem(item);
    reset(item || { name: '', email: '', phone: '', address: '' });
    setIsFormOpen(true);
  };

  const onSubmit = async (formData) => {
    try {
      if (selectedItem) {
        if (isCustomer) await updateCustomer(selectedItem._id, formData);
        else await updateSupplier(selectedItem._id, formData);
      } else {
        if (isCustomer) await createCustomer(formData);
        else await createSupplier(formData);
      }
      setIsFormOpen(false);
      fetchItems();
    } catch (err) { 
      alert(err.response?.data?.message || 'Error saving'); 
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        if (isCustomer) await deleteCustomer(id);
        else await deleteSupplier(id);
        fetchItems();
      } catch (err) { 
        alert(err.response?.data?.message || 'Error deleting'); 
      }
    }
  };

  const columns = [
    { key: 'name', label: 'Name', render: (row) => <span className="font-semibold text-slate-800">{row.name}</span> },
    { key: 'email', label: 'Email', render: (row) => row.email || <span className="text-slate-400 italic">None</span> },
    { key: 'phone', label: 'Phone', render: (row) => row.phone || <span className="text-slate-400 italic">None</span> },
    { key: 'address', label: 'Address', render: (row) => <span className="text-slate-500 line-clamp-1">{row.address || 'N/A'}</span> },
  ];

  if (canEdit) {
    columns.push({
      key: 'actions', label: '', render: (row) => (
        <div className="flex justify-end space-x-2">
          <button onClick={() => openForm(row)} className="p-1.5 text-slate-500 hover:bg-slate-100 hover:text-primary rounded-lg transition-colors" title="Edit">
            <Edit2 size={16} />
          </button>
          <button onClick={() => handleDelete(row._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
            <Trash2 size={16} />
          </button>
        </div>
      )
    });
  }

  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase().trim();
    return data.filter(item => 
      (item.name || '').toLowerCase().includes(q) ||
      (item.email || '').toLowerCase().includes(q) ||
      (item.phone || '').toLowerCase().includes(q) ||
      (item.address || '').toLowerCase().includes(q)
    );
  }, [data, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">{Title}</h2>

          {/* Search bar */}
          <div className="relative min-w-[220px] max-w-xs flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder={`Search ${Title.toLowerCase()} by name, email, phone...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 bg-white rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {canEdit && (
          <button onClick={() => openForm()} className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors font-medium text-sm shadow-sm shrink-0">
            <Plus size={18} /><span>Add {isCustomer ? 'Customer' : 'Supplier'}</span>
          </button>
        )}
      </div>
      
      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading {Title.toLowerCase()}...</div>
      ) : filteredData.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Search size={32} className="mx-auto text-slate-300 mb-2" />
          <p className="font-semibold text-slate-700">No {Title.toLowerCase()} found</p>
          <p className="text-xs text-slate-400 mt-1">
            {search ? `No records matched "${search}"` : `No ${Title.toLowerCase()} created yet`}
          </p>
        </div>
      ) : (
        <DataTable columns={columns} data={filteredData} />
      )}

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={selectedItem ? `Edit ${Title.slice(0, -1)}` : `New ${Title.slice(0, -1)}`}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
            <input {...register('name', { required: 'Name required' })} className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-sm" />
            {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input type="email" {...register('email')} className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
            <input type="text" {...register('phone')} className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
            <textarea {...register('address')} className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary text-sm" rows={2}></textarea>
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-slate-600 border rounded-xl hover:bg-slate-50 text-sm">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-hover font-medium text-sm">Save</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PartnerList;
