import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BaselineValuesPage from './BaselineValuesPage';
import {
  createBaselineValue,
  deleteBaselineValue,
  listBaselineValues,
  updateBaselineValue,
} from '../../api/baselineValues';

vi.mock('../../api/baselineValues');

const mockedList = listBaselineValues as unknown as vi.Mock;
const mockedCreate = createBaselineValue as unknown as vi.Mock;
const mockedUpdate = updateBaselineValue as unknown as vi.Mock;
const mockedDelete = deleteBaselineValue as unknown as vi.Mock;

describe('BaselineValuesPage', () => {
  beforeEach(() => {
    mockedList.mockResolvedValue([
      {
        id: 1,
        name: 'COP Target',
        metric_key: 'cop',
        value: 3.6,
        unit: 'COP',
        notes: 'Target',
        building_id: null,
        chiller_unit_id: null,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      },
    ]);
    mockedCreate.mockResolvedValue({});
    mockedUpdate.mockResolvedValue({});
    mockedDelete.mockResolvedValue({});
  });

  it('renders baseline table and submits new baseline', async () => {
    render(
      <MemoryRouter>
        <BaselineValuesPage />
      </MemoryRouter>,
    );

    await waitFor(() => expect(screen.getByText('COP Target')).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Power Target' } });
    fireEvent.change(screen.getByLabelText('Metric Key'), { target: { value: 'power_kw' } });
    fireEvent.change(screen.getByLabelText('Value'), { target: { value: '50' } });
    fireEvent.submit(screen.getByRole('button', { name: /create baseline/i }));

    await waitFor(() => expect(mockedCreate).toHaveBeenCalled());
  });
});
