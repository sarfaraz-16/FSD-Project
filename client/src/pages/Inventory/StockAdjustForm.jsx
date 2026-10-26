import React from 'react';
import { useForm } from 'react-hook-form';
import { adjustStock } from '../../services/inventoryService';

const StockAdjustForm = ({ product, onSuccess, onCancel }) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      await adjustStock(product._id, data);
      onSuccess();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adjusting stock');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4">
        <p className="text-sm text-slate-500">Product: <span className="font-medium text-slate-800">{product.name}</span></p>
        <p className="text-sm text-slate-500">Current Stock: <span className="font-medium text-slate-800">{product.stockQty}</span></p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Quantity Change (+ or -) *</label>
        <input type="number" {...register('change', { required: 'Change is required', validate: v => v !== '0' || 'Cannot be zero' })} className="w-full px-3 py-2 border rounded-xl" placeholder="e.g. 5 or -2" />
        {errors.change && <span className="text-red-500 text-xs">{errors.change.message}</span>}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Reason *</label>
        <select {...register('reason', { required: 'Reason is required' })} className="w-full px-3 py-2 border rounded-xl bg-white">
          <option value="Manual Adjustment">Manual Adjustment</option>
          <option value="Damage">Damage</option>
          <option value="Return">Return</option>
        </select>
      </div>
      
      <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-slate-600 border rounded-xl hover:bg-slate-50">Cancel</button>
        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-hover">
          {isSubmitting ? 'Saving...' : 'Adjust Stock'}
        </button>
      </div>
    </form>
  );
};

export default StockAdjustForm;
