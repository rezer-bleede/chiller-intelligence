import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import DashboardPage from './DashboardPage';
import { listAlertRules } from '../../api/alertRules';
import { listBuildings } from '../../api/buildings';
import { listChillerUnits } from '../../api/chillerUnits';

vi.mock('../../api/alertRules');
vi.mock('../../api/buildings');
vi.mock('../../api/chillerUnits');

const mockedListBuildings = listBuildings as unknown as vi.Mock;
const mockedListChillerUnits = listChillerUnits as unknown as vi.Mock;
const mockedListAlertRules = listAlertRules as unknown as vi.Mock;

describe('DashboardPage', () => {
  beforeEach(() => {
    mockedListBuildings.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    mockedListChillerUnits.mockResolvedValue([{ id: 1 }, { id: 2 }, { id: 3 }]);
    mockedListAlertRules.mockResolvedValue([{ id: 1 }]);
  });

  it('renders summary cards and charts', async () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Assets monitored/i)).toBeInTheDocument();
      expect(screen.getByText(/Chiller health/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Cooling consumption/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Power/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Per chiller analytics/i)).toBeInTheDocument();
  });
});
