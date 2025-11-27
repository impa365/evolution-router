import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Route as RouteIcon, Lock } from 'lucide-react';
import { useAuthStore } from '../store';
import { Button, Input, Card } from '../components/ui';
import toast from 'react-hot-toast';

export function LoginPage() {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      toast.error('Por favor, insira a API Key');
      return;
    }

    setLoading(true);
    
    try {
      // Simular validação (o backend validará na primeira request)
      login(apiKey);
      toast.success('Login realizado com sucesso!');
      navigate('/');
    } catch (error) {
      toast.error('Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mb-4">
            <RouteIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Evolution Router Manager
          </h1>
          <p className="text-gray-600">
            Gerencie seus webhooks de forma inteligente
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Input
            label="API Key"
            type="password"
            placeholder="Digite sua API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="mb-6"
            autoFocus
          />

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Entrando...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Lock className="w-5 h-5" />
                Entrar
              </div>
            )}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Dica:</strong> A API Key está configurada no arquivo{' '}
            <code className="bg-blue-100 px-1 rounded">.env</code> do Evolution Router.
          </p>
        </div>
      </Card>
    </div>
  );
}
