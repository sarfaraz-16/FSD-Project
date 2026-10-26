import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, X, Package, ShoppingCart, ShoppingBag, 
  Users, ArrowRight, CornerDownLeft, Clock, Sparkles, Building2
} from 'lucide-react';
import { searchGlobal } from '../../services/searchService';

const RECENT_SEARCHES_KEY = 'smarterp_recent_searches';

const GlobalSearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({
    products: [],
    sales: [],
    purchases: [],
    customers: [],
    suppliers: [],
    employees: [],
    navigation: []
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState([]);

  const inputRef = useRef(null);
  const resultsContainerRef = useRef(null);
  const navigate = useNavigate();

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (saved) setRecentSearches(JSON.parse(saved));
    } catch {
      setRecentSearches([]);
    }
  }, [isOpen]);

  const saveRecentSearch = (text) => {
    try {
      if (!text || !text.trim()) return;
      const updated = [text.trim(), ...recentSearches.filter(s => s.toLowerCase() !== text.trim().toLowerCase())].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Debounced search query
  useEffect(() => {
    if (!query.trim()) {
      setResults({
        products: [],
        sales: [],
        purchases: [],
        customers: [],
        suppliers: [],
        employees: [],
        navigation: []
      });
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const data = await searchGlobal(query);
        setResults(data || {
          products: [],
          sales: [],
          purchases: [],
          customers: [],
          suppliers: [],
          employees: [],
          navigation: []
        });
        setSelectedIndex(0);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Flattened list based on activeTab for keyboard navigation
  const getFlattenedItems = useCallback(() => {
    const items = [];

    if (activeTab === 'all' || activeTab === 'products') {
      results.products.forEach(p => items.push({ ...p, _type: 'product' }));
    }
    if (activeTab === 'all' || activeTab === 'orders') {
      results.sales.forEach(s => items.push({ ...s, _type: 'sales' }));
      results.purchases.forEach(p => items.push({ ...p, _type: 'purchase' }));
    }
    if (activeTab === 'all' || activeTab === 'partners') {
      results.customers.forEach(c => items.push({ ...c, _type: 'customer' }));
      results.suppliers.forEach(s => items.push({ ...s, _type: 'supplier' }));
    }
    if (activeTab === 'all' || activeTab === 'hr_nav') {
      results.employees.forEach(e => items.push({ ...e, _type: 'employee' }));
      results.navigation.forEach(n => items.push({ ...n, _type: 'navigation' }));
    }

    return items;
  }, [results, activeTab]);

  const flattenedItems = getFlattenedItems();

  const handleSelectItem = (item) => {
    saveRecentSearch(query || item.name || item.sku || item.invoiceNo);
    onClose();

    switch (item._type) {
      case 'product':
        navigate('/inventory');
        break;
      case 'sales':
        navigate(`/sales/${item._id}`);
        break;
      case 'purchase':
        navigate(`/purchases/${item._id}`);
        break;
      case 'customer':
        navigate('/sales/customers');
        break;
      case 'supplier':
        navigate('/purchases/suppliers');
        break;
      case 'employee':
        navigate('/hr');
        break;
      case 'navigation':
        navigate(item.path);
        break;
      default:
        break;
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < flattenedItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : flattenedItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flattenedItems[selectedIndex]) {
        handleSelectItem(flattenedItems[selectedIndex]);
      }
    }
  };

  if (!isOpen) return null;

  const totalResultsCount = flattenedItems.length;

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-start justify-center pt-16 px-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[82vh] transition-all"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 gap-3">
          <Search size={22} className="text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, orders, customers, suppliers, actions..."
            className="flex-1 bg-transparent text-slate-800 placeholder-slate-400 text-base outline-none font-medium"
          />
          {query && (
            <button 
              onClick={() => { setQuery(''); inputRef.current?.focus(); }}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              title="Clear search"
            >
              <X size={18} />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
            ESC
          </kbd>
        </div>

        {/* Filter Tabs */}
        {query.trim().length > 0 && (
          <div className="flex items-center px-4 py-2 border-b border-slate-100 bg-slate-50/70 gap-2 overflow-x-auto text-xs">
            <button
              onClick={() => { setActiveTab('all'); setSelectedIndex(0); }}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                activeTab === 'all' 
                  ? 'bg-primary text-white shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              All Results ({totalResultsCount})
            </button>
            <button
              onClick={() => { setActiveTab('products'); setSelectedIndex(0); }}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                activeTab === 'products' 
                  ? 'bg-primary text-white shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              Products ({results.products.length})
            </button>
            <button
              onClick={() => { setActiveTab('orders'); setSelectedIndex(0); }}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                activeTab === 'orders' 
                  ? 'bg-primary text-white shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              Orders ({results.sales.length + results.purchases.length})
            </button>
            <button
              onClick={() => { setActiveTab('partners'); setSelectedIndex(0); }}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                activeTab === 'partners' 
                  ? 'bg-primary text-white shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              Partners ({results.customers.length + results.suppliers.length})
            </button>
            <button
              onClick={() => { setActiveTab('hr_nav'); setSelectedIndex(0); }}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                activeTab === 'hr_nav' 
                  ? 'bg-primary text-white shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              HR & Pages ({results.employees.length + results.navigation.length})
            </button>
          </div>
        )}

        {/* Results / Suggestions Container */}
        <div ref={resultsContainerRef} className="flex-1 overflow-y-auto p-3 space-y-1">
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">Searching across SmartERP...</span>
            </div>
          )}

          {!loading && !query.trim() && (
            <div className="p-4 space-y-4">
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    <span className="flex items-center gap-1.5"><Clock size={13} /> Recent Searches</span>
                    <button 
                      onClick={clearRecentSearches}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term, i) => (
                      <button
                        key={i}
                        onClick={() => { setQuery(term); inputRef.current?.focus(); }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-lg font-medium transition-colors flex items-center gap-1.5"
                      >
                        <Search size={12} className="text-slate-400" />
                        <span>{term}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles size={13} /> Quick Shortcuts
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  {[
                    { name: 'Products & Stock', path: '/inventory', icon: Package, desc: 'Manage inventory items and SKUs' },
                    { name: 'Create Sales Order', path: '/sales/new', icon: ShoppingCart, desc: 'Generate a new customer sale' },
                    { name: 'Create Purchase Order', path: '/purchases/new', icon: ShoppingBag, desc: 'Reorder supplies & stock' },
                    { name: 'Customer Directory', path: '/sales/customers', icon: Building2, desc: 'View customer accounts' },
                  ].map((shortcut, i) => (
                    <button
                      key={i}
                      onClick={() => { onClose(); navigate(shortcut.path); }}
                      className="flex items-start gap-3 p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors text-left"
                    >
                      <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
                        <shortcut.icon size={16} />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800 text-xs">{shortcut.name}</div>
                        <div className="text-[11px] text-slate-500">{shortcut.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!loading && query.trim() && flattenedItems.length === 0 && (
            <div className="py-12 text-center text-slate-500">
              <Search size={36} className="mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-slate-700">No results found for "{query}"</p>
              <p className="text-xs text-slate-400 mt-1">Try searching with a SKU, product name, invoice number, or partner</p>
            </div>
          )}

          {!loading && query.trim() && flattenedItems.length > 0 && (
            flattenedItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={`${item._type}-${item._id || item.path || index}`}
                  onClick={() => handleSelectItem(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                    isSelected ? 'bg-primary/10 text-primary border border-primary/20' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-lg shrink-0 ${
                      item._type === 'product' ? 'bg-emerald-50 text-emerald-600' :
                      item._type === 'sales' ? 'bg-blue-50 text-blue-600' :
                      item._type === 'purchase' ? 'bg-purple-50 text-purple-600' :
                      item._type === 'customer' || item._type === 'supplier' ? 'bg-amber-50 text-amber-600' :
                      item._type === 'employee' ? 'bg-indigo-50 text-indigo-600' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {item._type === 'product' && <Package size={18} />}
                      {item._type === 'sales' && <ShoppingCart size={18} />}
                      {item._type === 'purchase' && <ShoppingBag size={18} />}
                      {(item._type === 'customer' || item._type === 'supplier') && <Building2 size={18} />}
                      {item._type === 'employee' && <Users size={18} />}
                      {item._type === 'navigation' && <ArrowRight size={18} />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900 truncate">
                          {item.name || item.invoiceNo || (item._type === 'purchase' && `PO #${item._id.slice(-6).toUpperCase()}`) || item.sku}
                        </span>
                        {item.sku && item.name && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            {item.sku}
                          </span>
                        )}
                        {item.status && (
                          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            item.status === 'confirmed' || item.status === 'completed' || item.status === 'received'
                              ? 'bg-emerald-100 text-emerald-700'
                              : item.status === 'draft' || item.status === 'ordered'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {item.status}
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-500 truncate mt-0.5">
                        {item._type === 'product' && (
                          <span>Category: {item.category?.name || 'General'} • Stock: <span className={item.stockQty <= (item.reorderLevel || 10) ? 'text-amber-600 font-semibold' : 'font-semibold text-slate-700'}>{item.stockQty}</span> units • ${Number(item.sellPrice || 0).toFixed(2)}</span>
                        )}
                        {item._type === 'sales' && (
                          <span>Customer: {item.customer?.name || 'N/A'} • Total: <span className="font-semibold text-slate-800">${Number(item.total || 0).toFixed(2)}</span></span>
                        )}
                        {item._type === 'purchase' && (
                          <span>Supplier: {item.supplier?.name || 'N/A'} • Total: <span className="font-semibold text-slate-800">${Number(item.total || 0).toFixed(2)}</span></span>
                        )}
                        {(item._type === 'customer' || item._type === 'supplier') && (
                          <span>{item.email || item.phone || 'Partner record'} • <span className="capitalize">{item._type}</span></span>
                        )}
                        {item._type === 'employee' && (
                          <span>{item.designation} • Dept: {item.department}</span>
                        )}
                        {item._type === 'navigation' && (
                          <span>Navigate to {item.name} ({item.path})</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <span className="text-[11px] font-medium text-slate-400 capitalize px-2 py-0.5 rounded-full bg-slate-100">
                      {item._type}
                    </span>
                    {isSelected && (
                      <CornerDownLeft size={14} className="text-primary hidden sm:inline" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono">↓</kbd> to navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono">↵</kbd> to select
            </span>
          </div>
          <div>SmartERP Global Search</div>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearchModal;
