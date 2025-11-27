# 🎨 Evolution Router Manager

Interface web moderna e profissional para gerenciar o Evolution Router.

## ✨ Funcionalidades

- 🎯 **Dashboard Completo** - Visão geral com gráficos e estatísticas em tempo real
- 🔀 **Gerenciamento de Rotas** - CRUD completo de rotas de webhook
- 🎯 **Targets (Destinos)** - Configure múltiplos destinos para cada rota
- 🎨 **Filtros Avançados** - Sistema completo de filtros com 12+ condições
- 📊 **Field Mappings** - Transforme e mapeie campos antes de enviar
- 📈 **Logs Detalhados** - Visualize e analise todos os webhooks processados
- 🔒 **Autenticação Segura** - Login com API Key
- 📱 **Responsivo** - Funciona perfeitamente em desktop e mobile
- 🌙 **UI Moderna** - Design profissional com Tailwind CSS
- ⚡ **Rápido** - Construído com React + Vite

## 🚀 Tecnologias

- **React 18** - Framework JavaScript
- **Vite** - Build tool ultra-rápido
- **React Router** - Navegação SPA
- **Zustand** - Gerenciamento de estado
- **Axios** - Cliente HTTP
- **Tailwind CSS** - Framework CSS
- **Lucide React** - Ícones
- **Recharts** - Gráficos
- **React JSON View** - Visualizador JSON
- **React Hot Toast** - Notificações
- **date-fns** - Manipulação de datas

## 📦 Instalação

```bash
cd evolution-router/manager
npm install
```

## 🛠️ Desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:5173

## 🏗️ Build para Produção

```bash
npm run build
```

Os arquivos serão gerados em `dist/`

## 🔧 Configuração

O manager já está configurado para fazer proxy das requisições para o backend na porta 3000.

Se precisar mudar, edite o `vite.config.js`:

```js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    },
  },
}
```

## 📖 Como Usar

### 1. Login

Use a API Key configurada no Evolution Router (.env do backend):

```
API_KEY=sua-chave-aqui
```

### 2. Dashboard

- Veja estatísticas em tempo real
- Monitore webhooks processados
- Visualize gráficos de atividade

### 3. Gerenciar Rotas

**Criar Rota:**
1. Clique em "Nova Rota"
2. Preencha nome, descrição e source
3. Salve

**Adicionar Target:**
1. Clique em "Ver Detalhes" na rota
2. Na aba "Destinos", clique em "Adicionar"
3. Configure URL, método, headers
4. Salve

**Adicionar Filtro:**
1. Na aba "Filtros", clique em "Adicionar"
2. Escolha o tipo de filtro
3. Configure a condição e valor
4. Salve

**Mapear Campos:**
1. Na aba "Mapeamentos", clique em "Adicionar"
2. Defina campo de origem e destino
3. Escolha o tipo de transformação
4. Salve

### 4. Testar Webhook

1. Abra os detalhes de uma rota
2. Clique em "Testar Webhook"
3. Um evento de teste será enviado

### 5. Visualizar Logs

- Acesse a página "Logs"
- Veja todos os webhooks processados
- Clique em "Ver Detalhes" para payload completo
- Exporte logs em JSON

## 🎨 Componentes Principais

### Pages
- `LoginPage` - Autenticação
- `DashboardPage` - Dashboard principal
- `RoutesPage` - Gerenciamento de rotas
- `LogsPage` - Visualização de logs
- `SettingsPage` - Configurações

### Components
- `Sidebar` - Menu lateral
- `Header` - Cabeçalho
- `RouteDetails` - Detalhes da rota com tabs
- `RouteModal` - Modal de criação/edição de rota
- `TargetModal` - Modal de target
- `FilterModal` - Modal de filtro
- `FieldMappingModal` - Modal de mapeamento

### UI Components
- `Card` - Cartão de conteúdo
- `Button` - Botões
- `Input` - Campos de entrada
- `Select` - Seleção
- `Modal` - Modais
- `Badge` - Badges de status
- `Loading` - Loading spinner
- `EmptyState` - Estado vazio

## 🎯 Estrutura de Pastas

```
src/
├── components/       # Componentes reutilizáveis
│   ├── ui/          # Componentes de UI base
│   ├── modals/      # Modais
│   └── routes/      # Componentes específicos de rotas
├── pages/           # Páginas da aplicação
├── store/           # Zustand stores
├── lib/             # Utilitários e configs
├── App.jsx          # Componente principal
└── main.jsx         # Entry point
```

## 🔐 Segurança

- Autenticação via API Key
- API Key armazenada no localStorage
- Validação em todas as requisições
- Logout automático em caso de 401

## 📱 Responsividade

- Mobile-first design
- Breakpoints: sm, md, lg, xl
- Layout adaptativo
- Touch-friendly

## 🎨 Cores

```js
primary: {
  500: '#0ea5e9',  // Azul principal
  600: '#0284c7',  // Azul escuro
  700: '#0369a1',  // Azul mais escuro
}

success: '#10b981',  // Verde
danger: '#ef4444',   // Vermelho
warning: '#f59e0b',  // Amarelo
info: '#3b82f6',     // Azul
```

## 🐛 Troubleshooting

### Erro de CORS

Configure o backend para aceitar requisições do frontend:
```go
router.Use(cors.Default())
```

### API Key inválida

Verifique se a chave está correta no `.env` do backend.

### Logs não aparecem

Verifique se há logs no banco de dados:
```sql
SELECT * FROM webhook_logs;
```

## 📝 Licença

MIT

## 🤝 Contribuindo

Contribuições são bem-vindas! Abra uma issue ou PR.

---

Feito com ❤️ pela Evolution API Team
