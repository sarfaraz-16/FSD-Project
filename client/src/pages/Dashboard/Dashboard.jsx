import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { getSummary, getSalesTrend, getTopProducts, getStockByCategory } from '../../services/dashboardService';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, ShoppingCart, Package, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, color, loading }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      {loading ? (
        <div className="h-8 w-24 bg-slate-200 animate-pulse rounded"></div>
      ) : (
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      )}
    </div>
    <div className={`p-4 rounded-full ${color}`}>
      <Icon size={24} />
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [summary, setSummary] = useState(null);
  const [salesTrend, setSalesTrend] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [stockByCategory, setStockByCategory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [sumRes, trendRes, topRes, stockRes] = await Promise.all([
          getSummary(),
          getSalesTrend(),
          getTopProducts(),
          getStockByCategory()
        ]);
        setSummary(sumRes);
        setSalesTrend(trendRes);
        setTopProducts(topRes);
        setStockByCategory(stockRes);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const COLORS = ['#2BA8E8', '#137333', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Today's Sales Total" 
          value={summary ? `$${(summary.todaySalesTotal || 0).toFixed(2)}` : '$0.00'} 
          icon={DollarSign} 
          color="bg-blue-100 text-blue-600" 
          loading={loading} 
        />
        <StatCard 
          title="Today's Sales Count" 
          value={summary ? (summary.todaySalesCount || 0) : 0} 

          icon={ShoppingCart} 
          color="bg-emerald-100 text-emerald-600" 
          loading={loading} 
        />
        <StatCard 
          title="Pending Orders" 
          value={summary ? summary.pendingOrdersCount : 0} 
          icon={Package} 
          color="bg-purple-100 text-purple-600" 
          loading={loading} 
        />
        <StatCard 
          title="Low Stock Items" 
          value={summary ? summary.lowStockCount : 0} 
          icon={AlertTriangle} 
          color="bg-amber-100 text-amber-600" 
          loading={loading} 
        />
      </div>

      {user.role !== 'staff' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Trend Line Chart */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Sales Trend (Last 7 Days)</h3>
            {loading ? (
              <div className="h-[300px] w-full bg-slate-100 animate-pulse rounded-lg"></div>
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer>
                  <LineChart data={salesTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tickMargin={10} />
                    <YAxis axisLine={false} tickLine={false} tickMargin={10} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Line type="monotone" dataKey="totalSales" name="Sales ($)" stroke="#2BA8E8" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Top Products Bar Chart */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Top Selling Products</h3>
            {loading ? (
              <div className="h-[300px] w-full bg-slate-100 animate-pulse rounded-lg"></div>
            ) : (
              <div className="h-[300px] w-full">
                <ResponsiveContainer>
                  <BarChart data={topProducts} layout="vertical" margin={{ top: 0, right: 0, left: 40, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="totalQty" name="Quantity Sold" fill="#137333" radius={[0, 4, 4, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stock By Category */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Stock Distribution by Category</h3>
          {loading ? (
            <div className="h-[300px] w-full bg-slate-100 animate-pulse rounded-lg"></div>
          ) : (
            <div className="h-[300px] w-full flex items-center justify-center">
              {stockByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stockByCategory} dataKey="totalStock" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                      {stockByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-slate-500">No stock data available</p>
              )}
            </div>
          )}
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white p-6 rounded-xl border border-amber-200 bg-amber-50 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-full">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-amber-900">Low Stock Alert</h3>
              <p className="text-amber-700 text-sm">{summary?.lowStockCount || 0} items need restocking</p>
            </div>
          </div>
          <div className="mt-6 flex flex-col items-center justify-center h-[200px] text-center border-2 border-dashed border-amber-200 rounded-xl bg-white/50">
            <p className="text-amber-800 font-medium mb-4">Ensure continuity of sales</p>
            {(user.role === 'admin' || user.role === 'manager') && (
              <Link to="/purchases/new" className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors inline-flex items-center">
                Create Purchase Order <ArrowRight size={16} className="ml-2" />
              </Link>
            )}
            {user.role === 'staff' && (
              <p className="text-amber-600 text-sm">Please notify a manager to reorder.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
