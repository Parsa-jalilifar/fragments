// tests/unit/post.test.js

const request = require('supertest');
const app = require('../../src/app');

describe('POST /fragments', () => {
  test('authenticated users can create a plain text fragment', async () => {
    const res = await request(app).post('/v1/fragments').auth('user1@email.com', 'password1').send({
      body: 'This is a fragment',
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
  });

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
});
