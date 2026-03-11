import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

const { app } = await import('../server.js');

test('GET /api/health returns healthy status', async () => {
    const response = await request(app).get('/api/health');

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.status, 'healthy');
    assert.ok(response.body.timestamp);
    assert.equal(response.body.version, '1.0.0');
});
