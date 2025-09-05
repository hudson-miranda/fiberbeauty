const { PrismaClient } = require('@prisma/client');

// Configuração otimizada para serverless
let prisma;

const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
};

// Singleton pattern para evitar múltiplas conexões
const getPrismaClient = () => {
  if (!prisma) {
    prisma = createPrismaClient();
  }
  return prisma;
};

// Função para desconectar o cliente (importante para serverless)
const disconnectPrisma = async () => {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
};

module.exports = {
  getPrismaClient,
  disconnectPrisma,
};
