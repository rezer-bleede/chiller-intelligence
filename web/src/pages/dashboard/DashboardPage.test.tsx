import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DashboardPage from './DashboardPage';
import { listAlertRules } from '../../api/alertRules';
import { listBuildings } from '../../api/buildings';
import { listChillerUnits } from '../../api/chillerUnits';
import { fetchDashboardLayout, saveDashboardLayout } from '../../api/dashboardLayouts';
import { defaultLayouts } from './widgets';

vi.mock('../../api/alertRules');
vi.mock('../../api/buildings');
vi.mock('../../api/chillerUnits');
vi.mock('../../api/dashboardLayouts');
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

describe('DashboardPage', () => {
  beforeEach(() => {
    mockedListBuildings.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    mockedListChillerUnits.mockResolvedValue([{ id: 1 }, { id: 2 }, { id: 3 }]);
    mockedListAlertRules.mockResolvedValue([{ id: 1 }]);
    mockedFetchLayout.mockImplementation((pageKey: string) =>
      Promise.resolve({ page_key: pageKey, layout: defaultLayouts[pageKey as keyof typeof defaultLayouts] ?? [] }),
    );
    mockedSaveLayout.mockResolvedValue({ page_key: 'dashboard_overview', layout: defaultLayouts.dashboard_overview });
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

    const equipmentTab = screen.getByText(/Equipment & Health/i);
    fireEvent.click(equipmentTab);

    await waitFor(() => {
      expect(mockedFetchLayout).toHaveBeenCalledWith('dashboard_equipment');
    });

    expect(screen.getByText(/Equipment efficiency \(pumps vs chillers\)/i)).toBeInTheDocument();
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

    const layout = screen.getByTestId('layout');
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
