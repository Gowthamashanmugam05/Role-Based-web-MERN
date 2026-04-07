import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import API_URL from '../config/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
        }
        setLoading(false);
    }, []);

    const loginSendOTP = async (email, password) => {
        await axios.post(`${API_URL}/api/auth/login/send-otp`, { email, password });
    };

    const registerSendOTP = async (name, email, password) => {
        await axios.post(`${API_URL}/api/auth/register/send-otp`, { name, email, password });
    };

    const verifyOTP = async (email, otp, purpose) => {
        const endpoint = purpose === 'register' 
            ? `${API_URL}/api/auth/register/verify-otp` 
            : `${API_URL}/api/auth/login/verify-otp`;
            
        const { data } = await axios.post(endpoint, { email, otp });
        
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        return data;
    };

    const resendOTP = async (email, purpose) => {
        await axios.post(`${API_URL}/api/auth/resend-otp`, { email, purpose });
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            loading, 
            loginSendOTP, 
            registerSendOTP, 
            verifyOTP,
            resendOTP,
            logout 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
