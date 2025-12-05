import { useEffect, useMemo, useState } from 'react';
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
import dayjs from 'dayjs';
import { fetchConsumptionEfficiency } from '../../api/analytics';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';

interface HistoryRecord {
  id: number;
  date: string;
  cooling_rth: number;
  power_kw: number;
  efficiency: number | null;
}

const HistoryPage = () => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 5 });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(undefined);
      try {
        const start = dayjs().subtract(30, 'day').toISOString();
        const data = await fetchConsumptionEfficiency({ start, granularity: 'day' });
        const mapped: HistoryRecord[] = data.series.map((item, index) => ({
          id: index + 1,
          date: dayjs(item.timestamp).format('YYYY-MM-DD HH:mm'),
          cooling_rth: item.cooling_rth,
          power_kw: item.power_kw,
          efficiency: item.efficiency_kwh_per_tr,
        }));
        setRecords(mapped);
      } catch (err: any) {
        setError(err?.response?.data?.detail ?? 'Unable to load historical data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const columns = useMemo<ColumnDef<HistoryRecord>[]>(
    () => [
      { accessorKey: 'date', header: 'Date' },
      { accessorKey: 'cooling_rth', header: 'Cooling (RTh)' },
      { accessorKey: 'power_kw', header: 'Power (kW)' },
      {
        accessorKey: 'efficiency',
        header: 'Efficiency (kWh/TR)',
        cell: ({ getValue }) => {
          const value = getValue<number | null>();
          return value ? value.toFixed(3) : '—';
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    data: records,
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
        {loading ? (
          <div className="p-6">
            <Loading />
          </div>
        ) : null}
        <ErrorMessage message={error} />
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
