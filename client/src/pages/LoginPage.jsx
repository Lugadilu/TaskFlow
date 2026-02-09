// client/src/components/LoginPage.jsx
import { useState } from 'react';
import { authApi } from '../services/api';
import { useAuth } from '../assets/contexts/AuthContext.jsx';
import { Link, useNavigate } from 'react-router-dom';


function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Local state for the form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Call the backend: POST /api/auth/login
      const data = await authApi.login({ email, password });
      // 2. Backend returns { token: "..." }
      const token = data.token;

      // 3. Store token via AuthContext
      //    - This saves to localStorage and sets isAuthenticated = true
      login(token);
      navigate('/');

      // 4. After this, App.jsx will re-render and show the TaskPage
    } catch (err) {
      // Handle 401 or network errors
      if (err.response && err.response.status === 401) {
        setError('Invalid email or password');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
        <h1 className="text-2xl font-semibold text-slate-900 mb-2">
          Welcome back
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Sign in to access your TaskFlow dashboard.
        </p>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-slate-600">
        Don’t have an account?{' '}
        <Link
            to="/register"
            className="font-medium text-blue-600 hover:text-blue-700"
        >
            Sign up here
        </Link>
        </div>
      </div>
    </div>
    
  );
}

export default LoginPage;