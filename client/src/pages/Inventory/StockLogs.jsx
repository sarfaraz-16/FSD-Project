import React, { useState, useEffect, useMemo } from 'react';
import { getStockLogs } from '../../services/inventoryService';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import { Search, X } from 'lucide-react';

const StockLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await getStockLogs();
      setLogs(res.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  const columns = [
    { key: 'date', label: 'Date', render: (row) => new Date(row.date).toLocaleString() },
    { key: 'product', label: 'Product', render: (row) => (
      <div>
        <span className="font-semibold text-slate-800">{row.product?.name}</span>
        <span className="text-xs text-slate-500 font-mono ml-2">({row.product?.sku})</span>
      </div>
    )},
    { key: 'change', label: 'Change', render: (row) => (
      <span className={row.change > 0 ? 'text-emerald-600 font-semibold' : 'text-red-600 font-semibold'}>
        {row.change > 0 ? `+${row.change}` : row.change}
      </span>
    )},
    { key: 'reason', label: 'Reason', render: (row) => <Badge>{row.reason}</Badge> },
    { key: 'by', label: 'Done By', render: (row) => row.by?.name || 'System' },
  ];

  const filteredLogs = useMemo(() => {
    if (!search.trim()) return logs;
    const q = search.toLowerCase().trim();
    return logs.filter(log => {
      const prodName = (log.product?.name || '').toLowerCase();
      const sku = (log.product?.sku || '').toLowerCase();
      const reason = (log.reason || '').toLowerCase();
      const doneBy = (log.by?.name || '').toLowerCase();
      return prodName.includes(q) || sku.includes(q) || reason.includes(q) || doneBy.includes(q);
    });
  }, [logs, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Stock Movement Logs</h2>

        <div className="relative min-w-[240px] max-w-xs w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text"
            placeholder="Search logs by product, SKU, reason..."
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

      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading stock movement logs...</div>
      ) : filteredLogs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Search size={32} className="mx-auto text-slate-300 mb-2" />
          <p className="font-semibold text-slate-700">No stock logs found</p>
          <p className="text-xs text-slate-400 mt-1">
            {search ? `No log entries matched "${search}"` : 'No stock adjustments logged yet'}
          </p>
        </div>
      ) : (
        <DataTable columns={columns} data={filteredLogs} />
      )}
    </div>
  );
};

export default StockLogs;
