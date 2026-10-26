import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSalesOrder, getPurchaseOrder } from '../../services/orderService';
import { ArrowLeft, Printer } from 'lucide-react';
import Badge from './Badge';

const OrderDetail = ({ type }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isSales = type === 'sales';
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = isSales ? await getSalesOrder(id) : await getPurchaseOrder(id);
        setOrder(res.data);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchOrder();
  }, [id, isSales]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading...</div>;
  if (!order) return <div className="p-8 text-center text-slate-500">Order not found</div>;

  const partner = isSales ? order.customer : order.supplier;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center print:hidden">
        <button onClick={() => navigate(-1)} className="flex items-center space-x-2 text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft size={20} /><span>Back to List</span>
        </button>
        <button onClick={handlePrint} className="flex items-center space-x-2 px-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors shadow-lg shadow-slate-800/20">
          <Printer size={18} /><span>Print Invoice</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 print:shadow-none print:border-none print:p-0">
        <div className="flex justify-between items-start mb-8 border-b border-slate-100 pb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              {isSales ? 'Sales Invoice' : 'Purchase Order'}
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              {isSales ? order.invoiceNo || 'DRAFT' : order._id.toUpperCase()}
            </p>
          </div>
          <div className="text-right">
            <Badge variant={order.status === 'completed' || order.status === 'received' ? 'success' : order.status === 'cancelled' ? 'danger' : 'primary'}>
              {order.status.toUpperCase()}
            </Badge>
            <p className="text-sm text-slate-500 mt-2">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">From</h3>
            <p className="font-semibold text-slate-800">SmartERP Inc.</p>
            <p className="text-slate-500 text-sm mt-1">123 Business Rd, Tech Park<br />City, Country 12345</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">{isSales ? 'Bill To' : 'Supplier'}</h3>
            <p className="font-semibold text-slate-800">{partner?.name}</p>
            {partner?.email && <p className="text-slate-500 text-sm mt-1">{partner.email}</p>}
            {partner?.phone && <p className="text-slate-500 text-sm mt-1">{partner.phone}</p>}
            {partner?.address && <p className="text-slate-500 text-sm mt-1">{partner.address}</p>}
          </div>
        </div>

        <table className="w-full text-left border-collapse mb-8">
          <thead>
            <tr className="border-b border-slate-200 text-sm text-slate-500">
              <th className="py-3 font-medium">Item</th>
              <th className="py-3 font-medium text-center">Qty</th>
              <th className="py-3 font-medium text-right">Price</th>
              <th className="py-3 font-medium text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {order.items.map((item, idx) => (
              <tr key={idx} className="text-slate-700">
                <td className="py-4">
                  <p className="font-medium">{item.product?.name}</p>
                  <p className="text-xs text-slate-400">{item.product?.sku}</p>
                </td>
                <td className="py-4 text-center">{item.qty}</td>
                <td className="py-4 text-right">${(item.price || item.cost).toFixed(2)}</td>
                <td className="py-4 text-right font-medium">${(item.qty * (item.price || item.cost)).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end border-t border-slate-200 pt-6">
          <div className="w-64">
            <div className="flex justify-between items-center mb-2 text-slate-500">
              <span>Subtotal</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-xl font-bold text-slate-800 border-t border-slate-100 pt-2">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
