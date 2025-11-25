import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building, deleteBuilding, listBuildings } from '../../api/buildings';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';

const BuildingsListPage = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
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

  if (loading) return <Loading />;

  return (
    <div>
      <div className="page-header">
        <h1>Buildings</h1>
        <button className="primary" onClick={() => navigate('/buildings/new')}>
          Add Building
        </button>
      </div>
      <ErrorMessage message={error} />
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Location</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {buildings.map((building) => (
            <tr key={building.id}>
              <td>{building.name}</td>
              <td>{building.location}</td>
              <td className="table-actions">
                <Link to={`/buildings/${building.id}/edit`}>Edit</Link>
                <button className="secondary" onClick={() => handleDelete(building.id)}>
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

export default BuildingsListPage;
