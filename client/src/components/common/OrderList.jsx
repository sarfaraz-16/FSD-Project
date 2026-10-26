import React, { useState, useEffect, useMemo } from 'react';
import { getSalesOrders, getPurchaseOrders, updateSalesOrderStatus, updatePurchaseOrderStatus } from '../../services/orderService';
import DataTable from './DataTable';
import Badge from './Badge';
import { Eye, CheckCircle, XCircle, Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OrderList = ({ type }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const isSales = type === 'sales';
  const Title = isSales ? 'Sales Orders' : 'Purchase Orders';

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = isSales 
        ? await getSalesOrders({ status: statusFilter }) 
        : await getPurchaseOrders({ status: statusFilter });
      setData(res.items || []);
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    fetchOrders(); 
  }, [type, statusFilter]);

  const handleAction = async (id, action) => {
    if (window.confirm(`Are you sure you want to ${action} this order?`)) {
      try {
        if (isSales) await updateSalesOrderStatus(id, action);
        else await updatePurchaseOrderStatus(id, action);
        fetchOrders();
      } catch (err) { 
        alert(err.response?.data?.message || `Error ${action}ing order`); 
      }
    }
  };

  const statusColors = {
    draft: 'default', confirmed: 'primary', ordered: 'primary', received: 'success', completed: 'success', cancelled: 'danger'
  };

  const columns = [
    { 
      key: 'invoiceNo', 
      label: isSales ? 'Invoice No' : 'Order ID', 
      render: (row) => <span className="font-semibold text-slate-800">{row.invoiceNo || row._id.slice(-6).toUpperCase()}</span> 
    },
    { 
      key: 'partner', 
      label: isSales ? 'Customer' : 'Supplier', 
      render: (row) => <span className="text-slate-700 font-medium">{isSales ? (row.customer?.name || 'Walk-in') : (row.supplier?.name || 'N/A')}</span> 
    },
    { key: 'date', label: 'Date', render: (row) => new Date(row.createdAt).toLocaleDateString() },
    { key: 'total', label: 'Total', render: (row) => <span className="font-semibold text-slate-900">${row.total.toFixed(2)}</span> },
    { key: 'status', label: 'Status', render: (row) => <Badge variant={statusColors[row.status]}>{row.status.toUpperCase()}</Badge> },
    { 
      key: 'actions', 
      label: '', 
      render: (row) => (
        <div className="flex justify-end space-x-1.5">
          <button 
            onClick={() => navigate(`/${isSales ? 'sales' : 'purchases'}/${row._id}`)} 
            className="p-1.5 text-slate-500 hover:bg-slate-100 hover:text-primary rounded-lg transition-colors"
            title="View Details"
          >
            <Eye size={16} />
          </button>
          {row.status === 'draft' && isSales && (
            <button onClick={() => handleAction(row._id, 'confirm')} className="p-1.5 text-primary hover:bg-primary-light rounded-lg transition-colors" title="Confirm Order">
              <CheckCircle size={16} />
            </button>
          )}
          {row.status === 'draft' && !isSales && (
            <button onClick={() => handleAction(row._id, 'ordered')} className="p-1.5 text-primary hover:bg-primary-light rounded-lg transition-colors" title="Mark Ordered">
              <CheckCircle size={16} />
            </button>
          )}
          {row.status === 'ordered' && !isSales && (
            <button onClick={() => handleAction(row._id, 'receive')} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Receive Stock">
              <CheckCircle size={16} />
            </button>
          )}
          {row.status === 'confirmed' && isSales && (
            <button onClick={() => handleAction(row._id, 'complete')} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Complete Order">
              <CheckCircle size={16} />
            </button>
          )}
          {['draft', 'confirmed'].includes(row.status) && isSales && (
            <button onClick={() => handleAction(row._id, 'cancel')} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Cancel Order">
              <XCircle size={16} />
            </button>
          )}
          {['draft', 'ordered'].includes(row.status) && !isSales && (
            <button onClick={() => handleAction(row._id, 'cancel')} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Cancel Order">
              <XCircle size={16} />
            </button>
          )}
        </div>
      )
    }
  ];

  // Client-side search filtering
  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase().trim();
    return data.filter(order => {
      const invoice = (order.invoiceNo || '').toLowerCase();
      const shortId = (order._id || '').slice(-6).toLowerCase();
      const partnerName = isSales ? (order.customer?.name || '').toLowerCase() : (order.supplier?.name || '').toLowerCase();
      return invoice.includes(q) || shortId.includes(q) || partnerName.includes(q);
    });
  }, [data, search, isSales]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap gap-3 items-center flex-1">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">{Title}</h2>

          {/* Search Bar Input */}
          <div className="relative min-w-[220px] max-w-xs flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder={`Search ${isSales ? 'invoice or customer' : 'order ID or supplier'}...`}
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

          {/* Status Filter */}
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)} 
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            {isSales ? <option value="confirmed">Confirmed</option> : <option value="ordered">Ordered</option>}
            {isSales ? <option value="completed">Completed</option> : <option value="received">Received</option>}
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <button 
          onClick={() => navigate(`/${isSales ? 'sales' : 'purchases'}/new`)} 
          className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors shadow-sm font-medium text-sm flex items-center shrink-0"
        >
          Create New {isSales ? 'Sale' : 'PO'}
        </button>
      </div>
      
      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading {Title.toLowerCase()}...</div>
      ) : filteredData.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Search size={32} className="mx-auto text-slate-300 mb-2" />
          <p className="font-semibold text-slate-700">No {Title.toLowerCase()} found</p>
          <p className="text-xs text-slate-400 mt-1">
            {search ? `No orders matched query "${search}"` : `No orders with status "${statusFilter || 'all'}"`}
          </p>
        </div>
      ) : (
        <DataTable columns={columns} data={filteredData} />
      )}
    </div>
  );
};

export default OrderList;
