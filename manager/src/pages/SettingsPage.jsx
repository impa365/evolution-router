import { useState } from 'react';
import { Card, Input, Button } from '../components/ui';
import { useAuthStore } from '../store';
import { Key, Server, Shield, Bell } from 'lucide-react';
import toast from 'react-hot-toast';

export function SettingsPage() {
  const { apiKey, logout } = useAuthStore();
  const [newApiKey, setNewApiKey] = useState('');

  const handleUpdateApiKey = () => {
    if (!newApiKey.trim()) {
      toast.error('Digite uma API Key válida');
      return;
    }
    
    logout();
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600 mt-2">
          Gerencie as configurações do Evolution Router Manager
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Key */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Key className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">API Key</h3>
              <p className="text-sm text-gray-600">Chave de autenticação</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key Atual
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  value={apiKey}
                  readOnly
                  className="input flex-1"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-3">
                Para alterar a API Key, faça logout e entre novamente com a nova chave.
              </p>
              <Button variant="danger" onClick={logout}>
                Fazer Logout
              </Button>
            </div>
          </div>
        </Card>

        {/* Server Info */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Server className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Servidor</h3>
              <p className="text-sm text-gray-600">Informações do backend</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">URL Base</p>
              <p className="font-mono text-sm text-gray-900">{window.location.origin}/api/v1</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Webhook Endpoint</p>
              <p className="font-mono text-sm text-gray-900">{window.location.origin}/webhook</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <span className="badge badge-success">Conectado</span>
            </div>
          </div>
        </Card>

        {/* Security */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Shield className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Segurança</h3>
              <p className="text-sm text-gray-600">Configurações de segurança</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Autenticação API</p>
                <p className="text-sm text-gray-500">Requer X-API-Key header</p>
              </div>
              <span className="badge badge-success">Ativo</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">HTTPS</p>
                <p className="text-sm text-gray-500">Conexão segura</p>
              </div>
              <span className="badge badge-success">Ativo</span>
            </div>
          </div>
        </Card>

        {/* About */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Bell className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Sobre</h3>
              <p className="text-sm text-gray-600">Informações do sistema</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Versão</p>
              <p className="font-semibold text-gray-900">1.0.0</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Produto</p>
              <p className="font-semibold text-gray-900">Evolution Router Manager</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Desenvolvido por</p>
              <p className="font-semibold text-gray-900">Evolution API Team</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Documentation */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Documentação e Links Úteis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/manager/api-docs"
            className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <p className="font-medium text-gray-900 mb-1">API Documentation</p>
            <p className="text-sm text-gray-600">Veja a documentação completa da API</p>
          </a>
          <a
            href="https://github.com/impa365/evolution-router"
            target="_blank"
            className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <p className="font-medium text-gray-900 mb-1">GitHub</p>
            <p className="text-sm text-gray-600">Acesse o código fonte</p>
          </a>
          <a
            href="https://evolution-api.com"
            target="_blank"
            className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <p className="font-medium text-gray-900 mb-1">Evolution API</p>
            <p className="text-sm text-gray-600">Saiba mais sobre a Evolution API</p>
          </a>
        </div>
      </Card>
    </div>
  );
}
