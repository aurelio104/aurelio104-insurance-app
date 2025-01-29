import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../services/axios';
import CircularProgress from '@mui/material/CircularProgress';
import "../stylespages.css";

const RegisterPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [formErrors, setFormErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'El nombre es obligatorio';
    if (!formData.email.trim() || !/^[\w-.]+@[\w-]+\.[a-z]{2,4}$/i.test(formData.email)) {
      errors.email = 'Por favor ingresa un correo electrónico válido';
    }
    if (!formData.password.trim() || formData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await axios.post('/auth/register', formData);
      alert('Registro exitoso. Redirigiendo al inicio de sesión...');
      navigate('/login');
    } catch (err) {
      setErrorMessage(err.response?.data?.error || 'Error en el registro, intenta nuevamente');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1 className="title">Crear Cuenta</h1>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <form onSubmit={handleSubmit}>
          <div className="input-field">
            <input
              name="name"
              type="text"
              placeholder="Nombre"
              value={formData.name}
              onChange={handleChange}
              className={formErrors.name ? 'input-error' : ''}
            />
            {formErrors.name && <p className="error-message">{formErrors.name}</p>}
          </div>
          <div className="input-field">
            <input
              name="email"
              type="email"
              placeholder="Correo Electrónico"
              value={formData.email}
              onChange={handleChange}
              className={formErrors.email ? 'input-error' : ''}
            />
            {formErrors.email && <p className="error-message">{formErrors.email}</p>}
          </div>
          <div className="input-field">
            <input
              name="password"
              type="password"
              placeholder="Contraseña"
              value={formData.password}
              onChange={handleChange}
              className={formErrors.password ? 'input-error' : ''}
            />
            {formErrors.password && <p className="error-message">{formErrors.password}</p>}
          </div>
          <button className="quote-button"              type="submit" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Registrarse'}
          </button>
        </form>
        <p className="quote-button"              type="submit" onClick={() => navigate('/login')}>Volver al inicio de sesión</p>
      </div>
    </div>
  );
};

export default RegisterPage;



