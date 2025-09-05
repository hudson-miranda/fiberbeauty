# Fiber Beauty - Deploy Guide

## Opção 1: Vercel (Recomendado - Gratuito)

### Frontend (React)
1. Instale a CLI do Vercel:
```bash
npm install -g vercel
```

2. Na pasta frontend, execute:
```bash
cd frontend
vercel
```

3. Configure as variáveis de ambiente no painel Vercel:
- REACT_APP_API_URL=https://seu-backend.vercel.app/api

### Backend (Node.js)
1. Na pasta backend, crie arquivo `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

2. Execute:
```bash
cd backend
vercel
```

3. Configure as variáveis de ambiente no painel Vercel:
- DATABASE_URL=sua_string_de_conexao_postgresql
- JWT_SECRET=seu_jwt_secret_super_seguro

## Opção 2: Netlify + Railway

### Frontend (Netlify - Gratuito)
1. Conecte seu repositório GitHub ao Netlify
2. Configure build command: `npm run build`
3. Configure publish directory: `build`

### Backend (Railway - Gratuito com limites)
1. Conecte seu repositório ao Railway
2. Configure as variáveis de ambiente
3. Railway detectará automaticamente que é Node.js

## Opção 3: VPS Próprio (DigitalOcean, AWS, etc.)

### Usando Docker (Recomendado)
```bash
# Build das imagens
docker build -t fiber-beauty-frontend ./frontend
docker build -t fiber-beauty-backend ./backend

# Execute com docker-compose
docker-compose up -d
```

### Manual (Ubuntu/Debian)
```bash
# Instalar Node.js e PM2
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2

# Deploy do backend
cd backend
npm install --production
pm2 start src/server.js --name "fiber-beauty-api"

# Deploy do frontend (com Nginx)
sudo apt install nginx
sudo cp -r frontend/build/* /var/www/html/
```

## Configuração de Domínio

### Para qualquer opção acima:
1. Configure seu DNS:
   - A record: @ -> IP do servidor (ou CNAME para Vercel/Netlify)
   - CNAME: www -> seu-dominio.com

2. Configure SSL (HTTPS):
   - Vercel/Netlify: Automático
   - VPS: Use Let's Encrypt com Certbot

## Banco de Dados

### Opções gratuitas/baratas:
1. **Supabase** (PostgreSQL gratuito até 500MB)
2. **PlanetScale** (MySQL gratuito até 5GB)
3. **Railway** (PostgreSQL gratuito com limites)
4. **Heroku Postgres** (gratuito até 10k rows)

## Configurações de Produção

### Frontend (.env.production)
```
REACT_APP_API_URL=https://api.seudominio.com
REACT_APP_ENVIRONMENT=production
```

### Backend (.env.production)
```
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://...
JWT_SECRET=seu_jwt_secret_muito_seguro
CORS_ORIGIN=https://seudominio.com
```
