const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const env = require('../src/config/env');

describe('Auth Endpoints', () => {
  let adminToken;
  let staffToken;

  beforeEach(async () => {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);
    
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@test.com',
      passwordHash,
      role: 'admin'
    });
    
    const staff = await User.create({
      name: 'Staff',
      email: 'staff@test.com',
      passwordHash,
      role: 'staff'
    });

    adminToken = jwt.sign({ id: admin._id }, env.JWT_SECRET, { expiresIn: '1h' });
    staffToken = jwt.sign({ id: staff._id }, env.JWT_SECRET, { expiresIn: '1h' });
  });

  it('should login with correct credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@test.com',
      password: 'password123'
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  it('should not login with wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@test.com',
      password: 'wrongpassword'
    });
    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toBe(false);
  });

  it('should allow login when expectedRole matches user role', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@test.com',
      password: 'password123',
      expectedRole: 'admin'
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
  });

  it('should reject login with 403 when user attempts to access wrong role portal', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'staff@test.com',
      password: 'password123',
      expectedRole: 'admin'
    });
    expect(res.statusCode).toEqual(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Access Denied: This account is not authorized to access the Admin portal/);
  });

  it('should allow admin to register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'New User',
        email: 'new@test.com',
        password: 'password123',
        role: 'manager'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('new@test.com');
  });

  it('should deny staff from registering a user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        name: 'New User',
        email: 'new2@test.com',
        password: 'password123',
        role: 'staff'
      });
    expect(res.statusCode).toEqual(403);
    expect(res.body.success).toBe(false);
  });

  it('should fetch my profile', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.data.user.email).toBe('admin@test.com');
  });
});
