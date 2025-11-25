import client from './client';

export interface ChillerUnit {
  id: number;
  building_id: number;
  name: string;
  manufacturer: string;
  model: string;
  capacity_tons: number;
  building?: {
    id: number;
    name: string;
  };
}

export type ChillerUnitPayload = Omit<ChillerUnit, 'id' | 'building'>;

export const listChillerUnits = async (buildingId?: string): Promise<ChillerUnit[]> => {
  const params = buildingId ? { building_id: buildingId } : undefined;
  const { data } = await client.get<ChillerUnit[]>('/chiller_units', { params });
  return data;
};

export const getChillerUnit = async (id: string): Promise<ChillerUnit> => {
  const { data } = await client.get<ChillerUnit>(`/chiller_units/${id}`);
  return data;
};

export const createChillerUnit = async (payload: ChillerUnitPayload): Promise<ChillerUnit> => {
  const { data } = await client.post<ChillerUnit>('/chiller_units', payload);
  return data;
};

export const updateChillerUnit = async (
  id: string,
  payload: Partial<ChillerUnitPayload>
): Promise<ChillerUnit> => {
  const { data } = await client.patch<ChillerUnit>(`/chiller_units/${id}`, payload);
  return data;
};

export const deleteChillerUnit = async (id: string): Promise<void> => {
  await client.delete(`/chiller_units/${id}`);
};
