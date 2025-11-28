import { NavLink } from 'react-router-dom';
import { useAuth } from '../../store/authStore';

type MainLayoutProps = {
  children: React.ReactNode;
};

const MainLayout = ({ children }: MainLayoutProps) => {
  const { user, organization, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h2>Chiller Intelligence</h2>
        <nav>
          <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/dashboard">
            Dashboard
          </NavLink>
          <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/buildings">
            Buildings
          </NavLink>
          <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/chiller-units">
            Chiller Units
          </NavLink>
          <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/data-sources">
            Data Sources
          </NavLink>
          <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/alert-rules">
            Alert Rules
          </NavLink>
          <NavLink
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            to="/settings/organization"
          >
            Organization Settings
          </NavLink>
        </nav>
      </aside>
      <div>
        <header className="top-bar">
          <div>
            <div>{organization?.name ?? 'Organization'}</div>
            <small style={{ color: '#475569' }}>{organization?.type}</small>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>{user?.name}</span>
            <button className="secondary" onClick={logout} type="button">
              Logout
            </button>
          </div>
        </header>
        <main className="content-area">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
