import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Key, ArrowRight, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/full-logo.png';
import toast from 'react-hot-toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('login'); // 'login' or 'otp'
    const [isLoading, setIsLoading] = useState(false);
    const { login, verifyOtp } = useAuth();
    const navigate = useNavigate();

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await login(email, password);
            toast.success("OTP sent to your email!");
            setStep('otp');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await verifyOtp(email, otp);
            toast.success("Welcome back!");
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.message || 'OTP Verification failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex items-center justify-center px-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="glass p-10 rounded-3xl space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand-500/5 rounded-full -ml-12 -mb-12 blur-xl"></div>
                    
                    <div className="text-center relative">
                        <div className="mb-6 flex justify-center">
                            <img src={logo} alt="Role Based AI Job Matcher" className="h-40 w-auto object-contain" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-white tracking-tight">
                            {step === 'login' ? 'Welcome Back' : 'Verify Email'}
                        </h2>
                        <p className="text-slate-400 mt-2 text-sm font-medium">
                            {step === 'login' ? 'Log in to match your skills with job roles' : `Enter the 6-digit OTP sent to ${email}`}
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 'login' ? (
                            <motion.form 
                                key="login"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                onSubmit={handleLoginSubmit} 
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-300 ml-1 uppercase tracking-wider">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 z-10" size={18} />
                                        <input 
                                            className="input-field !pl-12" 
                                            type="email" 
                                            placeholder="Enter your email" 
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-300 ml-1 uppercase tracking-wider">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 z-10" size={18} />
                                        <input 
                                            className="input-field !pl-12" 
                                            type="password" 
                                            placeholder="••••••••" 
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <button 
                                    className="w-full btn-primary py-4 rounded-xl flex items-center justify-center gap-2 text-base font-bold shadow-brand-500/30"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Processing...' : 'Sign In'}
                                    {!isLoading && <ArrowRight size={18} />}
                                </button>
                            </motion.form>
                        ) : (
                            <motion.form 
                                key="otp"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                onSubmit={handleOtpSubmit} 
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-300 ml-1 uppercase tracking-wider">OTP Code</label>
                                    <div className="relative">
                                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 z-10" size={18} />
                                        <input 
                                            className="input-field !pl-12 tracking-[0.5em] font-mono text-center" 
                                            type="text" 
                                            placeholder="123456" 
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            required
                                        />
                                    </div>
                                </div>

                                <button 
                                    className="w-full btn-primary py-4 rounded-xl flex items-center justify-center gap-2 text-base font-bold shadow-brand-500/30"
                                    disabled={isLoading || otp.length !== 6}
                                >
                                    {isLoading ? 'Verifying...' : 'Verify Login'}
                                    {!isLoading && <CheckCircle size={18} />}
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    {step === 'login' && (
                        <div className="text-center text-sm font-medium text-slate-500 pt-4">
                            Don't have an account? 
                            <Link to="/register" className="text-brand-400 hover:text-brand-300 ml-1 transition-colors">Create one</Link>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
