const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Product = require('../src/models/Product');
const Customer = require('../src/models/Customer');
const SalesOrder = require('../src/models/SalesOrder');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const env = require('../src/config/env');

describe('Search and Notifications Endpoints', () => {
  let adminToken;
  let staffToken;

  beforeEach(async () => {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    const admin = await User.create({ name: 'Admin', email: 'admin@test.com', passwordHash, role: 'admin' });
    adminToken = jwt.sign({ id: admin._id }, env.JWT_SECRET, { expiresIn: '1h' });

    const staff = await User.create({ name: 'Staff', email: 'staff@test.com', passwordHash, role: 'staff' });
    staffToken = jwt.sign({ id: staff._id }, env.JWT_SECRET, { expiresIn: '1h' });

    // Seed test products
    await Product.create({
      sku: 'SKU-LAPTOP-01',
      name: 'ThinkPad X1 Laptop',
      category: new mongoose.Types.ObjectId(),
      costPrice: 800,
      sellPrice: 1200,
      stockQty: 2, // low stock (reorder level default is 10)
      reorderLevel: 5
    });

    await Product.create({
      sku: 'SKU-MOUSE-01',
      name: 'Wireless Ergonomic Mouse',
      category: new mongoose.Types.ObjectId(),
      costPrice: 15,
      sellPrice: 30,
      stockQty: 0, // out of stock
      reorderLevel: 10
    });

    const customer = await Customer.create({ name: 'Global Logistics Inc', email: 'info@globallogistics.com' });

    await SalesOrder.create({
      customer: customer._id,
      items: [{ product: new mongoose.Types.ObjectId(), qty: 1, price: 50 }],
      total: 50,
      status: 'draft',
      createdBy: admin._id
    });
  });

  describe('GET /api/search', () => {
    it('should return matching products and navigation for a query', async () => {
      const res = await request(app)
        .get('/api/search?q=laptop')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.products.length).toBeGreaterThan(0);
      expect(res.body.data.products[0].sku).toBe('SKU-LAPTOP-01');
    });

    it('should return matching customers for query', async () => {
      const res = await request(app)
        .get('/api/search?q=logistics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.customers.length).toBeGreaterThan(0);
      expect(res.body.data.customers[0].name).toBe('Global Logistics Inc');
    });

    it('should handle empty search query gracefully', async () => {
      const res = await request(app)
        .get('/api/search?q=')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.products).toEqual([]);
    });
  });

  describe('GET /api/notifications', () => {
    it('should return low stock, out of stock, and draft order notifications', async () => {
      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.notifications.length).toBeGreaterThanOrEqual(3);

      const types = res.body.data.notifications.map(n => n.type);
      expect(types).toContain('out_of_stock');
      expect(types).toContain('low_stock');
      expect(types).toContain('sales_draft');

      expect(res.body.data.counts.total).toBeGreaterThanOrEqual(3);
      expect(res.body.data.counts.critical).toBeGreaterThanOrEqual(1);
    });

    it('should deny unauthenticated requests', async () => {
      const res = await request(app).get('/api/notifications');
      expect(res.status).toBe(401);
    });
  });
});
