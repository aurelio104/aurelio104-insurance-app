import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { useNavigate } from 'react-router-dom';

const ForgotPasswordPage = () => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const navigate = useNavigate();

  return (
<div className="auth-container">
        <div className="card">
        <h1 className="insurance-title">Recuperación de Contraseña</h1>
        <p className="description">
          Aquí el usuario puede recuperar su contraseña ingresando su correo electrónico.
        </p>
        <form>
          <div className="input-field">
            <input
              type="email"
              placeholder="Ingresa tu correo"
              aria-label="Correo Electrónico"
            />
          </div>
          <button className="quote-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Enviar'}
          </button>
        </form>
        <p className="link" onClick={() => navigate('/login')}>
          Volver al inicio de sesión
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
