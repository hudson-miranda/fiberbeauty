# 💅 Fiber Beauty - Sistema de Gerenciamento de Salão de Beleza

Sistema completo para gerenciamento de atendimentos em salão de beleza, focado no nicho de unhas, com fichas de atendimento dinâmicas e controle de acesso por perfil.

## 🚀 Tecnologias

### Backend
- **Node.js** + **Express** - API REST
- **Prisma ORM** - Gerenciamento do banco de dados
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação e autorização
- **bcryptjs** - Criptografia de senhas
- **Express Validator** - Validação de dados

### Frontend
- **React 18** - Framework frontend
- **React Router** - Roteamento
- **Tailwind CSS** - Estilização
- **React Hook Form** - Gerenciamento de formulários
- **React Query** - Gerenciamento de estado e cache
- **Axios** - Cliente HTTP
- **React Hot Toast** - Notificações

### DevOps
- **Docker** + **Docker Compose** - Containerização
- **PostgreSQL** - Banco de dados em container

## 📋 Funcionalidades

### 👤 Perfil: ATENDENTE
- ✅ Cadastrar nova cliente
- ✅ Editar dados da cliente (Nome, Sobrenome, CPF)
- ✅ Localizar cliente por Nome, Sobrenome ou CPF
- ✅ Realizar atendimento com fichas dinâmicas
- ❌ Não pode excluir cadastros
- ❌ Não pode acessar gestão ou relatórios

### 👨‍💼 Perfil: ADMINISTRADOR
- ✅ Todas as funcionalidades do atendente
- ✅ Criar e gerenciar fichas de atendimento dinâmicas
- ✅ Duplicar fichas existentes
- ✅ Deletar fichas e cadastros
- ✅ Gerenciar usuários e permissões
- ✅ Gerar relatórios e dashboards
- ✅ Visualizar estatísticas completas

## 🗃️ Estrutura do Banco de Dados

### Modelos Principais
- **User** - Usuários do sistema (Admin/Atendente)
- **Client** - Clientes do salão
- **AttendanceForm** - Fichas de atendimento configuráveis
- **FormField** - Campos dinâmicos das fichas
- **Attendance** - Registros de atendimentos realizados

### Tipos de Campos Suportados
- TEXT, TEXTAREA, SELECT, CHECKBOX, RADIO
- NUMBER, DATE, TIME, EMAIL, PHONE

## 🔧 Instalação e Configuração

### Pré-requisitos
- Docker e Docker Compose
- Node.js 18+ (para desenvolvimento local)
- Git

### 1. Clone o Repositório
```bash
git clone <url-do-repositorio>
cd fichaatendimento
```

### 2. Configuração com Docker (Recomendado)

#### Suba todos os serviços:
```bash
docker-compose up -d
```

#### Acesse o container do backend para executar migrações:
```bash
docker exec -it beauty_salon_backend sh
npm run prisma:migrate
npm run seed
exit
```

### 3. Configuração Manual (Desenvolvimento)

#### Backend:
```bash
cd backend
npm install
cp .env.example .env
# Edite o .env com suas configurações
npm run prisma:migrate
npm run seed
npm run dev
```

#### Frontend:
```bash
cd frontend
npm install
npm start
```

### 4. Configuração do Banco
Se estiver usando PostgreSQL local, certifique-se de que o banco esteja rodando e atualize a `DATABASE_URL` no `.env`.

## 🌐 URLs de Acesso

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health
- **Banco PostgreSQL**: localhost:5432

## 👥 Usuários Padrão

Após executar o seed:

### Administrador
- **Usuário**: `admin`
- **Senha**: `123456`

### Atendente
- **Usuário**: `maria.silva`
- **Senha**: `123456`

## 📊 Endpoints da API

### Autenticação
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Dados do usuário logado
- `POST /api/auth/change-password` - Alterar senha

### Clientes
- `GET /api/clients` - Listar clientes
- `GET /api/clients/:id` - Buscar por ID
- `GET /api/clients/cpf/:cpf` - Buscar por CPF
- `POST /api/clients` - Criar cliente
- `PUT /api/clients/:id` - Atualizar cliente
- `DELETE /api/clients/:id` - Excluir cliente (Admin)

### Fichas de Atendimento
- `GET /api/attendance-forms` - Listar fichas
- `GET /api/attendance-forms/:id` - Buscar por ID
- `POST /api/attendance-forms` - Criar ficha (Admin)
- `PUT /api/attendance-forms/:id` - Atualizar ficha (Admin)
- `POST /api/attendance-forms/:id/duplicate` - Duplicar ficha (Admin)
- `DELETE /api/attendance-forms/:id` - Excluir ficha (Admin)

### Atendimentos
- `GET /api/attendances` - Listar atendimentos
- `GET /api/attendances/:id` - Buscar por ID
- `GET /api/attendances/stats` - Estatísticas (Admin)
- `POST /api/attendances` - Criar atendimento
- `PUT /api/attendances/:id` - Atualizar atendimento

### Usuários
- `GET /api/users` - Listar usuários (Admin)
- `GET /api/users/:id` - Buscar por ID (Admin)
- `POST /api/users` - Criar usuário (Admin)
- `PUT /api/users/:id` - Atualizar usuário (Admin)
- `DELETE /api/users/:id` - Desativar usuário (Admin)

