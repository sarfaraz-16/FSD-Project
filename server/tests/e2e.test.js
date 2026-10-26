const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const { MongoMemoryReplSet } = require('mongodb-memory-server');
const User = require('../src/models/User');
const Category = require('../src/models/Category');
const Product = require('../src/models/Product');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const env = require('../src/config/env');

jest.setTimeout(120000);

describe('E2E Integration Flow', () => {
  let mongoServer;
  let adminToken, adminUserId;
  let categoryId, productId;
  let supplierId, customerId;
  let purchaseOrderId, salesOrderId;

  beforeAll(async () => {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);
    
    const adminUser = await User.create({
      name: 'Admin Flow',
      email: 'admin.flow@test.com',
      passwordHash,
      role: 'admin',
      isActive: true
    });
    adminUserId = adminUser._id;
    adminToken = jwt.sign({ id: adminUserId }, env.JWT_SECRET, { expiresIn: '1h' });

    supplierId = adminUserId; // For simplicity, use the same user document
    customerId = adminUserId;
  });

  it('should execute full e2e flow: Login -> Create Product -> PO -> SO -> Reports', async () => {
    // 1. Create Category & Product
    const catRes = await request(app).post('/api/categories').set('Authorization', `Bearer ${adminToken}`).send({ name: 'Laptops', description: 'Computing' });
    expect(catRes.statusCode).toBe(201);
    categoryId = catRes.body.data._id;

    const prodRes = await request(app).post('/api/products').set('Authorization', `Bearer ${adminToken}`).send({
      sku: 'MAC-M3', name: 'MacBook Pro M3', category: categoryId, costPrice: 1000, sellPrice: 1500, stockQty: 0, reorderLevel: 5
    });
    expect(prodRes.statusCode).toBe(201);
    productId = prodRes.body.data._id;
    expect(prodRes.body.data.stockQty).toBe(0);

    // 2. Create Purchase Order & Receive (stock increases)
    const poRes = await request(app).post('/api/purchases').set('Authorization', `Bearer ${adminToken}`).send({
      supplier: supplierId,
      items: [{ product: productId, qty: 20, cost: 1000 }]
    });
    expect(poRes.statusCode).toBe(201);
    purchaseOrderId = poRes.body.data._id;

    // Move to ordered
    const ordRes = await request(app).patch(`/api/purchases/${purchaseOrderId}`).set('Authorization', `Bearer ${adminToken}`).send({ action: 'ordered' });
    expect(ordRes.statusCode).toBe(200);

    const recvRes = await request(app).patch(`/api/purchases/${purchaseOrderId}`).set('Authorization', `Bearer ${adminToken}`).send({ action: 'receive' });
    expect(recvRes.statusCode).toBe(200);

    const prodCheck = await Product.findById(productId);
    expect(prodCheck.stockQty).toBe(20);

    // 3. Create Sales Order & Confirm (stock decreases)
    const soRes = await request(app).post('/api/sales').set('Authorization', `Bearer ${adminToken}`).send({
      customer: customerId,
      items: [{ product: productId, qty: 5, price: 1500 }]
    });
    expect(soRes.statusCode).toBe(201);
    salesOrderId = soRes.body.data._id;

    const confRes = await request(app).patch(`/api/sales/${salesOrderId}`).set('Authorization', `Bearer ${adminToken}`).send({ action: 'confirm' });
    expect(confRes.statusCode).toBe(200);

    const prodCheck2 = await Product.findById(productId);
    expect(prodCheck2.stockQty).toBe(15);

    // 4. Query Reports & Dashboard to verify data integrity
    const summaryRes = await request(app).get('/api/dashboard/summary').set('Authorization', `Bearer ${adminToken}`);
    expect(summaryRes.statusCode).toBe(200);
    expect(summaryRes.body.data.todaySalesTotal).toBe(7500);
    expect(summaryRes.body.data.todaySalesCount).toBe(1);
    expect(summaryRes.body.data.lowStockCount).toBe(0);
    expect(summaryRes.body.data.totalStockValue).toBe(15000);

    const salesReportRes = await request(app).get('/api/reports/sales').set('Authorization', `Bearer ${adminToken}`);
    expect(salesReportRes.statusCode).toBe(200);
    expect(salesReportRes.body.data.items.length).toBeGreaterThanOrEqual(1);
    expect(salesReportRes.body.data.items[0].total).toBe(7500);
  });
});
