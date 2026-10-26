const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Product = require('../src/models/Product');
const Category = require('../src/models/Category');
const SalesOrder = require('../src/models/SalesOrder');
const PurchaseOrder = require('../src/models/PurchaseOrder');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const env = require('../src/config/env');

describe('Dashboard & Reports Endpoints', () => {
  let adminToken, staffToken;

  beforeEach(async () => {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);
    
    const adminUser = await User.create({ name: 'Admin', email: 'admin@test.com', passwordHash, role: 'admin' });
    const staffUser = await User.create({ name: 'Staff', email: 'staff@test.com', passwordHash, role: 'staff' });

    adminToken = jwt.sign({ id: adminUser._id }, env.JWT_SECRET, { expiresIn: '1h' });
    staffToken = jwt.sign({ id: staffUser._id }, env.JWT_SECRET, { expiresIn: '1h' });

    const cat = await Category.create({ name: 'Hardware' });
    const p1 = await Product.create({ sku: 'A1', name: 'Nails', category: cat._id, costPrice: 1, sellPrice: 2, stockQty: 5, reorderLevel: 10 });
    
    await SalesOrder.create({ customer: adminUser._id, items: [{ product: p1._id, qty: 2, price: 2 }], total: 4, status: 'completed', createdBy: adminUser._id });
    await PurchaseOrder.create({ supplier: adminUser._id, items: [{ product: p1._id, qty: 10, cost: 1 }], total: 10, status: 'ordered', createdBy: adminUser._id });
  });

  it('should fetch dashboard summary for admin', async () => {
    const res = await request(app)
      .get('/api/dashboard/summary')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.todaySalesTotal).toBe(4);
    expect(res.body.data.lowStockCount).toBe(1);
    expect(res.body.data.totalStockValue).toBeDefined(); // admin sees cost
  });

  it('should fetch dashboard summary for staff (no cost/profit)', async () => {
    const res = await request(app)
      .get('/api/dashboard/summary')
      .set('Authorization', `Bearer ${staffToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.totalStockValue).toBeUndefined(); // staff cannot see cost
  });

  it('should fetch sales report and support CSV format', async () => {
    // Normal JSON request
    const resJson = await request(app)
      .get('/api/reports/sales')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(resJson.statusCode).toBe(200);
    expect(resJson.body.data.items.length).toBe(1);

    // CSV format request
    const resCsv = await request(app)
      .get('/api/reports/sales?format=csv')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(resCsv.statusCode).toBe(200);
    expect(resCsv.headers['content-type']).toMatch(/text\/csv/);
    expect(resCsv.text).toContain('Total'); // Header
    expect(resCsv.text).toContain('4'); // Total value
  });

  it('should deny staff from accessing reports', async () => {
    const res = await request(app)
      .get('/api/reports/sales')
      .set('Authorization', `Bearer ${staffToken}`);
    expect(res.statusCode).toBe(403);
  });
});
