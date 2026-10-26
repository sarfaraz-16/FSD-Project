const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Employee = require('../src/models/Employee');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const env = require('../src/config/env');

describe('HR & Users Module Endpoints', () => {
  let adminToken, adminUserId, managerToken, managerUserId;

  beforeEach(async () => {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);
    
    const adminUser = await User.create({
      name: 'Admin',
      email: 'admin@test.com',
      passwordHash,
      role: 'admin'
    });
    adminUserId = adminUser._id;
    adminToken = jwt.sign({ id: adminUser._id }, env.JWT_SECRET, { expiresIn: '1h' });

    const managerUser = await User.create({
      name: 'Manager',
      email: 'manager@test.com',
      passwordHash,
      role: 'manager'
    });
    managerUserId = managerUser._id;
    managerToken = jwt.sign({ id: managerUser._id }, env.JWT_SECRET, { expiresIn: '1h' });
  });

  it('should allow admin to create employee and link to user', async () => {
    const empRes = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'John Doe',
        department: 'Sales',
        designation: 'Sales Executive',
        joinDate: '2023-01-01'
      });
    expect(empRes.statusCode).toBe(201);
    const empId = empRes.body.data._id;

    const userRes = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'John Doe',
        email: 'john@test.com',
        password: 'password123',
        role: 'staff',
        employeeId: empId
      });
    expect(userRes.statusCode).toBe(201);
    expect(userRes.body.data.employeeId).toBe(empId);
  });

  it('should deny manager from updating user role', async () => {
    const res = await request(app)
      .patch(`/api/users/${managerUserId}`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ role: 'admin' });
    expect(res.statusCode).toBe(403);
  });

  it('should deny admin from removing their own admin role', async () => {
    const res = await request(app)
      .patch(`/api/users/${adminUserId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'manager' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Cannot change your own role/);
  });

  it('should deny admin from deactivating themselves', async () => {
    const res = await request(app)
      .patch(`/api/users/${adminUserId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isActive: false });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Cannot deactivate your own account/);
  });

  it('should allow admin to deactivate manager and manager cannot login', async () => {
    const patchRes = await request(app)
      .patch(`/api/users/${managerUserId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isActive: false });
    expect(patchRes.statusCode).toBe(200);
    expect(patchRes.body.data.isActive).toBe(false);

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'manager@test.com',
        password: 'password123'
      });
    expect(loginRes.statusCode).toBe(401);
    expect(loginRes.body.message).toMatch(/Invalid credentials/);
  });
});
