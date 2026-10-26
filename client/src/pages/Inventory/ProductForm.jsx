import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { createProduct, updateProduct } from '../../services/inventoryService';

const ProductForm = ({ product, categories, onSuccess, onCancel }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();

  useEffect(() => {
    if (product) {
      reset({
        ...product,
        category: product.category?._id || product.category
      });
    } else {
      reset();
    }
  }, [product, reset]);

  const onSubmit = async (data) => {
    try {
      if (product) {
        await updateProduct(product._id, data);
      } else {
        await createProduct(data);
      }
      onSuccess();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving product');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">SKU *</label>
          <input {...register('sku', { required: 'SKU is required' })} className="w-full px-3 py-2 border rounded-xl" />
          {errors.sku && <span className="text-red-500 text-xs">{errors.sku.message}</span>}
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
          <input {...register('name', { required: 'Name is required' })} className="w-full px-3 py-2 border rounded-xl" />
          {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
        <select {...register('category', { required: 'Category is required' })} className="w-full px-3 py-2 border rounded-xl bg-white">
          <option value="">Select Category</option>
          {categories.map(cat => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>
        {errors.category && <span className="text-red-500 text-xs">{errors.category.message}</span>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Cost Price *</label>
          <input type="number" step="0.01" {...register('costPrice', { required: 'Cost Price is required', min: 0 })} className="w-full px-3 py-2 border rounded-xl" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Sell Price *</label>
          <input type="number" step="0.01" {...register('sellPrice', { required: 'Sell Price is required', min: 0 })} className="w-full px-3 py-2 border rounded-xl" />
        </div>
      </div>
      {!product && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Initial Stock</label>
            <input type="number" {...register('stockQty', { min: 0 })} className="w-full px-3 py-2 border rounded-xl" defaultValue={0} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Reorder Level</label>
            <input type="number" {...register('reorderLevel', { min: 0 })} className="w-full px-3 py-2 border rounded-xl" defaultValue={10} />
          </div>
        </div>
      )}
      {product && (
        <div className="flex items-center space-x-2">
          <input type="checkbox" id="isActive" {...register('isActive')} />
          <label htmlFor="isActive" className="text-sm font-medium text-slate-700">Is Active</label>
        </div>
      )}
      <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-slate-600 border rounded-xl hover:bg-slate-50">Cancel</button>
        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-hover">
          {isSubmitting ? 'Saving...' : 'Save Product'}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
