import { Bell, Search, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useLogsStore } from '../store';

export function Header() {
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);
  const { logs, fetchLogs } = useLogsStore();

  useEffect(() => {
    fetchLogs({ limit: 10 });
    const interval = setInterval(() => fetchLogs({ limit: 10 }), 30000);
    return () => clearInterval(interval);
  }, [fetchLogs]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function getRelativeTime(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now - time) / 1000);
    
    if (diff < 60) return 'agora mesmo';
    if (diff < 3600) return `${Math.floor(diff / 60)} min atrás`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
    return `${Math.floor(diff / 86400)}d atrás`;
  }

  const notifications = logs.map(log => {
    const hasError = log.error || log.targets_failed > 0;
    const filterRejected = !log.filters_passed;
    
    let type, title, icon, color;
    
    if (filterRejected) {
      type = 'warning';
      title = 'Filtro rejeitado';
      icon = AlertCircle;
      color = 'text-yellow-500';
    } else if (hasError) {
      type = 'error';
      title = 'Falha no envio';
      icon = XCircle;
      color = 'text-red-500';
    } else {
      type = 'success';
      title = 'Webhook processado';
      icon = CheckCircle;
      color = 'text-green-500';
    }

    return {
      id: log.id,
      type,
      title,
      message: `${log.source} - ${log.targets_sent} enviado(s), ${log.targets_failed} falha(s)`,
      time: getRelativeTime(log.processed_at),
      icon,
      color
    };
  });

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="search"
              placeholder="Buscar rotas, logs..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative" ref={notificationRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">Notificações</h3>
                    <span className="text-xs text-gray-500">{notifications.length} novas</span>
                  </div>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => {
                    const Icon = notification.icon;
                    return (
                      <div 
                        key={notification.id}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex gap-3">
                          <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${notification.color}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                            <p className="text-xs text-gray-600 mt-0.5">{notification.message}</p>
                            <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="px-4 py-2 border-t border-gray-200">
                  <button className="text-xs text-primary-600 hover:text-primary-700 font-medium w-full text-center">
                    Ver todas as notificações
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pl-4 border-l border-gray-300">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Admin</p>
              <p className="text-xs text-gray-500">Administrador</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-medium">
              A
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
