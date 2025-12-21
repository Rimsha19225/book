import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './AuthForm.css';

interface SignupFormProps {
  onSwitchToLogin: () => void;
  onSignupSuccess: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSwitchToLogin, onSignupSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await register(email, name, password);
      onSignupSuccess();
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <form onSubmit={handleSubmit} className="auth-form">
        <h2>Sign Up</h2>

        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
          />
        </div>

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
            minLength={6}
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <button type="submit" disabled={loading} className="auth-button">
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>

        <p className="auth-switch-link">
          Already have an account?{' '}
          <button type="button" onClick={onSwitchToLogin} className="switch-button">
            Login
          </button>
        </p>
      </form>
    </div>
  );
};

export default SignupForm;