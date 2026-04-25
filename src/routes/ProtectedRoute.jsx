import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children, fallback = null }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return fallback;
  }

  return children;
}
