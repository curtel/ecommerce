// API URL Configuration
const getApiUrl = () => {
  // Use environment variable if available (from .env file or deployment config)
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Check if we're in development (localhost) or production
  const isLocalhost = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';
  
  return isLocalhost ? 'http://localhost:4000' : '/api';
};

// Export config variables
export const API_URL = getApiUrl(); 
