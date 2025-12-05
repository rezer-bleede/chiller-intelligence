import apiClient from './client';

export interface DateRangeFilters {
  start?: string;
  end?: string;
  building_id?: number;
  chiller_unit_id?: number;
  granularity?: 'minute' | 'hour' | 'day' | 'month';
}

export interface PlantOverviewResponse {
  cooling_load_rth: number;
  power_consumption_kw: number;
  avg_cop: number;
  efficiency_gain_percent: number;
  monthly_savings: number;
  co2_saved: number;
}

export interface ConsumptionEfficiencyPoint {
  timestamp: string;
  cooling_rth: number;
  power_kw: number;
  efficiency_kwh_per_tr: number | null;
  avg_cop: number;
}

export interface EquipmentMetric {
  id: number;
  name: string;
  cooling_share: number;
  power_share: number;
  efficiency_kwh_per_tr: number;
  avg_cop: number;
}

export interface ChillerTrendPoint {
  timestamp: string;
  ewt: number;
  lwt: number;
  power_kw: number;
  cooling_rth: number;
  capacity_pct: number;
}

export interface ChillerTrendSeries {
  unit_id: number;
  unit_name: string;
  points: ChillerTrendPoint[];
}

export const fetchPlantOverview = async (params: DateRangeFilters = {}) => {
  const response = await apiClient.get('/analytics/plant-overview', { params });
  return response.data as PlantOverviewResponse;
};

export const fetchConsumptionEfficiency = async (params: DateRangeFilters = {}) => {
  const response = await apiClient.get('/analytics/consumption-efficiency', { params });
  return response.data as { series: ConsumptionEfficiencyPoint[] };
};

export const fetchEquipmentMetrics = async (params: DateRangeFilters = {}) => {
  const response = await apiClient.get('/analytics/equipment-metrics', { params });
  return response.data as { units: EquipmentMetric[] };
};

export const fetchChillerTrends = async (params: DateRangeFilters = {}) => {
  const response = await apiClient.get('/analytics/chiller-trends', { params });
  return response.data as { chillers: ChillerTrendSeries[] };
};
