import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { AuthContext } from '../../store/authStore';

describe('ProtectedRoute', () => {
  it('redirects unauthenticated users to login', () => {
    render(
      <AuthContext.Provider
        value={{
          token: undefined,
          user: undefined,
          organization: undefined,
          initializing: false,
          isAuthenticated: false,
          login: async () => {},
          register: async () => {},
          logout: () => {},
          initializeFromStorage: async () => {},
        }}
      >
        <MemoryRouter initialEntries={[{ pathname: '/dashboard' }]}
          initialIndex={0}
        >
          <Routes>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <div>Secret</div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });
});
