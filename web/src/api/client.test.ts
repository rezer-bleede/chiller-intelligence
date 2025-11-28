import { describe, expect, it, vi, afterEach } from 'vitest';

const importClient = async () => {
  const module = await import('./client');
  return module.default;
};

afterEach(() => {
  vi.resetModules();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('API client base URL resolution', () => {
  it('uses VITE_API_BASE_URL when provided', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://api.example.com');

    const client = await importClient();

    expect(client.defaults.baseURL).toBe('http://api.example.com');
  });

  it('falls back to localhost API when env var is missing', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const client = await importClient();

    expect(client.defaults.baseURL).toBe('http://localhost:8000');
    expect(warnSpy).toHaveBeenCalledWith(
      'VITE_API_BASE_URL is not set; defaulting API client to http://localhost:8000. '
        + 'Set VITE_API_BASE_URL to point at your FastAPI server to avoid proxy errors.',
    );
  });
});
