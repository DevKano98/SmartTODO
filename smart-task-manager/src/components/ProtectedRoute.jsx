import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from './Loading';

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <Loading />;
  }
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

export default ProtectedRoute;
