import { useMemo, useState } from 'react';
import {
  ColumnDef,
  PaginationState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

interface HistoryRecord {
  id: number;
  date: string;
  equipment: string;
  load: number;
  efficiency: number;
  alarms: number;
  notes: string;
}

const sampleHistory: HistoryRecord[] = [
  { id: 1, date: '2024-11-01', equipment: 'Chiller U1', load: 72, efficiency: 0.63, alarms: 1, notes: 'Reset after optimization' },
  { id: 2, date: '2024-11-02', equipment: 'Pump P1', load: 54, efficiency: 0.44, alarms: 0, notes: 'Stable' },
  { id: 3, date: '2024-11-03', equipment: 'Chiller U2', load: 68, efficiency: 0.66, alarms: 2, notes: 'High ambient temp' },
  { id: 4, date: '2024-11-04', equipment: 'Cooling Tower', load: 58, efficiency: 0.48, alarms: 0, notes: 'Water quality checked' },
  { id: 5, date: '2024-11-05', equipment: 'Chiller U1', load: 74, efficiency: 0.62, alarms: 1, notes: 'Circuit A tuned' },
  { id: 6, date: '2024-11-06', equipment: 'Chiller U3', load: 61, efficiency: 0.6, alarms: 0, notes: 'Normal operations' },
  { id: 7, date: '2024-11-07', equipment: 'Pump P2', load: 49, efficiency: 0.46, alarms: 0, notes: 'Balanced flow' },
  { id: 8, date: '2024-11-08', equipment: 'Chiller U2', load: 70, efficiency: 0.64, alarms: 1, notes: 'Setpoint tightened' },
  { id: 9, date: '2024-11-09', equipment: 'Cooling Tower', load: 57, efficiency: 0.47, alarms: 0, notes: 'Fan staged down' },
  { id: 10, date: '2024-11-10', equipment: 'Chiller U3', load: 62, efficiency: 0.59, alarms: 1, notes: 'Filter cleaned' },
];

const HistoryPage = () => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 5 });

  const columns = useMemo<ColumnDef<HistoryRecord>[]>(
    () => [
      { accessorKey: 'date', header: 'Date' },
      { accessorKey: 'equipment', header: 'Equipment' },
      { accessorKey: 'load', header: 'Load (%)' },
      { accessorKey: 'efficiency', header: 'Efficiency (kWh/TR)' },
      { accessorKey: 'alarms', header: 'Alarms' },
      { accessorKey: 'notes', header: 'Notes' },
    ],
    [],
  );

  const table = useReactTable({
    data: sampleHistory,
    columns,
    state: { globalFilter, pagination },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'includesString',
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Historical data</p>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Performance log</h1>
        </div>
        <input
          type="search"
          value={globalFilter ?? ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Filter records"
          className="w-72 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-300">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-6 py-3">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-3 text-slate-700 dark:text-slate-200">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-3 py-1 font-semibold text-slate-700 transition enabled:hover:border-brand-500 enabled:hover:text-brand-600 disabled:opacity-50 dark:border-slate-700 dark:text-slate-100"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Prev
            </button>
            <span className="rounded-lg bg-slate-100 px-3 py-1 font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-100">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-3 py-1 font-semibold text-slate-700 transition enabled:hover:border-brand-500 enabled:hover:text-brand-600 disabled:opacity-50 dark:border-slate-700 dark:text-slate-100"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span>Rows per page</span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              {[5, 10].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;
