import { useState, useEffect } from 'react';
import { Modal, Input, Select, Button, Textarea } from '../ui';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const METHOD_OPTIONS = [
  { value: 'POST', label: 'POST' },
  { value: 'PUT', label: 'PUT' },
  { value: 'PATCH', label: 'PATCH' },
];

export function TargetModal({ isOpen, onClose, routeId, target }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    method: 'POST',
    headers: '{}',
    enabled: true,
    timeout: 30,
  });

  useEffect(() => {
    if (target) {
      setFormData({
        name: target.name || '',
        url: target.url || '',
        method: target.method || 'POST',
        headers: JSON.stringify(target.headers || {}, null, 2),
        enabled: target.enabled ?? true,
        timeout: target.timeout || 30,
      });
    } else {
      setFormData({
        name: '',
        url: '',
        method: 'POST',
        headers: '{}',
        enabled: true,
        timeout: 30,
      });
    }
  }, [target, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Parse headers JSON
      let headers;
      try {
        headers = JSON.parse(formData.headers);
      } catch (e) {
        toast.error('Headers inválidos. Deve ser um JSON válido.');
        setLoading(false);
        return;
      }

      const payload = {
        ...formData,
        headers,
        timeout: parseInt(formData.timeout),
      };

      if (target) {
        await api.put(`/targets/${target.id}`, payload);
        toast.success('Target atualizado com sucesso!');
      } else {
        await api.post(`/routes/${routeId}/targets`, payload);
        toast.success('Target criado com sucesso!');
      }
      
      onClose();
      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao salvar target');
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
      title={target ? 'Editar Target' : 'Novo Target'}
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
          label="Nome do Target"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Ex: CRM Principal"
          required
        />

        <Input
          label="URL"
          name="url"
          type="url"
          value={formData.url}
          onChange={handleChange}
          placeholder="https://seu-destino.com/webhook"
          required
        />

        <Select
          label="Método HTTP"
          name="method"
          value={formData.method}
          onChange={handleChange}
          options={METHOD_OPTIONS}
        />

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Headers (JSON)
          </label>
          <textarea
            name="headers"
            value={formData.headers}
            onChange={handleChange}
            className="input font-mono text-sm"
            rows={6}
            placeholder={`{\n  "Authorization": "Bearer token",\n  "Content-Type": "application/json"\n}`}
          />
          <p className="text-xs text-gray-500 mt-1">
            Adicione headers customizados no formato JSON
          </p>
        </div>

        <Input
          label="Timeout (segundos)"
          name="timeout"
          type="number"
          value={formData.timeout}
          onChange={handleChange}
          min="1"
          max="300"
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
            Target ativo
          </label>
        </div>
      </form>
    </Modal>
  );
}
