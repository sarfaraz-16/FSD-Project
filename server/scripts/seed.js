const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../src/models/User');
const Employee = require('../src/models/Employee');
const Category = require('../src/models/Category');
const Product = require('../src/models/Product');
const Customer = require('../src/models/Customer');
const Supplier = require('../src/models/Supplier');
const PurchaseOrder = require('../src/models/PurchaseOrder');
const SalesOrder = require('../src/models/SalesOrder');
const StockLog = require('../src/models/StockLog');

const connectDB = require('../src/config/db');

const seedDB = async () => {
  await connectDB();
  console.log('Clearing database...');
  await Promise.all([
    User.deleteMany(), Employee.deleteMany(), Category.deleteMany(),
    Product.deleteMany(), Customer.deleteMany(), Supplier.deleteMany(),
    PurchaseOrder.deleteMany(), SalesOrder.deleteMany(), StockLog.deleteMany()
  ]);

  console.log('Seeding Employees...');
  const employees = await Employee.insertMany([
    { name: 'Alice Admin', department: 'Executive', designation: 'Chief Technology Officer', email: 'admin@smarterp.com', phone: '+1 555-0101', joinDate: new Date('2023-01-15'), status: 'active' },
    { name: 'Bob Manager', department: 'Operations', designation: 'Inventory & Operations Lead', email: 'manager@smarterp.com', phone: '+1 555-0102', joinDate: new Date('2023-03-20'), status: 'active' },
    { name: 'Charlie Staff', department: 'Sales', designation: 'Desk Sales & POS Associate', email: 'staff@smarterp.com', phone: '+1 555-0103', joinDate: new Date('2023-06-10'), status: 'active' },
    { name: 'Diana Prince', department: 'Logistics', designation: 'Warehouse Manager', email: 'diana@smarterp.com', phone: '+1 555-0104', joinDate: new Date('2023-08-01'), status: 'active' },
    { name: 'Evan Wright', department: 'Purchasing', designation: 'Procurement Specialist', email: 'evan@smarterp.com', phone: '+1 555-0105', joinDate: new Date('2024-02-14'), status: 'active' },
    { name: 'Fiona Gallagher', department: 'Finance', designation: 'Senior Accountant', email: 'fiona@smarterp.com', phone: '+1 555-0106', joinDate: new Date('2024-05-18'), status: 'active' }
  ]);

  console.log('Seeding Users...');
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  const [admin, manager, staff] = await User.insertMany([
    { name: 'Alice Admin', email: 'admin@smarterp.com', passwordHash, role: 'admin', isActive: true, employee: employees[0]._id },
    { name: 'Bob Manager', email: 'manager@smarterp.com', passwordHash, role: 'manager', isActive: true, employee: employees[1]._id },
    { name: 'Charlie Staff', email: 'staff@smarterp.com', passwordHash, role: 'staff', isActive: true, employee: employees[2]._id }
  ]);

  console.log('Seeding Categories...');
  const categories = await Category.insertMany([
    { name: 'Laptops', description: 'Business & Gaming Laptops' },
    { name: 'Networking', description: 'Routers & Switches' },
    { name: 'Accessories', description: 'Keyboards, Mice & Docks' },
    { name: 'Storage', description: 'SSDs & HDDs' },
    { name: 'Displays', description: 'Monitors & Projectors' }
  ]);

  console.log('Seeding Products...');
  const products = await Product.insertMany([
    { sku: 'LAP-PRO-16', name: 'MacBook Pro 16"', category: categories[0]._id, costPrice: 2000, sellPrice: 2500, stockQty: 18, reorderLevel: 5 },
    { sku: 'LAP-XPS-15', name: 'Dell XPS 15', category: categories[0]._id, costPrice: 1500, sellPrice: 1800, stockQty: 22, reorderLevel: 5 },
    { sku: 'NET-WIFI-6', name: 'Cisco WiFi 6 Router', category: categories[1]._id, costPrice: 200, sellPrice: 350, stockQty: 48, reorderLevel: 10 },
    { sku: 'ACC-MX-M', name: 'Logitech MX Master 3', category: categories[2]._id, costPrice: 60, sellPrice: 100, stockQty: 4, reorderLevel: 10 },
    { sku: 'ACC-KEY-M', name: 'Mechanical Keyboard RGB', category: categories[2]._id, costPrice: 80, sellPrice: 150, stockQty: 32, reorderLevel: 10 },
    { sku: 'STO-SSD-1', name: 'Samsung 1TB NVMe SSD', category: categories[3]._id, costPrice: 90, sellPrice: 130, stockQty: 95, reorderLevel: 20 },
    { sku: 'DIS-4K-27', name: 'Dell 27" 4K IPS Monitor', category: categories[4]._id, costPrice: 300, sellPrice: 450, stockQty: 14, reorderLevel: 5 },
  ]);

  console.log('Seeding Partners...');
  const customers = await Customer.insertMany([
    { name: 'Acme Corporation', email: 'purchasing@acme.com', phone: '+1 555-0100', address: '123 Acme Industrial Way, San Francisco, CA' },
    { name: 'Globex Innovations', email: 'orders@globex.com', phone: '+1 555-0200', address: '456 Globex Boulevard, Austin, TX' },
    { name: 'Apex Tech Solutions', email: 'billing@apextech.io', phone: '+1 555-0350', address: '88 Cyber Park, Seattle, WA' }
  ]);

  const suppliers = await Supplier.insertMany([
    { name: 'TechWholesale Ltd', email: 'sales@techwholesale.com', phone: '+1 555-0300', address: '789 Tech Blvd, Boston, MA' },
    { name: 'Global Components Inc', email: 'supply@globalcomp.com', phone: '+1 555-0400', address: '101 Industry Pkwy, Chicago, IL' },
    { name: 'Silicon Valley Logistics', email: 'orders@svlogistics.com', phone: '+1 555-0550', address: '500 Innovation Way, San Jose, CA' }
  ]);

  console.log('Seeding Purchase Orders...');
  await PurchaseOrder.create([
    {
      supplier: suppliers[0]._id,
      items: [
        { product: products[0]._id, qty: 10, cost: 2000 },
        { product: products[3]._id, qty: 50, cost: 60 }
      ],
      total: 23000,
      status: 'received',
      receivedAt: new Date(Date.now() - 86400000 * 3),
      createdBy: admin._id
    },
    {
      supplier: suppliers[1]._id,
      items: [
        { product: products[2]._id, qty: 25, cost: 200 },
        { product: products[5]._id, qty: 40, cost: 90 }
      ],
      total: 8600,
      status: 'ordered',
      createdBy: manager._id
    },
    {
      supplier: suppliers[2]._id,
      items: [
        { product: products[4]._id, qty: 30, cost: 80 },
        { product: products[6]._id, qty: 10, cost: 300 }
      ],
      total: 5400,
      status: 'draft',
      createdBy: admin._id
    }
  ]);

  console.log('Seeding Sales Orders...');
  await SalesOrder.create([
    {
      customer: customers[0]._id,
      items: [
        { product: products[0]._id, qty: 2, price: 2500 },
        { product: products[6]._id, qty: 4, price: 450 }
      ],
      total: 6800,
      status: 'completed',
      invoiceNo: 'INV-2026-0001',
      createdBy: manager._id,
      createdAt: new Date(Date.now() - 86400000 * 2)
    },
    {
      customer: customers[1]._id,
      items: [
        { product: products[1]._id, qty: 3, price: 1800 },
        { product: products[4]._id, qty: 5, price: 150 }
      ],
      total: 6150,
      status: 'confirmed',
      invoiceNo: 'INV-2026-0002',
      createdBy: staff._id,
      createdAt: new Date(Date.now() - 86400000)
    },
    {
      customer: customers[2]._id,
      items: [
        { product: products[2]._id, qty: 4, price: 350 },
        { product: products[5]._id, qty: 10, price: 130 }
      ],
      total: 2700,
      status: 'draft',
      createdBy: staff._id,
      createdAt: new Date()
    }
  ]);

  console.log('Database successfully seeded with comprehensive Demo Data!');
  process.exit();
};

seedDB().catch(err => {
  console.error(err);
  process.exit(1);
});
