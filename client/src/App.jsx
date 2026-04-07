import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Navbar from './components/Navbar';
import Preloader from './components/Preloader';
import FeedbackPopup from './components/FeedbackPopup';
import { Toaster } from 'react-hot-toast';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return null;
    if (!user) return <Navigate to="/login" />;
    return children;
};

const AppLayout = () => {
    const location = useLocation();
    const isAppPage = location.pathname === '/';
    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

    return (
        <div className={`min-h-screen bg-[#020617] text-slate-100 flex flex-col ${(isAuthPage || isAppPage) ? 'h-screen overflow-hidden' : ''}`}>
            {!isAppPage && <Navbar />}
            <main className="flex-1 overflow-auto">
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route 
                        path="/" 
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        } 
                    />
                </Routes>
            </main>
            {(!isAuthPage && !isAppPage) && (
                <footer className="py-6 border-t border-slate-900/80 text-center text-slate-500 text-sm">
                    &copy; 2026 role based - AI Job Role Matcher
                </footer>
            )}
        </div>
    );
};

function App() {
    const [isPreloaded, setIsPreloaded] = React.useState(false);

    return (
        <AuthProvider>
            <Toaster position="top-right" reverseOrder={false} 
                toastOptions={{
                    style: { background: '#0f172a', color: '#fff', border: '1px solid #1e293b' },
                }}
            />
            <AnimatePresence>
                {!isPreloaded && <Preloader onComplete={() => setIsPreloaded(true)} />}
            </AnimatePresence>
            
            {isPreloaded && (
                <Router>
                    <AppLayout />
                    <FeedbackPopup />
                </Router>
            )}
        </AuthProvider>
    );
}

export default App;
