import { useEffect } from 'react';
import { useStatsStore, useRoutesStore, useLogsStore } from '../store';
import { Card, Loading } from '../components/ui';
import {
  Activity,
  Route as RouteIcon,
  CheckCircle,
  XCircle,
  TrendingUp,
  Clock,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#10b981', '#ef4444', '#f59e0b'];

export function DashboardPage() {
  const { stats, loading: statsLoading, fetchStats } = useStatsStore();
  const { routes, fetchRoutes } = useRoutesStore();
  const { logs, fetchLogs } = useLogsStore();

  useEffect(() => {
    fetchStats();
    fetchRoutes();
    fetchLogs({ limit: 10 });
  }, []);

  if (statsLoading) return <Loading />;

  const statCards = [
    {
      title: 'Total de Webhooks',
      value: stats?.total_webhooks || 0,
      icon: Activity,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Webhooks com Sucesso',
      value: stats?.successful_webhooks || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Webhooks com Falha',
      value: stats?.failed_webhooks || 0,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Rotas Ativas',
      value: stats?.total_routes || 0,
      icon: RouteIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  // Gerar dados reais dos últimos 7 dias
  const chartData = (() => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const last7Days = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];
      
      const dayLogs = Array.isArray(logs) ? logs.filter(log => {
        const logDate = new Date(log.processed_at);
        return logDate.toDateString() === date.toDateString();
      }) : [];
      
      const success = dayLogs.filter(l => l.filters_passed && l.targets_failed === 0).length;
      const failed = dayLogs.filter(l => !l.filters_passed || l.targets_failed > 0).length;
      
      last7Days.push({
        name: dayName,
        success,
        failed,
        webhooks: success + failed
      });
    }
    
    return last7Days;
  })();

  const pieData = [
    { name: 'Sucesso', value: stats?.successful_webhooks || 0 },
    { name: 'Falha', value: stats?.failed_webhooks || 0 },
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Visão geral do Evolution Router
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stat.value.toLocaleString()}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <Card className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Webhooks nos Últimos 7 Dias
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="success"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorSuccess)"
                name="Sucesso"
              />
              <Area
                type="monotone"
                dataKey="failed"
                stroke="#ef4444"
                fillOpacity={1}
                fill="url(#colorFailed)"
                name="Falha"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Pie Chart */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Distribuição de Status
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Logs */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Atividade Recente
            </h3>
            <a href="/logs" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              Ver todos
            </a>
          </div>
          <div className="space-y-3">
            {Array.isArray(logs) && logs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className={`p-2 rounded-lg ${log.filters_passed ? 'bg-green-100' : 'bg-red-100'}`}>
                  {log.filters_passed ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {log.event_type || 'Webhook recebido'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(log.processed_at).toLocaleString('pt-BR')}
                  </p>
                </div>
                <span className="text-xs text-gray-500">
                  ms
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Active Routes */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Rotas Ativas
            </h3>
            <a href="/routes" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              Ver todas
            </a>
          </div>
          <div className="space-y-3">
            {Array.isArray(routes) && routes.slice(0, 5).map((route) => (
              <div
                key={route.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="p-2 bg-primary-100 rounded-lg">
                  <RouteIcon className="w-4 h-4 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {route.name}
                  </p>
                  <p className="text-xs text-gray-500">{route.source}</p>
                </div>
                <span className={`badge ${route.enabled ? 'badge-success' : 'badge-danger'}`}>
                  {route.enabled ? 'Ativa' : 'Inativa'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
