FROM node:18-alpine

WORKDIR /app

# Copiar package.json e package-lock.json primeiro (para cache de camadas)
COPY package*.json ./

# Instalar dependências
RUN npm ci --no-audit --no-fund

# Copiar código da aplicação
COPY . .

# Expor porta
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]
