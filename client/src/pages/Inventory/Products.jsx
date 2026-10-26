import React, { useState, useEffect, useContext } from 'react';
import { getProducts, getCategories, deleteProduct } from '../../services/inventoryService';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import ProductForm from './ProductForm';
import StockAdjustForm from './StockAdjustForm';
import { Plus, Edit2, Archive, PackagePlus } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { user } = useContext(AuthContext);

  const canEdit = ['admin', 'manager'].includes(user.role);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await getProducts({ page, limit: 10, search, category: categoryFilter });
      setProducts(res.items || []);
      setTotalPages(Math.ceil((res.total || 0) / 10));
      setTotal(res.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCategories().then(res => setCategories(res.data || []));
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, search, categoryFilter]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this product?')) {
      await deleteProduct(id);
      fetchProducts();
    }
  };

  const columns = [
    { key: 'sku', label: 'SKU' },
    { key: 'name', label: 'Product Name', render: (row) => (
      <div>
        <p className="font-medium text-slate-800">{row.name}</p>
        <p className="text-xs text-slate-500">{row.category?.name}</p>
      </div>
    )},
    { key: 'price', label: 'Price', render: (row) => `$${row.sellPrice.toFixed(2)}` },
    { key: 'stockQty', label: 'Stock', render: (row) => (
      <Badge variant={row.stockQty <= row.reorderLevel ? 'danger' : 'success'}>
        {row.stockQty} in stock
      </Badge>
    )},
    { key: 'isActive', label: 'Status', render: (row) => (
      <Badge variant={row.isActive ? 'primary' : 'default'}>{row.isActive ? 'Active' : 'Inactive'}</Badge>
    )},
  ];

  if (canEdit) {
    columns.push({
      key: 'actions', label: '', render: (row) => (
        <div className="flex justify-end space-x-2">
          <button onClick={() => { setSelectedProduct(row); setIsAdjustOpen(true); }} className="p-1.5 text-primary hover:bg-primary-light rounded-lg" title="Adjust Stock">
            <PackagePlus size={16} />
          </button>
          <button onClick={() => { setSelectedProduct(row); setIsFormOpen(true); }} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg" title="Edit">
            <Edit2 size={16} />
          </button>
          <button onClick={() => handleDelete(row._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="Deactivate">
            <Archive size={16} />
          </button>
        </div>
      )
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4 flex-1">
          <input 
            type="text" 
            placeholder="Search products..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full max-w-xs px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-primary focus:border-primary"
          />
          <select 
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white"
          >
            <option value="">All Categories</option>
            {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
          </select>
        </div>
        
        {canEdit && (
          <button 
            onClick={() => { setSelectedProduct(null); setIsFormOpen(true); }}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors"
          >
            <Plus size={18} />
            <span>Add New</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500">Loading...</div>
      ) : (
        <>
          <DataTable columns={columns} data={products} />
          <div className="p-4 bg-white rounded-xl border border-slate-200 flex flex-wrap justify-between items-center text-sm shadow-sm">
            <p className="text-slate-500">
              Showing page <span className="font-semibold text-slate-800">{page}</span> of <span className="font-semibold text-slate-800">{totalPages || 1}</span> ({total} products)
            </p>
            <div className="flex gap-2 mt-2 sm:mt-0">
              <button 
                disabled={page === 1} 
                onClick={() => setPage(p => p - 1)} 
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                Previous
              </button>
              <button 
                disabled={page >= totalPages || totalPages === 0} 
                onClick={() => setPage(p => p + 1)} 
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={selectedProduct ? 'Edit Product' : 'Add New Product'}>
        <ProductForm 
          product={selectedProduct} 
          categories={categories}
          onSuccess={() => { setIsFormOpen(false); fetchProducts(); }}
          onCancel={() => setIsFormOpen(false)}
        />
      </Modal>

      <Modal isOpen={isAdjustOpen} onClose={() => setIsAdjustOpen(false)} title="Adjust Stock">
        <StockAdjustForm 
          product={selectedProduct}
          onSuccess={() => { setIsAdjustOpen(false); fetchProducts(); }}
          onCancel={() => setIsAdjustOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default Products;
