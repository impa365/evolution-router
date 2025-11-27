import React, { useState } from 'react';
import { 
  BookOpenIcon, 
  CodeBracketIcon, 
  CommandLineIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const ApiDocsPage = () => {
  const [copiedEndpoint, setCopiedEndpoint] = useState(null);
  const [expandedSection, setExpandedSection] = useState('routes');

  const baseUrl = 'http://localhost:3001';

  const copyToClipboard = (text, endpoint) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(endpoint);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const endpoints = {
    routes: {
      title: 'Rotas',
      icon: '🛣️',
      items: [
        {
          method: 'GET',
          path: '/api/v1/routes',
          description: 'Lista todas as rotas',
          response: `{
  "routes": [
    {
      "id": "uuid",
      "name": "Nome da Rota",
      "source": "evolution|custom",
      "enabled": true,
      "targets": [...],
      "filters": [...],
      "created_at": "2025-11-27T18:00:00Z"
    }
  ]
}`
        },
        {
          method: 'GET',
          path: '/api/v1/routes/:id',
          description: 'Obtém detalhes de uma rota específica',
          response: `{
  "id": "uuid",
  "name": "Nome da Rota",
  "source": "evolution|custom",
  "enabled": true,
  "targets": [...],
  "filters": [...]
}`
        },
        {
          method: 'POST',
          path: '/api/v1/routes',
          description: 'Cria uma nova rota',
          body: `{
  "name": "Nome da Rota",
  "description": "Descrição opcional",
  "source": "evolution|custom",
  "enabled": true
}`,
          response: `{
  "id": "uuid",
  "name": "Nome da Rota",
  "created_at": "2025-11-27T18:00:00Z"
}`
        },
        {
          method: 'PUT',
          path: '/api/v1/routes/:id',
          description: 'Atualiza uma rota existente',
          body: `{
  "name": "Novo Nome",
  "enabled": false
}`,
          response: `{
  "id": "uuid",
  "name": "Novo Nome",
  "enabled": false
}`
        },
        {
          method: 'DELETE',
          path: '/api/v1/routes/:id',
          description: 'Remove uma rota',
          response: `{
  "message": "Rota removida com sucesso"
}`
        }
      ]
    },
    targets: {
      title: 'Destinos',
      icon: '🎯',
      items: [
        {
          method: 'POST',
          path: '/api/v1/routes/:routeId/targets',
          description: 'Adiciona um destino a uma rota',
          body: `{
  "name": "Nome do Destino",
  "url": "https://seu-webhook.com/endpoint",
  "method": "POST",
  "headers": {},
  "enabled": true,
  "timeout": 30
}`,
          response: `{
  "id": "uuid",
  "name": "Nome do Destino",
  "url": "https://seu-webhook.com/endpoint"
}`
        },
        {
          method: 'PUT',
          path: '/api/v1/routes/:routeId/targets/:id',
          description: 'Atualiza um destino',
          body: `{
  "enabled": false,
  "timeout": 60
}`,
          response: `{
  "id": "uuid",
  "enabled": false,
  "timeout": 60
}`
        },
        {
          method: 'DELETE',
          path: '/api/v1/routes/:routeId/targets/:id',
          description: 'Remove um destino',
          response: `{
  "message": "Destino removido com sucesso"
}`
        }
      ]
    },
    filters: {
      title: 'Filtros',
      icon: '🔍',
      items: [
        {
          method: 'POST',
          path: '/api/v1/routes/:routeId/filters',
          description: 'Adiciona um filtro a uma rota',
          body: `{
  "type": "event_type|custom",
  "field_path": "event",
  "condition": "equals|contains|starts_with",
  "value": "messages.upsert",
  "enabled": true
}`,
          response: `{
  "id": "uuid",
  "type": "event_type",
  "condition": "equals",
  "value": "messages.upsert"
}`
        },
        {
          method: 'DELETE',
          path: '/api/v1/routes/:routeId/filters/:id',
          description: 'Remove um filtro',
          response: `{
  "message": "Filtro removido com sucesso"
}`
        }
      ]
    },
    logs: {
      title: 'Logs',
      icon: '📋',
      items: [
        {
          method: 'GET',
          path: '/api/v1/logs',
          description: 'Lista logs de webhooks processados',
          params: 'limit=50&route_id=uuid',
          response: `{
  "logs": [
    {
      "id": "uuid",
      "route_id": "uuid",
      "source": "evolution",
      "event_type": "messages.upsert",
      "targets_sent": 2,
      "targets_failed": 0,
      "processing_time": 150,
      "processed_at": "2025-11-27T18:00:00Z"
    }
  ],
  "total": 150
}`
        },
        {
          method: 'GET',
          path: '/api/v1/logs/:id',
          description: 'Detalhes de um log específico',
          response: `{
  "id": "uuid",
  "raw_payload": {...},
  "filters_passed": true,
  "retry_logs": [...]
}`
        }
      ]
    },
    stats: {
      title: 'Estatísticas',
      icon: '📊',
      items: [
        {
          method: 'GET',
          path: '/api/v1/stats',
          description: 'Estatísticas gerais do sistema',
          response: `{
  "total_webhooks": 1500,
  "successful_webhooks": 1450,
  "failed_webhooks": 50,
  "total_routes": 5
}`
        }
      ]
    },
    webhook: {
      title: 'Receber Webhooks',
      icon: '📨',
      items: [
        {
          method: 'POST',
          path: '/webhook/evolution/:instanceName',
          description: 'Endpoint para receber webhooks da Evolution API',
          body: `{
  "event": "messages.upsert",
  "instance": "minha-instancia",
  "data": {...}
}`,
          response: `{
  "status": "processed",
  "webhook_log_id": "uuid"
}`
        },
        {
          method: 'POST',
          path: '/webhook/custom/:routeId',
          description: 'Endpoint customizado para qualquer webhook',
          body: `{
  "qualquer": "payload",
  "formato": "livre"
}`,
          response: `{
  "status": "processed",
  "webhook_log_id": "uuid"
}`
        }
      ]
    }
  };

  const MethodBadge = ({ method }) => {
    const colors = {
      GET: 'bg-blue-100 text-blue-700 border-blue-200',
      POST: 'bg-green-100 text-green-700 border-green-200',
      PUT: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      DELETE: 'bg-red-100 text-red-700 border-red-200'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded border ${colors[method]}`}>
        {method}
      </span>
    );
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 -m-6 p-6 min-h-full">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm mb-8 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <BookOpenIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">API Documentation</h1>
              <p className="text-slate-600 mt-1">Evolution Router REST API - v1.0</p>
            </div>
          </div>
        </div>
        {/* Intro */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 mb-8 border border-blue-100">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white rounded-xl shadow-sm">
              <CommandLineIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Base URL</h2>
              <div className="bg-white rounded-lg p-4 border border-blue-200 font-mono text-sm text-slate-700">
                {baseUrl}/api/v1
              </div>
              <p className="text-slate-600 mt-3 text-sm">
                Todas as requisições devem incluir o header <code className="bg-white px-2 py-1 rounded text-blue-600">X-API-Key: sua-api-key</code>
              </p>
            </div>
          </div>
        </div>

        {/* Endpoints */}
        <div className="space-y-6">
          {Object.entries(endpoints).map(([key, section]) => (
            <div key={key} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <button
                onClick={() => setExpandedSection(expandedSection === key ? null : key)}
                className="w-full px-6 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{section.icon}</span>
                  <h3 className="text-xl font-semibold text-slate-900">{section.title}</h3>
                  <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                    {section.items.length} endpoints
                  </span>
                </div>
                {expandedSection === key ? (
                  <ChevronDownIcon className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronRightIcon className="w-5 h-5 text-slate-400" />
                )}
              </button>

              {expandedSection === key && (
                <div className="border-t border-slate-200">
                  {section.items.map((endpoint, idx) => (
                    <div key={idx} className="p-6 border-b border-slate-100 last:border-b-0">
                      <div className="flex items-start gap-4 mb-4">
                        <MethodBadge method={endpoint.method} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <code className="text-sm font-mono text-slate-900 bg-slate-100 px-3 py-1 rounded">
                              {endpoint.path}
                            </code>
                            <button
                              onClick={() => copyToClipboard(`${baseUrl}${endpoint.path}`, endpoint.path)}
                              className="p-1 hover:bg-slate-100 rounded transition-colors"
                              title="Copiar URL completa"
                            >
                              {copiedEndpoint === endpoint.path ? (
                                <CheckIcon className="w-4 h-4 text-green-600" />
                              ) : (
                                <ClipboardDocumentIcon className="w-4 h-4 text-slate-400" />
                              )}
                            </button>
                          </div>
                          <p className="text-slate-600 text-sm">{endpoint.description}</p>
                        </div>
                      </div>

                      {endpoint.params && (
                        <div className="mb-4">
                          <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Query Parameters</h4>
                          <code className="block bg-slate-50 rounded-lg p-3 text-sm text-slate-700 border border-slate-200">
                            ?{endpoint.params}
                          </code>
                        </div>
                      )}

                      {endpoint.body && (
                        <div className="mb-4">
                          <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Request Body</h4>
                          <pre className="bg-slate-900 rounded-lg p-4 text-sm text-slate-100 overflow-x-auto border border-slate-700">
                            <code>{endpoint.body}</code>
                          </pre>
                        </div>
                      )}

                      <div>
                        <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Response</h4>
                        <pre className="bg-slate-900 rounded-lg p-4 text-sm text-emerald-400 overflow-x-auto border border-slate-700">
                          <code>{endpoint.response}</code>
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 text-white">
          <div className="flex items-start gap-4">
            <CodeBracketIcon className="w-8 h-8 text-blue-400 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Precisa de ajuda?</h3>
              <p className="text-slate-300 text-sm mb-4">
                Consulte o código-fonte no GitHub ou entre em contato com o Evolution API Team.
              </p>
              <a
                href="https://github.com/impa365/evolution-router"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-slate-900 px-4 py-2 rounded-lg font-medium text-sm hover:bg-slate-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                Ver no GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiDocsPage;
