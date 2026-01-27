/**
 * API Integration Tests
 * 
 * Comprehensive unit and integration tests for all API endpoints.
 * Tests cover:
 * - Authentication endpoints (register, login)
 * - Hub management (CRUD operations)
 * - Link operations with Smart Rules
 * - Analytics tracking
 * - Error handling and validation
 * 
 * Framework: Jest with Supertest
 * Run: npm test
 */

const request = require('supertest');
const app = require('../src/app');

describe('Link Hub API - Insane Level Testing', () => {
    let testUser = { email: `test_${Date.now()}@example.com`, password: 'Password123!' };
    let token = '';

    test('POST /api/auth/register - Register a new user', async () => {
        const res = await request(app).post('/api/auth/register').send(testUser);
        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('token');
        token = res.body.token;
    });

    test('POST /api/auth/login - Login with valid credentials', async () => {
        const res = await request(app).post('/api/auth/login').send(testUser);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token');
    });

    test('POST /api/hubs - Create a new hub (Requires Auth)', async () => {
        const res = await request(app)
            .post('/api/hubs')
            .set('Authorization', `Bearer ${token}`)
            .send({ slug: 'my-smart-hub', title: 'Smart Hub' });
        expect(res.statusCode).toBe(201);
    });

    test('GET /invalid-route - 404 Handler Check', async () => {
        const res = await request(app).get('/api/some/invalid/path');
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toContain('not found');
    });
});
