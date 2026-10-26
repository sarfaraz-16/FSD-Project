import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { getProducts } from '../../services/inventoryService';
import { getCustomers, getSuppliers } from '../../services/partnerService';
import { createSalesOrder, createPurchaseOrder } from '../../services/orderService';

const OrderForm = ({ type }) => {
  const navigate = useNavigate();
  const isSales = type === 'sales';
  const Title = isSales ? 'New Sales Order' : 'New Purchase Order';

  const [partners, setPartners] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [selectedPartner, setSelectedPartner] = useState('');
  const [items, setItems] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const [partRes, prodRes] = await Promise.all([
          isSales ? getCustomers() : getSuppliers(),
          getProducts({ limit: 1000 })
        ]);
        setPartners(partRes.data || []);
        setProducts(prodRes.items || []);
      } catch (err) { console.error(err); }
    };
    init();
  }, [type, isSales]);

  const addItem = () => {
    setItems([...items, { product: '', qty: 1, price: 0 }]);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    if (field === 'product') {
      const prod = products.find(p => p._id === value);
      if (prod) newItems[index].price = isSales ? prod.sellPrice : prod.costPrice;
    }
    setItems(newItems);
  };

  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const total = items.reduce((sum, item) => sum + (item.qty * item.price), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPartner || items.length === 0 || items.some(i => !i.product || i.qty < 1)) {
      return alert('Please select a partner and add at least one valid item.');
    }

    setSubmitting(true);
    try {
      const payload = {
        [isSales ? 'customer' : 'supplier']: selectedPartner,
        items: items.map(i => ({ product: i.product, qty: Number(i.qty), [isSales ? 'price' : 'cost']: Number(i.price) }))
      };
      
      if (isSales) await createSalesOrder(payload);
      else await createPurchaseOrder(payload);
      
      navigate(`/${isSales ? 'sales' : 'purchases'}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <div className="flex items-center space-x-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"><ArrowLeft size={20} /></button>
        <h2 className="text-2xl font-bold text-slate-800">{Title}</h2>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
        <div className="p-6 border-b border-slate-100">
          <label className="block text-sm font-semibold text-slate-700 mb-2">{isSales ? 'Select Customer' : 'Select Supplier'}</label>
          <select value={selectedPartner} onChange={(e) => setSelectedPartner(e.target.value)} className="w-full max-w-md px-4 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary">
            <option value="">-- Select --</option>
            {partners.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Order Items</h3>
          
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="flex-1">
                  <select value={item.product} onChange={(e) => updateItem(idx, 'product', e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-white">
                    <option value="">Select Product</option>
                    {products.map(p => <option key={p._id} value={p._id}>{p.name} ({p.sku})</option>)}
                  </select>
                </div>
                <div className="w-24">
                  <input type="number" min="1" value={item.qty} onChange={(e) => updateItem(idx, 'qty', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-center" placeholder="Qty" />
                </div>
                <div className="w-32">
                  <input type="number" min="0" step="0.01" value={item.price} onChange={(e) => updateItem(idx, 'price', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-right" placeholder="Price" />
                </div>
                <div className="w-24 text-right font-medium text-slate-700">
                  ${((item.qty || 0) * (item.price || 0)).toFixed(2)}
                </div>
                <button onClick={() => removeItem(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
              </div>
            ))}
            {items.length === 0 && <p className="text-sm text-slate-500 italic py-4">No items added yet.</p>}
          </div>

          <button onClick={addItem} className="mt-4 flex items-center space-x-2 px-4 py-2 text-primary bg-primary-light/50 hover:bg-primary-light rounded-xl transition-colors font-medium">
            <Plus size={18} /><span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40 lg:ml-64">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Total Items: <span className="font-semibold text-slate-800">{items.length}</span></p>
            <p className="text-2xl font-bold text-slate-900">${total.toFixed(2)}</p>
          </div>
          <div className="flex space-x-3">
            <button onClick={() => navigate(-1)} className="px-6 py-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={submitting} className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-medium shadow-md shadow-primary/20 transition-colors flex items-center">
              {submitting ? 'Saving...' : 'Save Draft'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderForm;
