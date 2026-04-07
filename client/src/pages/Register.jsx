import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight, CheckCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import logo from '../assets/full-logo.png';
import toast from 'react-hot-toast';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [otp, setOtp] = useState('');
    const [isOTPStep, setIsOTPStep] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const { registerSendOTP, verifyOTP, resendOTP } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        let timer;
        if (cooldown > 0) {
            timer = setInterval(() => {
                setCooldown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [cooldown]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await registerSendOTP(formData.name, formData.email, formData.password);
            toast.success("Verification code sent to your email!");
            setIsOTPStep(true);
            setCooldown(60);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send verification code');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await verifyOTP(formData.email, otp, 'register');
            toast.success("Account created successfully! Welcome.");
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid or expired code');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (cooldown > 0) return;
        setIsLoading(true);
        try {
            await resendOTP(formData.email, 'register');
            toast.success("New verification code sent!");
            setCooldown(60);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to resend code');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex items-center justify-center px-4">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg"
            >
                <div className="glass p-12 rounded-3xl space-y-10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-brand-500/10 rounded-full -ml-16 -mt-16 blur-2xl"></div>
                    
                    <div className="text-center relative">
                        <div className="mb-6 flex justify-center">
                            <img src={logo} alt="Role Based AI Job Matcher" className="h-40 w-auto object-contain" />
                        </div>
                        <h2 className="text-4xl font-black text-white tracking-tight">
                            {isOTPStep ? "Verify Account" : "Create Account"}
                        </h2>
                        <p className="text-slate-400 mt-3 text-base font-medium">
                            {isOTPStep 
                                ? `Enter the 6-digit code sent to ${formData.email}` 
                                : "Create your account and match with your dream role"}
                        </p>
                    </div>

                    {!isOTPStep ? (
                        <form onSubmit={handleSendOTP} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-300 ml-1 uppercase tracking-widest">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 z-10" size={18} />
                                    <input 
                                        className="input-field !pl-12" 
                                        name="name"
                                        type="text" 
                                        placeholder="John Doe" 
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-300 ml-1 uppercase tracking-widest">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 z-10" size={18} />
                                    <input 
                                        className="input-field !pl-12" 
                                        name="email"
                                        type="email" 
                                        placeholder="john@example.com" 
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-300 ml-1 uppercase tracking-widest">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 z-10" size={18} />
                                    <input 
                                        className="input-field !pl-12" 
                                        name="password"
                                        type="password" 
                                        placeholder="Minimum 8 characters" 
                                        onChange={handleChange}
                                        required
                                        minLength="8"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pb-4">
                                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-tighter">
                                    <CheckCircle size={14} className="text-brand-500" /> Secure Encryption
                                </div>
                                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-tighter">
                                    <CheckCircle size={14} className="text-brand-500" /> Data Privacy Guaranteed
                                </div>
                            </div>

                            <button 
                                type="submit"
                                className="w-full btn-primary py-4 rounded-xl flex items-center justify-center gap-2 text-lg font-black shadow-brand-500/40"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Sending Code...' : 'Continue'}
                                {!isLoading && <ArrowRight size={20} />}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOTP} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-300 ml-1 uppercase tracking-widest">Verification Code</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 z-10" size={18} />
                                    <input 
                                        className="input-field !pl-12 tracking-[0.5em] font-mono text-center" 
                                        type="text" 
                                        placeholder="000000" 
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        required
                                        maxLength="6"
                                        pattern="\d{6}"
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit"
                                className="w-full btn-primary py-4 rounded-xl flex items-center justify-center gap-2 text-lg font-black shadow-brand-500/40"
                                disabled={isLoading || otp.length !== 6}
                            >
                                {isLoading ? 'Verifying...' : 'Verify & Create Account'}
                                {!isLoading && <CheckCircle size={20} />}
                            </button>

                            <button 
                                type="button"
                                onClick={handleResendOTP}
                                disabled={isLoading || cooldown > 0}
                                className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors disabled:opacity-50 disabled:hover:text-slate-400"
                            >
                                <RefreshCw size={16} className={isLoading && cooldown === 0 ? "animate-spin" : ""} />
                                {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend Code'}
                            </button>
                            
                            <button
                                type="button"
                                onClick={() => setIsOTPStep(false)}
                                className="w-full text-center text-sm font-medium text-brand-400 hover:text-brand-300"
                            >
                                Back to Registration
                            </button>
                        </form>
                    )}

                    {!isOTPStep && (
                        <div className="text-center text-sm font-medium text-slate-500 pt-2 pb-4">
                            Already have an account? 
                            <Link to="/login" className="text-brand-400 hover:text-brand-300 ml-1 font-bold">Log in here</Link>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
