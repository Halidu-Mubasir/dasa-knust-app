import { create } from 'zustand';
import api from '@/lib/axios';
import { User, LoginCredentials, RegisterData, AuthResponse } from '@/types/user';
import { toast } from 'sonner';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    // Actions
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
    initialize: () => Promise<void>;
    setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,

    login: async (credentials: LoginCredentials) => {
        try {
            console.log('Login attempt with:', {
                username: credentials.username,
                password: '[REDACTED]',
                passwordLength: credentials.password.length,
            });

            // Call login API
            const { data } = await api.post<AuthResponse>('/auth/login/', credentials);

            console.log('Login successful, tokens received');

            // Save tokens to localStorage
            localStorage.setItem('accessToken', data.access);
            localStorage.setItem('refreshToken', data.refresh);

            // Fetch user profile
            const userResponse = await api.get<User>('/users/me/');

            // Update state
            set({
                user: userResponse.data,
                isAuthenticated: true,
                isLoading: false
            });

            toast.success('Welcome back!');
        } catch (error: any) {
            console.error('Login error details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                message: error.message,
            });

            set({ user: null, isAuthenticated: false, isLoading: false });

            // Handle specific error messages
            if (error.response?.status === 401) {
                const errorMsg = error.response?.data?.detail || error.response?.data?.message;
                if (errorMsg) {
                    toast.error(errorMsg);
                } else {
                    toast.error('Invalid credentials. Please check your username and password.');
                }
            } else if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else if (error.response?.data?.detail) {
                toast.error(error.response.data.detail);
            } else {
                toast.error('Login failed. Please try again.');
            }

            throw error;
        }
    },

    register: async (data: RegisterData) => {
        try {
            console.log('Registration data being sent:', data);
            const response = await api.post('/auth/register/', data);
            console.log('Registration response:', response.data);
            toast.success('Account created successfully! Please log in.');
        } catch (error: any) {
            console.error('Registration error details:', {
                status: error.response?.status,
                data: error.response?.data,
                headers: error.response?.headers,
            });

            // Handle validation errors from Django
            if (error.response?.data) {
                const errorData = error.response.data;

                // Django typically returns errors as {field: [error1, error2]} or {field: error}
                if (typeof errorData === 'object' && !errorData.message) {
                    Object.keys(errorData).forEach((key) => {
                        const messages = errorData[key];
                        if (Array.isArray(messages)) {
                            messages.forEach((message: string) => {
                                toast.error(`${key}: ${message}`);
                            });
                        } else {
                            toast.error(`${key}: ${messages}`);
                        }
                    });
                } else if (errorData.message) {
                    toast.error(errorData.message);
                } else {
                    toast.error('Registration failed. Check console for details.');
                }
            } else {
                toast.error('Registration failed. Please try again.');
            }

            throw error;
        }
    },

    logout: () => {
        // Clear tokens from localStorage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        // Reset state
        set({
            user: null,
            isAuthenticated: false,
            isLoading: false
        });

        toast.success('Logged out successfully');
    },

    initialize: async () => {
        const token = localStorage.getItem('accessToken');

        if (!token) {
            set({ user: null, isAuthenticated: false, isLoading: false });
            return;
        }

        try {
            // Fetch user profile if token exists
            const { data } = await api.get<User>('/users/me/');

            set({
                user: data,
                isAuthenticated: true,
                isLoading: false
            });
        } catch (error) {
            // Token is invalid or expired
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');

            set({
                user: null,
                isAuthenticated: false,
                isLoading: false
            });
        }
    },

    setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
    },
}));
