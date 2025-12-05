import client from './client';

export type Operator = '>' | '<' | '>=' | '<=';
export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export interface AlertRule {
  id: number;
  chiller_unit_id: number;
  name: string;
  metric_key: string;
  condition_operator: Operator;
  threshold_value: number;
  severity: AlertSeverity;
  is_active: boolean;
  recipient_emails: string[];
  chiller_unit?: {
    id: number;
    name: string;
  };
}

export type AlertRulePayload = Omit<AlertRule, 'id' | 'chiller_unit'>;

export const listAlertRules = async (): Promise<AlertRule[]> => {
  const { data } = await client.get<AlertRule[]>('/alert_rules');
  return data;
};

export const getAlertRule = async (id: string): Promise<AlertRule> => {
  const { data } = await client.get<AlertRule>(`/alert_rules/${id}`);
  return data;
};

export const createAlertRule = async (payload: AlertRulePayload): Promise<AlertRule> => {
  const { data } = await client.post<AlertRule>('/alert_rules', payload);
  return data;
};

export const updateAlertRule = async (
  id: string,
  payload: Partial<AlertRulePayload>
): Promise<AlertRule> => {
  const { data } = await client.patch<AlertRule>(`/alert_rules/${id}`, payload);
  return data;
};

export const deleteAlertRule = async (id: string): Promise<void> => {
  await client.delete(`/alert_rules/${id}`);
};
