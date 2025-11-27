import { useState, useEffect } from 'react';
import { Modal, Input, Select, Button } from '../ui';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const TYPE_OPTIONS = [
  { value: 'event_type', label: 'Tipo de Evento' },
  { value: 'field_value', label: 'Valor de Campo' },
  { value: 'custom', label: 'Customizado' },
];

const CONDITION_OPTIONS = [
  { value: 'equals', label: 'Igual a (=)' },
  { value: 'not_equals', label: 'Diferente de (≠)' },
  { value: 'contains', label: 'Contém' },
  { value: 'not_contains', label: 'Não contém' },
  { value: 'starts_with', label: 'Começa com' },
  { value: 'ends_with', label: 'Termina com' },
  { value: 'regex', label: 'Expressão Regular' },
  { value: 'exists', label: 'Existe' },
  { value: 'not_exists', label: 'Não existe' },
  { value: 'gt', label: 'Maior que (>)' },
  { value: 'lt', label: 'Menor que (<)' },
  { value: 'gte', label: 'Maior ou igual (≥)' },
  { value: 'lte', label: 'Menor ou igual (≤)' },
];

export function FilterModal({ isOpen, onClose, routeId, filter }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'event_type',
    field_path: '',
    condition: 'equals',
    value: '',
    enabled: true,
  });

  useEffect(() => {
    if (filter) {
      setFormData({
        type: filter.type || 'event_type',
        field_path: filter.field_path || '',
        condition: filter.condition || 'equals',
        value: filter.value || '',
        enabled: filter.enabled ?? true,
      });
    } else {
      setFormData({
        type: 'event_type',
        field_path: '',
        condition: 'equals',
        value: '',
        enabled: true,
      });
    }
  }, [filter, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (filter) {
        await api.put(`/filters/${filter.id}`, formData);
        toast.success('Filtro atualizado com sucesso!');
      } else {
        await api.post(`/routes/${routeId}/filters`, formData);
        toast.success('Filtro criado com sucesso!');
      }
      
      onClose();
      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao salvar filtro');
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
      title={filter ? 'Editar Filtro' : 'Novo Filtro'}
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
        <Select
          label="Tipo de Filtro"
          name="type"
          value={formData.type}
          onChange={handleChange}
          options={TYPE_OPTIONS}
        />

        {formData.type === 'field_value' && (
          <Input
            label="Caminho do Campo"
            name="field_path"
            value={formData.field_path}
            onChange={handleChange}
            placeholder="Ex: data.message.text"
            required
          />
        )}

        <Select
          label="Condição"
          name="condition"
          value={formData.condition}
          onChange={handleChange}
          options={CONDITION_OPTIONS}
        />

        <Input
          label="Valor"
          name="value"
          value={formData.value}
          onChange={handleChange}
          placeholder="Valor para comparação"
          required={formData.condition !== 'exists' && formData.condition !== 'not_exists'}
        />

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="enabled"
            name="enabled"
            checked={formData.enabled}
            onChange={handleChange}
            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <label htmlFor="enabled" className="text-sm font-medium text-gray-700">
            Filtro ativo
          </label>
        </div>

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 font-medium mb-2">Exemplos:</p>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• <strong>Event Type:</strong> messages.upsert</li>
            <li>• <strong>Field Path:</strong> data.message.key.remoteJid</li>
            <li>• <strong>Regex:</strong> ^55\d{'{10,11}'}@s.whatsapp.net$</li>
          </ul>
        </div>
      </form>
    </Modal>
  );
}
