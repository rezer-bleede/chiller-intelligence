import { act, renderHook, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from './authStore';
import * as authApi from '../api/auth';

vi.mock('../api/auth');

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <AuthProvider>{children}</AuthProvider>
  </BrowserRouter>
);

describe('authStore', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('logs in and stores user details', async () => {
    vi.mocked(authApi.login).mockResolvedValue({
      access_token: 'token-123',
      user: { id: 1, email: 'user@test.com', name: 'User' },
      organization: { id: 2, name: 'Org', type: 'ENERGY_MGMT' },
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('user@test.com', 'password');
    });

    await waitFor(() => {
      expect(result.current.token).toBe('token-123');
      expect(result.current.user?.email).toBe('user@test.com');
      expect(localStorage.getItem('chiller-intelligence-token')).toBe('token-123');
    });
  });

  it('initializes from existing token', async () => {
    localStorage.setItem('chiller-intelligence-token', 'persisted');
    vi.mocked(authApi.getMe).mockResolvedValue({
      access_token: 'persisted',
      user: { id: 5, email: 'persisted@test.com', name: 'Persisted User' },
      organization: { id: 9, name: 'Persisted Org', type: 'FM' },
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));
    expect(result.current.user?.name).toBe('Persisted User');
    expect(result.current.organization?.name).toBe('Persisted Org');
  });
});
