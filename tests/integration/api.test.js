
const request = require('supertest');
const app = require('../server');

describe('Health Check API', () => {
  test('GET /api/health should return 200', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect('Content-Type', /json/)
      .expect(200);
    
    expect(response.body.status).toBe('OK');
  });
});

describe('Authentication API', () => {
  test('POST /api/auth/register should create user', async () => {
    const userData = {
      firstName: 'Test',
      lastName: 'User',
      email: `test${Date.now()}@example.com`,
      password: 'Test123!@#',
      confirmPassword: 'Test123!@#',
      terms: true
    };
    
    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect('Content-Type', /json/)
      .expect(201);
    
    expect(response.body.success).toBe(true);
    expect(response.body.token).toBeDefined();
  });
});
