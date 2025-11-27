import React, { useState } from 'react';
import { 
  BookOpenIcon, 
  ChevronDownIcon, 
  ChevronRightIcon,
  CommandLineIcon,
  CodeBracketIcon,
  CheckIcon,
  ClipboardIcon,
  KeyIcon,
  ShieldCheckIcon,
  LightBulbIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const ApiDocsPage = () => {
  const [expandedSections, setExpandedSections] = useState({ auth: true, routes: true });
  const [expandedEndpoints, setExpandedEndpoints] = useState({});
  const [copiedText, setCopiedText] = useState(null);

  const baseUrl = window.location.origin;

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleEndpoint = (endpoint) => {
    setExpandedEndpoints(prev => ({
      ...prev,
      [endpoint]: !prev[endpoint]
    }));
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const MethodBadge = ({ method }) => {
    const colors = {
      GET: 'bg-blue-100 text-blue-800 border-blue-300',
      POST: 'bg-green-100 text-green-800 border-green-300',
      PUT: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      DELETE: 'bg-red-100 text-red-800 border-red-300'
    };
    
    return (
      <span className={`px-3 py-1 rounded-lg text-sm font-bold border ${colors[method]}`}>
        {method}
      </span>
    );
  };

  const StatusBadge = ({ code, text }) => {
    const colors = {
      '200': 'bg-green-50 text-green-700 border-green-200',
      '201': 'bg-green-50 text-green-700 border-green-200',
      '400': 'bg-orange-50 text-orange-700 border-orange-200',
      '401': 'bg-red-50 text-red-700 border-red-200',
      '404': 'bg-red-50 text-red-700 border-red-200',
      '500': 'bg-red-50 text-red-700 border-red-200'
    };
    
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded border ${colors[code]}`}>
        <span className="font-mono font-semibold text-sm">{code}</span>
        <span className="text-sm">{text}</span>
      </div>
    );
  };

  const CodeBlock = ({ code, language = 'json', id }) => {
    const isCopied = copiedText === id;
    
    return (
      <div className="relative group">
        <button
          onClick={() => copyToClipboard(code, id)}
          className="absolute top-3 right-3 p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {isCopied ? (
            <CheckIcon className="w-4 h-4" />
          ) : (
            <ClipboardIcon className="w-4 h-4" />
          )}
        </button>
        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
          <code className={`language-${language}`}>{code}</code>
        </pre>
      </div>
    );
  };

  const Parameter = ({ name, type, required, description, example }) => (
    <div className="border-l-4 border-blue-400 pl-4 py-2 mb-3 bg-blue-50/50">
      <div className="flex items-center gap-2 mb-1">
        <code className="text-sm font-bold text-blue-900">{name}</code>
        <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded border border-purple-300">
          {type}
        </span>
        {required && (
          <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded border border-red-300 font-semibold">
            OBRIGATÓRIO
          </span>
        )}
      </div>
      <p className="text-sm text-gray-700 mb-1">{description}</p>
      {example && (
        <div className="text-xs text-gray-600 font-mono bg-white px-2 py-1 rounded border border-gray-200">
          Exemplo: <span className="text-blue-600">{example}</span>
        </div>
      )}
    </div>
  );

  const apiDocumentation = {
    auth: {
      title: '🔐 Autenticação',
      description: 'Todos os endpoints da API (exceto webhook) exigem autenticação via API Key no header.',
      content: (
        <div className="space-y-4">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-900 mb-1">Importante</h4>
                <p className="text-sm text-yellow-800">
                  Configure sua <code className="bg-yellow-100 px-1 rounded">API_KEY</code> no arquivo <code className="bg-yellow-100 px-1 rounded">.env</code> antes de usar a API.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <KeyIcon className="w-5 h-5" />
              Como Autenticar
            </h4>
            <p className="text-sm text-gray-700 mb-3">
              Inclua o header <code className="bg-gray-100 px-2 py-0.5 rounded text-sm">X-API-Key</code> em todas as requisições:
            </p>
            <CodeBlock 
              id="auth-header"
              language="bash"
              code={`curl -H "X-API-Key: sua-api-key-aqui" \\
  ${baseUrl}/api/v1/routes`}
            />
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Respostas de Erro</h4>
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <StatusBadge code="401" text="Unauthorized" />
                <p className="text-sm text-gray-700">API Key ausente ou inválida</p>
              </div>
            </div>
            <CodeBlock 
              id="auth-error"
              code={`{
  "error": "API key is required"
}

// ou

{
  "error": "Invalid API key"
}`}
            />
          </div>
        </div>
      )
    },

    routes: {
      title: '🛣️ Gerenciamento de Rotas',
      description: 'Crie e gerencie rotas de webhook para receber e distribuir eventos.',
      endpoints: [
        {
          id: 'create-route',
          method: 'POST',
          path: '/api/v1/routes',
          summary: 'Criar Nova Rota',
          description: 'Cria uma nova rota de webhook para processar eventos de uma origem específica.',
          headers: [
            { name: 'X-API-Key', value: 'sua-api-key', required: true },
            { name: 'Content-Type', value: 'application/json', required: true }
          ],
          body: {
            name: { type: 'string', required: true, description: 'Nome identificador da rota', example: 'Rota Evolution API' },
            source: { type: 'string', required: true, description: 'Origem dos webhooks (evolution, n8n, etc)', example: 'evolution' },
            enabled: { type: 'boolean', required: false, description: 'Se a rota está ativa', example: 'true' }
          },
          requestExample: `{
  "name": "Rota Evolution API",
  "source": "evolution",
  "enabled": true
}`,
          responses: [
            {
              status: '201',
              description: 'Rota criada com sucesso',
              example: `{
  "id": "ce14b012-01df-4ed9-b254-9b218508f6ce",
  "name": "Rota Evolution API",
  "source": "evolution",
  "enabled": true,
  "created_at": "2025-11-27T18:23:45Z",
  "updated_at": "2025-11-27T18:23:45Z"
}`
            },
            {
              status: '400',
              description: 'Dados inválidos',
              example: `{
  "error": "name is required"
}`
            }
          ],
          curlExample: `curl -X POST ${baseUrl}/api/v1/routes \\
  -H "X-API-Key: sua-api-key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Rota Evolution API",
    "source": "evolution",
    "enabled": true
  }'`
        },
        {
          id: 'list-routes',
          method: 'GET',
          path: '/api/v1/routes',
          summary: 'Listar Todas as Rotas',
          description: 'Retorna todas as rotas cadastradas no sistema com seus targets e filters.',
          headers: [
            { name: 'X-API-Key', value: 'sua-api-key', required: true }
          ],
          responses: [
            {
              status: '200',
              description: 'Lista de rotas retornada com sucesso',
              example: `[
  {
    "id": "ce14b012-01df-4ed9-b254-9b218508f6ce",
    "name": "Rota Evolution API",
    "source": "evolution",
    "enabled": true,
    "targets": [
      {
        "id": "target-uuid",
        "url": "https://api.exemplo.com/webhook",
        "method": "POST",
        "enabled": true
      }
    ],
    "filters": [
      {
        "id": "filter-uuid",
        "type": "include",
        "field_path": "event",
        "condition": "equals",
        "value": "messages.upsert"
      }
    ],
    "field_mappings": [],
    "created_at": "2025-11-27T18:23:45Z",
    "updated_at": "2025-11-27T18:23:45Z"
  }
]`
            }
          ],
          curlExample: `curl -X GET ${baseUrl}/api/v1/routes \\
  -H "X-API-Key: sua-api-key"`
        },
        {
          id: 'get-route',
          method: 'GET',
          path: '/api/v1/routes/:id',
          summary: 'Obter Rota Específica',
          description: 'Retorna detalhes completos de uma rota incluindo todos os targets, filters e field mappings.',
          pathParams: {
            id: { type: 'string', required: true, description: 'UUID da rota', example: 'ce14b012-01df-4ed9-b254-9b218508f6ce' }
          },
          headers: [
            { name: 'X-API-Key', value: 'sua-api-key', required: true }
          ],
          responses: [
            {
              status: '200',
              description: 'Rota encontrada',
              example: `{
  "id": "ce14b012-01df-4ed9-b254-9b218508f6ce",
  "name": "Rota Evolution API",
  "source": "evolution",
  "enabled": true,
  "targets": [...],
  "filters": [...],
  "field_mappings": [],
  "created_at": "2025-11-27T18:23:45Z",
  "updated_at": "2025-11-27T18:23:45Z"
}`
            },
            {
              status: '404',
              description: 'Rota não encontrada',
              example: `{
  "error": "Route not found"
}`
            }
          ],
          curlExample: `curl -X GET ${baseUrl}/api/v1/routes/ce14b012-01df-4ed9-b254-9b218508f6ce \\
  -H "X-API-Key: sua-api-key"`
        },
        {
          id: 'update-route',
          method: 'PUT',
          path: '/api/v1/routes/:id',
          summary: 'Atualizar Rota',
          description: 'Atualiza os dados de uma rota existente.',
          pathParams: {
            id: { type: 'string', required: true, description: 'UUID da rota', example: 'ce14b012-01df-4ed9-b254-9b218508f6ce' }
          },
          headers: [
            { name: 'X-API-Key', value: 'sua-api-key', required: true },
            { name: 'Content-Type', value: 'application/json', required: true }
          ],
          body: {
            name: { type: 'string', required: false, description: 'Novo nome da rota' },
            enabled: { type: 'boolean', required: false, description: 'Ativar/desativar rota' }
          },
          requestExample: `{
  "name": "Rota Evolution API - Atualizada",
  "enabled": false
}`,
          responses: [
            {
              status: '200',
              description: 'Rota atualizada com sucesso',
              example: `{
  "id": "ce14b012-01df-4ed9-b254-9b218508f6ce",
  "name": "Rota Evolution API - Atualizada",
  "source": "evolution",
  "enabled": false,
  "updated_at": "2025-11-27T19:00:00Z"
}`
            }
          ],
          curlExample: `curl -X PUT ${baseUrl}/api/v1/routes/ce14b012-01df-4ed9-b254-9b218508f6ce \\
  -H "X-API-Key: sua-api-key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Rota Evolution API - Atualizada",
    "enabled": false
  }'`
        },
        {
          id: 'delete-route',
          method: 'DELETE',
          path: '/api/v1/routes/:id',
          summary: 'Deletar Rota',
          description: 'Remove uma rota e todos os seus targets, filters e field mappings associados.',
          pathParams: {
            id: { type: 'string', required: true, description: 'UUID da rota', example: 'ce14b012-01df-4ed9-b254-9b218508f6ce' }
          },
          headers: [
            { name: 'X-API-Key', value: 'sua-api-key', required: true }
          ],
          responses: [
            {
              status: '200',
              description: 'Rota deletada com sucesso',
              example: `{
  "message": "Route deleted successfully"
}`
            },
            {
              status: '404',
              description: 'Rota não encontrada',
              example: `{
  "error": "Route not found"
}`
            }
          ],
          curlExample: `curl -X DELETE ${baseUrl}/api/v1/routes/ce14b012-01df-4ed9-b254-9b218508f6ce \\
  -H "X-API-Key: sua-api-key"`
        }
      ]
    },

    targets: {
      title: '🎯 Gerenciamento de Targets',
      description: 'Targets são destinos para onde os webhooks serão encaminhados. Configure múltiplos targets para cada rota.',
      endpoints: [
        {
          id: 'create-target',
          method: 'POST',
          path: '/api/v1/routes/:id/targets',
          summary: 'Criar Target',
          description: 'Adiciona um novo target (destino) para uma rota específica.',
          pathParams: {
            id: { type: 'string', required: true, description: 'UUID da rota', example: 'ce14b012-01df-4ed9-b254-9b218508f6ce' }
          },
          headers: [
            { name: 'X-API-Key', value: 'sua-api-key', required: true },
            { name: 'Content-Type', value: 'application/json', required: true }
          ],
          body: {
            url: { type: 'string', required: true, description: 'URL de destino do webhook', example: 'https://api.exemplo.com/webhook' },
            method: { type: 'string', required: true, description: 'Método HTTP (GET, POST, PUT, DELETE)', example: 'POST' },
            headers: { type: 'object', required: false, description: 'Headers customizados para enviar', example: '{"Authorization": "Bearer token"}' },
            enabled: { type: 'boolean', required: false, description: 'Se o target está ativo', example: 'true' },
            priority: { type: 'integer', required: false, description: 'Prioridade de execução (menor = maior prioridade)', example: '1' },
            timeout: { type: 'integer', required: false, description: 'Timeout em segundos', example: '30' }
          },
          requestExample: `{
  "url": "https://n8n.exemplo.com/webhook/evolution",
  "method": "POST",
  "headers": {
    "Authorization": "Bearer seu-token",
    "X-Custom-Header": "valor"
  },
  "enabled": true,
  "priority": 1,
  "timeout": 30
}`,
          responses: [
            {
              status: '201',
              description: 'Target criado com sucesso',
              example: `{
  "id": "target-uuid",
  "route_id": "ce14b012-01df-4ed9-b254-9b218508f6ce",
  "url": "https://n8n.exemplo.com/webhook/evolution",
  "method": "POST",
  "headers": {
    "Authorization": "Bearer seu-token",
    "X-Custom-Header": "valor"
  },
  "enabled": true,
  "priority": 1,
  "timeout": 30,
  "created_at": "2025-11-27T18:30:00Z"
}`
            }
          ],
          curlExample: `curl -X POST ${baseUrl}/api/v1/routes/ce14b012-01df-4ed9-b254-9b218508f6ce/targets \\
  -H "X-API-Key: sua-api-key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://n8n.exemplo.com/webhook/evolution",
    "method": "POST",
    "enabled": true,
    "priority": 1
  }'`
        },
        {
          id: 'list-targets',
          method: 'GET',
          path: '/api/v1/routes/:id/targets',
          summary: 'Listar Targets',
          description: 'Retorna todos os targets configurados para uma rota.',
          pathParams: {
            id: { type: 'string', required: true, description: 'UUID da rota' }
          },
          headers: [
            { name: 'X-API-Key', value: 'sua-api-key', required: true }
          ],
          responses: [
            {
              status: '200',
              description: 'Lista de targets',
              example: `[
  {
    "id": "target-uuid-1",
    "route_id": "ce14b012-01df-4ed9-b254-9b218508f6ce",
    "url": "https://n8n.exemplo.com/webhook/evolution",
    "method": "POST",
    "enabled": true,
    "priority": 1
  }
]`
            }
          ],
          curlExample: `curl -X GET ${baseUrl}/api/v1/routes/ce14b012-01df-4ed9-b254-9b218508f6ce/targets \\
  -H "X-API-Key: sua-api-key"`
        },
        {
          id: 'update-target',
          method: 'PUT',
          path: '/api/v1/targets/:id',
          summary: 'Atualizar Target',
          description: 'Atualiza configurações de um target existente.',
          pathParams: {
            id: { type: 'string', required: true, description: 'UUID do target' }
          },
          headers: [
            { name: 'X-API-Key', value: 'sua-api-key', required: true },
            { name: 'Content-Type', value: 'application/json', required: true }
          ],
          body: {
            url: { type: 'string', required: false, description: 'Nova URL de destino' },
            enabled: { type: 'boolean', required: false, description: 'Ativar/desativar target' },
            priority: { type: 'integer', required: false, description: 'Nova prioridade' }
          },
          requestExample: `{
  "enabled": false,
  "priority": 5
}`,
          curlExample: `curl -X PUT ${baseUrl}/api/v1/targets/target-uuid \\
  -H "X-API-Key: sua-api-key" \\
  -H "Content-Type: application/json" \\
  -d '{"enabled": false}'`
        },
        {
          id: 'delete-target',
          method: 'DELETE',
          path: '/api/v1/targets/:id',
          summary: 'Deletar Target',
          description: 'Remove um target de uma rota.',
          pathParams: {
            id: { type: 'string', required: true, description: 'UUID do target' }
          },
          headers: [
            { name: 'X-API-Key', value: 'sua-api-key', required: true }
          ],
          responses: [
            {
              status: '200',
              description: 'Target deletado com sucesso',
              example: `{
  "message": "Target deleted successfully"
}`
            }
          ],
          curlExample: `curl -X DELETE ${baseUrl}/api/v1/targets/target-uuid \\
  -H "X-API-Key: sua-api-key"`
        }
      ]
    },

    filters: {
      title: '🔍 Gerenciamento de Filtros',
      description: 'Filtros permitem processar apenas webhooks que atendam condições específicas.',
      endpoints: [
        {
          id: 'create-filter',
          method: 'POST',
          path: '/api/v1/routes/:id/filters',
          summary: 'Criar Filtro',
          description: 'Adiciona um filtro para processar seletivamente webhooks baseado em condições.',
          pathParams: {
            id: { type: 'string', required: true, description: 'UUID da rota' }
          },
          headers: [
            { name: 'X-API-Key', value: 'sua-api-key', required: true },
            { name: 'Content-Type', value: 'application/json', required: true }
          ],
          body: {
            type: { type: 'string', required: true, description: 'Tipo do filtro: include (processar se passar) ou exclude (não processar se passar)', example: 'include' },
            field_path: { type: 'string', required: true, description: 'Caminho do campo no JSON (dot notation)', example: 'data.event' },
            condition: { type: 'string', required: true, description: 'Condição: equals, contains, starts_with, ends_with, regex', example: 'equals' },
            value: { type: 'string', required: true, description: 'Valor para comparação', example: 'messages.upsert' },
            enabled: { type: 'boolean', required: false, description: 'Se o filtro está ativo', example: 'true' }
          },
          requestExample: `{
  "type": "include",
  "field_path": "data.event",
  "condition": "equals",
  "value": "messages.upsert",
  "enabled": true
}`,
          responses: [
            {
              status: '201',
              description: 'Filtro criado com sucesso',
              example: `{
  "id": "filter-uuid",
  "route_id": "ce14b012-01df-4ed9-b254-9b218508f6ce",
  "type": "include",
  "field_path": "data.event",
  "condition": "equals",
  "value": "messages.upsert",
  "enabled": true,
  "created_at": "2025-11-27T18:35:00Z"
}`
            }
          ],
          curlExample: `curl -X POST ${baseUrl}/api/v1/routes/ce14b012-01df-4ed9-b254-9b218508f6ce/filters \\
  -H "X-API-Key: sua-api-key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "include",
    "field_path": "data.event",
    "condition": "equals",
    "value": "messages.upsert"
  }'`,
          useCases: [
            {
              title: 'Filtrar apenas mensagens recebidas',
              example: `{
  "type": "include",
  "field_path": "data.event",
  "condition": "equals",
  "value": "messages.upsert"
}`
            },
            {
              title: 'Excluir webhooks de status',
              example: `{
  "type": "exclude",
  "field_path": "data.event",
  "condition": "contains",
  "value": "status"
}`
            },
            {
              title: 'Filtrar por número específico',
              example: `{
  "type": "include",
  "field_path": "data.key.remoteJid",
  "condition": "starts_with",
  "value": "5511"
}`
            }
          ]
        },
        {
          id: 'list-filters',
          method: 'GET',
          path: '/api/v1/routes/:id/filters',
          summary: 'Listar Filtros',
          description: 'Retorna todos os filtros configurados para uma rota.',
          pathParams: {
            id: { type: 'string', required: true, description: 'UUID da rota' }
          },
          headers: [
            { name: 'X-API-Key', value: 'sua-api-key', required: true }
          ],
          curlExample: `curl -X GET ${baseUrl}/api/v1/routes/ce14b012-01df-4ed9-b254-9b218508f6ce/filters \\
  -H "X-API-Key: sua-api-key"`
        },
        {
          id: 'update-filter',
          method: 'PUT',
          path: '/api/v1/filters/:id',
          summary: 'Atualizar Filtro',
          description: 'Atualiza configurações de um filtro existente.',
          pathParams: {
            id: { type: 'string', required: true, description: 'UUID do filtro' }
          },
          curlExample: `curl -X PUT ${baseUrl}/api/v1/filters/filter-uuid \\
  -H "X-API-Key: sua-api-key" \\
  -H "Content-Type: application/json" \\
  -d '{"enabled": false}'`
        },
        {
          id: 'delete-filter',
          method: 'DELETE',
          path: '/api/v1/filters/:id',
          summary: 'Deletar Filtro',
          description: 'Remove um filtro de uma rota.',
          pathParams: {
            id: { type: 'string', required: true, description: 'UUID do filtro' }
          },
          curlExample: `curl -X DELETE ${baseUrl}/api/v1/filters/filter-uuid \\
  -H "X-API-Key: sua-api-key"`
        }
      ]
    },

    logs: {
      title: '📊 Logs e Monitoramento',
      description: 'Monitore o processamento de webhooks e visualize estatísticas.',
      endpoints: [
        {
          id: 'list-logs',
          method: 'GET',
          path: '/api/v1/logs',
          summary: 'Listar Logs',
          description: 'Retorna histórico de processamento de webhooks com paginação e filtros.',
          headers: [
            { name: 'X-API-Key', value: 'sua-api-key', required: true }
          ],
          queryParams: {
            route_id: { type: 'string', required: false, description: 'Filtrar por rota específica' },
            source: { type: 'string', required: false, description: 'Filtrar por origem' },
            event_type: { type: 'string', required: false, description: 'Filtrar por tipo de evento' },
            limit: { type: 'integer', required: false, description: 'Quantidade de registros (padrão: 50)', example: '100' },
            offset: { type: 'integer', required: false, description: 'Pular N registros', example: '0' }
          },
          responses: [
            {
              status: '200',
              description: 'Lista de logs',
              example: `{
  "logs": [
    {
      "id": "log-uuid",
      "route_id": "ce14b012-01df-4ed9-b254-9b218508f6ce",
      "source": "evolution",
      "event_type": "messages.upsert",
      "raw_payload": {...},
      "processed_at": "2025-11-27T18:40:00Z",
      "filters_passed": true,
      "targets_sent": 2,
      "targets_failed": 0,
      "processing_time": 150,
      "error": null
    }
  ],
  "total": 150,
  "limit": 50,
  "offset": 0
}`
            }
          ],
          curlExample: `curl -X GET "${baseUrl}/api/v1/logs?route_id=ce14b012-01df-4ed9-b254-9b218508f6ce&limit=100" \\
  -H "X-API-Key: sua-api-key"`
        },
        {
          id: 'get-log',
          method: 'GET',
          path: '/api/v1/logs/:id',
          summary: 'Obter Log Específico',
          description: 'Retorna detalhes completos de um log incluindo payload completo e tentativas de retry.',
          pathParams: {
            id: { type: 'string', required: true, description: 'UUID do log' }
          },
          headers: [
            { name: 'X-API-Key', value: 'sua-api-key', required: true }
          ],
          curlExample: `curl -X GET ${baseUrl}/api/v1/logs/log-uuid \\
  -H "X-API-Key: sua-api-key"`
        },
        {
          id: 'get-stats',
          method: 'GET',
          path: '/api/v1/stats',
          summary: 'Estatísticas',
          description: 'Retorna estatísticas agregadas de processamento de webhooks.',
          headers: [
            { name: 'X-API-Key', value: 'sua-api-key', required: true }
          ],
          queryParams: {
            route_id: { type: 'string', required: false, description: 'Filtrar estatísticas por rota' },
            period: { type: 'string', required: false, description: 'Período: hour, day, week, month', example: 'day' }
          },
          responses: [
            {
              status: '200',
              description: 'Estatísticas',
              example: `{
  "total_webhooks": 1250,
  "total_processed": 1200,
  "total_filtered": 50,
  "total_failed": 25,
  "success_rate": 98.0,
  "avg_processing_time": 145,
  "by_source": {
    "evolution": 800,
    "n8n": 400
  },
  "by_event_type": {
    "messages.upsert": 600,
    "messages.update": 300
  },
  "period": {
    "start": "2025-11-27T00:00:00Z",
    "end": "2025-11-27T23:59:59Z"
  }
}`
            }
          ],
          curlExample: `curl -X GET "${baseUrl}/api/v1/stats?period=day" \\
  -H "X-API-Key: sua-api-key"`
        }
      ]
    },

    webhook: {
      title: '📬 Receber Webhooks',
      description: 'Endpoint público para receber webhooks de sistemas externos. Não requer autenticação.',
      endpoints: [
        {
          id: 'receive-webhook',
          method: 'POST',
          path: '/webhook/:source/:route_id',
          summary: 'Receber Webhook',
          description: 'Endpoint público para receber webhooks. O sistema processa automaticamente baseado nos filtros e envia para os targets configurados.',
          pathParams: {
            source: { type: 'string', required: true, description: 'Origem do webhook (evolution, n8n, etc)', example: 'evolution' },
            route_id: { type: 'string', required: true, description: 'UUID da rota de destino', example: 'ce14b012-01df-4ed9-b254-9b218508f6ce' }
          },
          headers: [
            { name: 'Content-Type', value: 'application/json', required: true }
          ],
          body: {
            '*': { type: 'any', required: true, description: 'Qualquer payload JSON será aceito e processado' }
          },
          requestExample: `{
  "event": "messages.upsert",
  "instance": "evolution-instance",
  "data": {
    "key": {
      "remoteJid": "5511999999999@s.whatsapp.net",
      "fromMe": false,
      "id": "3EB0XXXXX"
    },
    "message": {
      "conversation": "Olá, mundo!"
    },
    "messageTimestamp": 1732737600
  }
}`,
          responses: [
            {
              status: '200',
              description: 'Webhook recebido e processado',
              example: `{
  "status": "processed",
  "route_id": "ce14b012-01df-4ed9-b254-9b218508f6ce",
  "log_id": "log-uuid",
  "filters_passed": true,
  "targets_sent": 2,
  "targets_failed": 0,
  "processing_time": 145
}`
            },
            {
              status: '200',
              description: 'Webhook recebido mas filtrado (não passou nos filtros)',
              example: `{
  "status": "filtered",
  "route_id": "ce14b012-01df-4ed9-b254-9b218508f6ce",
  "log_id": "log-uuid",
  "filters_passed": false,
  "reason": "Event type does not match filter"
}`
            },
            {
              status: '404',
              description: 'Rota não encontrada',
              example: `{
  "error": "Route not found"
}`
            }
          ],
          curlExample: `curl -X POST ${baseUrl}/webhook/evolution/ce14b012-01df-4ed9-b254-9b218508f6ce \\
  -H "Content-Type: application/json" \\
  -d '{
    "event": "messages.upsert",
    "instance": "my-instance",
    "data": {
      "message": {
        "conversation": "Hello World"
      }
    }
  }'`,
          useCases: [
            {
              title: 'Configurar na Evolution API',
              description: 'Configure esta URL nas settings de webhook da sua instância Evolution API:',
              example: `URL: ${baseUrl}/webhook/evolution/ce14b012-01df-4ed9-b254-9b218508f6ce
Events: Selecione os eventos desejados
Headers: Nenhum header adicional necessário`
            },
            {
              title: 'Integração com N8N',
              description: 'Use o nó HTTP Request do N8N apontando para:',
              example: `URL: ${baseUrl}/webhook/n8n/ce14b012-01df-4ed9-b254-9b218508f6ce
Method: POST
Content-Type: application/json
Body: Seu payload JSON`
            }
          ]
        }
      ]
    }
  };

  const renderEndpoint = (endpoint) => {
    const isExpanded = expandedEndpoints[endpoint.id];
    
    return (
      <div key={endpoint.id} className="border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition-colors">
        <button
          onClick={() => toggleEndpoint(endpoint.id)}
          className="w-full px-6 py-4 bg-white hover:bg-gray-50 flex items-center justify-between transition-colors"
        >
          <div className="flex items-center gap-4">
            <MethodBadge method={endpoint.method} />
            <div className="text-left">
              <code className="text-sm font-mono text-gray-800">{endpoint.path}</code>
              <p className="text-sm text-gray-600 mt-1">{endpoint.summary}</p>
            </div>
          </div>
          {isExpanded ? (
            <ChevronDownIcon className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronRightIcon className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {isExpanded && (
          <div className="border-t border-gray-200 bg-gray-50 p-6 space-y-6">
            {/* Descrição */}
            <div>
              <p className="text-gray-700">{endpoint.description}</p>
            </div>

            {/* Path Parameters */}
            {endpoint.pathParams && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-blue-600">📍</span> Path Parameters
                </h4>
                {Object.entries(endpoint.pathParams).map(([name, param]) => (
                  <Parameter key={name} name={name} {...param} />
                ))}
              </div>
            )}

            {/* Query Parameters */}
            {endpoint.queryParams && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-purple-600">🔍</span> Query Parameters
                </h4>
                {Object.entries(endpoint.queryParams).map(([name, param]) => (
                  <Parameter key={name} name={name} {...param} />
                ))}
              </div>
            )}

            {/* Headers */}
            {endpoint.headers && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-orange-600">📋</span> Headers
                </h4>
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  {endpoint.headers.map((header, idx) => (
                    <div key={idx} className={`flex items-center justify-between p-3 ${idx > 0 ? 'border-t border-gray-200' : ''}`}>
                      <code className="text-sm font-semibold text-gray-800">{header.name}</code>
                      <div className="flex items-center gap-2">
                        <code className="text-sm text-gray-600">{header.value}</code>
                        {header.required && (
                          <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded font-semibold">
                            REQUIRED
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Request Body */}
            {endpoint.body && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-green-600">📦</span> Request Body
                </h4>
                {Object.entries(endpoint.body).map(([name, param]) => (
                  <Parameter key={name} name={name} {...param} />
                ))}
                {endpoint.requestExample && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Exemplo:</p>
                    <CodeBlock id={`${endpoint.id}-request`} code={endpoint.requestExample} />
                  </div>
                )}
              </div>
            )}

            {/* Responses */}
            {endpoint.responses && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-indigo-600">📤</span> Responses
                </h4>
                <div className="space-y-4">
                  {endpoint.responses.map((response, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-white">
                      <div className="flex items-center gap-3 mb-3">
                        <StatusBadge code={response.status} text={response.description} />
                      </div>
                      {response.example && (
                        <CodeBlock id={`${endpoint.id}-response-${response.status}`} code={response.example} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Use Cases */}
            {endpoint.useCases && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <LightBulbIcon className="w-5 h-5 text-yellow-500" />
                  Casos de Uso
                </h4>
                <div className="space-y-3">
                  {endpoint.useCases.map((useCase, idx) => (
                    <div key={idx} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h5 className="font-semibold text-blue-900 mb-2">{useCase.title}</h5>
                      {useCase.description && (
                        <p className="text-sm text-blue-800 mb-2">{useCase.description}</p>
                      )}
                      {useCase.example && (
                        <CodeBlock id={`${endpoint.id}-usecase-${idx}`} code={useCase.example} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* cURL Example */}
            {endpoint.curlExample && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CommandLineIcon className="w-5 h-5 text-gray-600" />
                  Exemplo cURL
                </h4>
                <CodeBlock id={`${endpoint.id}-curl`} language="bash" code={endpoint.curlExample} />
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 -m-6 p-6 min-h-full">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <BookOpenIcon className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Documentação da API
              </h1>
              <p className="text-gray-600 text-lg">
                Evolution Router - Sistema de roteamento inteligente de webhooks
              </p>
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <ShieldCheckIcon className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-blue-900">
                  <strong>v1.0</strong> - Produção
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Base URL */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-start gap-3">
            <CommandLineIcon className="w-6 h-6 text-gray-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">Base URL</h3>
              <div className="flex items-center gap-3">
                <code className="flex-1 bg-gray-900 text-green-400 px-4 py-3 rounded-lg font-mono text-sm">
                  {baseUrl}
                </code>
                <button
                  onClick={() => copyToClipboard(baseUrl, 'base-url')}
                  className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  {copiedText === 'base-url' ? (
                    <CheckIcon className="w-5 h-5 text-green-600" />
                  ) : (
                    <ClipboardIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sections */}
        {Object.entries(apiDocumentation).map(([key, section]) => {
          const isExpanded = expandedSections[key];
          
          return (
            <div key={key} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <button
                onClick={() => toggleSection(key)}
                className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{section.title.split(' ')[0]}</span>
                  <div className="text-left">
                    <h2 className="text-xl font-bold text-gray-900">
                      {section.title.split(' ').slice(1).join(' ')}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronDownIcon className="w-6 h-6 text-gray-400" />
                ) : (
                  <ChevronRightIcon className="w-6 h-6 text-gray-400" />
                )}
              </button>

              {isExpanded && (
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                  {section.content ? (
                    section.content
                  ) : (
                    <div className="space-y-4">
                      {section.endpoints?.map(renderEndpoint)}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Footer */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-gray-600">
              <CodeBracketIcon className="w-5 h-5" />
              <span className="text-sm">
                Documentação gerada automaticamente • Evolution Router v0.1.6
              </span>
            </div>
            <a
              href="https://github.com/EvolutionAPI/evolution-router"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
            >
              <span>GitHub</span>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiDocsPage;
