/**
 * Axios HTTP Client
 * Two separate instances: one for auth (port 3001), one for data (port 3002).
 */
import axios from 'axios';

const AUTH_BASE_URL = 'http://localhost:3001';
const DATA_BASE_URL = 'http://localhost:3002';

function createClient(baseURL) {
    const client = axios.create({
        baseURL,
        timeout: 8000,
        headers: { 'Content-Type': 'application/json' }
    });

    // Request interceptor
    client.interceptors.request.use(
        config => {
            console.log(`[REQUEST] ${config.method?.toUpperCase()} ${baseURL}${config.url}`);
            return config;
        },
        error => Promise.reject(error)
    );

    // Response interceptor
    client.interceptors.response.use(
        response => response,
        error => {
            console.error('[API ERROR]', error.response?.status, error.response?.data || error.message);
            return Promise.reject(error);
        }
    );

    return client;
}

export const authClient = createClient(AUTH_BASE_URL);
export const dataClient = createClient(DATA_BASE_URL);
