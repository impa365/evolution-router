import { useEffect, useState } from 'react';
import { useLogsStore } from '../store';
import { Card, Badge, Loading, Button } from '../components/ui';
import { Activity, CheckCircle, XCircle, Clock, Search, Filter as FilterIcon, Download } from 'lucide-react';
import ReactJson from '@microlink/react-json-view';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function LogsPage() {
  const { logs, loading, fetchLogs } = useLogsStore();
  const [selectedLog, setSelectedLog] = useState(null);
  const [filters, setFilters] = useState({
    route_id: '',
    limit: 50,
  });

  useEffect(() => {
    fetchLogs(filters);
  }, [filters]);

  const handleRefresh = () => {
    fetchLogs(filters);
  };

  const exportLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `logs-${format(new Date(), 'yyyy-MM-dd-HHmm')}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Logs de Webhooks</h1>
          <p className="text-gray-600 mt-2">
            Monitore e analise todos os webhooks processados
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={exportLogs}>
            <Download className="w-5 h-5 mr-2" />
            Exportar
          </Button>
          <Button onClick={handleRefresh}>
            <Activity className="w-5 h-5 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Processados</p>
              <p className="text-2xl font-bold text-gray-900">{logs.length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Filtros Passados</p>
              <p className="text-2xl font-bold text-gray-900">
                {logs.filter((l) => l.filters_passed).length}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Com Falhas</p>
              <p className="text-2xl font-bold text-gray-900">
                {logs.filter((l) => l.targets_failed > 0).length}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tempo Médio</p>
              <p className="text-2xl font-bold text-gray-900">
                {logs.length > 0
                  ? Math.round(
                      logs.reduce((sum, l) => sum + (l.processing_time || 0), 0) / logs.length
                    )
                  : 0}
                ms
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Logs List */}
      <Card>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Data/Hora</th>
                <th>Evento</th>
                <th>Status</th>
                <th>Targets</th>
                <th>Tempo</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="text-sm">
                    {format(new Date(log.processed_at), "dd/MM/yyyy HH:mm:ss", {
                      locale: ptBR,
                    })}
                  </td>
                  <td>
                    <div>
                      <p className="font-medium text-gray-900">
                        {log.event_type || log.source}
                      </p>
                      {log.event_type && (
                        <p className="text-xs text-gray-500">{log.source}</p>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-col gap-1">
                      <Badge variant={log.filters_passed ? 'success' : 'danger'}>
                        {log.filters_passed ? 'Passou' : 'Bloqueado'}
                      </Badge>
                      {log.error && (
                        <Badge variant="danger">Erro</Badge>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="text-sm">
                      <p className="text-green-600 font-medium">
                        ✓ {log.targets_sent}
                      </p>
                      {log.targets_failed > 0 && (
                        <p className="text-red-600 font-medium">
                          ✗ {log.targets_failed}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="text-sm text-gray-600">
                    {log.processing_time_ms}ms
                  </td>
                  <td>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedLog(log)}
                    >
                      Ver Detalhes
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {logs.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Nenhum log encontrado
            </div>
          )}
        </div>
      </Card>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setSelectedLog(null)}
            />
            <div className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  Detalhes do Log
                </h3>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">ID</p>
                    <p className="font-mono text-sm">{selectedLog.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Processado em</p>
                    <p className="font-medium">
                      {format(new Date(selectedLog.processed_at), "dd/MM/yyyy HH:mm:ss", {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Evento</p>
                    <p className="font-medium">{selectedLog.event_type || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tempo de Processamento</p>
                    <p className="font-medium">{selectedLog.processing_time_ms}ms</p>
                  </div>
                </div>

                {/* Error */}
                {selectedLog.error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm font-medium text-red-800">Erro:</p>
                    <p className="text-sm text-red-700 mt-1">{selectedLog.error}</p>
                  </div>
                )}

                {/* Payload */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    Payload Recebido
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4 overflow-auto">
                    <ReactJson
                      src={selectedLog.raw_payload}
                      theme="rjv-default"
                      collapsed={1}
                      displayDataTypes={false}
                      displayObjectSize={false}
                      enableClipboard
                      name={false}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
