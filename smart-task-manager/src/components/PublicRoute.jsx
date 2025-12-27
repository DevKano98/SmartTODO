import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from './Loading';

const PublicRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <Loading />;
  }
  
  if (currentUser) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

export default PublicRoute;
