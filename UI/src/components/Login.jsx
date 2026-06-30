// src/components/Login.jsx - Session Authentication Login Screen Component
import React, { useState } from 'react';

export default function Login({ setToken, setCurrentUser, navigateTo }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();

      if (response.ok) {
        setToken(data.token);
        setCurrentUser(data.user);
        navigateTo('feed');
      } else {
        setError(data.error || 'Invalid credentials provided.');
      }
    } catch (err) {
      setError('Cannot establish communication link with backend API server.');
    }
  };

  return (
    <div id="login-page-container" className="max-w-md mx-auto mt-16 bg-white border border-gray-200 rounded-xl p-8 shadow-sm" data-testid="login-card">
      <h2 id="login-title" className="text-2xl font-bold mb-2 text-gray-800 text-center" data-testid="login-heading">Welcome Back</h2>
      <p id="login-subtitle" className="text-sm text-gray-500 mb-6 text-center">Sign in to check out global activity metrics</p>

      {error && (
        <div id="login-error-alert" className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md" data-testid="login-error-message">
          {error}
        </div>
      )}

      <form id="login-form" onSubmit={handleSubmit} className="space-y-4" data-testid="form-login">
        <div>
          <label id="lbl-login-email" className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1" htmlFor="login-email">Email Address</label>
          <input 
            id="login-email"
            name="email"
            type="email"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            data-testid="input-login-email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div>
          <label id="lbl-login-password" className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1" htmlFor="login-password">Password</label>
          <input 
            id="login-password"
            name="password"
            type="password"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            data-testid="input-login-password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        <button 
          id="btn-login-submit"
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-md shadow-sm transition"
          data-testid="btn-login-submit"
        >
          Sign In
        </button>
      </form>

      <div id="login-footer" className="mt-6 pt-6 border-t border-gray-100 text-center">
        <p className="text-sm text-gray-600">
          New to the ReedHub?{' '}
          <button 
            id="btn-switch-to-register"
            className="text-indigo-600 hover:underline font-medium"
            data-testid="link-goto-register"
            onClick={() => navigateTo('register')}
          >
            Register an account
          </button>
        </p>
      </div>
    </div>
  );
}