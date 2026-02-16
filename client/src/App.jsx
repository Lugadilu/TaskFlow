import TaskPage from './pages/TaskPage';
import LoginPage from './pages/LoginPage';
import { useAuth } from './assets/contexts/AuthContext.jsx';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';  
import ResetPasswordPage from './pages/ResetPasswordPage';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-slate-900/5">
      {/* Top bar */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-sm font-bold">
              TF
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">TaskFlow</p>
              <p className="text-[11px] text-slate-500">Personal task workspace</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
       <main>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <TaskPage />
              </ProtectedRoute>
            }
          />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />


          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}export default App;
