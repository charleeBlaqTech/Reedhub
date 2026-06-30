// src/components/Register.jsx - Secure User Signup Component Interface
import React, { useState } from 'react';

export default function Register({ navigateTo }) {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Handle inputs modifying fields
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit registration parameters downstream to backend service
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Registration successful! Proceed to Login.');
        setFormData({ name: '', email: '', password: '' });
      } else {
        setError(data.error || 'Registration failed processing.');
      }
    } catch (err) {
      setError('Cannot establish operational connection with backend server pipeline.');
    }
  };

  return (
    <div id="register-page-container" className="max-w-md mx-auto mt-16 bg-white border border-gray-200 rounded-xl p-8 shadow-sm" data-testid="register-card">
      <h2 id="register-title" className="text-2xl font-bold mb-2 text-gray-800 text-center" data-testid="register-heading">Create Account</h2>
      <p id="register-subtitle" className="text-sm text-gray-500 mb-6 text-center">Join the QA Practice Automation Workspace</p>

      {/* Alert Notice Banners for Validation Testing */}
      {message && (
        <div id="register-success-alert" className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-md" data-testid="register-success-message">
          {message}
        </div>
      )}
      {error && (
        <div id="register-error-alert" className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-md" data-testid="register-error-message">
          {error}
        </div>
      )}

      <form id="register-form" onSubmit={handleSubmit} className="space-y-4" data-testid="form-register">
        <div>
          <label id="lbl-register-name" className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1" htmlFor="reg-name">Full Name</label>
          <input 
            id="reg-name"
            name="name"
            type="text"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            data-testid="input-register-name"
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        <div>
          <label id="lbl-register-email" className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1" htmlFor="reg-email">Email Address</label>
          <input 
            id="reg-email"
            name="email"
            type="email"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            data-testid="input-register-email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div>
          <label id="lbl-register-password" className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1" htmlFor="reg-password">Password</label>
          <input 
            id="reg-password"
            name="password"
            type="password"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
            data-testid="input-register-password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        <button 
          id="btn-register-submit"
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-md shadow-sm transition"
          data-testid="btn-register-submit"
        >
          Sign Up
        </button>
      </form>

      <div id="register-footer" className="mt-6 pt-6 border-t border-gray-100 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <button 
            id="btn-switch-to-login"
            className="text-indigo-600 hover:underline font-medium"
            data-testid="link-goto-login"
            onClick={() => navigateTo('login')}
          >
            Log in here
          </button>
        </p>
      </div>
    </div>
  );
}