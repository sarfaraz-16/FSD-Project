const Category = require('../models/Category');
const Product = require('../models/Product');

// Category Services
const getCategories = async () => Category.find().sort({ name: 1 });
const createCategory = async (data) => Category.create(data);
const updateCategory = async (id, data) => Category.findByIdAndUpdate(id, data, { new: true, runValidators: true });
const deleteCategory = async (id) => {
  const products = await Product.countDocuments({ category: id });
  if (products > 0) throw new Error('Cannot delete category with products');
  return Category.findByIdAndDelete(id);
};

// Product Services
const getProducts = async (query) => {
  const { search, category, page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = query;
  const filter = { isActive: true };

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } },
    ];
  }
  if (category) filter.category = category;

  const skip = (page - 1) * limit;
  const total = await Product.countDocuments(filter);
  const items = await Product.find(filter)
    .populate('category', 'name')
    .sort({ [sort]: order === 'desc' ? -1 : 1 })
    .skip(skip)
    .limit(Number(limit));

  return { items, page: Number(page), limit: Number(limit), total };
};

const createProduct = async (data) => {
  const existing = await Product.findOne({ sku: data.sku });
  if (existing) throw new Error('Duplicate SKU');
  return Product.create(data);
};

const updateProduct = async (id, data) => {
  if (data.sku) {
    const existing = await Product.findOne({ sku: data.sku, _id: { $ne: id } });
    if (existing) throw new Error('Duplicate SKU');
  }
  return Product.findByIdAndUpdate(id, data, { new: true, runValidators: true }).populate('category', 'name');
};

const deleteProduct = async (id) => Product.findByIdAndUpdate(id, { isActive: false }, { new: true });

module.exports = {
  getCategories, createCategory, updateCategory, deleteCategory,
  getProducts, createProduct, updateProduct, deleteProduct
};
