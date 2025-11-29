import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building, listBuildings } from '../../api/buildings';
import { ChillerUnit, deleteChillerUnit, listChillerUnits } from '../../api/chillerUnits';
import ErrorMessage from '../../components/common/ErrorMessage';
import Loading from '../../components/common/Loading';
import { ChillerCircuitChart, DashboardCard, KPICard } from '../../components/charts';

const ChillerUnitsListPage = () => {
  const [chillers, setChillers] = useState<ChillerUnit[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<string>('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const navigate = useNavigate();

  const loadChillers = async (buildingId?: string) => {
    setLoading(true);
    setError(undefined);
    try {
      const [chillerData, buildingData] = await Promise.all([
        listChillerUnits(buildingId),
        listBuildings(),
      ]);
      setChillers(chillerData);
      setBuildings(buildingData);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Unable to load chiller units.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChillers();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this chiller unit?')) return;
    try {
      await deleteChillerUnit(String(id));
      loadChillers(selectedBuilding || undefined);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Unable to delete chiller unit.');
    }
  };

  const filtered = useMemo(
    () =>
      chillers.filter(
        (unit) =>
          unit.name.toLowerCase().includes(search.toLowerCase()) ||
          unit.manufacturer?.toLowerCase().includes(search.toLowerCase()),
      ),
    [chillers, search],
  );

  const sampleCircuitData = [
    { time: '10:00', capacity: 62, dischargeA: 285, suctionA: 72, dischargeB: 276, suctionB: 70 },
    { time: '10:10', capacity: 64, dischargeA: 298, suctionA: 70, dischargeB: 286, suctionB: 69 },
    { time: '10:20', capacity: 66, dischargeA: 310, suctionA: 68, dischargeB: 295, suctionB: 67 },
    { time: '10:30', capacity: 69, dischargeA: 318, suctionA: 66, dischargeB: 302, suctionB: 65 },
    { time: '10:40', capacity: 71, dischargeA: 325, suctionA: 64, dischargeB: 308, suctionB: 64 },
  ];

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Equipment</p>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Chiller Units</h1>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="search"
            placeholder="Search chillers"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-60 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
          <select
            value={selectedBuilding}
            onChange={(e) => {
              const next = e.target.value;
              setSelectedBuilding(next);
              loadChillers(next || undefined);
            }}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="">All buildings</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <button
            className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-300"
            onClick={() => navigate('/chiller-units/new')}
          >
            Add Chiller Unit
          </button>
        </div>
      </div>

      <ErrorMessage message={error} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <KPICard label="Total units" value={filtered.length} unit="active" change="Live" icon="❄️" />
        <KPICard label="Buildings covered" value={buildings.length} unit="sites" change="Portfolio" icon="🏢" color="#0ea5e9" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-300">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Building</th>
                <th className="px-6 py-3">Manufacturer</th>
                <th className="px-6 py-3">Model</th>
                <th className="px-6 py-3">Capacity (tons)</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((unit) => (
                <tr key={unit.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                  <td className="px-6 py-3 font-medium text-slate-900 dark:text-white">{unit.name}</td>
                  <td className="px-6 py-3 text-slate-600 dark:text-slate-300">{unit.building?.name ?? unit.building_id}</td>
                  <td className="px-6 py-3 text-slate-600 dark:text-slate-300">{unit.manufacturer}</td>
                  <td className="px-6 py-3 text-slate-600 dark:text-slate-300">{unit.model}</td>
                  <td className="px-6 py-3 text-slate-600 dark:text-slate-300">{unit.capacity_tons}</td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex justify-end gap-3 text-sm font-semibold">
                      <Link className="text-brand-600 hover:text-brand-500" to={`/chiller-units/${unit.id}/edit`}>
                        Edit
                      </Link>
                      <button
                        className="text-rose-500 hover:text-rose-400"
                        onClick={() => handleDelete(unit.id)}
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
      </div>

      <DashboardCard title="Circuit A + B pressure" subtitle="Diagnostics" actions={<span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-100">Live</span>}>
        <ChillerCircuitChart data={sampleCircuitData} />
      </DashboardCard>
    </div>
  );
};

export default ChillerUnitsListPage;
