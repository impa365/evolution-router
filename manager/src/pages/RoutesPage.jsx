import { useEffect, useState } from 'react';
import { useRoutesStore } from '../store';
import { Card, Button, Modal, Input, Select, Badge, EmptyState, Loading } from '../components/ui';
import { Plus, Edit, Trash2, Route as RouteIcon, Target, Filter, FileJson, Copy, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { RouteModal } from '../components/modals/RouteModal';
import { RouteDetails } from '../components/routes/RouteDetails';

export function RoutesPage() {
  const { routes, loading, fetchRoutes, deleteRoute } = useRoutesStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`Tem certeza que deseja deletar a rota "${name}"?`)) {
      return;
    }

    try {
      await deleteRoute(id);
      toast.success('Rota deletada com sucesso!');
    } catch (error) {
      toast.error('Erro ao deletar rota');
    }
  };

  const handleEdit = (route) => {
    setSelectedRoute(route);
    setIsCreateModalOpen(true);
  };

  const handleViewDetails = (route) => {
    setSelectedRoute(route);
    setIsDetailsOpen(true);
  };

  const copyWebhookUrl = (route) => {
    const url = `${window.location.origin}/webhook/${route.source}/${route.id}`;
    navigator.clipboard.writeText(url);
    toast.success('URL copiada para a área de transferência!');
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rotas de Webhook</h1>
          <p className="text-gray-600 mt-2">
            Gerencie suas rotas e configure o roteamento de webhooks
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Nova Rota
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <RouteIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Rotas</p>
              <p className="text-2xl font-bold text-gray-900">{routes.length}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Rotas Ativas</p>
              <p className="text-2xl font-bold text-gray-900">
                {routes.filter((r) => r.enabled).length}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Filter className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Filtros</p>
              <p className="text-2xl font-bold text-gray-900">
                {routes.reduce((sum, r) => sum + (r.filters?.length || 0), 0)}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Targets</p>
              <p className="text-2xl font-bold text-gray-900">
                {routes.reduce((sum, r) => sum + (r.targets?.length || 0), 0)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Routes List */}
      {routes.length === 0 ? (
        <Card>
          <EmptyState
            icon={RouteIcon}
            title="Nenhuma rota cadastrada"
            description="Crie sua primeira rota para começar a rotear webhooks"
            action={
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="w-5 h-5 mr-2" />
                Criar Primeira Rota
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {routes.map((route) => (
            <Card key={route.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {route.name}
                    </h3>
                    <Badge variant={route.enabled ? 'success' : 'danger'}>
                      {route.enabled ? 'Ativa' : 'Inativa'}
                    </Badge>
                    <Badge variant="info">{route.source}</Badge>
                  </div>
                  {route.description && (
                    <p className="text-gray-600 mb-3">{route.description}</p>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-2 rounded-lg">
                    <span className="font-mono text-xs">
                      {window.location.origin}/webhook/{route.source}/{route.id}
                    </span>
                    <button
                      onClick={() => copyWebhookUrl(route)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                      title="Copiar URL"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => handleViewDetails(route)}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => handleEdit(route)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(route.id, route.name)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Targets</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {route.targets?.length || 0}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-xs text-gray-500">Filtros</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {route.filters?.length || 0}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FileJson className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-500">Mapeamentos</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {route.field_mappings?.length || 0}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      <RouteModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setSelectedRoute(null);
        }}
        route={selectedRoute}
      />

      {selectedRoute && (
        <RouteDetails
          isOpen={isDetailsOpen}
          onClose={() => {
            setIsDetailsOpen(false);
            setSelectedRoute(null);
          }}
          route={selectedRoute}
        />
      )}
    </div>
  );
}
