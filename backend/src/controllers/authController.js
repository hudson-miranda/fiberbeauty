const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const authController = {
  // Login do usuário
  async login(req, res) {
    try {
      const { username, password } = req.body;

      // Buscar usuário (case-insensitive)
      const user = await prisma.user.findFirst({
        where: { 
          username: {
            equals: username,
            mode: 'insensitive'
          }
        },
        select: {
          id: true,
          name: true,
          username: true,
          password: true,
          role: true,
          isActive: true,
        },
      });

      if (!user || !user.isActive) {
        return res.status(401).json({
          error: 'Credenciais inválidas',
          code: 'INVALID_CREDENTIALS',
        });
      }

      // Verificar senha
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          error: 'Credenciais inválidas',
          code: 'INVALID_CREDENTIALS',
        });
      }

      // Gerar token JWT
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      // Remover senha da resposta
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        message: 'Login realizado com sucesso',
        token,
        user: userWithoutPassword,
      });
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  // Verificar token e retornar dados do usuário
  async me(req, res) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          name: true,
          username: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        return res.status(404).json({
          error: 'Usuário não encontrado',
          code: 'USER_NOT_FOUND',
        });
      }

      res.json({ user });
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  // Atualizar perfil do usuário
  async updateProfile(req, res) {
    try {
      const { name, username } = req.body;
      const userId = req.user.id;

      // Verificar se o usuário existe
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!existingUser) {
        return res.status(404).json({
          error: 'Usuário não encontrado',
          code: 'USER_NOT_FOUND',
        });
      }

      // Verificar se o username já está em uso por outro usuário
      if (username && username !== existingUser.username) {
        const usernameExists = await prisma.user.findFirst({
          where: { 
            username: { equals: username, mode: 'insensitive' },
            id: { not: userId },
          },
        });

        if (usernameExists) {
          return res.status(400).json({
            error: 'Nome de usuário já está em uso',
            code: 'USERNAME_ALREADY_EXISTS',
          });
        }
      }

      // Atualizar usuário
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(name && { name }),
          ...(username && { username }),
        },
        select: {
          id: true,
          name: true,
          username: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      res.json({
        message: 'Perfil atualizado com sucesso',
        user: updatedUser,
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR',
      });
    }
  },

  // Alterar senha
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      // Buscar usuário atual
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({
          error: 'Usuário não encontrado',
          code: 'USER_NOT_FOUND',
        });
      }

      // Verificar senha atual
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          error: 'Senha atual incorreta',
          code: 'INVALID_CURRENT_PASSWORD',
        });
      }

      // Criptografar nova senha
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      // Atualizar senha
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
      });

      res.json({
        message: 'Senha alterada com sucesso',
      });
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR',
      });
    }
  },
};

module.exports = authController;
