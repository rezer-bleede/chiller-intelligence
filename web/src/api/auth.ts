import client from './client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  organization_name: string;
  organization_type: string;
  admin_name: string;
  admin_email: string;
  admin_password: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    email: string;
    name: string;
  };
  organization: {
    id: number;
    name: string;
    type: string;
  };
}

export const login = async (payload: LoginRequest): Promise<AuthResponse> => {
  const { data } = await client.post<AuthResponse>('/auth/login', payload);
  return data;
};

export const register = async (payload: RegisterRequest): Promise<AuthResponse> => {
  const { data } = await client.post<AuthResponse>('/auth/register', payload);
  return data;
};

export const getMe = async (): Promise<AuthResponse> => {
  const { data } = await client.get<AuthResponse>('/auth/me');
  return data;
};
