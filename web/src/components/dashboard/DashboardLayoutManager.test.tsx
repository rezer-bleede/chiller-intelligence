import { fireEvent, render, screen } from '@testing-library/react';
import DashboardLayoutManager, { WidgetDefinition, WidgetLayoutConfig } from './DashboardLayoutManager';

vi.mock('react-grid-layout', () => {
  const Responsive = ({ children, onDragStop, onResizeStop, layouts }: any) => (
    <div
      data-testid="mock-grid"
      onClick={() => onDragStop?.([], layouts)}
      onDoubleClick={() => onResizeStop?.([], layouts)}
    >
      {typeof children === 'function' ? children('lg') : children}
    </div>
  );

  return { Responsive, WidthProvider: (Comp: any) => Comp };
});

describe('DashboardLayoutManager', () => {
  const widgets: WidgetDefinition[] = [
    { id: 'w1', title: 'Widget 1', render: () => <div>Chart 1</div> },
    { id: 'w2', title: 'Widget 2', render: () => <div>Chart 2</div>, hideHeader: true },
  ];

  const layoutConfig: WidgetLayoutConfig[] = [
    { widgetId: 'w1', x: 0, y: 0, w: 6, h: 6 },
    { widgetId: 'w2', x: 6, y: 0, w: 6, h: 6 },
  ];

  it('only shows drag handles in edit mode', () => {
    const { rerender } = render(
      <DashboardLayoutManager widgets={widgets} layoutConfig={layoutConfig} editMode={false} onLayoutChange={vi.fn()} />,
    );

    expect(screen.queryByText('⠿')).not.toBeInTheDocument();

    rerender(
      <DashboardLayoutManager widgets={widgets} layoutConfig={layoutConfig} editMode onLayoutChange={vi.fn()} />,
    );

    const handles = screen.getAllByText('⠿');
    expect(handles).toHaveLength(2);
  });

  it('commits layout updates on drag and resize stop', () => {
    const onLayoutChange = vi.fn();

    render(
      <DashboardLayoutManager widgets={widgets} layoutConfig={layoutConfig} editMode onLayoutChange={onLayoutChange} />,
    );

    const grid = screen.getByTestId('mock-grid');

    fireEvent.click(grid);
    fireEvent.doubleClick(grid);

    expect(onLayoutChange).toHaveBeenCalledTimes(2);
    expect(onLayoutChange.mock.calls[0][0]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ widgetId: 'w1' }),
        expect.objectContaining({ widgetId: 'w2' }),
      ]),
    );
  });
});
