# 🎯 Guia de Uso - Evolution Router

## 📖 Índice

1. [Instalação](#instalação)
2. [Configuração Básica](#configuração-básica)
3. [Criando sua Primeira Rota](#criando-sua-primeira-rota)
4. [Integrando com Evolution API](#integrando-com-evolution-api)
5. [Exemplos Práticos](#exemplos-práticos)
6. [Troubleshooting](#troubleshooting)

---

## 🚀 Instalação

### Opção 1: Docker Compose (Recomendado)

```bash
cd evolution-router
cp .env.example .env
# Editar .env com suas configurações
docker-compose up -d
```

### Opção 2: Docker Compose com Evolution API

```bash
cd evolution-router
cp .env.example .env
# Editar .env com suas configurações
docker-compose -f docker-compose.full.yml up -d
```

### Opção 3: Desenvolvimento Local

```bash
cd evolution-router
cp .env.example .env
go mod download
go run cmd/router/main.go
```

---

## ⚙️ Configuração Básica

### 1. Configure suas variáveis de ambiente

Edite o arquivo `.env`:

```env
# Porta do servidor
SERVER_PORT=3000

# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=router
POSTGRES_PASSWORD=router123
POSTGRES_DB=evolution_router

# Chave de API (IMPORTANTE: Mude isso!)
API_KEY=sua-chave-super-segura-aqui
```

### 2. Teste se está funcionando

```bash
curl http://localhost:3000/health
```

Resposta esperada:
```json
{"status":"ok"}
```

---

## 🎨 Criando sua Primeira Rota

### Passo 1: Criar a Rota

```bash
curl -X POST http://localhost:3000/api/v1/routes \
  -H "X-API-Key: sua-chave-super-segura-aqui" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mensagens para CRM",
    "description": "Roteia mensagens da Evolution API para o CRM",
    "source": "evolution-api",
    "enabled": true
  }'
```

Resposta:
```json
{
  "id": "abc-123-def-456",
  "name": "Mensagens para CRM",
  "description": "Roteia mensagens da Evolution API para o CRM",
  "source": "evolution-api",
  "enabled": true,
  "created_at": "2025-11-27T10:00:00Z"
}
```

**Guarde o `id` retornado!** Você vai precisar dele.

---

### Passo 2: Adicionar um Destino (Target)

```bash
curl -X POST http://localhost:3000/api/v1/routes/abc-123-def-456/targets \
  -H "X-API-Key: sua-chave-super-segura-aqui" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "CRM Principal",
    "url": "https://seu-crm.com/webhook",
    "method": "POST",
    "headers": {
      "Authorization": "Bearer token-do-crm",
      "Content-Type": "application/json"
    },
    "enabled": true,
    "timeout": 30
  }'
```

---

### Passo 3: Adicionar Filtros (Opcional)

Filtrar apenas mensagens de texto:

```bash
curl -X POST http://localhost:3000/api/v1/routes/abc-123-def-456/filters \
  -H "X-API-Key: sua-chave-super-segura-aqui" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "event_type",
    "condition": "equals",
    "value": "messages.upsert",
    "enabled": true
  }'
```

Filtrar mensagens que contém "pedido":

```bash
curl -X POST http://localhost:3000/api/v1/routes/abc-123-def-456/filters \
  -H "X-API-Key: sua-chave-super-segura-aqui" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "field_value",
    "field_path": "data.message.text",
    "condition": "contains",
    "value": "pedido",
    "enabled": true
  }'
```

---

### Passo 4: Configurar Transformação de Campos (Opcional)

Mapear campos específicos para enviar ao destino:

```bash
curl -X POST http://localhost:3000/api/v1/routes/abc-123-def-456/field-mappings \
  -H "X-API-Key: sua-chave-super-segura-aqui" \
  -H "Content-Type: application/json" \
  -d '{
    "source_field": "data.message.text",
    "target_field": "mensagem",
    "transform_type": "direct",
    "enabled": true
  }'
```

---

## 🔗 Integrando com Evolution API

### 1. Configure o Webhook na Evolution API

Na Evolution API, configure a variável de ambiente:

```env
WEBHOOK_URL=http://evolution-router:3000/webhook/evolution/abc-123-def-456
```

**Substitua `abc-123-def-456` pelo ID da sua rota!**

### 2. Ou via API da Evolution

```bash
curl -X POST https://sua-evolution-api.com/instance/create \
  -H "apikey: sua-key-evolution" \
  -H "Content-Type: application/json" \
  -d '{
    "instanceName": "minhaInstancia",
    "webhook": {
      "url": "http://evolution-router:3000/webhook/evolution/abc-123-def-456",
      "webhook_by_events": false
    }
  }'
```

---

## 💡 Exemplos Práticos

### Exemplo 1: Enviar mensagens para múltiplos CRMs

1. Crie uma rota
2. Adicione múltiplos targets (um para cada CRM)
3. Configure filtros se necessário

```bash
# Target 1 - CRM A
curl -X POST http://localhost:3000/api/v1/routes/abc-123/targets \
  -H "X-API-Key: sua-key" \
  -H "Content-Type: application/json" \
  -d '{"name": "CRM A", "url": "https://crm-a.com/webhook", "enabled": true}'

# Target 2 - CRM B  
curl -X POST http://localhost:3000/api/v1/routes/abc-123/targets \
  -H "X-API-Key: sua-key" \
  -H "Content-Type: application/json" \
  -d '{"name": "CRM B", "url": "https://crm-b.com/webhook", "enabled": true}'
```

---

### Exemplo 2: Filtrar por número de telefone específico

```bash
curl -X POST http://localhost:3000/api/v1/routes/abc-123/filters \
  -H "X-API-Key: sua-key" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "field_value",
    "field_path": "data.message.key.remoteJid",
    "condition": "starts_with",
    "value": "5511",
    "enabled": true
  }'
```

---

### Exemplo 3: Enviar apenas campos específicos

```bash
# Mapear apenas o texto da mensagem
curl -X POST http://localhost:3000/api/v1/routes/abc-123/field-mappings \
  -H "X-API-Key: sua-key" \
  -H "Content-Type: application/json" \
  -d '{
    "source_field": "data.message.text",
    "target_field": "message",
    "transform_type": "direct"
  }'

# Mapear o remetente
curl -X POST http://localhost:3000/api/v1/routes/abc-123/field-mappings \
  -H "X-API-Key: sua-key" \
  -H "Content-Type: application/json" \
  -d '{
    "source_field": "data.message.key.remoteJid",
    "target_field": "from",
    "transform_type": "direct"
  }'
```

---

## 📊 Monitoramento

### Ver logs de webhooks recebidos

```bash
curl http://localhost:3000/api/v1/logs \
  -H "X-API-Key: sua-key"
```

### Ver estatísticas

```bash
curl http://localhost:3000/api/v1/stats \
  -H "X-API-Key: sua-key"
```

### Filtrar logs por rota

```bash
curl "http://localhost:3000/api/v1/logs?route_id=abc-123&limit=10" \
  -H "X-API-Key: sua-key"
```

---

## 🔧 Troubleshooting

### Webhook não está chegando

1. Verifique se a rota está habilitada:
```bash
curl http://localhost:3000/api/v1/routes/abc-123 -H "X-API-Key: sua-key"
```

2. Verifique os logs:
```bash
docker-compose logs -f evolution-router
```

### Webhook não está sendo enviado para o destino

1. Verifique se o target está habilitado
2. Teste o endpoint manualmente:
```bash
curl -X POST https://seu-destino.com/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "message"}'
```

3. Verifique os logs de retry:
```bash
curl http://localhost:3000/api/v1/logs/log-id -H "X-API-Key: sua-key"
```

### Filtros não estão funcionando

1. Revise a estrutura do payload que você está recebendo
2. Use o endpoint de logs para ver o `raw_payload`
3. Ajuste o `field_path` conforme necessário

---

## 🎓 Conceitos Importantes

### Condições de Filtro Disponíveis

- `equals`: Valor exato
- `not_equals`: Diferente de
- `contains`: Contém o texto
- `not_contains`: Não contém
- `starts_with`: Começa com
- `ends_with`: Termina com
- `regex`: Expressão regular
- `exists`: Campo existe
- `not_exists`: Campo não existe
- `gt`: Maior que (numérico)
- `lt`: Menor que (numérico)
- `gte`: Maior ou igual
- `lte`: Menor ou igual

### Tipos de Transformação

- `direct`: Cópia direta do valor
- `uppercase`: Converte para maiúsculo
- `lowercase`: Converte para minúsculo
- `trim`: Remove espaços extras
- `json_encode`: Converte para JSON string
- `json_decode`: Converte de JSON string

---

## 🤝 Suporte

Encontrou algum problema? Abra uma issue no GitHub ou consulte a documentação completa no README.md

**Próximo passo**: Explore os exemplos avançados e personalize seu roteamento! 🚀
