import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import DataSourceFormPage from './DataSourceFormPage';
import { listChillerUnits } from '../../api/chillerUnits';
import { createDataSource, getDataSource, updateDataSource } from '../../api/dataSources';

vi.mock('../../api/chillerUnits');
vi.mock('../../api/dataSources');

const mockedListChillers = listChillerUnits as unknown as vi.Mock;
const mockedCreate = createDataSource as unknown as vi.Mock;
const mockedGet = getDataSource as unknown as vi.Mock;
const mockedUpdate = updateDataSource as unknown as vi.Mock;

const renderForm = () =>
  render(
    <MemoryRouter initialEntries={['/data-sources/new']}>
      <Routes>
        <Route path="/data-sources/new" element={<DataSourceFormPage />} />
        <Route path="/data-sources" element={<div>List Page</div>} />
      </Routes>
    </MemoryRouter>,
  );

describe('DataSourceFormPage', () => {
  beforeEach(() => {
    mockedListChillers.mockResolvedValue([{ id: 1, name: 'Unit A', building_id: 1 }]);
    mockedCreate.mockResolvedValue({ id: 99 });
    mockedGet.mockResolvedValue(null);
    mockedUpdate.mockResolvedValue({});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders live/historical config and submits combined payload', async () => {
    renderForm();

    await waitFor(() => expect(screen.getByText('Live data connection')).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText('Live connection params (JSON)'), {
      target: { value: '{"topic":"live/chiller"}' },
    });

    fireEvent.change(screen.getByLabelText('Host'), { target: { value: 'historical.local' } });
    fireEvent.change(screen.getByLabelText('Database'), { target: { value: 'archive' } });
    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'demo_user' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'super-secret' } });

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => expect(mockedCreate).toHaveBeenCalled());
    expect(mockedCreate).toHaveBeenCalledWith({
      chiller_unit_id: 1,
      type: 'MQTT',
      connection_params: {
        live: { topic: 'live/chiller' },
        historical_storage: {
          backend: 'POSTGRES',
          host: 'historical.local',
          port: 5432,
          database: 'archive',
          username: 'demo_user',
          password: 'super-secret',
          ssl: false,
          preload_years: 2,
        },
      },
    });

    await waitFor(() => expect(screen.getByText('List Page')).toBeInTheDocument());
  });
});
