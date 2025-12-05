import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AlertsPage from './AlertsPage';
import { fetchAlerts } from '../../api/alerts';
import { listChillerUnits } from '../../api/chillerUnits';

vi.mock('../../api/alerts');
vi.mock('../../api/chillerUnits');

const mockedFetchAlerts = fetchAlerts as unknown as vi.Mock;
const mockedListChillers = listChillerUnits as unknown as vi.Mock;

describe('AlertsPage', () => {
  beforeEach(() => {
    mockedFetchAlerts.mockResolvedValue({
      summary: { total: 2, by_severity: { CRITICAL: 1, INFO: 1 } },
      alerts: [
        {
          id: 1,
          alert_rule_id: 1,
          chiller_unit_id: 1,
          severity: 'CRITICAL',
          metric_key: 'power_kw',
          metric_value: 50,
          message: 'Power high',
          triggered_at: '2024-01-01T00:00:00Z',
          acknowledged: false,
        },
      ],
    });
    mockedListChillers.mockResolvedValue([]);
  });

  it('renders alerts and summary cards', async () => {
    render(
      <MemoryRouter>
        <AlertsPage />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText('Total alerts')).toBeInTheDocument());
    expect(screen.getByText('Critical')).toBeInTheDocument();
    expect(screen.getByText('Power high')).toBeInTheDocument();
  });
});
