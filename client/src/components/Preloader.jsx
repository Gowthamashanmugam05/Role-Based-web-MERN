import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Preloader = ({ onComplete }) => {
    const [phase, setPhase] = useState(0); 

    useEffect(() => {
        // Snappier timings
        const timer1 = setTimeout(() => setPhase(1), 500); // Fly in initials
        const timer2 = setTimeout(() => setPhase(2), 1200); // Slide out text
        const timer3 = setTimeout(() => setPhase(3), 2000); // Fade in tagline
        const timer4 = setTimeout(() => onComplete(), 3800); // Finish faster

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
            clearTimeout(timer4);
        };
    }, [onComplete]);

    // Professional motion variables
    const snapSpring = { type: "spring", damping: 18, stiffness: 120 };
    const ultraSmooth = [0.16, 1, 0.3, 1]; // Exponential Out (Very professional)

    return (
        <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(20px)" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] bg-[#020617] flex flex-col items-center justify-center overflow-hidden"
        >
            {/* High-end glow layer */}
            <div className="absolute inset-0 bg-brand-500/5 pointer-events-none" />
            <motion.div 
                animate={{ 
                    scale: [1, 1.4, 1],
                    opacity: [0.05, 0.1, 0.05],
                }}
                transition={{ duration: 6, repeat: Infinity }}
                className="absolute w-[900px] h-[900px] bg-brand-500/10 rounded-full blur-[180px]"
            />

            <div className="relative flex flex-col items-center">
                <div className="flex items-center justify-center">
                    {/* ROLE SECTION */}
                    <div className="flex items-center overflow-hidden h-28 px-2">
                        <motion.span 
                            initial={{ x: -600, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.7, ease: ultraSmooth }}
                            className="text-8xl md:text-9xl font-black text-brand-500 relative z-20"
                        >
                            R
                        </motion.span>
                        <AnimatePresence>
                            {phase >= 2 && (
                                <motion.div 
                                    initial={{ x: "-100%", opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ duration: 0.6, ease: ultraSmooth }}
                                    className="text-8xl md:text-9xl font-black text-white relative z-10 flex items-center"
                                >
                                    <span className="tracking-tighter">ole</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="w-4 md:w-8" />

                    {/* BASED SECTION */}
                    <div className="flex items-center overflow-hidden h-28 px-2">
                        <motion.span 
                            initial={{ x: 600, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.7, ease: ultraSmooth }}
                            className="text-8xl md:text-9xl font-black text-brand-500 relative z-20"
                        >
                            B
                        </motion.span>
                        <AnimatePresence>
                            {phase >= 2 && (
                                <motion.div 
                                    initial={{ x: "-100%", opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ duration: 0.6, ease: ultraSmooth }}
                                    className="text-8xl md:text-9xl font-black text-white relative z-10"
                                >
                                    <span className="tracking-tighter">ased</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* AI TAGLINE */}
                <div className="h-10 mt-6 overflow-hidden">
                    <AnimatePresence>
                        {phase >= 3 && (
                            <motion.div 
                                initial={{ y: 30, opacity: 0, letterSpacing: "1.5rem" }}
                                animate={{ y: 0, opacity: 1, letterSpacing: "0.5rem" }}
                                transition={{ duration: 1, ease: ultraSmooth }}
                                className="text-sm md:text-base font-bold text-brand-500 uppercase flex items-center gap-6 whitespace-nowrap"
                            >
                                <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-brand-500/40" />
                                <span>AI Job Matcher</span>
                                <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-brand-500/40" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* SMOOTH BOTTOM INDICATOR */}
            <div className="absolute bottom-20 flex flex-col items-center gap-4">
                <div className="w-32 h-[2px] bg-slate-900 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-1/2 h-full bg-brand-500 shadow-[0_0_10px_#0ea5e9]"
                    />
                </div>
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    className="text-[10px] font-black text-slate-500 uppercase tracking-widest"
                >
                    Synthesizing Career Matrix
                </motion.p>
            </div>
        </motion.div>
    );
};

export default Preloader;
