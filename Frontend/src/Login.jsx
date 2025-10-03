import { useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

export default function Login({ onLogin, onToggleSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  const handleForgot = (e) => {
    e.preventDefault();
    alert('Password reset functionality coming soon!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('http://localhost:3002/api/auth/login', { email, password });
      if (rememberMe) {
        localStorage.setItem('token', res.data.token);
      } else {
        sessionStorage.setItem('token', res.data.token);
      }
      onLogin();
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="login-container">
      <h2>Login Form</h2>
      <div className="glass-form">
        <form onSubmit={handleSubmit}>
          <input 
            type="email" 
            className="glass-input"
            placeholder="Username or Email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            className="glass-input"
            placeholder="Password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
          />
          <label className="remember-me">
            <input 
              type="checkbox" 
              checked={rememberMe} 
              onChange={e => setRememberMe(e.target.checked)} 
            />
            Remember me
          </label>
          <button type="submit" className="purple-btn">Login</button>
        </form>
        <a href="#" className="forgot-link" onClick={handleForgot}>Forgot Password?</a>
        {error && <div className="error">{error}</div>}
        <button className="toggle-btn" onClick={onToggleSignup}>Don't have an account? Sign Up</button>
      </div>
    </div>
  );
}

Login.propTypes = {
  onLogin: PropTypes.func.isRequired,
  onToggleSignup: PropTypes.func.isRequired,
};
