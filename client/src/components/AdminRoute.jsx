import { Navigate } from 'react-router-dom';
import { useAuth } from '../assets/contexts/AuthContext.jsx';

function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin } = useAuth();

  // Not logged in → redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but not admin → redirect to regular tasks page
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Is admin → allow access
  return children;
}

export default AdminRoute;