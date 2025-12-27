import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="text-center">
        <Logo className="mx-auto h-12 w-auto mb-6" />
        
        <h1 className="text-9xl font-bold text-primary-600 dark:text-primary-400">404</h1>
        
        <h2 className="mt-4 text-3xl font-extrabold text-gray-900 dark:text-white">
          Page not found
        </h2>
        
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="mt-8">
          <Link to="/" className="btn btn-primary">
            Go back home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
