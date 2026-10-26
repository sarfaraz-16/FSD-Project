import React, { useState, useEffect, useContext } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../services/inventoryService';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { useForm } from 'react-hook-form';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { user } = useContext(AuthContext);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const canEdit = ['admin', 'manager'].includes(user.role);

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const openForm = (cat = null) => {
    setSelectedCategory(cat);
    reset(cat || { name: '', description: '' });
    setIsFormOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (selectedCategory) await updateCategory(selectedCategory._id, data);
      else await createCategory(data);
      setIsFormOpen(false);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving category');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete category? Ensure no products are linked.')) {
      try {
        await deleteCategory(id);
        fetchCategories();
      } catch (err) {
        alert(err.response?.data?.message || 'Error deleting category');
      }
    }
  };

  const columns = [
    { key: 'name', label: 'Category Name', render: (row) => <span className="font-medium text-slate-800">{row.name}</span> },
    { key: 'description', label: 'Description' },
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
        <h2 className="text-xl font-semibold text-slate-800">Categories</h2>
        {canEdit && (
          <button onClick={() => openForm()} className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors">
            <Plus size={18} /><span>Add Category</span>
          </button>
        )}
      </div>
      
      {loading ? <div className="p-8 text-center text-slate-500">Loading...</div> : <DataTable columns={columns} data={categories} />}

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={selectedCategory ? 'Edit Category' : 'New Category'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
            <input {...register('name', { required: 'Name required' })} className="w-full px-3 py-2 border rounded-xl" />
            {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea {...register('description')} className="w-full px-3 py-2 border rounded-xl" rows={3}></textarea>
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-slate-600 border rounded-xl hover:bg-slate-50">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-hover">Save</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Categories;
