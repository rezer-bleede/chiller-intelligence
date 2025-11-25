import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChillerUnit, deleteChillerUnit, listChillerUnits } from '../../api/chillerUnits';
import { Building, listBuildings } from '../../api/buildings';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';

const ChillerUnitsListPage = () => {
  const [chillers, setChillers] = useState<ChillerUnit[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<string>('');
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

  if (loading) return <Loading />;

  return (
    <div>
      <div className="page-header">
        <h1>Chiller Units</h1>
        <button className="primary" onClick={() => navigate('/chiller-units/new')}>
          Add Chiller Unit
        </button>
      </div>
      <ErrorMessage message={error} />
      <div style={{ marginBottom: 12 }}>
        <label htmlFor="building_filter">Filter by building</label>
        <select
          id="building_filter"
          value={selectedBuilding}
          onChange={(e) => {
            const value = e.target.value;
            setSelectedBuilding(value);
            loadChillers(value || undefined);
          }}
        >
          <option value="">All Buildings</option>
          {buildings.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Building</th>
            <th>Manufacturer</th>
            <th>Model</th>
            <th>Capacity (tons)</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {chillers.map((unit) => (
            <tr key={unit.id}>
              <td>{unit.name}</td>
              <td>{unit.building?.name ?? unit.building_id}</td>
              <td>{unit.manufacturer}</td>
              <td>{unit.model}</td>
              <td>{unit.capacity_tons}</td>
              <td className="table-actions">
                <Link to={`/chiller-units/${unit.id}/edit`}>Edit</Link>
                <button className="secondary" onClick={() => handleDelete(unit.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ChillerUnitsListPage;
