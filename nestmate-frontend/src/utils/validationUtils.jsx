const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const isValidPhone = (phone) => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  };
  
  const isValidPassword = (password) => {
    return password.length >= 8;
  };
  
  const validateForm = (formData, fields) => {
    const errors = {};
    fields.forEach(field => {
      if (!formData[field.name]) {
        errors[field.name] = `${field.label} is required`;
      } else if (field.type === 'email' && !isValidEmail(formData[field.name])) {
        errors[field.name] = 'Invalid email format';
      } else if (field.type === 'phone' && !isValidPhone(formData[field.name])) {
        errors[field.name] = 'Invalid phone number';
      } else if (field.type === 'password' && !isValidPassword(formData[field.name])) {
        errors[field.name] = 'Password must be at least 8 characters';
      }
    });
    return errors;
  };
  
  const validationUtils = {
    isValidEmail,
    isValidPhone,
    isValidPassword,
    validateForm,
  };
  
  export default validationUtils;