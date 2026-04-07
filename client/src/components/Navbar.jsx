import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, UserCircle } from 'lucide-react';
import logo from '../assets/full-logo.png';

const Navbar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    return (
        <nav className="glass sticky top-0 z-50 px-6 h-20 border-b border-white/5 flex items-center">
            <div className="max-w-7xl mx-auto w-full flex justify-between items-center group">
                <Link to="/" className="flex items-center group relative z-10">
                    <img 
                        src={logo} 
                        alt="Role Based AI Job Matcher" 
                        className="h-20 w-auto object-contain transition-all scale-150 origin-left group-hover:scale-[1.65]" 
                    />
                </Link>

                <div className="flex items-center gap-6">
                    {user ? (
                        <>
                            <div className="items-center gap-2 hidden md:flex">
                                <UserCircle size={20} className="text-brand-400" />
                                <span className="text-sm font-medium text-slate-300">{user.name}</span>
                            </div>
                            <button 
                                onClick={logout} 
                                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-400 hover:text-red-400 transition-colors"
                            >
                                <LogOut size={16} />
                                <span>Logout</span>
                            </button>
                        </>
                    ) : (
                        <div className="flex gap-4">
                            {location.pathname === '/login' ? (
                                <Link to="/register" className="btn-primary py-1.5 px-6 rounded-full text-sm shadow-md">Sign Up</Link>
                            ) : (
                                <Link to="/login" className="btn-primary py-1.5 px-6 rounded-full text-sm shadow-md">Login</Link>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
