// Central API configuration
// Production: Render backend URL
// Development: localhost fallback
const API_URL = import.meta.env.VITE_API_URL || 'https://role-based-web-mern.onrender.com';

export default API_URL;
