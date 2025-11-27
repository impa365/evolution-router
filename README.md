# Evolution Router

<p align="center">
  <img src="https://img.shields.io/badge/version-0.1.5--beta-blue" alt="Version">
  <img src="https://img.shields.io/badge/status-beta-yellow" alt="Status">
  <img src="https://img.shields.io/badge/go-1.24-00ADD8?logo=go" alt="Go Version">
  <img src="https://img.shields.io/badge/license-Apache%202.0-green" alt="License">
</p>

**Evolution Router** é um sistema profissional de roteamento e gerenciamento de webhooks desenvolvido em **Go**, projetado especialmente para a **Evolution API Go**, mas totalmente adaptável para uso com qualquer API ou sistema que necessite roteamento inteligente de webhooks.

## 📋 O que é?

Evolution Router é uma solução standalone que atua como um **hub centralizado de webhooks**, permitindo:

- **Receber webhooks** de múltiplas fontes
- **Filtrar eventos** com base em condições customizadas
- **Rotear para múltiplos destinos** simultaneamente
- **Transformar dados** entre origem e destino
- **Retry automático** com backoff exponencial
- **Logs detalhados** de todas as operações
- **Interface de gerenciamento** React moderna

## 🎯 Para que serve?

### Casos de Uso

1. **Evolution API Go (Foco Principal)**
   - Receber eventos de instâncias WhatsApp
   - Filtrar mensagens por tipo, remetente, conteúdo
   - Rotear para diferentes sistemas (CRM, ERP, notificações)
   - Transformar payloads para formatos específicos

2. **Integrações Gerais**
   - Distribuir webhooks de APIs para múltiplos consumidores
   - Aplicar lógica de negócio antes do envio
   - Centralizar logs de todas as integrações
   - Gerenciar retries e falhas

3. **Microserviços**
   - Event routing entre serviços
   - Transformação de eventos
   - Observabilidade de integrações

## ✨ Recursos

### Core
- ⚡️ **Alta Performance**: Processamento concorrente com worker pool
- 🔄 **Retry Inteligente**: Exponential backoff com até 5 tentativas
- 🎯 **Filtros Avançados**: Suporte a múltiplas condições (equals, contains, regex, etc.)
- 🔀 **Roteamento Múltiplo**: Envie para quantos destinos precisar
- 🔧 **Transformação de Dados**: Mapeamento de campos flexível
- 📊 **Logs Detalhados**: Rastreamento completo de todas as operações
- 🔐 **Autenticação**: API Key para proteção dos endpoints

### Interface de Gerenciamento
- 📈 **Dashboard**: Estatísticas em tempo real
- 🗂️ **Gerenciamento de Rotas**: CRUD completo com interface intuitiva
- 🎨 **UI Moderna**: React + Tailwind CSS + Zustand
- 📱 **Responsivo**: Funciona em qualquer dispositivo
- 🔔 **Notificações**: Sistema de alertas em tempo real

## 🚀 Instalação

### Opção 1: Docker (Recomendado)

```bash
docker pull impa365/evolution-router:latest

docker run -d \
  --name evolution-router \
  -p 3001:3001 \
  -e DATABASE_HOST=seu-postgres-host \
  -e DATABASE_PORT=5432 \
  -e DATABASE_USER=postgres \
  -e DATABASE_PASSWORD=sua-senha \
  -e DATABASE_NAME=evolution_router \
  -e API_KEY=sua-api-key-segura \
  -e SERVER_PORT=3001 \
  -e DISPATCHER_WORKERS=10 \
  -e RETRY_MAX_ATTEMPTS=5 \
  impa365/evolution-router:latest
```

### Opção 2: Compilação Manual

#### Requisitos
- Go 1.24+
- PostgreSQL 15+
- Node.js 18+ (para build do frontend)

#### Backend
```bash
# Clone o repositório
git clone https://github.com/EvolutionAPI/evolution-router.git
cd evolution-router

# Configure variáveis de ambiente
cp .env.example .env
# Edite o .env com suas configurações

# Instale dependências
go mod download

# Compile o projeto
go build -o server cmd/evolution-go/main.go

# Execute
./server
```

#### Frontend
```bash
cd manager

# Instale dependências
npm install

# Build para produção
npm run build

# Os arquivos ficarão em dist/
```

## 🔧 Configuração

### Variáveis de Ambiente

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=sua-senha
DATABASE_NAME=evolution_router

# Server
SERVER_PORT=3001
API_KEY=sua-api-key-segura

# Dispatcher
DISPATCHER_WORKERS=10        # Número de workers concorrentes
RETRY_MAX_ATTEMPTS=5         # Tentativas máximas de retry
```

### Primeira Execução

1. O banco de dados será criado automaticamente via migrations
2. Acesse o manager em `http://localhost:3001/manager`
3. Use o `API_KEY` configurado para autenticação

## 📖 Uso

### 1. Criar uma Rota

Acesse o manager e crie uma rota:

```json
{
  "name": "Mensagens WhatsApp",
  "source": "whatsapp",
  "description": "Rota para eventos do WhatsApp",
  "enabled": true
}
```

A URL do webhook será: `http://seu-servidor:3001/webhook/whatsapp/{route_id}`

### 2. Adicionar Destinos (Targets)

```json
{
  "name": "CRM Principal",
  "url": "https://seu-crm.com/api/webhook",
  "method": "POST",
  "headers": {
    "Authorization": "Bearer token-do-crm",
    "Content-Type": "application/json"
  },
  "timeout": 30,
  "enabled": true,
  "priority": 1
}
```

