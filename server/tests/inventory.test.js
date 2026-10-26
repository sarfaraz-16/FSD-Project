const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Category = require('../src/models/Category');
const Product = require('../src/models/Product');
const StockLog = require('../src/models/StockLog');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const env = require('../src/config/env');

describe('Inventory Endpoints', () => {
  let adminToken;
  let staffToken;
  let adminUser;
  let categoryId;
  let productId;

  beforeEach(async () => {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);
    
    adminUser = await User.create({
      name: 'Admin',
      email: 'admin@test.com',
      passwordHash,
      role: 'admin'
    });
    
    const staffUser = await User.create({
      name: 'Staff',
      email: 'staff@test.com',
      passwordHash,
      role: 'staff'
    });

    adminToken = jwt.sign({ id: adminUser._id }, env.JWT_SECRET, { expiresIn: '1h' });
    staffToken = jwt.sign({ id: staffUser._id }, env.JWT_SECRET, { expiresIn: '1h' });

    const category = await Category.create({ name: 'Electronics', description: 'Tech stuff' });
    categoryId = category._id;

    const product = await Product.create({
      sku: 'SKU123',
      name: 'Laptop',
      category: categoryId,
      costPrice: 500.5,
      sellPrice: 1000,
      stockQty: 5,
      reorderLevel: 10
    });
    productId = product._id;
  });

  it('should create a product', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        sku: 'SKU124',
        name: 'Mouse',
        category: categoryId,
        costPrice: 20,
        sellPrice: 50,
        stockQty: 50,
        reorderLevel: 20
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Mouse');
  });

  it('should deny staff from creating a product', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        sku: 'SKU125',
        name: 'Keyboard',
        category: categoryId,
        costPrice: 30,
        sellPrice: 60,
      });
    expect(res.statusCode).toEqual(403);
  });

  it('should reject duplicate SKU', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        sku: 'SKU123',
        name: 'Another Laptop',
        category: categoryId,
        costPrice: 500,
        sellPrice: 1000,
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toBe('Duplicate SKU');
  });

  it('should adjust stock correctly', async () => {
    const res = await request(app)
      .post(`/api/products/${productId}/adjust`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        change: 5,
        reason: 'Manual Adjustment'
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.product.stockQty).toBe(10);
    
    // Check StockLog
    const logs = await StockLog.find({ product: productId });
    expect(logs.length).toBe(1);
    expect(logs[0].change).toBe(5);
  });

  it('should reject adjustment resulting in negative stock', async () => {
    const res = await request(app)
      .post(`/api/products/${productId}/adjust`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        change: -10,
        reason: 'Damage'
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toMatch(/Insufficient stock/);
  });

  it('should fetch low stock products', async () => {
    // Current stock is 5, reorder is 10, so it's low stock
    const res = await request(app)
      .get('/api/products/low-stock')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].name).toBe('Laptop');
  });
});
