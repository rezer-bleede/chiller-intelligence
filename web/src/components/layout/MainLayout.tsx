import { useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../store/authStore';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/history', label: 'History', icon: '📜' },
  { to: '/buildings', label: 'Buildings', icon: '🏢' },
  { to: '/chiller-units', label: 'Chiller Units', icon: '❄️' },
  { to: '/data-sources', label: 'Data Sources', icon: '🔌' },
  { to: '/alert-rules', label: 'Alert Rules', icon: '🚨' },
  { to: '/settings/organization', label: 'Organization', icon: '⚙️' },
];

type MainLayoutProps = {
  children: React.ReactNode;
};

const MainLayout = ({ children }: MainLayoutProps) => {
  const { user, organization, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
  );

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const navLinkClasses = useMemo(
    () =>
      ({ isActive }: { isActive: boolean }) =>
        `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition hover:bg-white/10 hover:text-white ${
          isActive ? 'bg-white/10 text-white shadow-inner' : 'text-slate-100'
        }`,
    [],
  );

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50">
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-72 transform bg-gradient-to-b from-slate-900 to-slate-800 px-4 py-6 shadow-xl transition-transform duration-200 md:static md:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between px-2">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400">Chiller</p>
              <h2 className="text-2xl font-semibold text-white">Intelligence</h2>
            </div>
            <button
              type="button"
              className="rounded-lg p-2 text-slate-300 transition hover:bg-white/10 md:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              ✕
            </button>
          </div>
          <nav className="mt-8 space-y-1">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={navLinkClasses} onClick={() => setSidebarOpen(false)}>
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
            <p className="text-xs uppercase tracking-wide text-slate-400">Organization</p>
            <p className="font-semibold text-white">{organization?.name ?? 'Organization'}</p>
            <p className="text-xs text-slate-300">{organization?.type ?? 'Cooling portfolio'}</p>
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col md:pl-0">
          <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-900/80 md:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-700 shadow-sm transition hover:border-brand-500 hover:text-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                onClick={() => setSidebarOpen((open) => !open)}
                aria-label="Toggle navigation"
              >
                ☰
              </button>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Live plant view</p>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">Chiller performance cockpit</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-brand-500 hover:text-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
              </button>
              <div className="hidden items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 dark:bg-slate-800/70 dark:text-slate-100 md:flex">
                <span className="rounded-full bg-brand-500/20 px-2 py-1 text-xs font-semibold text-brand-900 dark:text-brand-100">{organization?.name ?? 'Org'}</span>
                <span className="text-slate-500 dark:text-slate-300">{user?.name}</span>
              </div>
              <button
                className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-300"
                onClick={logout}
                type="button"
              >
                Logout
              </button>
            </div>
          </header>
          <main className="flex-1 bg-gradient-to-b from-slate-50 via-white to-slate-100 px-4 py-6 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 md:px-8">
            <div className="mx-auto max-w-7xl space-y-8">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
