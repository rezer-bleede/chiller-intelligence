import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DashboardPage from './DashboardPage';
import { listAlertRules } from '../../api/alertRules';
import { listBuildings } from '../../api/buildings';
import { listChillerUnits } from '../../api/chillerUnits';
import { fetchDashboardLayout, saveDashboardLayout } from '../../api/dashboardLayouts';
import {
  fetchChillerTrends,
  fetchConsumptionEfficiency,
  fetchEquipmentMetrics,
  fetchPlantOverview,
} from '../../api/analytics';
import { defaultLayouts } from './widgets';

vi.mock('../../api/alertRules');
vi.mock('../../api/buildings');
vi.mock('../../api/chillerUnits');
vi.mock('../../api/dashboardLayouts');
vi.mock('../../api/analytics');
vi.mock('../../components/dashboard/DashboardLayoutManager', () => ({
  __esModule: true,
  default: ({ widgets, onLayoutChange, editMode }: any) => (
    <div
      data-testid="layout"
      data-editing={editMode}
      onClick={() =>
        onLayoutChange?.(
          widgets.map((widget: { id: string }, index: number) => ({
            widgetId: widget.id,
            x: index,
            y: 0,
            w: 3,
            h: 3,
          })),
        )
      }
    >
      {widgets.map((widget: { id: string; title: string }) => (
        <div key={widget.id}>{widget.title}</div>
      ))}
    </div>
  ),
}));

const mockedListBuildings = listBuildings as unknown as vi.Mock;
const mockedListChillerUnits = listChillerUnits as unknown as vi.Mock;
const mockedListAlertRules = listAlertRules as unknown as vi.Mock;
const mockedFetchLayout = fetchDashboardLayout as unknown as vi.Mock;
const mockedSaveLayout = saveDashboardLayout as unknown as vi.Mock;
const mockedPlantOverview = fetchPlantOverview as unknown as vi.Mock;
const mockedConsumption = fetchConsumptionEfficiency as unknown as vi.Mock;
const mockedEquipment = fetchEquipmentMetrics as unknown as vi.Mock;
const mockedChillerTrends = fetchChillerTrends as unknown as vi.Mock;

describe('DashboardPage', () => {
  beforeEach(() => {
    mockedListBuildings.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    mockedListChillerUnits.mockResolvedValue([{ id: 1 }, { id: 2 }, { id: 3 }]);
    mockedListAlertRules.mockResolvedValue([{ id: 1 }]);
    mockedFetchLayout.mockImplementation((pageKey: string) =>
      Promise.resolve({ page_key: pageKey, layout: defaultLayouts[pageKey as keyof typeof defaultLayouts] ?? [] }),
    );
    mockedSaveLayout.mockResolvedValue({ page_key: 'dashboard_overview', layout: defaultLayouts.dashboard_overview });
    mockedPlantOverview.mockResolvedValue({
      cooling_load_rth: 100,
      power_consumption_kw: 200,
      avg_cop: 3.5,
      efficiency_gain_percent: 5,
      monthly_savings: 1200,
      co2_saved: 42,
    });
    mockedConsumption.mockResolvedValue({
      series: [
        {
          timestamp: '2024-01-01T00:00:00Z',
          cooling_rth: 50,
          power_kw: 20,
          efficiency_kwh_per_tr: 0.4,
          avg_cop: 3.1,
        },
      ],
    });
    mockedEquipment.mockResolvedValue({
      units: [
        {
          id: 1,
          name: 'Chiller A',
          cooling_share: 60,
          power_share: 40,
          efficiency_kwh_per_tr: 0.31,
          avg_cop: 3.2,
        },
      ],
    });
    mockedChillerTrends.mockResolvedValue({
      chillers: [
        {
          unit_id: 1,
          unit_name: 'Chiller A',
          points: [
            {
              timestamp: '2024-01-01T00:00:00Z',
              ewt: 12.1,
              lwt: 7.5,
              power_kw: 20,
              cooling_rth: 50,
              capacity_pct: 75,
            },
          ],
        },
      ],
    });
  });

  it('renders overview widgets and allows switching sections', async () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mockedFetchLayout).toHaveBeenCalledWith('dashboard_overview');
    });

    expect(screen.getByText(/Plant cooling load/i)).toBeInTheDocument();
    expect(mockedPlantOverview).toHaveBeenCalled();
    expect(mockedConsumption).toHaveBeenCalled();
    expect(mockedEquipment).toHaveBeenCalled();
    expect(mockedChillerTrends).toHaveBeenCalled();

    const equipmentTab = screen.getByText(/Equipment & Health/i);
    fireEvent.click(equipmentTab);

    await waitFor(() => {
      expect(mockedFetchLayout).toHaveBeenCalledWith('dashboard_equipment');
    });

    expect(screen.getByText(/Equipment efficiency \(avg COP\)/i)).toBeInTheDocument();
  });

  it('enters edit mode and saves updated layouts', async () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(mockedFetchLayout).toHaveBeenCalledWith('dashboard_overview');
    });

    const editButton = screen.getByText(/Edit layout/i);
    fireEvent.click(editButton);

    const layout = await screen.findByTestId('layout');
    expect(layout).toHaveAttribute('data-editing', 'true');

    fireEvent.click(layout);

    const saveButton = await screen.findByText(/Save layout/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockedSaveLayout).toHaveBeenCalledWith(
        'dashboard_overview',
        expect.arrayContaining([expect.objectContaining({ widgetId: 'kpi-cooling-load' })]),
      );
    });
  });
});
