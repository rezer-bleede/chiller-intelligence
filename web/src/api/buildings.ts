import client from './client';

export interface Building {
  id: number;
  name: string;
  location: string;
  latitude?: number;
  longitude?: number;
}

export type BuildingPayload = Omit<Building, 'id'>;

export const listBuildings = async (): Promise<Building[]> => {
  const { data } = await client.get<Building[]>('/buildings');
  return data;
};

export const getBuilding = async (id: string): Promise<Building> => {
  const { data } = await client.get<Building>(`/buildings/${id}`);
  return data;
};

export const createBuilding = async (payload: BuildingPayload): Promise<Building> => {
  const { data } = await client.post<Building>('/buildings', payload);
  return data;
};

export const updateBuilding = async (id: string, payload: Partial<BuildingPayload>): Promise<Building> => {
  const { data } = await client.patch<Building>(`/buildings/${id}`, payload);
  return data;
};

export const deleteBuilding = async (id: string): Promise<void> => {
  await client.delete(`/buildings/${id}`);
};
