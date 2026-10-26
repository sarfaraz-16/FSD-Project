const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const env = require('../src/config/env');

describe('Permission Matrix Tests', () => {
  let tokens = {};

  beforeEach(async () => {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    for (const role of ['admin', 'manager', 'staff']) {
      const user = await User.create({ name: `${role} User`, email: `${role}@test.com`, passwordHash, role });
      tokens[role] = jwt.sign({ id: user._id }, env.JWT_SECRET, { expiresIn: '1h' });
    }
  });

  const matrix = [
    { route: '/api/categories', method: 'get', expected: { admin: 200, manager: 200, staff: 200 } },
    { route: '/api/categories', method: 'post', body: { name: 'Test' }, expected: { admin: 201, manager: 201, staff: 403 } },
    { route: '/api/sales', method: 'get', expected: { admin: 200, manager: 200, staff: 200 } },
    { route: '/api/sales', method: 'post', body: {}, expected: { admin: 400, manager: 400, staff: 400 } },
    { route: '/api/purchases', method: 'get', expected: { admin: 200, manager: 200, staff: 403 } },
    { route: '/api/purchases', method: 'post', body: {}, expected: { admin: 400, manager: 400, staff: 403 } },
    { route: '/api/employees', method: 'get', expected: { admin: 200, manager: 200, staff: 403 } },
    { route: '/api/employees', method: 'post', body: {}, expected: { admin: 400, manager: 403, staff: 403 } },
    { route: '/api/users', method: 'get', expected: { admin: 200, manager: 403, staff: 403 } }
  ];

  matrix.forEach(({ route, method, body, expected }) => {
    describe(`${method.toUpperCase()} ${route}`, () => {
      for (const [role, code] of Object.entries(expected)) {
        it(`should return ${code} for ${role}`, async () => {
          const req = request(app)[method](route).set('Authorization', `Bearer ${tokens[role]}`);
          if (body) req.send(body);
          const res = await req;
          expect(res.statusCode).toBe(code);
        });
      }
    });
  });
});
