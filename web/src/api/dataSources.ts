import client from './client';

export type DataSourceType = 'MQTT' | 'HTTP' | 'FILE_UPLOAD' | 'EXTERNAL_DB';

export type HistoricalStorageConfig = {
  backend: 'POSTGRES';
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
  preload_years?: number;
};

export type DataSourceConnectionParams = {
  live: Record<string, unknown>;
  historical_storage: HistoricalStorageConfig;
};

export interface DataSource {
  id: number;
  chiller_unit_id: number;
  type: DataSourceType;
  connection_params: DataSourceConnectionParams;
  chiller_unit?: {
    id: number;
    name: string;
  };
}

export type DataSourcePayload = {
  chiller_unit_id: number;
  type: DataSourceType;
  connection_params: DataSourceConnectionParams;
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
