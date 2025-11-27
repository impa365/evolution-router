import { useState, useEffect } from 'react';
import { Modal, Input, Select, Button } from '../ui';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const TRANSFORM_OPTIONS = [
  { value: 'direct', label: 'Direto (sem transformação)' },
  { value: 'uppercase', label: 'MAIÚSCULO' },
  { value: 'lowercase', label: 'minúsculo' },
  { value: 'trim', label: 'Remover espaços' },
  { value: 'json_encode', label: 'Codificar JSON' },
  { value: 'json_decode', label: 'Decodificar JSON' },
];

export function FieldMappingModal({ isOpen, onClose, routeId, mapping }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    source_field: '',
    target_field: '',
    transform_type: 'direct',
    default_value: '',
    enabled: true,
  });

  useEffect(() => {
    if (mapping) {
      setFormData({
        source_field: mapping.source_field || '',
        target_field: mapping.target_field || '',
        transform_type: mapping.transform_type || 'direct',
        default_value: mapping.default_value || '',
        enabled: mapping.enabled ?? true,
      });
    } else {
      setFormData({
        source_field: '',
        target_field: '',
        transform_type: 'direct',
        default_value: '',
        enabled: true,
      });
    }
  }, [mapping, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mapping) {
        await api.put(`/field-mappings/${mapping.id}`, formData);
        toast.success('Mapeamento atualizado com sucesso!');
      } else {
        await api.post(`/routes/${routeId}/field-mappings`, formData);
        toast.success('Mapeamento criado com sucesso!');
      }
      
      onClose();
      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao salvar mapeamento');
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
      title={mapping ? 'Editar Mapeamento' : 'Novo Mapeamento'}
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
          label="Campo de Origem"
          name="source_field"
          value={formData.source_field}
          onChange={handleChange}
          placeholder="Ex: data.message.text"
          required
        />

        <Input
          label="Campo de Destino"
          name="target_field"
          value={formData.target_field}
          onChange={handleChange}
          placeholder="Ex: message"
          required
        />

        <Select
          label="Tipo de Transformação"
          name="transform_type"
          value={formData.transform_type}
          onChange={handleChange}
          options={TRANSFORM_OPTIONS}
        />

        <Input
          label="Valor Padrão (opcional)"
          name="default_value"
          value={formData.default_value}
          onChange={handleChange}
          placeholder="Valor se o campo não existir"
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
            Mapeamento ativo
          </label>
        </div>

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 font-medium mb-2">Exemplo:</p>
          <div className="text-xs text-blue-700 space-y-1">
            <p>• <strong>Origem:</strong> data.message.text</p>
            <p>• <strong>Destino:</strong> content.message</p>
            <p>• <strong>Resultado:</strong> {'{'}content: {'{'}message: "texto da mensagem"{'}'}{'}'}</p>
          </div>
        </div>
      </form>
    </Modal>
  );
}
