import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './AuthForm.css';

interface LoginFormProps {
  onSwitchToSignup: () => void;
  onLoginSuccess: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToSignup, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      onLoginSuccess();
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Login</h2>

        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <button type="submit" disabled={loading} className="auth-button">
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p className="auth-switch-link">
          Don't have an account?{' '}
          <button type="button" onClick={onSwitchToSignup} className="switch-button">
            Sign up
          </button>
        </p>
      </form>
    </div>
  );
};

export default LoginForm;