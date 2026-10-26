import React, { useState, useEffect, useContext } from 'react';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer, getSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../../services/partnerService';
import DataTable from './DataTable';
import Modal from './Modal';
import { useForm } from 'react-hook-form';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const PartnerList = ({ type }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const { user } = useContext(AuthContext);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  
  const isCustomer = type === 'customer';
  const Title = isCustomer ? 'Customers' : 'Suppliers';
  const canEdit = isCustomer ? true : ['admin', 'manager'].includes(user.role);

  const fetchItems = async () => {
    try {
      const res = isCustomer ? await getCustomers() : await getSuppliers();
      setData(res.data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchItems(); }, [type]);

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
    } catch (err) { alert(err.response?.data?.message || 'Error saving'); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        if (isCustomer) await deleteCustomer(id);
        else await deleteSupplier(id);
        fetchItems();
      } catch (err) { alert(err.response?.data?.message || 'Error deleting'); }
    }
  };

  const columns = [
    { key: 'name', label: 'Name', render: (row) => <span className="font-medium text-slate-800">{row.name}</span> },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'address', label: 'Address' },
  ];

  if (canEdit) {
    columns.push({
      key: 'actions', label: '', render: (row) => (
        <div className="flex justify-end space-x-2">
          <button onClick={() => openForm(row)} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg"><Edit2 size={16} /></button>
          <button onClick={() => handleDelete(row._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
        </div>
      )
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-800">{Title}</h2>
        {canEdit && (
          <button onClick={() => openForm()} className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors">
            <Plus size={18} /><span>Add {isCustomer ? 'Customer' : 'Supplier'}</span>
          </button>
        )}
      </div>
      
      {loading ? <div className="p-8 text-center text-slate-500">Loading...</div> : <DataTable columns={columns} data={data} />}

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={selectedItem ? `Edit ${Title.slice(0, -1)}` : `New ${Title.slice(0, -1)}`}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
            <input {...register('name', { required: 'Name required' })} className="w-full px-3 py-2 border rounded-xl" />
            {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
          </div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Email</label><input type="email" {...register('email')} className="w-full px-3 py-2 border rounded-xl" /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Phone</label><input type="text" {...register('phone')} className="w-full px-3 py-2 border rounded-xl" /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1">Address</label><textarea {...register('address')} className="w-full px-3 py-2 border rounded-xl" rows={2}></textarea></div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-slate-600 border rounded-xl hover:bg-slate-50">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-hover">Save</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PartnerList;
