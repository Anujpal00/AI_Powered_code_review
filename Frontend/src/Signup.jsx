import { useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

export default function Signup({ onSignup, onToggleLogin }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await axios.post('http://localhost:3002/api/auth/register', { username, email, password });
      setSuccess('Signup successful! You can now log in.');
      onSignup();
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="signup-container">
      <h2>Sign Up Form</h2>
      <div className="glass-form">
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            className="glass-input"
            placeholder="Username" 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            required 
          />
          <input 
            type="email" 
            className="glass-input"
            placeholder="Email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            className="glass-input"
            placeholder="Password (min 8 chars)" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
          />
          <button type="submit" className="purple-btn">Sign Up</button>
        </form>
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
        <button className="toggle-btn" onClick={onToggleLogin}>Already have an account? Login</button>
      </div>
    </div>
  );
}

Signup.propTypes = {
  onSignup: PropTypes.func.isRequired,
  onToggleLogin: PropTypes.func.isRequired,
};
