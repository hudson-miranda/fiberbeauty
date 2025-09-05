// Validadores para diferentes tipos de dados

export const validateCPF = (cpf) => {
  if (!cpf) return false;
  
  const numbers = cpf.replace(/\D/g, '');
  
  if (numbers.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(numbers)) return false; // Todos os dígitos iguais
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers.charAt(i)) * (10 - i);
  }
  let digit1 = 11 - (sum % 11);
  if (digit1 === 10 || digit1 === 11) digit1 = 0;
  if (digit1 !== parseInt(numbers.charAt(9))) return false;
  
  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers.charAt(i)) * (11 - i);
  }
  let digit2 = 11 - (sum % 11);
  if (digit2 === 10 || digit2 === 11) digit2 = 0;
  if (digit2 !== parseInt(numbers.charAt(10))) return false;
  
  return true;
};

export const validateEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  if (!phone) return false;
  const numbers = phone.replace(/\D/g, '');
  return numbers.length === 10 || numbers.length === 11;
};

export const validatePassword = (password) => {
  if (!password) return { isValid: false, errors: ['Senha é obrigatória'] };
  
  const errors = [];
  
  if (password.length < 6) {
    errors.push('Senha deve ter pelo menos 6 caracteres');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra maiúscula');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra minúscula');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Senha deve conter pelo menos um número');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateRequired = (value, fieldName = 'Campo') => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} é obrigatório`;
  }
  return null;
};

export const validateMinLength = (value, minLength, fieldName = 'Campo') => {
  if (value && value.length < minLength) {
    return `${fieldName} deve ter pelo menos ${minLength} caracteres`;
  }
  return null;
};

export const validateMaxLength = (value, maxLength, fieldName = 'Campo') => {
  if (value && value.length > maxLength) {
    return `${fieldName} deve ter no máximo ${maxLength} caracteres`;
  }
  return null;
};

export const validateDate = (date) => {
  if (!date) return false;
  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime());
};

export const validateFutureDate = (date) => {
  if (!validateDate(date)) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const inputDate = new Date(date);
  inputDate.setHours(0, 0, 0, 0);
  return inputDate >= today;
};

export const validateAge = (birthDate, minAge = 0, maxAge = 120) => {
  if (!validateDate(birthDate)) return false;
  
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age >= minAge && age <= maxAge;
};
