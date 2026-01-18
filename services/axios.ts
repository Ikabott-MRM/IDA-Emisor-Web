import axios from 'axios';

// Use local proxy API route instead of direct backend call
// This avoids mixed content blocking (HTTPS → HTTP)
const instance = axios.create({
  baseURL: '/api/proxy',
});

// No need for x-api-key header here - the proxy handles it server-side

export default instance;
