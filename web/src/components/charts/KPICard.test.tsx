import { render, screen } from '@testing-library/react';
import KPICard from './KPICard';

const sparkline = [
  { name: 't-3', value: 10 },
  { name: 't-2', value: 12 },
  { name: 't-1', value: 11 },
];

describe('KPICard', () => {
  it('renders value and unit', () => {
    render(<KPICard label="Test KPI" value={42} unit="%" change="+2%" sparklineData={sparkline} />);

    expect(screen.getByText('Test KPI')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('%')).toBeInTheDocument();
    expect(screen.getByText('+2%')).toBeInTheDocument();
  });
});
