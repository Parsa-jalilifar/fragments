// tests/unit/post.test.js

const request = require('supertest');
const app = require('../../src/app');

describe('POST /v1/fragments', () => {
  test('authenticated users can create a fragment', async () => {
    const res = await request(app).post('/v1/fragments').auth('user1@email.com', 'password1').set({
      'Content-Type': 'text/plain',
      body: 'This is a fragment',
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
  });

  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).post('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).post('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  test('fragment without data does not work', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .send();
    expect(res.statusCode).toBe(500);
  });

  test('unsupported fragment types are denied', async () => {
    const res = await request(app).post('/v1/fragments').auth('user1@email.com', 'password1').set({
      'Content-Type': 'application/xml',
      body: '<name>fragment</name>',
    });
    expect(res.statusCode).toBe(415);
    expect(res.body.status).toBe('error');
  });
});
