import axios from 'axios';

const API_URL = import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://order-management-backend-production-e017.up.railway.app/api';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add Interceptor to attach token
api.interceptors.request.use((config) => {
    const adminToken = localStorage.getItem("adminToken");
    const clientToken = localStorage.getItem("clientToken");

    if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
    } else if (clientToken) {
        config.headers.Authorization = `Bearer ${clientToken}`;
    }

    return config;
});

// Response Interceptor for Refresh Token
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers['Authorization'] = 'Bearer ' + token;
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    throw new Error("No refresh token");
                }

                // Use axios directly to avoid interceptor loop
                const response = await axios.post(`${API_URL}/admin/refresh`, { refreshToken });
                const { token } = response.data;

                localStorage.setItem('adminToken', token);

                // Update header for verify calls
                api.defaults.headers.common['Authorization'] = 'Bearer ' + token;
                originalRequest.headers['Authorization'] = 'Bearer ' + token;

                processQueue(null, token);
                return api(originalRequest);
            } catch (err) {
                processQueue(err, null);
                // Logout if refresh fails
                localStorage.removeItem('adminToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/admin/login';
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export const getProducts = async () => {
    const response = await api.get('/client/products');
    return response.data;
};

// Auth
export const adminLogin = async (email: string, password: string) => {
    const response = await api.post('/admin/login', { email, password });
    if (response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
    }
    if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    return response.data;
};

export const requestOtp = async (mobileNumber: string) => {
    const response = await api.post('/auth/otp', { mobileNumber });
    return response.data;
};

export const verifyOtp = async (mobileNumber: string, otp: string) => {
    const response = await api.post('/auth/verify', { mobileNumber, otp });
    return response.data;
};

export const clientLogin = async (name: string, mobileNumber: string) => {
    const response = await api.post('/client/login', { name, mobileNumber });
    if (response.data.token) {
        localStorage.setItem('clientToken', response.data.token);
        sessionStorage.setItem('clientInfo', JSON.stringify(response.data.client));
    }
    return response.data;
};

export const getClientHistory = async () => {
    const token = localStorage.getItem('clientToken');
    const response = await api.get('/client/orders', {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

// Helper to check if logged in
export const isClientLoggedIn = () => !!localStorage.getItem('clientToken');

export const submitInquiry = async (data: any) => {
    // If logged in, we might not need to send name/mobile if backend extracted it from token,
    // but our controller still expects it in body for now.
    // Let's keep sending it for compatibility.
    const response = await api.post('/client/inquiry', data);
    return response.data;
};

// Orders
export const getOrders = async () => {
    const response = await api.get('/admin/orders');
    return response.data;
};

export const getOrder = async (orderId: string) => {
    const response = await api.get(`/client/order/${orderId}`);
    return response.data;
};

export const setPricing = async (orderId: string, items: any[]) => {
    const response = await api.put(`/admin/order/${orderId}/pricing`, { items });
    return response.data;
};

export const modifyOrder = async (orderId: string, items: any[]) => {
    const response = await api.put(`/client/order/${orderId}/modify`, { items });
    return response.data;
};

export const confirmOrder = async (orderId: string) => {
    const response = await api.post(`/client/order/${orderId}/confirm`);
    return response.data;
};

export const confirmDelivery = async (orderId: string) => {
    const response = await api.post(`/client/order/${orderId}/received`);
    return response.data;
};

export const cancelOrder = async (orderId: string) => {
    const response = await api.post(`/admin/order/${orderId}/cancel`);
    return response.data;
};

export const extendDueDate = async (orderId: string, date: string) => {
    const response = await api.put(`/admin/order/${orderId}/extend-due-date`, { date });
    return response.data;
};

export const adminDeliverOrder = async (orderId: string) => {
    const response = await api.post(`/admin/order/${orderId}/deliver`);
    return response.data;
};

// Local History (No Auth)
export const getLocalHistory = () => {
    const history = localStorage.getItem('localOrderHistory');
    return history ? JSON.parse(history) : [];
};

export const addToLocalHistory = (order: any) => {
    const history = getLocalHistory();
    // Avoid duplicates
    if (!history.find((o: any) => o._id === order._id)) {
        const entry = {
            _id: order._id,
            createdAt: order.createdAt,
            itemCount: order.items.length,
            status: order.orderStatus,
            mobileNumber: order.clientId?.mobileNumber || order.mobileNumber // Store ownership
        };
        const newHistory = [entry, ...history].slice(0, 20); // Keep last 20
        localStorage.setItem('localOrderHistory', JSON.stringify(newHistory));
    }
};
