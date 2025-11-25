import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DataSource, deleteDataSource, listDataSources } from '../../api/dataSources';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';

const DataSourcesListPage = () => {
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const navigate = useNavigate();

  const loadDataSources = async () => {
    setLoading(true);
    setError(undefined);
    try {
      const data = await listDataSources();
      setDataSources(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Unable to load data sources.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDataSources();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this data source?')) return;
    try {
      await deleteDataSource(String(id));
      loadDataSources();
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Unable to delete data source.');
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="page-header">
        <h1>Data Sources</h1>
        <button className="primary" onClick={() => navigate('/data-sources/new')}>
          Add Data Source
        </button>
      </div>
      <ErrorMessage message={error} />
      <table>
        <thead>
          <tr>
            <th>Chiller Unit</th>
            <th>Type</th>
            <th>Connection Params</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {dataSources.map((source) => (
            <tr key={source.id}>
              <td>{source.chiller_unit?.name ?? source.chiller_unit_id}</td>
              <td>{source.type}</td>
              <td>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(source.connection_params, null, 2)}
                </pre>
              </td>
              <td className="table-actions">
                <Link to={`/data-sources/${source.id}/edit`}>Edit</Link>
                <button className="secondary" onClick={() => handleDelete(source.id)}>
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

export default DataSourcesListPage;
