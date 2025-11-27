import { useState, useEffect } from 'react';
import { Modal, Input, Select, Button, Textarea } from '../ui';
import { useRoutesStore } from '../../store';
import toast from 'react-hot-toast';

const SOURCE_OPTIONS = [
  { value: 'evolution-api', label: 'Evolution API' },
  { value: 'n8n', label: 'N8N' },
  { value: 'zapier', label: 'Zapier' },
  { value: 'make', label: 'Make (Integromat)' },
  { value: 'custom', label: 'Custom' },
];

export function RouteModal({ isOpen, onClose, route }) {
  const { createRoute, updateRoute } = useRoutesStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    source: 'evolution-api',
    enabled: true,
  });

  useEffect(() => {
    if (route) {
      setFormData({
        name: route.name || '',
        description: route.description || '',
        source: route.source || 'evolution-api',
        enabled: route.enabled ?? true,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        source: 'evolution-api',
        enabled: true,
      });
    }
  }, [route, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (route) {
        await updateRoute(route.id, formData);
        toast.success('Rota atualizada com sucesso!');
      } else {
        await createRoute(formData);
        toast.success('Rota criada com sucesso!');
      }
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao salvar rota');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={route ? 'Editar Rota' : 'Nova Rota'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <Input
          label="Nome da Rota"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Ex: Mensagens para CRM"
          required
        />

        <Textarea
          label="Descrição"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Descreva o propósito desta rota..."
        />

        <Select
          label="Origem (Source)"
          name="source"
          value={formData.source}
          onChange={handleChange}
          options={SOURCE_OPTIONS}
        />

        <div className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            id="enabled"
            name="enabled"
            checked={formData.enabled}
            onChange={handleChange}
            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <label htmlFor="enabled" className="text-sm font-medium text-gray-700">
            Rota ativa
          </label>
        </div>

        {!route && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              Após criar a rota, você poderá adicionar targets, filtros e mapeamentos de campos.
            </p>
          </div>
        )}
      </form>
    </Modal>
  );
}
