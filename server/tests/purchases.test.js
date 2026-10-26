const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Product = require('../src/models/Product');
const Supplier = require('../src/models/Supplier');
const PurchaseOrder = require('../src/models/PurchaseOrder');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const env = require('../src/config/env');

describe('Purchase Endpoints', () => {
  let token;
  let supplierId;
  let productId;

  beforeEach(async () => {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);
    
    const user = await User.create({ name: 'Admin', email: 'admin@test.com', passwordHash, role: 'admin' });
    token = jwt.sign({ id: user._id }, env.JWT_SECRET, { expiresIn: '1h' });

    const supplier = await Supplier.create({ name: 'Tech Dist' });
    supplierId = supplier._id;

    const product = await Product.create({
      sku: 'SKU2',
      name: 'Item 2',
      category: new mongoose.Types.ObjectId(),
      costPrice: 10,
      sellPrice: 20,
      stockQty: 50
    });
    productId = product._id;
  });

  it('should receive order and increase stock once only', async () => {
    const order = await PurchaseOrder.create({
      supplier: supplierId,
      items: [{ product: productId, qty: 20, cost: 10 }],
      total: 200,
      createdBy: new mongoose.Types.ObjectId(),
      status: 'ordered'
    });

    const res = await request(app)
      .patch(`/api/purchases/${order._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ action: 'receive' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.status).toBe('received');

    const product = await Product.findById(productId);
    expect(product.stockQty).toBe(70); // 50 + 20

    // Try receiving again
    const res2 = await request(app)
      .patch(`/api/purchases/${order._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ action: 'receive' });

    expect(res2.statusCode).toBe(400); // Expect bad request

    const productAgain = await Product.findById(productId);
    expect(productAgain.stockQty).toBe(70); // Remains 70
  });
});
