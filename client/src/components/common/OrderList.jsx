import React, { useState, useEffect } from 'react';
import { getSalesOrders, getPurchaseOrders, updateSalesOrderStatus, updatePurchaseOrderStatus } from '../../services/orderService';
import DataTable from './DataTable';
import Badge from './Badge';
import { Eye, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OrderList = ({ type }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();

  const isSales = type === 'sales';
  const Title = isSales ? 'Sales Orders' : 'Purchase Orders';

  const fetchOrders = async () => {
    try {
      const res = isSales ? await getSalesOrders({ status: statusFilter }) : await getPurchaseOrders({ status: statusFilter });
      setData(res.items || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [type, statusFilter]);

  const handleAction = async (id, action) => {
    if (window.confirm(`Are you sure you want to ${action} this order?`)) {
      try {
        if (isSales) await updateSalesOrderStatus(id, action);
        else await updatePurchaseOrderStatus(id, action);
        fetchOrders();
      } catch (err) { alert(err.response?.data?.message || `Error ${action}ing order`); }
    }
  };

  const statusColors = {
    draft: 'default', confirmed: 'primary', ordered: 'primary', received: 'success', completed: 'success', cancelled: 'danger'
  };

  const columns = [
    { key: 'invoiceNo', label: isSales ? 'Invoice No' : 'Order ID', render: (row) => <span className="font-medium text-slate-800">{row.invoiceNo || row._id.slice(-6).toUpperCase()}</span> },
    { key: 'partner', label: isSales ? 'Customer' : 'Supplier', render: (row) => (isSales ? row.customer?.name : row.supplier?.name) },
    { key: 'date', label: 'Date', render: (row) => new Date(row.createdAt).toLocaleDateString() },
    { key: 'total', label: 'Total', render: (row) => <span className="font-semibold">${row.total.toFixed(2)}</span> },
    { key: 'status', label: 'Status', render: (row) => <Badge variant={statusColors[row.status]}>{row.status.toUpperCase()}</Badge> },
    { key: 'actions', label: '', render: (row) => (
        <div className="flex justify-end space-x-2">
          <button onClick={() => navigate(`/${isSales ? 'sales' : 'purchases'}/${row._id}`)} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg"><Eye size={16} /></button>
          {row.status === 'draft' && isSales && <button onClick={() => handleAction(row._id, 'confirm')} className="p-1.5 text-primary hover:bg-primary-light rounded-lg" title="Confirm"><CheckCircle size={16} /></button>}
          {row.status === 'draft' && !isSales && <button onClick={() => handleAction(row._id, 'ordered')} className="p-1.5 text-primary hover:bg-primary-light rounded-lg" title="Mark Ordered"><CheckCircle size={16} /></button>}
          {row.status === 'ordered' && !isSales && <button onClick={() => handleAction(row._id, 'receive')} className="p-1.5 text-success-text hover:bg-success-bg rounded-lg" title="Receive Stock"><CheckCircle size={16} /></button>}
          {row.status === 'confirmed' && isSales && <button onClick={() => handleAction(row._id, 'complete')} className="p-1.5 text-success-text hover:bg-success-bg rounded-lg" title="Complete"><CheckCircle size={16} /></button>}
          {['draft', 'confirmed'].includes(row.status) && isSales && <button onClick={() => handleAction(row._id, 'cancel')} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="Cancel"><XCircle size={16} /></button>}
          {['draft', 'ordered'].includes(row.status) && !isSales && <button onClick={() => handleAction(row._id, 'cancel')} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="Cancel"><XCircle size={16} /></button>}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex space-x-4 items-center">
          <h2 className="text-xl font-semibold text-slate-800">{Title}</h2>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-sm">
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            {isSales ? <option value="confirmed">Confirmed</option> : <option value="ordered">Ordered</option>}
            {isSales ? <option value="completed">Completed</option> : <option value="received">Received</option>}
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <button onClick={() => navigate(`/${isSales ? 'sales' : 'purchases'}/new`)} className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors shadow-sm shadow-primary/20">
          Create New
        </button>
      </div>
      
      {loading ? <div className="p-8 text-center text-slate-500">Loading...</div> : <DataTable columns={columns} data={data} />}
    </div>
  );
};

export default OrderList;
