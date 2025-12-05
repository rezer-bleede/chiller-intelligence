import apiClient from './client';

export interface DateRangeFilters {
  start?: string;
  end?: string;
  building_id?: number;
  chiller_unit_id?: number;
  granularity?: 'minute' | 'hour' | 'day' | 'month';
}

export const fetchPlantOverview = async (params: DateRangeFilters = {}) => {
  const response = await apiClient.get('/analytics/plant-overview', { params });
  return response.data as {
    cooling_load_rth: number;
    power_consumption_kw: number;
    avg_cop: number;
    efficiency_gain_percent: number;
    monthly_savings: number;
    co2_saved: number;
  };
};

export const fetchConsumptionEfficiency = async (params: DateRangeFilters = {}) => {
  const response = await apiClient.get('/analytics/consumption-efficiency', { params });
  return response.data as { series: Array<Record<string, any>> };
};

export const fetchEquipmentMetrics = async (params: DateRangeFilters = {}) => {
  const response = await apiClient.get('/analytics/equipment-metrics', { params });
  return response.data as { units: Array<Record<string, any>> };
};

export const fetchChillerTrends = async (params: DateRangeFilters = {}) => {
  const response = await apiClient.get('/analytics/chiller-trends', { params });
  return response.data as { chillers: Array<Record<string, any>> };
};
