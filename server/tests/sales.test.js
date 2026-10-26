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

describe('Sales Endpoints', () => {
  let token;
  let customerId;
  let productId;

  beforeEach(async () => {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);
    
    const user = await User.create({ name: 'Admin', email: 'admin@test.com', passwordHash, role: 'admin' });
    token = jwt.sign({ id: user._id }, env.JWT_SECRET, { expiresIn: '1h' });

    const customer = await Customer.create({ name: 'Acme Corp' });
    customerId = customer._id;

    const product = await Product.create({
      sku: 'SKU1',
      name: 'Item 1',
      category: new mongoose.Types.ObjectId(),
      costPrice: 10,
      sellPrice: 20,
      stockQty: 50
    });
    productId = product._id;
  });

  it('should create a draft sales order', async () => {
    const res = await request(app)
      .post('/api/sales')
      .set('Authorization', `Bearer ${token}`)
      .send({
        customer: customerId,
        items: [{ product: productId, qty: 5, price: 20 }]
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.total).toBe(100);
    expect(res.body.data.status).toBe('draft');
  });

  it('should reject confirming order if stock is insufficient', async () => {
    const order = await SalesOrder.create({
      customer: customerId,
      items: [{ product: productId, qty: 100, price: 20 }],
      total: 2000,
      createdBy: new mongoose.Types.ObjectId(),
      status: 'draft'
    });

    const res = await request(app)
      .patch(`/api/sales/${order._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ action: 'confirm' });
    
    expect(res.statusCode).toBe(400);
  });

  it('should confirm order and reduce stock', async () => {
    const order = await SalesOrder.create({
      customer: customerId,
      items: [{ product: productId, qty: 10, price: 20 }],
      total: 200,
      createdBy: new mongoose.Types.ObjectId(),
      status: 'draft'
    });

    const res = await request(app)
      .patch(`/api/sales/${order._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ action: 'confirm' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe('confirmed');
    expect(res.body.data.invoiceNo).toMatch(/^INV-\d{4}-\d{4}$/);

    const product = await Product.findById(productId);
    expect(product.stockQty).toBe(40);
  });

  it('should restore stock when cancelling a confirmed order', async () => {
    const order = await SalesOrder.create({
      customer: customerId,
      items: [{ product: productId, qty: 10, price: 20 }],
      total: 200,
      createdBy: new mongoose.Types.ObjectId(),
      status: 'draft'
    });

    await request(app)
      .patch(`/api/sales/${order._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ action: 'confirm' });

    const res = await request(app)
      .patch(`/api/sales/${order._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ action: 'cancel' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe('cancelled');

    const product = await Product.findById(productId);
    expect(product.stockQty).toBe(50);
  });
});
