import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';

const TEST_CLIENT_ID = 'test-client';
const TEST_CLIENT_SECRET = 'test-secret';
const TEST_JWT_SECRET = 'integration-test-jwt-secret';

// Set env before importing app (swaggerOptions reads BASE_URL at module scope)
process.env.BASE_URL = 'http://localhost:3100';
process.env.JWT_SECRET = TEST_JWT_SECRET;
process.env.CLIENT_ID = TEST_CLIENT_ID;
process.env.CLIENT_SECRET = TEST_CLIENT_SECRET;
process.env.RATE_LIMIT_MAX = '1000';

let app: FastifyInstance;

function basicAuth(clientId: string, clientSecret: string): string {
  return 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
}

async function getToken(): Promise<string> {
  const res = await app.inject({
    method: 'POST',
    url: '/token',
    headers: {
      authorization: basicAuth(TEST_CLIENT_ID, TEST_CLIENT_SECRET),
      'content-type': 'application/json',
    },
    payload: { grant_type: 'client_credentials' },
  });
  return JSON.parse(res.payload).access_token;
}

describe('Converto API integration', () => {
  beforeAll(async () => {
    const { buildApp } = await import('./app.js');
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /healthz returns ok', async () => {
    const res = await app.inject({ method: 'GET', url: '/healthz' });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.payload)).toEqual({ status: 'ok' });
  });

  it('GET /.well-known/openid-configuration returns correct metadata', async () => {
    const res = await app.inject({ method: 'GET', url: '/.well-known/openid-configuration' });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.token_endpoint).toContain('/token');
    expect(body.token_endpoint_auth_methods_supported).toContain('client_secret_basic');
  });

  it('POST /token returns JWT with valid credentials', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/token',
      headers: {
        authorization: basicAuth(TEST_CLIENT_ID, TEST_CLIENT_SECRET),
        'content-type': 'application/json',
      },
      payload: { grant_type: 'client_credentials' },
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.access_token).toBeDefined();
    expect(body.token_type).toBe('Bearer');
  });

  it('POST /token rejects invalid credentials', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/token',
      headers: {
        authorization: basicAuth('wrong', 'creds'),
        'content-type': 'application/json',
      },
      payload: { grant_type: 'client_credentials' },
    });
    expect(res.statusCode).toBe(401);
  });

  it('POST /v1/pdf rejects unauthenticated requests', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/pdf',
      headers: { 'content-type': 'application/json' },
      payload: { html: '<h1>Test</h1>' },
    });
    expect(res.statusCode).toBe(401);
  });

  it('POST /v1/pdf rejects request with both html and url', async () => {
    const token = await getToken();
    const res = await app.inject({
      method: 'POST',
      url: '/v1/pdf',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      payload: { html: '<h1>Test</h1>', url: 'https://example.com' },
    });
    expect(res.statusCode).toBe(422);
  });

  it('POST /v1/pdf rejects private URL (SSRF protection)', async () => {
    const token = await getToken();
    const res = await app.inject({
      method: 'POST',
      url: '/v1/pdf',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      payload: { url: 'http://169.254.169.254/latest/meta-data' },
    });
    expect(res.statusCode).toBe(422);
    expect(JSON.parse(res.payload).error).toContain('private');
  });

  it('POST /v1/pdf generates PDF from HTML', async () => {
    const token = await getToken();
    const res = await app.inject({
      method: 'POST',
      url: '/v1/pdf',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      payload: { html: '<h1>Integration Test</h1>' },
    });
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('application/pdf');
    // PDF files start with %PDF
    expect(res.rawPayload.subarray(0, 4).toString()).toBe('%PDF');
  }, 30000);

  it('GET /openapi returns API documentation', async () => {
    const res = await app.inject({ method: 'GET', url: '/openapi/' });
    expect(res.statusCode).toBe(200);
  });
});
