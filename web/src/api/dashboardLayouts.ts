import { WidgetLayoutConfig } from '../components/dashboard/DashboardLayoutManager';
import { DashboardPageKey } from '../pages/dashboard/widgets';
import client from './client';

export interface DashboardLayoutResponse {
  page_key: DashboardPageKey;
  layout: WidgetLayoutConfig[];
}

export const fetchDashboardLayout = async (pageKey: DashboardPageKey): Promise<DashboardLayoutResponse> => {
  const { data } = await client.get<DashboardLayoutResponse>(`/dashboard-layouts/${pageKey}`);
  return data;
};

export const saveDashboardLayout = async (
  pageKey: DashboardPageKey,
  layout: WidgetLayoutConfig[],
): Promise<DashboardLayoutResponse> => {
  const { data } = await client.put<DashboardLayoutResponse>(`/dashboard-layouts/${pageKey}`, { layout });
  return data;
};
