// API URL Configuration
const getApiUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  return 'http://localhost:4000/api';

};

// Export config variables
export const API_URL = getApiUrl();

// Log configuration
console.log('Environment:', process.env.NODE_ENV);
console.log('API URL:', API_URL);

// Additional configuration for fetch requests
export const fetchConfig = {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  credentials: 'include' // Enable credentials
}; 
