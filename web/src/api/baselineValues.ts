import client from './client';

export interface BaselineValue {
  id: number;
  name: string;
  metric_key: string;
  value: number;
  unit?: string | null;
  notes?: string | null;
  building_id?: number | null;
  chiller_unit_id?: number | null;
  created_at: string;
  updated_at: string;
}

export type BaselineValuePayload = Omit<BaselineValue, 'id' | 'created_at' | 'updated_at'>;

export const listBaselineValues = async (): Promise<BaselineValue[]> => {
  const { data } = await client.get<BaselineValue[]>('/baseline-values');
  return data;
};

export const createBaselineValue = async (payload: BaselineValuePayload): Promise<BaselineValue> => {
  const { data } = await client.post<BaselineValue>('/baseline-values', payload);
  return data;
};

export const updateBaselineValue = async (
  id: number,
  payload: Partial<BaselineValuePayload>,
): Promise<BaselineValue> => {
  const { data } = await client.patch<BaselineValue>(`/baseline-values/${id}`, payload);
  return data;
};

export const deleteBaselineValue = async (id: number): Promise<void> => {
  await client.delete(`/baseline-values/${id}`);
};

export const importBaselineValues = async (file: File): Promise<{ created: number }> => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await client.post<{ created: number }>('/baseline-values/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};
