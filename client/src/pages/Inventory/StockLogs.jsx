import React, { useState, useEffect } from 'react';
import { getStockLogs } from '../../services/inventoryService';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';

const StockLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
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
        <span className="font-medium text-slate-800">{row.product?.name}</span>
        <span className="text-xs text-slate-500 ml-2">({row.product?.sku})</span>
      </div>
    )},
    { key: 'change', label: 'Change', render: (row) => (
      <span className={row.change > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
        {row.change > 0 ? `+${row.change}` : row.change}
      </span>
    )},
    { key: 'reason', label: 'Reason', render: (row) => <Badge>{row.reason}</Badge> },
    { key: 'by', label: 'Done By', render: (row) => row.by?.name },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-800">Stock Movement Logs</h2>
      {loading ? <div className="p-8 text-center text-slate-500">Loading...</div> : <DataTable columns={columns} data={logs} />}
    </div>
  );
};

export default StockLogs;
