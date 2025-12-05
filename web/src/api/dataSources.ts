import client from './client';

export type DataSourceType = 'MQTT' | 'HTTP' | 'FILE_UPLOAD' | 'EXTERNAL_DB';

export interface DataSource {
  id: number;
  chiller_unit_id: number;
  type: DataSourceType;
  connection_params: Record<string, unknown>;
  chiller_unit?: {
    id: number;
    name: string;
  };
}

export type DataSourcePayload = {
  chiller_unit_id: number;
  type: DataSourceType;
  connection_params: Record<string, unknown>;
};

export const listDataSources = async (): Promise<DataSource[]> => {
  const { data } = await client.get<DataSource[]>('/data_sources');
  return data;
};

export const getDataSource = async (id: string): Promise<DataSource> => {
  const { data } = await client.get<DataSource>(`/data_sources/${id}`);
  return data;
};

export const createDataSource = async (payload: DataSourcePayload): Promise<DataSource> => {
  const { data } = await client.post<DataSource>('/data_sources', payload);
  return data;
};

export const updateDataSource = async (
  id: string,
  payload: Partial<DataSourcePayload>,
): Promise<DataSource> => {
  const { data } = await client.patch<DataSource>(`/data_sources/${id}`, payload);
  return data;
};

export const deleteDataSource = async (id: string): Promise<void> => {
  await client.delete(`/data_sources/${id}`);
};
