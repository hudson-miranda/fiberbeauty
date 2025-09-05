const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          error: 'Usuário não autenticado',
          code: 'NOT_AUTHENTICATED' 
        });
      }

      // Se allowedRoles for uma string, converter para array
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ 
          error: 'Acesso negado. Permissões insuficientes.',
          code: 'INSUFFICIENT_PERMISSIONS',
          required: roles,
          current: req.user.role
        });
      }

      next();
    } catch (error) {
      console.error('Erro no middleware de autorização:', error);
      return res.status(500).json({ 
        error: 'Erro interno do servidor',
        code: 'INTERNAL_ERROR' 
      });
    }
  };
};

// Middlewares específicos para roles
const adminOnly = roleMiddleware(['ADMIN']);
const adminOrAttendant = roleMiddleware(['ADMIN', 'ATTENDANT']);

module.exports = {
  roleMiddleware,
  adminOnly,
  adminOrAttendant,
};
