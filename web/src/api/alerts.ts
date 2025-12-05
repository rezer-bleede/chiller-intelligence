import client from './client';
import { AlertSeverity } from './alertRules';

export interface AlertEvent {
  id: number;
  alert_rule_id?: number | null;
  chiller_unit_id?: number | null;
  severity: AlertSeverity;
  metric_key: string;
  metric_value: number;
  message: string;
  triggered_at: string;
  acknowledged: boolean;
}

export interface AlertSummary {
  total: number;
  by_severity: Record<string, number>;
}

export interface AlertFeedResponse {
  summary: AlertSummary;
  alerts: AlertEvent[];
}

export const fetchAlerts = async (
  severity?: AlertSeverity,
  chillerUnitId?: number,
): Promise<AlertFeedResponse> => {
  const params: Record<string, string | number> = {};
  if (severity) params.severity = severity;
  if (chillerUnitId) params.chiller_unit_id = chillerUnitId;
  const { data } = await client.get<AlertFeedResponse>('/alerts', { params });
  return data;
};
