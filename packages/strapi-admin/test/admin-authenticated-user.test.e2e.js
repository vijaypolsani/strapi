'use strict';

// Helpers.
const { registerAndLogin } = require('../../../test/helpers/auth');
const { createAuthRequest, createRequest } = require('../../../test/helpers/request');

let rq;

describe('Authenticated User', () => {
  beforeAll(async () => {
    const token = await registerAndLogin();

    rq = createAuthRequest(token);
  }, 60000);

  describe('GET /users/me', () => {
    test('Returns sanitized user info', async () => {
      const res = await rq({
        url: '/admin/users/me',
        method: 'GET',
        body: {},
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toMatchObject({
        id: expect.anything(),
        firstname: expect.stringOrNull(),
        lastname: expect.stringOrNull(),
        username: expect.stringOrNull(),
        email: expect.any(String),
        isActive: expect.any(Boolean),
      });
    });

    test('Returns forbidden on unauthenticated query', async () => {
      const req = createRequest();
      const res = await req({
        url: '/admin/users/me',
        method: 'GET',
        body: {},
      });

      expect(res.statusCode).toBe(403);
    });
  });

  describe('PUT /users/me', () => {
    test('Returns forbidden on unauthenticated query', async () => {
      const req = createRequest();
      const res = await req({
        url: '/admin/users/me',
        method: 'PUT',
        body: {},
      });

      expect(res.statusCode).toBe(403);
    });

    test('Fails when trying to edit roles', async () => {
      const res = await rq({
        url: '/admin/users/me',
        method: 'PUT',
        body: {
          roles: [1],
        },
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toMatchObject({
        statusCode: 400,
        error: 'Bad Request',
        message: 'ValidationError',
      });
    });

    test('Fails when trying to edit isActive', async () => {
      const res = await rq({
        url: '/admin/users/me',
        method: 'PUT',
        body: {
          isActive: 12,
        },
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toMatchObject({
        statusCode: 400,
        error: 'Bad Request',
        message: 'ValidationError',
      });
    });

    test('Fails when trying to set invalid inputs', async () => {
      const res = await rq({
        url: '/admin/users/me',
        method: 'PUT',
        body: {
          isActive: 12,
        },
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toMatchObject({
        statusCode: 400,
        error: 'Bad Request',
        message: 'ValidationError',
      });
    });

    test('Allows edition of names', async () => {
      const input = {
        firstname: 'newFirstName',
        lastname: 'newLastaName',
      };

      const res = await rq({
        url: '/admin/users/me',
        method: 'PUT',
        body: input,
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toMatchObject({
        id: expect.anything(),
        email: expect.any(String),
        firstname: input.firstname,
        lastname: input.lastname,
        username: expect.stringOrNull(),
        isActive: expect.any(Boolean),
        roles: expect.arrayContaining([]),
      });
    });
  });
});