## 🛡️ Segurança

- **JWT** para autenticação
- **Rate Limiting** - 100 requests por 15 minutos
- **Helmet** para headers de segurança
- **CORS** configurado
- **Validação de dados** em todas as rotas
- **Criptografia bcrypt** para senhas
- **Middlewares de autorização** por role

## 🎨 Interface do Usuário

### Características do Design
- **Responsivo** - Funciona em desktop, tablet e mobile
- **Tailwind CSS** - Design system consistente
- **Componentes reutilizáveis** - Modal, Card, FormField
- **Animações suaves** - Transições e feedbacks visuais
- **Cores da marca** - Paleta rosa/roxo para beleza
- **Tipografia** - Fonte Inter para legibilidade

### Padrões de UX
- **Feedback imediato** - Toasts para ações
- **Estados de loading** - Spinners e skeletons
- **Validação em tempo real** - Formulários inteligentes
- **Navegação intuitiva** - Breadcrumbs e menus claros
- **Proteção de rotas** - Baseada em permissões

## 📱 Responsividade

O sistema foi desenvolvido mobile-first e é totalmente responsivo:

- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

## 🔄 Scripts Úteis

### Backend
```bash
npm run dev              # Servidor de desenvolvimento
npm run start            # Produção
npm run prisma:migrate   # Executar migrações
npm run prisma:reset     # Reset do banco
npm run prisma:studio    # Interface visual do banco
npm run seed             # Popular banco com dados iniciais
```

### Frontend
```bash
npm start       # Servidor de desenvolvimento
npm run build   # Build para produção
npm test        # Executar testes
```

### Docker
```bash
docker-compose up -d              # Subir todos os serviços
docker-compose down               # Parar todos os serviços
docker-compose logs backend       # Ver logs do backend
docker-compose logs frontend      # Ver logs do frontend
docker-compose restart backend    # Reiniciar backend
```

## 🐛 Troubleshooting

### Problema: Erro de conexão com banco
**Solução**: Verifique se o PostgreSQL está rodando e a `DATABASE_URL` está correta.

### Problema: Frontend não carrega
**Solução**: Verifique se o backend está rodando na porta 3001.

### Problema: Erro de CORS
**Solução**: Verifique a configuração de `FRONTEND_URL` no backend.

### Problema: Token inválido
**Solução**: Limpe o localStorage do navegador ou faça logout/login.

## 📈 Próximas Implementações

- [ ] **Agenda de horários** - Sistema de agendamento
- [ ] **Relatórios avançados** - Exportação PDF/Excel
- [ ] **Dashboard em tempo real** - WebSockets
- [ ] **Sistema de backup** - Backup automático
- [ ] **Notificações push** - PWA
- [ ] **Integração com WhatsApp** - Notificações
- [ ] **Sistema de estoque** - Produtos e materiais
- [ ] **Múltiplas filiais** - Multi-tenant

## 🔧 Troubleshooting

### Problemas de Build do Docker

#### Erro: "failed to prepare extraction snapshot"
Este erro geralmente indica problemas com o cache do Docker. Soluções:

**1. Limpeza Completa (Recomendado):**
```bash
# PowerShell (Windows)
.\clean-docker.ps1

# Bash (Linux/Mac)
./clean-docker.sh
```

**2. Limpeza Manual:**
```bash
# Parar containers
docker-compose down -v --remove-orphans

# Limpar cache completo
docker system prune -a -f
docker builder prune -a -f

# Reconstruir sem cache
docker-compose build --no-cache
docker-compose up -d
```

**3. Build Individual:**
```bash
# Se um serviço específico falhar
docker-compose build --no-cache backend
docker-compose build --no-cache frontend
docker-compose up -d
```

### Problemas de Conectividade

#### Banco de Dados não Conecta
```bash
# Verificar se o PostgreSQL está rodando
docker-compose ps

# Ver logs do banco
docker-compose logs postgres

# Resetar dados do banco (CUIDADO: apaga dados!)
docker-compose down -v
docker-compose up -d
```

#### Porta já em Uso
```bash
# Verificar o que está usando a porta
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Linux/Mac

# Matar processo na porta
taskkill /PID <PID> /F        # Windows
kill -9 <PID>                # Linux/Mac
```

### Problemas de Performance

#### Build Lento
- Use `docker-compose build --parallel` para builds paralelos
- Verifique se o Docker Desktop tem recursos suficientes alocados
- Considere usar BuildKit: `DOCKER_BUILDKIT=1 docker-compose build`

#### Container Travando
```bash
# Verificar recursos
docker stats

# Reiniciar container específico
docker-compose restart backend
docker-compose restart frontend
```

### Scripts de Conveniência

- `start.ps1` / `start.sh` - Inicialização completa com verificações
- `clean-docker.ps1` - Limpeza completa do Docker
- `docker-compose logs -f` - Ver logs em tempo real

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Add: nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para dúvidas e suporte:
- 📧 Email: suporte@fiberbeauty.com
- 📱 WhatsApp: (11) 99999-9999
- 🐛 Issues: GitHub Issues

---

**Desenvolvido com 💜 por Fiber Beauty Team**
