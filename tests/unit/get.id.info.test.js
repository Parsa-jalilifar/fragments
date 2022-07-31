// tests/unit/get.id.info.test.js

const request = require('supertest');
const app = require('../../src/app');

describe('GET /fragments/:id.ext', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () =>
    request(app).get('/v1/fragments/:id.ext').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app)
      .get('/v1/fragments/:id.ext')
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401));

  // If ext is not supported it should deny the request
  test('unsupported extension types are denied', async () => {
    const postResponse = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set({
        'Content-Type': 'text/plain',
        body: 'This is a fragment',
      });

    const getResponse = await request(app)
      .get(`/v1/fragments/${postResponse.body.fragment.id}.xml`)
      .auth('user1@email.com', 'password1');

    expect(getResponse.statusCode).toBe(415);
    expect(getResponse.body.error.message).toBe('Extension type is not supported.');
  });

  // if conversion is not allowed it should deny the request
  test('unsupported conversions are denied', async () => {
    const postResponse = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set({
        'Content-Type': 'text/plain',
        body: 'This is a fragment',
      });

    const getResponse = await request(app)
      .get(`/v1/fragments/${postResponse.body.fragment.id}.png`)
      .auth('user1@email.com', 'password1');

    expect(getResponse.statusCode).toBe(415);
    expect(getResponse.body.error.message).toBe('Conversion is not allowed.');
  });

  // Successful conversion from txt to txt
  test('Convert fragment data from md to html', async () => {
    const postResponse = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set({
        'Content-Type': 'text/plain',
        body: 'This is a fragment',
      });

    const getResponse = await request(app)
      .get(`/v1/fragments/${postResponse.body.fragment.id}.txt`)
      .auth('user1@email.com', 'password1');

    expect(getResponse.statusCode).toBe(200);
    expect(getResponse.headers['content-type']).toBe('text/plain; charset=utf-8');
  });

  // Successful conversion from md to html
  test('Convert fragment data from md to html', async () => {
    const postResponse = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set({
        'Content-Type': 'text/markdown',
        body: '# This is a fragment',
      });

    const getResponse = await request(app)
      .get(`/v1/fragments/${postResponse.body.fragment.id}.html`)
      .auth('user1@email.com', 'password1');

    expect(getResponse.statusCode).toBe(200);
    expect(getResponse.headers['content-type']).toBe('text/html; charset=utf-8');
  });
});

describe('GET /v1/fragments/:id/info', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () =>
    request(app).get('/v1/fragments/id/info').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app)
      .get('/v1/fragments/:id/info')
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401));

  test('metadata of posted fragment can be retrieved by id', async () => {
    const postResponse = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set({
        'Content-Type': 'text/plain',
        body: 'This is a fragment',
      });

    const getResponse = await request(app)
      .get(`/v1/fragments/${postResponse.body.fragment.id}/info`)
      .auth('user1@email.com', 'password1');

    expect(getResponse.statusCode).toBe(200);
    expect(getResponse.body.status).toBe('ok');
  });

  test('requested fragment metadata by invalid id should fail', async () => {
    const res = await request(app)
      .get(`/v1/fragments/randomId/info`)
      .auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(404);
  });
});
