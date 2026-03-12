/* eslint no-process-env: 0 */

import { test as setup, expect } from '@playwright/test';

setup('web app is reachable', async ({ request }) => {
  const response = await request.get('/');
  expect(response.ok(), `E2E_WEB_URL (${process.env.E2E_WEB_URL}) is not reachable`).toBeTruthy();
});

setup('api is reachable', async () => {
  const apiUrl = process.env.E2E_API_URL;
  if (!apiUrl) throw new Error('E2E_API_URL must be set');

  const response = await fetch(`${apiUrl}/health`);
  expect(response.ok, `E2E_API_URL (${apiUrl}/health) is not reachable`).toBeTruthy();
});
