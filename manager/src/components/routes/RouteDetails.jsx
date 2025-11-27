import { useState } from 'react';
import { Modal, Button, Badge, Card } from '../ui';
import { Target, Filter, FileJson, Plus, Edit, Trash2, Play } from 'lucide-react';
import { TargetModal } from '../modals/TargetModal';
import { FilterModal } from '../modals/FilterModal';
import { FieldMappingModal } from '../modals/FieldMappingModal';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export function RouteDetails({ isOpen, onClose, route }) {
  const [activeTab, setActiveTab] = useState('targets');
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isFieldMappingModalOpen, setIsFieldMappingModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const tabs = [
    { id: 'targets', label: 'Destinos (Targets)', icon: Target },
    { id: 'filters', label: 'Filtros', icon: Filter },
    { id: 'mappings', label: 'Mapeamentos', icon: FileJson },
  ];

  const handleDelete = async (type, id) => {
    if (!confirm('Tem certeza que deseja deletar?')) return;

    try {
      await api.delete(`/${type}/${id}`);
      toast.success('Deletado com sucesso!');
      window.location.reload(); // Recarregar para atualizar
    } catch (error) {
      toast.error('Erro ao deletar');
    }
  };

  const handleTest = async () => {
    try {
      const testPayload = {
        event: 'test.event',
        data: {
          message: 'Teste de webhook',
          timestamp: new Date().toISOString(),
        },
      };

      await api.post(`/webhook/${route.source}/${route.id}`, testPayload);
      toast.success('Webhook de teste enviado!');
    } catch (error) {
      toast.error('Erro ao enviar teste');
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={route.name}
        footer={
          <>
            <Button variant="secondary" onClick={onClose}>
              Fechar
            </Button>
            <Button onClick={handleTest}>
              <Play className="w-4 h-4 mr-2" />
              Testar Webhook
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          {/* Info */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={route.enabled ? 'success' : 'danger'}>
                {route.enabled ? 'Ativa' : 'Inativa'}
              </Badge>
              <Badge variant="info">{route.source}</Badge>
            </div>
            {route.description && (
              <p className="text-gray-600">{route.description}</p>
            )}
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex gap-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Targets Tab */}
          {activeTab === 'targets' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-gray-900">Destinos Configurados</h4>
                <Button size="sm" onClick={() => setIsTargetModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar
                </Button>
              </div>
              <div className="space-y-3">
                {route.targets?.map((target) => (
                  <div key={target.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-medium text-gray-900">{target.name}</h5>
                          <Badge variant={target.enabled ? 'success' : 'danger'}>
                            {target.enabled ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 break-all">{target.url}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Método: {target.method} | Timeout: {target.timeout}s
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedItem(target);
                            setIsTargetModalOpen(true);
                          }}
                          className="p-1 text-gray-600 hover:text-gray-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete('targets', target.id)}
                          className="p-1 text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {(!route.targets || route.targets.length === 0) && (
                  <p className="text-center text-gray-500 py-8">
                    Nenhum destino configurado
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Filters Tab */}
          {activeTab === 'filters' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-gray-900">Filtros Configurados</h4>
                <Button size="sm" onClick={() => setIsFilterModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar
                </Button>
              </div>
              <div className="space-y-3">
                {route.filters?.map((filter) => (
                  <div key={filter.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="info">{filter.type}</Badge>
                          <Badge variant="warning">{filter.condition}</Badge>
                          {!filter.enabled && <Badge variant="danger">Inativo</Badge>}
                        </div>
                        {filter.field_path && (
                          <p className="text-sm text-gray-600">Campo: {filter.field_path}</p>
                        )}
                        <p className="text-sm text-gray-600">Valor: {filter.value}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedItem(filter);
                            setIsFilterModalOpen(true);
                          }}
                          className="p-1 text-gray-600 hover:text-gray-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete('filters', filter.id)}
                          className="p-1 text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {(!route.filters || route.filters.length === 0) && (
                  <p className="text-center text-gray-500 py-8">
                    Nenhum filtro configurado
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Field Mappings Tab */}
          {activeTab === 'mappings' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-gray-900">Mapeamentos de Campos</h4>
                <Button size="sm" onClick={() => setIsFieldMappingModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar
                </Button>
              </div>
              <div className="space-y-3">
                {route.field_mappings?.map((mapping) => (
                  <div key={mapping.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="info">{mapping.transform_type}</Badge>
                          {!mapping.enabled && <Badge variant="danger">Inativo</Badge>}
                        </div>
                        <div className="text-sm space-y-1">
                          <p className="text-gray-600">
                            <span className="font-medium">De:</span> {mapping.source_field}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-medium">Para:</span> {mapping.target_field}
                          </p>
                          {mapping.default_value && (
                            <p className="text-gray-600">
                              <span className="font-medium">Padrão:</span> {mapping.default_value}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedItem(mapping);
                            setIsFieldMappingModalOpen(true);
                          }}
                          className="p-1 text-gray-600 hover:text-gray-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete('field-mappings', mapping.id)}
                          className="p-1 text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {(!route.field_mappings || route.field_mappings.length === 0) && (
                  <p className="text-center text-gray-500 py-8">
                    Nenhum mapeamento configurado
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Sub-modals */}
      <TargetModal
        isOpen={isTargetModalOpen}
        onClose={() => {
          setIsTargetModalOpen(false);
          setSelectedItem(null);
        }}
        routeId={route.id}
        target={selectedItem}
      />

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => {
          setIsFilterModalOpen(false);
          setSelectedItem(null);
        }}
        routeId={route.id}
        filter={selectedItem}
      />

      <FieldMappingModal
        isOpen={isFieldMappingModalOpen}
        onClose={() => {
          setIsFieldMappingModalOpen(false);
          setSelectedItem(null);
        }}
        routeId={route.id}
        mapping={selectedItem}
      />
    </>
  );
}
