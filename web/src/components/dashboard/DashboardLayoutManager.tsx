import { useCallback, useEffect, useMemo, useState } from 'react';
import { Layout, Layouts, Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

export interface WidgetDefinition {
  id: string;
  title: string;
  render: () => JSX.Element;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  frameless?: boolean;
  hideHeader?: boolean;
}

export interface WidgetLayoutConfig {
  widgetId: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface DashboardLayoutManagerProps {
  widgets: WidgetDefinition[];
  layoutConfig: WidgetLayoutConfig[];
  editMode: boolean;
  onLayoutChange: (layout: WidgetLayoutConfig[]) => void;
}

const ResponsiveGridLayout = WidthProvider(Responsive);

const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
const cols = { lg: 12, md: 12, sm: 8, xs: 4, xxs: 2 };

const mapToLayout = (
  layoutConfig: WidgetLayoutConfig[],
  widgets: WidgetDefinition[],
): Layouts => {
  const widgetLookup = widgets.reduce<Record<string, WidgetDefinition>>((acc, widget) => {
    acc[widget.id] = widget;
    return acc;
  }, {});

  const baseLayout: Layout[] = layoutConfig.map((item) => ({
    i: item.widgetId,
    x: item.x,
    y: item.y,
    w: item.w,
    h: Math.max(item.h, widgetLookup[item.widgetId]?.minH ?? item.h),
    minW: widgetLookup[item.widgetId]?.minW,
    minH: widgetLookup[item.widgetId]?.minH,
    maxW: widgetLookup[item.widgetId]?.maxW,
    maxH: widgetLookup[item.widgetId]?.maxH,
  }));

  return {
    lg: baseLayout,
    md: baseLayout,
    sm: baseLayout,
    xs: baseLayout,
    xxs: baseLayout,
  };
};

const mapToConfig = (layout: Layout[]): WidgetLayoutConfig[] =>
  layout.map((item) => ({ widgetId: item.i, x: item.x, y: item.y, w: item.w, h: item.h }));

const DashboardLayoutManager = ({ widgets, layoutConfig, editMode, onLayoutChange }: DashboardLayoutManagerProps) => {
  const [layouts, setLayouts] = useState<Layouts>(() => mapToLayout(layoutConfig, widgets));

  useEffect(() => {
    setLayouts(mapToLayout(layoutConfig, widgets));
  }, [layoutConfig, widgets]);

  const handleLayoutCommit = useCallback(
    (_: Layout[], allLayouts: Layouts) => {
      setLayouts(allLayouts);
      const nextLayout = mapToConfig(allLayouts.lg ?? []);
      onLayoutChange(nextLayout);
    },
    [onLayoutChange],
  );

  const widgetOrder = useMemo(() => widgets.map((widget) => widget.id), [widgets]);

  return (
    <div
      className={
        editMode
          ? 'rounded-2xl border border-dashed border-brand-200 bg-brand-50/40 dark:border-brand-500/50 dark:bg-slate-900/40'
          : ''
      }
    >
      <ResponsiveGridLayout
        layouts={layouts}
        breakpoints={breakpoints}
        cols={cols}
        rowHeight={32}
        margin={[16, 16]}
        isDraggable={editMode}
        isResizable={editMode}
        compactType="vertical"
        preventCollision={!editMode}
        draggableHandle=".widget-drag-handle"
        onDragStop={handleLayoutCommit}
        onResizeStop={handleLayoutCommit}
        onLayoutChange={editMode ? undefined : handleLayoutCommit}
      >
        {widgetOrder.map((widgetId) => {
          const widget = widgets.find((item) => item.id === widgetId);
          if (!widget) return null;
          const containerClass = widget.frameless
            ? 'group relative flex h-full flex-col overflow-hidden rounded-xl p-1'
            : 'group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-card transition dark:border-slate-800 dark:bg-slate-900';

          const shouldShowHeader = !widget.hideHeader;
          const showHandle = editMode;

          return (
            <div key={widget.id} className="h-full">
              <div className={containerClass}>
                {shouldShowHeader && (
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{widget.title}</p>
                    {showHandle && (
                      <span className="widget-drag-handle cursor-move rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600 shadow-sm transition group-hover:bg-brand-100 group-hover:text-brand-700 dark:bg-slate-800 dark:text-slate-200">
                        ⠿
                      </span>
                    )}
                  </div>
                )}
                {!shouldShowHeader && showHandle && (
                  <span className="widget-drag-handle absolute right-3 top-3 z-10 cursor-move rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600 shadow-sm transition group-hover:bg-brand-100 group-hover:text-brand-700 dark:bg-slate-800 dark:text-slate-200">
                    ⠿
                  </span>
                )}
                <div className={`flex h-full flex-1 flex-col ${shouldShowHeader ? '' : 'pt-2'}`}>
                  <div className="min-h-[220px] flex-1">{widget.render()}</div>
                </div>
              </div>
            </div>
          );
        })}
      </ResponsiveGridLayout>
    </div>
  );
};

export default DashboardLayoutManager;
