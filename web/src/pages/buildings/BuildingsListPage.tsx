import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building, deleteBuilding, listBuildings } from '../../api/buildings';
import ErrorMessage from '../../components/common/ErrorMessage';
import Loading from '../../components/common/Loading';

const PAGE_SIZE = 6;

const BuildingsListPage = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const loadBuildings = async () => {
    setLoading(true);
    setError(undefined);
    try {
      const data = await listBuildings();
      setBuildings(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Unable to load buildings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBuildings();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this building?')) return;
    try {
      await deleteBuilding(String(id));
      loadBuildings();
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Unable to delete building.');
    }
  };

  const filtered = useMemo(
    () =>
      buildings.filter(
        (building) =>
          building.name.toLowerCase().includes(search.toLowerCase()) ||
          building.location?.toLowerCase().includes(search.toLowerCase()),
      ),
    [buildings, search],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search]);

  if (loading) return <Loading />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Portfolio</p>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Buildings</h1>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter buildings"
            className="w-64 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
          <button
            className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-300"
            onClick={() => navigate('/buildings/new')}
          >
            Add Building
          </button>
        </div>
      </div>

      <ErrorMessage message={error} />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-300">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Location</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {pageItems.map((building) => (
                <tr key={building.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                  <td className="px-6 py-3 font-medium text-slate-900 dark:text-white">{building.name}</td>
                  <td className="px-6 py-3 text-slate-600 dark:text-slate-300">{building.location}</td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex justify-end gap-3 text-sm font-semibold">
                      <Link className="text-brand-600 hover:text-brand-500" to={`/buildings/${building.id}/edit`}>
                        Edit
                      </Link>
                      <button
                        className="text-rose-500 hover:text-rose-400"
                        onClick={() => handleDelete(building.id)}
                        type="button"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3 text-sm text-slate-600 dark:border-slate-800 dark:text-slate-300">
          <span>
            Showing {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-3 py-1 font-semibold text-slate-700 transition enabled:hover:border-brand-500 enabled:hover:text-brand-600 disabled:opacity-50 dark:border-slate-700 dark:text-slate-100"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Prev
            </button>
            <span className="rounded-lg bg-slate-100 px-3 py-1 font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-100">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              className="rounded-lg border border-slate-200 px-3 py-1 font-semibold text-slate-700 transition enabled:hover:border-brand-500 enabled:hover:text-brand-600 disabled:opacity-50 dark:border-slate-700 dark:text-slate-100"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuildingsListPage;
