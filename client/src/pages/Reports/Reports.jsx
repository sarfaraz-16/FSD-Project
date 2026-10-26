import React, { useState, useEffect } from 'react';
import { getSalesReport, getPurchasesReport, getLowStockReport } from '../../services/reportingService';
import { Download } from 'lucide-react';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('sales');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params = { page, limit: 10 };
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        
        let res;
        if (activeTab === 'sales') res = await getSalesReport(params);
        else if (activeTab === 'purchases') res = await getPurchasesReport(params);
        else res = await getLowStockReport(params);
        
        setData(res.items);
        setTotalPages(Math.ceil(res.total / 10));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab, startDate, endDate, page]);

  const handleExport = () => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const query = new URLSearchParams(params).toString();
    const token = localStorage.getItem('token');
    
    // Create a temporary link to download because we need to attach authorization token
    // For simplicity, we assume auth is handled via cookies or backend allows token in query params for downloads
    // Wait, the API doesn't support token in query. Let's fetch using our API client and create object URL.
    
    fetch(`${baseUrl}/reports/${activeTab}?format=csv&${query}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => response.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeTab}_report.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    })
    .catch(err => console.error('Error downloading CSV:', err));
  };

  const tabs = [
    { id: 'sales', label: 'Sales Report' },
    { id: 'purchases', label: 'Purchases Report' },
    { id: 'low-stock', label: 'Low Stock Report' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Reports</h1>
        <p className="text-slate-500">View and export system reports</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200">
          <nav className="-mb-px flex space-x-8 px-6 pt-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setPage(1); }}
                className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 flex flex-wrap gap-4 items-center justify-between border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">From Date</label>
              <input type="date" value={startDate} onChange={e => {setStartDate(e.target.value); setPage(1);}} className="border border-slate-300 rounded-lg p-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">To Date</label>
              <input type="date" value={endDate} onChange={e => {setEndDate(e.target.value); setPage(1);}} className="border border-slate-300 rounded-lg p-2 text-sm" />
            </div>
          </div>
          <button onClick={handleExport} className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg flex items-center font-medium text-sm shadow-sm">
            <Download size={16} className="mr-2" />
            Export CSV
          </button>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-slate-500 text-sm border-b border-slate-200">
                {activeTab === 'sales' && (
                  <>
                    <th className="p-4 font-medium">Date</th>
                    <th className="p-4 font-medium">Invoice No</th>
                    <th className="p-4 font-medium">Customer</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Total</th>
                  </>
                )}
                {activeTab === 'purchases' && (
                  <>
                    <th className="p-4 font-medium">Date</th>
                    <th className="p-4 font-medium">Supplier</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Total</th>
                  </>
                )}
                {activeTab === 'low-stock' && (
                  <>
                    <th className="p-4 font-medium">SKU</th>
                    <th className="p-4 font-medium">Product Name</th>
                    <th className="p-4 font-medium">Category</th>
                    <th className="p-4 font-medium">Stock Qty</th>
                    <th className="p-4 font-medium">Reorder Level</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan="5" className="p-4"><div className="h-4 bg-slate-100 animate-pulse rounded w-full"></div></td>
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-500">No records found.</td></tr>
              ) : (
                data.map(item => (
                  <tr key={item._id} className="hover:bg-slate-50">
                    {activeTab === 'sales' && (
                      <>
                        <td className="p-4">{new Date(item.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 font-medium">{item.invoiceNo}</td>
                        <td className="p-4">{item.customer?.name}</td>
                        <td className="p-4 capitalize">{item.status}</td>
                        <td className="p-4 font-medium">${item.total?.toFixed(2)}</td>
                      </>
                    )}
                    {activeTab === 'purchases' && (
                      <>
                        <td className="p-4">{new Date(item.createdAt).toLocaleDateString()}</td>
                        <td className="p-4">{item.supplier?.name}</td>
                        <td className="p-4 capitalize">{item.status}</td>
                        <td className="p-4 font-medium">${item.total?.toFixed(2)}</td>
                      </>
                    )}
                    {activeTab === 'low-stock' && (
                      <>
                        <td className="p-4">{item.sku}</td>
                        <td className="p-4 font-medium">{item.name}</td>
                        <td className="p-4">{item.category?.name}</td>
                        <td className="p-4 font-bold text-red-600">{item.stockQty}</td>
                        <td className="p-4">{item.reorderLevel}</td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 flex justify-between items-center bg-slate-50">
          <p className="text-sm text-slate-500">Page {page} of {totalPages || 1}</p>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 border border-slate-300 rounded bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50">Prev</button>
            <button disabled={page === totalPages || totalPages === 0} onClick={() => setPage(p => p + 1)} className="px-3 py-1 border border-slate-300 rounded bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50">Next</button>
          </div>
        </div>

      </div>
    </div>
  );
};
export default Reports;
