import client from './client';

export interface Organization {
  id: number;
  name: string;
  type: string;
}

export const getOrganization = async (): Promise<Organization> => {
  const { data } = await client.get<Organization>('/organizations/me');
  return data;
};

export const updateOrganization = async (payload: Partial<Organization>): Promise<Organization> => {
  const { data } = await client.patch<Organization>('/organizations/me', payload);
  return data;
};
