const { body, validationResult } = require('express-validator');

// Middleware para lidar com erros de validação
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Dados inválidos',
      code: 'VALIDATION_ERROR',
      details: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value,
      })),
    });
  }
  next();
};

// Validações para Login
const validateLogin = [
  body('username')
    .notEmpty()
    .withMessage('Nome de usuário é obrigatório')
    .isLength({ min: 3 })
    .withMessage('Nome de usuário deve ter pelo menos 3 caracteres'),
  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres'),
  handleValidationErrors,
];

// Validações para Cliente
const validateClient = [
  body('firstName')
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .isLength({ min: 2 })
    .withMessage('Nome deve ter pelo menos 2 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
    .withMessage('Nome deve conter apenas letras'),
  body('lastName')
    .notEmpty()
    .withMessage('Sobrenome é obrigatório')
    .isLength({ min: 2 })
    .withMessage('Sobrenome deve ter pelo menos 2 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
    .withMessage('Sobrenome deve conter apenas letras'),
  body('cpf')
    .notEmpty()
    .withMessage('CPF é obrigatório')
    .matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)
    .withMessage('CPF deve estar no formato 000.000.000-00')
    .custom((value) => {
      // Remove formatação e verifica se tem exatamente 11 dígitos
      const numbers = value.replace(/\D/g, '');
      if (numbers.length !== 11) {
        throw new Error('CPF deve ter exatamente 11 dígitos');
      }
      return true;
    }),
  handleValidationErrors,
];

// Validações para Usuário
const validateUser = [
  body('name')
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .isLength({ min: 2 })
    .withMessage('Nome deve ter pelo menos 2 caracteres'),
  body('username')
    .notEmpty()
    .withMessage('Nome de usuário é obrigatório')
    .isLength({ min: 3 })
    .withMessage('Nome de usuário deve ter pelo menos 3 caracteres')
    .matches(/^[a-zA-Z0-9._]+$/)
    .withMessage('Nome de usuário deve conter apenas letras, números, pontos e underscores'),
  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres'),
  body('role')
    .isIn(['ADMIN', 'ATTENDANT'])
    .withMessage('Role deve ser ADMIN ou ATTENDANT'),
  handleValidationErrors,
];

// Validações para Ficha de Atendimento
const validateAttendanceForm = [
  body('name')
    .notEmpty()
    .withMessage('Nome da ficha é obrigatório')
    .isLength({ min: 3 })
    .withMessage('Nome deve ter pelo menos 3 caracteres'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Descrição deve ter no máximo 500 caracteres'),
  body('fields')
    .isArray({ min: 1 })
    .withMessage('Deve haver pelo menos um campo na ficha'),
  body('fields.*.label')
    .notEmpty()
    .withMessage('Label do campo é obrigatório'),
  body('fields.*.type')
    .isIn(['TEXT', 'TEXTAREA', 'SELECT', 'CHECKBOX', 'RADIO', 'NUMBER', 'DATE', 'TIME', 'EMAIL', 'PHONE'])
    .withMessage('Tipo de campo inválido'),
  handleValidationErrors,
];

// Validações para Atendimento
const validateAttendance = [
  body('clientId')
    .notEmpty()
    .withMessage('ID do cliente é obrigatório')
    .isString()
    .withMessage('ID do cliente deve ser uma string válida'),
  body('attendanceFormId')
    .notEmpty()
    .withMessage('ID da ficha de atendimento é obrigatório')
    .isString()
    .withMessage('ID da ficha deve ser uma string válida'),
  body('responses')
    .isObject()
    .withMessage('Respostas devem ser um objeto válido'),
  handleValidationErrors,
];

// Validações para Duplicar Ficha
const validateDuplicateForm = [
  body('name')
    .notEmpty()
    .withMessage('Nome para a ficha duplicada é obrigatório')
    .isLength({ min: 3 })
    .withMessage('Nome deve ter pelo menos 3 caracteres'),
  handleValidationErrors,
];

module.exports = {
  validateLogin,
  validateClient,
  validateUser,
  validateAttendanceForm,
  validateAttendance,
  validateDuplicateForm,
  handleValidationErrors,
};
