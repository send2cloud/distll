
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h1 className="text-6xl font-bold mb-4 text-gray-900 dark:text-gray-100">404</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">Oops! Page not found</p>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          The URL you're trying to access: <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{location.pathname}</code>
        </p>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          If you're trying to access a direct summary, make sure the URL is in the correct format.
        </p>
        <Link to="/">
          <Button className="w-full">Return to Home</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
