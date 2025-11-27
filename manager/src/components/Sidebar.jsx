import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Route,
  Target,
  Filter,
  FileJson,
  Activity,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '../store';
import clsx from 'clsx';

const navigation = [
  { name: 'Dashboard', to: '/', icon: LayoutDashboard },
  { name: 'Rotas', to: '/routes', icon: Route },
  { name: 'Logs', to: '/logs', icon: Activity },
  { name: 'Configurações', to: '/settings', icon: Settings },
];

export function Sidebar() {
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="flex flex-col h-screen w-64 bg-dark-900 text-white">
      {/* Header */}
      <div className="p-6 border-b border-dark-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
            <Route className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Evolution Router</h1>
            <p className="text-xs text-gray-400">Webhook Manager</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-dark-800 hover:text-white'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-dark-800">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-300 hover:bg-dark-800 hover:text-white transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </div>
  );
}
