FROM node:18-alpine

# Instalar OpenSSL para o Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copiar package.json e package-lock.json primeiro (para cache de camadas)
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production --no-audit --no-fund

# Copiar código da aplicação
COPY . .

# Gerar Prisma Client
RUN npx prisma generate

# Expor porta
EXPOSE 3001

# Comando para iniciar a aplicação
CMD ["npm", "start"]
