const jwt = require('jsonwebtoken');
const { getPrismaClient } = require('../config/database');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        error: 'Token de acesso não fornecido',
        code: 'NO_TOKEN' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Obter cliente Prisma
    const prisma = getPrismaClient();
    
    // Buscar usuário no banco para verificar se ainda está ativo
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        username: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ 
        error: 'Usuário não encontrado ou inativo',
        code: 'INVALID_USER' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Token inválido',
        code: 'INVALID_TOKEN' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expirado',
        code: 'EXPIRED_TOKEN' 
      });
    }

    console.error('Erro no middleware de autenticação:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR' 
    });
  }
};

module.exports = authMiddleware;
