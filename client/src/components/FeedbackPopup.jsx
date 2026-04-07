import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

const POPUP_INTERVAL_MS = 3 * 60 * 1000; // 3 minutes

const FeedbackPopup = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [message, setMessage] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user } = useAuth();
    const location = useLocation();

    useEffect(() => {
        const isDashboard = location.pathname === '/';
        const hasSubmitted = localStorage.getItem('feedback_submitted') === 'true';

        // Do not run popup logic if they are not on Dashboard or already submitted
        if (!isDashboard || hasSubmitted) {
            setIsVisible(false);
            return;
        }

        // Show popup after 3 minutes if not already submitted
        const timer = setTimeout(() => {
            if (localStorage.getItem('feedback_submitted') !== 'true') {
                setIsVisible(true);
            }
        }, POPUP_INTERVAL_MS);

        return () => clearTimeout(timer);
    }, [location.pathname]);

    // Re-schedule after dismissal (only if not submitted)
    const scheduleNext = () => {
        if (localStorage.getItem('feedback_submitted') === 'true') return;

        setTimeout(() => {
            if (localStorage.getItem('feedback_submitted') !== 'true') {
                setRating(0);
                setHoverRating(0);
                setMessage('');
                setSubmitted(false);
                setIsVisible(true);
            }
        }, POPUP_INTERVAL_MS);
    };

    const handleClose = () => {
        setIsVisible(false);
        scheduleNext();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) return;

        setIsSubmitting(true);

        try {
            if (user?.token) {
                await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/feedback`, 
                    { rating, message }, 
                    { headers: { Authorization: `Bearer ${user.token}` } }
                );
            }
        } catch (error) {
            console.error("Failed to submit feedback", error);
            // Even if it fails, lets continue to dismiss the popup so we don't annoy the user
        }

        localStorage.setItem('feedback_submitted', 'true'); // Flag permanently prevents popup

        setIsSubmitting(false);
        setSubmitted(true);

        // Auto-close after showing thank-you for 2s
        setTimeout(() => {
            setIsVisible(false);
        }, 2000);
    };

    const ratingLabels = ['', 'Terrible', 'Bad', 'Okay', 'Good', 'Excellent'];
    const activeRating = hoverRating || rating;

    return (
        <AnimatePresence>
            {isVisible && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
                    />

                    {/* Popup Card */}
                    <motion.div
                        key="popup"
                        initial={{ opacity: 0, scale: 0.85, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.85, y: 40 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="fixed inset-0 flex items-center justify-center z-[201] px-4 pointer-events-none"
                    >
                        <div className="pointer-events-auto w-full max-w-md bg-[#0f172a] border border-white/10 rounded-[2rem] shadow-2xl shadow-black/50 overflow-hidden">

                            {/* Header Gradient Bar */}
                            <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                            <div className="p-8">
                                {/* Close Button */}
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                            <MessageSquare size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-black text-lg tracking-tight">Quick Feedback</h3>
                                            <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest">How's your experience?</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleClose}
                                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white transition-all"
                                        id="feedback-close-btn"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                <AnimatePresence mode="wait">
                                    {/* Submitted State */}
                                    {submitted ? (
                                        <motion.div
                                            key="thanks"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="flex flex-col items-center justify-center py-8 space-y-4"
                                        >
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.1 }}
                                                className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400"
                                            >
                                                <CheckCircle2 size={32} />
                                            </motion.div>
                                            <div className="text-center space-y-1">
                                                <p className="text-white font-black text-xl">Thank You! 🎉</p>
                                                <p className="text-slate-500 text-sm font-medium">Your feedback helps us improve.</p>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        /* Feedback Form */
                                        <motion.form
                                            key="form"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            onSubmit={handleSubmit}
                                            className="space-y-6"
                                            id="feedback-form"
                                        >
                                            {/* Star Rating */}
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                    Rate your experience
                                                </label>
                                                <div className="flex items-center gap-2">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button
                                                            key={star}
                                                            type="button"
                                                            id={`star-${star}`}
                                                            onMouseEnter={() => setHoverRating(star)}
                                                            onMouseLeave={() => setHoverRating(0)}
                                                            onClick={() => setRating(star)}
                                                            className="transition-transform hover:scale-125 active:scale-95"
                                                        >
                                                            <Star
                                                                size={32}
                                                                className={`transition-colors duration-150 ${
                                                                    star <= activeRating
                                                                        ? 'fill-amber-400 text-amber-400'
                                                                        : 'fill-transparent text-slate-700'
                                                                }`}
                                                            />
                                                        </button>
                                                    ))}
                                                    {activeRating > 0 && (
                                                        <motion.span
                                                            key={activeRating}
                                                            initial={{ opacity: 0, x: -5 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            className="ml-2 text-amber-400 font-black text-sm uppercase tracking-widest"
                                                        >
                                                            {ratingLabels[activeRating]}
                                                        </motion.span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Message */}
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                    Tell us more <span className="text-slate-700">(optional)</span>
                                                </label>
                                                <textarea
                                                    id="feedback-message"
                                                    rows={3}
                                                    value={message}
                                                    onChange={(e) => setMessage(e.target.value)}
                                                    placeholder="What do you love? What can we improve?"
                                                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-white text-sm font-medium placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 resize-none transition-all"
                                                />
                                            </div>

                                            {/* Submit */}
                                            <button
                                                id="feedback-submit-btn"
                                                type="submit"
                                                disabled={rating === 0 || isSubmitting}
                                                className="w-full flex items-center justify-center gap-3 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-[.2em] rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-indigo-500/20"
                                            >
                                                {isSubmitting ? (
                                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                ) : (
                                                    <>
                                                        <Send size={16} />
                                                        Submit Feedback
                                                    </>
                                                )}
                                            </button>
                                        </motion.form>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default FeedbackPopup;
