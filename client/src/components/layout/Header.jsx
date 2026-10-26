import React, { useEffect, useState } from 'react';
import { Bell, Search } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { getLowStock } from '../../services/inventoryService';

const Header = () => {
  const location = useLocation();
  const pathParts = location.pathname.split('/').filter(Boolean);
  const title = pathParts.length > 0 ? pathParts[0].charAt(0).toUpperCase() + pathParts[0].slice(1) : 'Dashboard';
  
  const [lowStockCount, setLowStockCount] = useState(0);

  useEffect(() => {
    const fetchLowStock = async () => {
      try {
        const res = await getLowStock();
        setLowStockCount(res.data.length);
      } catch (err) {
        console.error(err);
      }
    };
    fetchLowStock();
  }, [location.pathname]); // Refetch on navigation

  return (
    <header className="h-20 bg-background flex items-center justify-between px-8 border-b border-slate-200/50">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">{title}</h1>
        <div className="text-sm text-slate-500 mt-1 flex items-center space-x-2">
          <span>Home</span>
          {pathParts.length > 0 && (
            <>
              <span>/</span>
              <span className="text-primary capitalize">{title}</span>
            </>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-primary transition-colors">
          <Search size={20} />
        </button>
        <button className="relative w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-primary transition-colors" title="Low Stock Alerts">
          <Bell size={20} />
          {lowStockCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-white">
              {lowStockCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