### 3. Configurar Filtros (Opcional)

```json
{
  "type": "payload",
  "field_path": "data.key.remoteJid",
  "condition": "contains",
  "value": "@s.whatsapp.net",
  "enabled": true
}
```

Condições suportadas:
- `equals`: Igualdade exata
- `not_equals`: Diferente de
- `contains`: Contém texto
- `not_contains`: Não contém texto
- `regex`: Expressão regular
- `greater_than`: Maior que (números)
- `less_than`: Menor que (números)

### 4. Mapear Campos (Opcional)

```json
{
  "source_field": "data.key.remoteJid",
  "target_field": "phone",
  "transform_type": "none",
  "enabled": true
}

```

Tipos de transformação:
- `none`: Sem transformação
- `uppercase`: Texto em maiúsculas
- `lowercase`: Texto em minúsculas
- `trim`: Remove espaços
- `base64`: Codifica em base64

## 🔌 API Reference

### Receber Webhook

```http
POST /webhook/:source/:route_id
Content-Type: application/json

{
  "event": "messages.upsert",
  "data": {
    // seu payload aqui
  }
}
```

### Rotas

```http
# Listar rotas
GET /api/v1/routes
X-API-Key: sua-api-key

# Criar rota
POST /api/v1/routes
X-API-Key: sua-api-key
Content-Type: application/json

{
  "name": "Nome da Rota",
  "source": "origem",
  "description": "Descrição",
  "enabled": true
}

# Atualizar rota
PUT /api/v1/routes/:id
X-API-Key: sua-api-key

# Deletar rota
DELETE /api/v1/routes/:id
X-API-Key: sua-api-key
```

### Destinos (Targets)

```http
# Listar destinos de uma rota
GET /api/v1/routes/:id/targets
X-API-Key: sua-api-key

# Criar destino
POST /api/v1/routes/:id/targets
X-API-Key: sua-api-key

# Atualizar destino
PUT /api/v1/targets/:id
X-API-Key: sua-api-key

# Deletar destino
DELETE /api/v1/targets/:id
X-API-Key: sua-api-key
```

### Logs

```http
# Listar logs
GET /api/v1/logs?limit=50&offset=0&route_id=uuid&source=origem&status=success
X-API-Key: sua-api-key

# Ver log específico
GET /api/v1/logs/:id
X-API-Key: sua-api-key

# Estatísticas
GET /api/v1/stats
X-API-Key: sua-api-key
```

## 🏗️ Arquitetura

```
┌─────────────────┐
│  Webhook Source │
│  (Evolution API)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Evolution Router│
│  (Receiver)     │
└────────┬────────┘
         │
    ┌────┴────┐
    │ Filters │
    └────┬────┘
         │
    ┌────┴────┐
    │  Queue  │
    └────┬────┘
         │
  ┌──────┴──────┐
  │ Worker Pool │
  └──────┬──────┘
         │
    ┌────┴─────┐
    │ Transform│
    └────┬─────┘
         │
┌────────┴────────┐
│   Dispatcher    │
│ (Send to Targets)│
└────────┬────────┘
         │
    ┌────┴────┐
    │  Retry  │
    └────┬────┘
         │
    ┌────┴────┐
    │  Logs   │
    └─────────┘
```

### Componentes

1. **Receiver**: Recebe webhooks e valida source/route
2. **Filters**: Aplica condições configuradas
3. **Queue**: Fila em memória para processamento assíncrono
4. **Worker Pool**: Pool de workers concorrentes (padrão: 10)
5. **Transform**: Aplica transformações de campo
6. **Dispatcher**: Envia para targets em paralelo
7. **Retry**: Sistema de retry com exponential backoff
8. **Logs**: Armazenamento de todos os eventos

### Banco de Dados

PostgreSQL com 6 tabelas principais:

- `routes`: Rotas de webhook
- `targets`: Destinos para envio
- `filters`: Condições de filtragem
- `field_mappings`: Mapeamento de campos
- `webhook_logs`: Logs de processamento
- `retry_logs`: Logs de tentativas

## 📊 Performance

- **Processamento Concorrente**: Worker pool configurável
- **Retry Inteligente**: Backoff exponencial (1s, 2s, 4s, 8s, 16s)
- **Timeout Configurável**: Por target (padrão: 30s)
- **Logs Otimizados**: Índices em campos críticos

## 🗺️ Roadmap

### v0.2.0
- [ ] Rate limiting por rota
- [ ] Webhooks assíncronos (callbacks)
- [ ] Métricas com Prometheus
- [ ] Dashboard de observabilidade

### v0.3.0
- [ ] Suporte a templates de transformação
- [ ] Editor visual de filtros
- [ ] Testes A/B de rotas
- [ ] Replay de webhooks

### v1.0.0
- [ ] Cluster mode com Redis
- [ ] Dead letter queue
- [ ] Circuit breaker
- [ ] API GraphQL

## 📄 Licença

Este projeto está licenciado sob a Apache License 2.0 - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'feat: Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 💬 Suporte

- 📧 Email: suporte@impa365.com
- 💬 Comunidade: [IMPA365 Community](https://comunidade.impa365.com)
- 📖 Documentação: Em breve

## 🙏 Agradecimentos

Desenvolvido com ❤️ pela equipe [IMPA365](https://github.com/impa365)

---

<p align="center">
  <strong>Evolution Router</strong> - Roteamento inteligente de webhooks para Evolution API Go e além
</p>
