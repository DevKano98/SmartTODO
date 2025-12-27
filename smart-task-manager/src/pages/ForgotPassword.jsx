import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

const ForgotPassword = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    
    try {
      await resetPassword(email);
      setMessage('Password reset email sent! Check your inbox.');
      setLoading(false);
    } catch (error) {
      console.error('Password reset error:', error);
      setError(
        error.code === 'auth/user-not-found'
          ? 'No account found with this email'
          : error.message
      );
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <div className="text-center">
          <Logo className="mx-auto h-12 w-auto" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Reset your password
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Enter your email and we'll send you a link to reset your password
          </p>
        </div>
        
        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
        
        {message && (
          <div className="p-4 bg-green-100 text-green-700 rounded-md text-sm">
            {message}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="Email address"
            />
          </div>
          
          <div>
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
          </div>
          
          <div className="text-center">
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
