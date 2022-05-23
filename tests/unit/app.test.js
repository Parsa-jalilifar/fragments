// tests/unit/app.test.js

const request = require('supertest');

const app = require('../../src/app');

describe('Not Found', () => {
  test('should return status: error', async () => {
    const res = await request(app).get('/randomUrl');
    expect(res.body.status).toEqual('error');
    expect(res.body.error.message).toEqual('not found');
    expect(res.body.error.code).toBe(404);
  });
});
