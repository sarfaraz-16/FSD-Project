const Product = require('../models/Product');
const SalesOrder = require('../models/SalesOrder');
const PurchaseOrder = require('../models/PurchaseOrder');
const Customer = require('../models/Customer');
const Supplier = require('../models/Supplier');
const Employee = require('../models/Employee');
const permissions = require('../../../shared/permissions.json');
const { sendSuccess } = require('../utils/response');

const searchAll = async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) {
      return sendSuccess(res, {
        products: [],
        sales: [],
        purchases: [],
        customers: [],
        suppliers: [],
        employees: [],
        navigation: []
      }, 'Empty search query');
    }

    const regex = new RegExp(q, 'i');
    const userRole = req.user.role;
    const rolePerms = permissions[userRole] || {};

    const canReadInventory = rolePerms.inventory?.includes('read');
    const canReadSales = rolePerms.sales?.includes('read');
    const canReadPurchases = rolePerms.purchases?.includes('read');
    const canReadEmployees = rolePerms.employees?.includes('read');

    const promises = {};

    if (canReadInventory) {
      promises.products = Product.find({
        isActive: true,
        $or: [{ name: regex }, { sku: regex }]
      })
      .populate('category', 'name')
      .limit(6)
      .lean();
    }

    if (canReadSales) {
      promises.sales = SalesOrder.find({
        $or: [{ invoiceNo: regex }]
      })
      .populate('customer', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

      promises.customers = Customer.find({
        $or: [{ name: regex }, { email: regex }, { phone: regex }]
      })
      .limit(5)
      .lean();
    }

    if (canReadPurchases) {
      promises.purchases = PurchaseOrder.find()
      .populate('supplier', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

      promises.suppliers = Supplier.find({
        $or: [{ name: regex }, { email: regex }, { phone: regex }]
      })
      .limit(5)
      .lean();
    }

    if (canReadEmployees) {
      promises.employees = Employee.find({
        $or: [{ name: regex }, { department: regex }, { designation: regex }]
      })
      .limit(5)
      .lean();
    }

    const results = await Promise.all(
      Object.entries(promises).map(async ([key, promise]) => [key, await promise])
    );

    const data = {
      products: [],
      sales: [],
      purchases: [],
      customers: [],
      suppliers: [],
      employees: [],
      navigation: []
    };

    results.forEach(([key, val]) => {
      if (key === 'purchases') {
        data.purchases = val.filter(po => 
          (po.supplier?.name && regex.test(po.supplier.name)) ||
          po._id.toString().includes(q)
        ).slice(0, 6);
      } else {
        data[key] = val;
      }
    });

    const navItems = [
      { name: 'Dashboard', path: '/', category: 'Navigation', roles: ['admin', 'manager', 'staff'] },
      { name: 'Inventory Products', path: '/inventory', category: 'Inventory', roles: ['admin', 'manager', 'staff'] },
      { name: 'Inventory Categories', path: '/inventory/categories', category: 'Inventory', roles: ['admin', 'manager', 'staff'] },
      { name: 'Stock Movement Logs', path: '/inventory/stock-logs', category: 'Inventory', roles: ['admin', 'manager', 'staff'] },
      { name: 'Sales Orders', path: '/sales', category: 'Sales', roles: ['admin', 'manager', 'staff'] },
      { name: 'New Sales Order', path: '/sales/new', category: 'Sales', roles: ['admin', 'manager', 'staff'] },
      { name: 'Customer Directory', path: '/sales/customers', category: 'Sales', roles: ['admin', 'manager', 'staff'] },
      { name: 'Purchase Orders', path: '/purchases', category: 'Purchases', roles: ['admin', 'manager'] },
      { name: 'New Purchase Order', path: '/purchases/new', category: 'Purchases', roles: ['admin', 'manager'] },
      { name: 'Supplier Directory', path: '/purchases/suppliers', category: 'Purchases', roles: ['admin', 'manager'] },
      { name: 'Reports & Analytics', path: '/reports', category: 'Reports', roles: ['admin', 'manager'] },
      { name: 'Employee Directory', path: '/hr', category: 'HR', roles: ['admin', 'manager'] },
      { name: 'User Access Control', path: '/hr/users', category: 'HR', roles: ['admin'] },
      { name: 'System Settings', path: '/settings', category: 'Settings', roles: ['admin'] },
      { name: 'Support & Help Desk', path: '/support', category: 'Support', roles: ['admin', 'manager', 'staff'] },
    ];

    data.navigation = navItems.filter(item => 
      item.roles.includes(userRole) && 
      (regex.test(item.name) || regex.test(item.category))
    );

    sendSuccess(res, data, 'Search completed successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = { searchAll };
