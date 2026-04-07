import React, { useState } from 'react';
import axios from 'axios';
import { 
    Upload, FileText, Send, CheckCircle2, XCircle, 
    Zap, Target, Sparkles, BookOpen, UserCheck, 
    ArrowRight, Sparkle, Loader2, Award, Briefcase, ExternalLink,
    ChevronUp, ChevronDown, UserCircle, LogOut, Menu, X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/full-logo.png';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [file, setFile] = useState(null);
    const [jobRole, setJobRole] = useState('');
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [skills, setSkills] = useState('');
    const [experience, setExperience] = useState('Beginner');
    const [location, setLocation] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [liveJobs, setLiveJobs] = useState([]);
    const [jobsLoading, setJobsLoading] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Track User Time on Dashboard
    React.useEffect(() => {
        if (!user?.token) return;
        
        // ping every 60 seconds (1 minute)
        const timeInterval = setInterval(async () => {
            try {
                await axios.post('http://localhost:5000/api/auth/time', 
                    { seconds: 60 },
                    { headers: { Authorization: `Bearer ${user.token}` } }
                );
            } catch (error) {
                console.warn('Failed to update tracking time');
            }
        }, 60000);

        return () => clearInterval(timeInterval);
    }, [user]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
            toast.success('Resume uploaded successfully!');
        } else {
            toast.error('Please upload a valid PDF file.');
        }
    };

    const fetchLiveJobs = async (role, loc) => {
        setJobsLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/jobs', {
                params: { query: role || 'IT jobs', location: loc || 'India', pages: 1 },
                timeout: 15000,
            });
            if (Array.isArray(response.data) && response.data.length > 0) {
                setLiveJobs(response.data);
            }
        } catch (err) {
            console.warn('Live jobs fetch failed:', err.message);
        } finally {
            setJobsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !jobRole || !name) {
            toast.error('Please fill all required fields');
            return;
        }

        setIsLoading(true);
        setIsSidebarOpen(false);
        setLiveJobs([]);
        const formData = new FormData();
        formData.append('resume', file);
        formData.append('jobRole', jobRole);
        formData.append('name', name);
        formData.append('age', age);
        formData.append('skills', skills);
        formData.append('experience', experience);
        formData.append('location', location);

        try {
            const response = await axios.post('http://localhost:5000/api/resume/analyze', formData, {
                timeout: 120000
            });
            if (response.data.success) {
                setResult(response.data.analysis);
                toast.success('AI Analysis Complete!');
                // Fetch live jobs in parallel after analysis
                fetchLiveJobs(jobRole, location);
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error(error.response?.data?.message || 'Error analyzing resume');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen w-full flex flex-col md:flex-row bg-[#020617] text-slate-200 selection:bg-brand-500/30 overflow-hidden relative">
            
            {/* Top Bar for Mobile */}
            <div className="md:hidden flex items-center justify-between p-4 bg-slate-900/50 border-b border-white/5 backdrop-blur-xl z-[60]">
                <img src={logo} alt="Logo" className="h-10 w-auto" />
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="p-2 rounded-xl bg-white/5 text-brand-400"
                    >
                        <UserCircle size={20} />
                    </button>
                    <button 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 rounded-xl bg-brand-500 text-white"
                    >
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Desktop Profile Toggle (Fixed) */}
            <div className="hidden md:block fixed top-6 right-8 z-[100]">
                <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className={`flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-900/40 border border-white/5 backdrop-blur-md transition-all hover:border-brand-500/30 ${isProfileOpen ? 'border-brand-500/50' : ''}`}
                >
                    <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400">
                        <UserCircle size={20} />
                    </div>
                </button>

                <AnimatePresence>
                    {isProfileOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className="absolute top-14 right-0 w-64 bg-slate-900/90 border border-white/5 backdrop-blur-2xl rounded-2xl shadow-2xl p-4 space-y-4"
                        >
                            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Authenticated As</p>
                                <p className="text-sm font-black text-white truncate">{user?.name}</p>
                                <p className="text-[10px] font-bold text-slate-500 truncate">{user?.email}</p>
                            </div>
                            <div className="space-y-1">
                                <button 
                                    onClick={logout}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all font-black uppercase text-[10px] tracking-widest"
                                >
                                    <LogOut size={16} /> Logout Session
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Mobile Profile Dropdown (Fixed Overlay) */}
            <AnimatePresence>
                {(isProfileOpen && !isSidebarOpen) && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="md:hidden fixed top-20 right-4 w-[calc(100%-2rem)] bg-slate-900 border border-white/5 backdrop-blur-2xl rounded-2xl shadow-2xl p-6 z-[100]"
                    >
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 mb-4">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Account</p>
                            <p className="text-lg font-black text-white truncate">{user?.name}</p>
                            <p className="text-xs font-bold text-slate-500">{user?.email}</p>
                        </div>
                        <button 
                            onClick={logout}
                            className="w-full flex items-center justify-center gap-3 px-3 py-4 rounded-2xl bg-red-500/10 text-red-400 font-black uppercase text-xs tracking-widest border border-red-500/20"
                        >
                            <LogOut size={18} /> Logout Session
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* LEFT SIDEBAR (User Input Navbar) */}
            <aside className={`
                fixed inset-0 z-50 md:relative md:inset-auto md:flex
                w-full md:w-[420px] h-full flex flex-col bg-slate-900 md:bg-slate-900/40 border-r border-white/5 backdrop-blur-xl transition-transform duration-500
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                {/* Fixed Header */}
                <div className="px-8 pt-10 md:pt-6 pb-4 relative">
                    <button 
                        onClick={() => setIsSidebarOpen(false)}
                        className="md:hidden absolute top-6 right-6 p-2 rounded-xl bg-white/5 text-slate-400"
                    >
                        <X size={20} />
                    </button>
                    <img src={logo} alt="Logo" className="h-16 md:h-20 w-auto mb-3 scale-125 origin-left" />
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 mb-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse"></span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-brand-400">Recruiter Simulation v2.0</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter leading-none mb-2">Career <span className="text-brand-500">Analyzer</span></h1>
                    <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">Match your industry DNA.</p>
                </div>

                {/* Scrollable Form Area */}
                <div className="flex-1 overflow-y-auto px-6 md:px-8 custom-scrollbar space-y-6 md:space-y-8 pb-32">
                    <form id="analyzer-form" onSubmit={handleSubmit} className="space-y-5 md:space-y-6 pt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                                <input 
                                    type="text" 
                                    placeholder="Ex: John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-brand-500/50 transition-all outline-none text-white font-bold placeholder:text-slate-700 sm:text-sm" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Age</label>
                                <input 
                                    type="number" 
                                    placeholder="24"
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-brand-500/50 transition-all outline-none text-white font-bold placeholder:text-slate-700 sm:text-sm" 
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Experience</label>
                                <select 
                                    value={experience}
                                    onChange={(e) => setExperience(e.target.value)}
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-brand-500/50 transition-all outline-none text-white font-bold appearance-none cursor-pointer sm:text-sm"
                                >
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Professional</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Location</label>
                                <input 
                                    type="text" 
                                    placeholder="Chennai"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-brand-500/50 transition-all outline-none text-white font-bold placeholder:text-slate-700 sm:text-sm" 
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Target Job Role</label>
                            <div className="relative group">
                                <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-400 transition-colors" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="Ex: Senior React Dev"
                                    value={jobRole}
                                    onChange={(e) => setJobRole(e.target.value)}
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-5 py-4 focus:ring-2 focus:ring-brand-500/50 transition-all outline-none text-white font-bold placeholder:text-slate-700 sm:text-sm" 
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Resume (PDF)</label>
                            <input type="file" onChange={handleFileChange} className="hidden" id="side-upload" accept=".pdf" />
                            <label 
                                htmlFor="side-upload"
                                className={`flex flex-col items-center justify-center p-6 md:p-8 border-2 border-dashed rounded-3xl cursor-pointer transition-all ${file ? 'border-brand-500/50 bg-brand-500/5' : 'border-white/5 hover:border-white/10 hover:bg-white/5'}`}
                            >
                                <div className={`p-3 rounded-xl mb-3 ${file ? 'bg-brand-500 text-white' : 'bg-white/5 text-slate-500'}`}>
                                    <FileText size={20} />
                                </div>
                                <p className={`font-black text-[9px] md:text-[10px] uppercase tracking-widest text-center truncate w-full ${file ? 'text-brand-400' : 'text-slate-600'}`}>
                                    {file ? file.name : 'Choose File'}
                                </p>
                            </label>
                        </div>
                    </form>
                </div>

                {/* Fixed Footer with Submit Button */}
                <div className="p-6 md:p-8 bg-slate-900 border-t border-white/5 absolute bottom-0 left-0 w-full z-10">
                    <button 
                        form="analyzer-form"
                        type="submit"
                        disabled={isLoading}
                        className="w-full group relative overflow-hidden flex items-center justify-center gap-3 bg-brand-600 hover:bg-brand-500 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-brand-500/20 active:scale-[0.98] disabled:opacity-50"
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            <>
                                <Zap size={18} fill="currentColor" />
                                <span className="uppercase tracking-[0.2em] text-xs">Match My Role</span>
                                <ArrowRight size={16} />
                            </>
                        )}
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 h-full overflow-y-auto overflow-x-hidden custom-scrollbar relative px-4 md:px-0">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[400px] md:w-[800px] h-[400px] md:h-[800px] bg-brand-600/5 rounded-full blur-[80px] md:blur-[120px] -mr-48 md:-mr-96 -mt-48 md:-mt-96 pointer-events-none"></div>
                
                <div className="max-w-5xl mx-auto md:px-12 pt-6 md:pt-8 pb-16 relative">
                    <AnimatePresence mode="wait">
                        {isLoading && (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-[60vh] md:h-[70vh] flex flex-col items-center justify-center space-y-8 md:space-y-12"
                            >
                                <div className="relative">
                                    <div className="w-24 md:w-32 h-24 md:h-32 rounded-full border-4 border-brand-500/10 border-t-brand-500 animate-spin"></div>
                                    <Sparkle className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-brand-400 animate-pulse" size={32} />
                                </div>
                                <div className="text-center space-y-4 md:space-y-6 px-4">
                                    <h3 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter">"Simulating Senior Decision Panel..."</h3>
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-64 md:w-80 h-2 md:h-2.5 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                                            <motion.div 
                                                className="h-full bg-brand-500 shadow-[0_0_20px_rgba(99,102,241,0.5)]"
                                                initial={{ width: "0%" }}
                                                animate={{ width: "100%" }}
                                                transition={{ duration: 15, ease: "linear" }}
                                            />
                                        </div>
                                        <p className="text-slate-500 animate-pulse font-black text-[9px] md:text-[10px] uppercase tracking-[.3em]">AI Synthesis in Progress</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {!isLoading && !result && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="h-[60vh] md:h-[70vh] flex flex-col items-center justify-center text-center space-y-6 md:space-y-8"
                            >
                                <div className="w-20 md:w-24 h-20 md:h-24 bg-slate-900 rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center text-brand-500 border border-brand-500/10 shadow-2xl shadow-brand-500/5">
                                    <Send size={40} className="md:w-12 md:h-12" />
                                </div>
                                <div className="space-y-3 md:space-y-4 px-6 md:px-0">
                                    <h3 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none">Intelligence Hub.</h3>
                                    <p className="text-slate-400 font-bold max-w-lg mx-auto uppercase tracking-widest text-[10px] md:text-xs leading-loose">
                                        Complete the profile in the {window.innerWidth < 768 ? 'sidebar menu' : 'left panel'} to trigger a deep industrial analysis of your potential.
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {result && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6 md:space-y-10 pb-20"
                            >
                                {/* Score Card */}
                                <div className="bg-gradient-to-br from-brand-600 to-indigo-700 rounded-3xl md:rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[80px] -mr-48 -mt-48 transition-transform group-hover:scale-110"></div>
                                    <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-12 text-center lg:text-left">
                                        <div className="space-y-4 md:space-y-6">
                                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 md:gap-4">
                                                <span className="px-4 md:px-5 py-1 md:py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] md:text-[11px] font-black uppercase tracking-[.2em] text-white border border-white/20 shadow-xl">
                                                    {result.careerLevel} Level
                                                </span>
                                                <span className={`px-4 md:px-5 py-1 md:py-1.5 backdrop-blur-md rounded-full text-[10px] md:text-[11px] font-black uppercase tracking-[.2em] border shadow-xl ${result.recruiterDecision?.shortlisted ? 'bg-emerald-500/20 text-emerald-100 border-emerald-500/30' : 'bg-red-500/20 text-red-100 border-red-500/30'}`}>
                                                    {result.recruiterDecision?.shortlisted ? 'Recruiter Choice' : 'Risky Match'}
                                                </span>
                                            </div>
                                            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[.9]">Precision Match.</h2>
                                            <p className="text-brand-100 text-lg md:text-xl font-medium max-w-2xl leading-relaxed italic opacity-90">"{result.summary}"</p>
                                        </div>
                                        <div className="relative shrink-0">
                                            <div className="w-40 md:w-48 h-40 md:h-48 rounded-full bg-white/10 flex flex-col items-center justify-center border-[4px] md:border-[6px] border-white/20 shadow-inner group-hover:scale-105 transition-transform duration-500">
                                                <span className="text-5xl md:text-6xl font-black text-white tracking-tighter">{result.matchingScore}%</span>
                                                <span className="text-[10px] md:text-[11px] font-black uppercase text-white/50 tracking-[.3em]">Score</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Live Job Openings Section */}
                                {(liveJobs.length > 0 || jobsLoading || (result.jobOpportunities && result.jobOpportunities.length > 0)) && (
                                    <div className="card-box bg-slate-900/60 border border-brand-500/10 p-6 md:p-10 rounded-3xl md:rounded-[3rem]">
                                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8 md:mb-10 text-center sm:text-left">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 md:w-12 h-10 md:h-12 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center">
                                                    <Briefcase size={24} className="md:w-7 md:h-7" />
                                                </div>
                                                <div>
                                                    <h4 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">Real-World Openings</h4>
                                                    <p className="text-[8px] md:text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Live job listings · Click Apply Now to open company/portal page</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <p className="hidden sm:block text-[9px] md:text-[10px] bg-indigo-500/10 text-indigo-400 px-4 py-1.5 rounded-full font-black tracking-widest uppercase animate-pulse border border-indigo-500/20">Live Syncing</p>
                                            </div>
                                        </div>

                                        {/* Jobs Loading Skeleton */}
                                        {jobsLoading && (
                                            <div className="space-y-4">
                                                {[1,2,3].map(i => (
                                                    <div key={i} className="flex flex-col p-6 rounded-[2rem] bg-white/5 border border-white/5 animate-pulse space-y-3">
                                                        <div className="h-5 w-2/3 bg-white/10 rounded-xl" />
                                                        <div className="h-3 w-1/2 bg-white/5 rounded-xl" />
                                                        <div className="h-3 w-full bg-white/5 rounded-xl" />
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Live Jobs from API */}
                                        {!jobsLoading && liveJobs.length > 0 && (
                                            <div id="job-carousel" className="max-h-[400px] md:max-h-[580px] overflow-y-auto sm:pr-3 space-y-4 md:space-y-6 snap-y snap-mandatory scroll-smooth custom-scrollbar">
                                                {liveJobs.map((job, index) => (
                                                    <div key={job.id || index} className="snap-start flex flex-col p-6 md:p-8 rounded-[2rem] bg-white/5 border border-white/5 hover:border-brand-500/30 transition-all group relative overflow-hidden">
                                                        <div className="absolute top-0 left-0 w-1 md:w-2 h-full bg-indigo-500/20 group-hover:bg-indigo-500 transition-colors" />
                                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 md:gap-8">
                                                            <div className="space-y-3 md:space-y-4 flex-1 text-center md:text-left">
                                                                <div className="space-y-2">
                                                                    <div className="flex flex-col md:flex-row items-center gap-3 flex-wrap">
                                                                        <h5 className="text-white font-black text-xl md:text-2xl tracking-tighter leading-none group-hover:text-brand-400 transition-colors">{job.title}</h5>
                                                                        <span className={`px-3 py-1 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-widest ${job.type?.toLowerCase().includes('intern') ? 'bg-amber-500/20 text-amber-400 border border-amber-500/10' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/10'}`}>
                                                                            {job.type || 'Full-time'}
                                                                        </span>
                                                                        {job.isRemote && (
                                                                            <span className="px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest bg-sky-500/20 text-sky-400 border border-sky-500/10">Remote</span>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center justify-center md:justify-start gap-3 text-slate-500 font-bold uppercase tracking-widest text-[9px] md:text-[11px]">
                                                                        <span className="text-slate-300">{job.company}</span>
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                                                                        <span className="text-brand-400/70">{job.location}</span>
                                                                        {job.salary && (
                                                                            <><span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                                                                            <span className="text-emerald-400">{job.salary}</span></>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <p className="text-slate-400 text-xs md:text-sm leading-relaxed line-clamp-2 italic font-medium opacity-80">"{job.description || 'Highly calibrated role matching your exact skill matrix.'}"</p>
                                                            </div>
                                                            <div className="flex flex-col items-center gap-2 shrink-0">
                                                                {/* Source Badge */}
                                                                <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                                                                    job.source === 'LinkedIn' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                                    job.source === 'Naukri' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                                                    job.source === 'Indeed' ? 'bg-violet-500/10 text-violet-400 border-violet-500/20' :
                                                                    'bg-white/5 text-slate-400 border-white/10'
                                                                }`}>{job.source}</span>
                                                                <a
                                                                    href={job.applyUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="w-full md:w-auto px-8 md:px-10 py-3 md:py-4 bg-white/5 hover:bg-brand-600 text-white text-[9px] md:text-[11px] font-black uppercase tracking-[.2em] rounded-2xl transition-all flex items-center gap-3 justify-center border border-white/5 active:scale-95 shadow-xl"
                                                                >
                                                                    Apply Now <ExternalLink size={14} className="md:w-4 md:h-4" />
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Fallback: AI-suggested jobs (no API results) */}
                                        {!jobsLoading && liveJobs.length === 0 && result.jobOpportunities && result.jobOpportunities.length > 0 && (
                                            <div id="job-carousel" className="max-h-[400px] md:max-h-[580px] overflow-y-auto sm:pr-3 space-y-4 md:space-y-6 snap-y snap-mandatory scroll-smooth custom-scrollbar">
                                                {result.jobOpportunities.map((job, index) => (
                                                    <div key={index} className="snap-start flex flex-col p-6 md:p-8 rounded-[2rem] bg-white/5 border border-white/5 hover:border-brand-500/30 transition-all group relative overflow-hidden">
                                                        <div className="absolute top-0 left-0 w-1 md:w-2 h-full bg-indigo-500/20 group-hover:bg-indigo-500 transition-colors" />
                                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 md:gap-8">
                                                            <div className="space-y-3 md:space-y-4 flex-1 text-center md:text-left">
                                                                <div className="space-y-2">
                                                                    <div className="flex flex-col md:flex-row items-center gap-3 flex-wrap">
                                                                        <h5 className="text-white font-black text-xl md:text-2xl tracking-tighter leading-none group-hover:text-brand-400 transition-colors">{job.title}</h5>
                                                                        <span className={`px-3 py-1 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-widest ${job.type?.toLowerCase().includes('intern') ? 'bg-amber-500/20 text-amber-400 border border-amber-500/10' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/10'}`}>
                                                                            {job.type || 'Direct'}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center justify-center md:justify-start gap-3 text-slate-500 font-bold uppercase tracking-widest text-[9px] md:text-[11px]">
                                                                        <span className="text-slate-300">{job.company}</span>
                                                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                                                                        <span className="text-brand-400/70">{job.location}</span>
                                                                    </div>
                                                                </div>
                                                                <p className="text-slate-400 text-xs md:text-sm leading-relaxed line-clamp-2 italic font-medium opacity-80">"{job.description || 'Highly calibrated role matching your exact skill matrix.'}"</p>
                                                            </div>
                                                            <a href={job.link || job.applyUrl || '#'} target="_blank" rel="noopener noreferrer" className="shrink-0 w-full md:w-auto px-8 md:px-10 py-3 md:py-4 bg-white/5 hover:bg-brand-600 text-white text-[9px] md:text-[11px] font-black uppercase tracking-[.2em] rounded-2xl transition-all flex items-center gap-3 justify-center border border-white/5 active:scale-95 shadow-xl">
                                                                Apply Now <ExternalLink size={14} className="md:w-4 md:h-4" />
                                                            </a>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Market & ATS Cards */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
                                    <div className="bg-slate-900/50 border border-indigo-500/10 p-8 md:p-10 rounded-3xl md:rounded-[3rem] space-y-6 md:space-y-8 backdrop-blur-md">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 md:w-12 h-10 md:h-12 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center">
                                                    <FileText size={24} className="md:w-7 md:h-7" />
                                                </div>
                                                <div>
                                                    <h4 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">ATS Core</h4>
                                                    <p className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest">Compatibility</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-2xl md:text-3xl font-black text-indigo-400">{result.atsAnalysis?.atsScore}%</span>
                                            </div>
                                        </div>
                                        <div className="space-y-4 md:space-y-5">
                                            <div className="flex flex-wrap gap-2">
                                                {result.atsAnalysis?.missingKeywords?.slice(0, 5).map((kw, i) => (
                                                    <span key={i} className="px-3 py-1.5 bg-red-500/10 text-red-100 text-[8px] md:text-[10px] font-black uppercase tracking-widest rounded-xl border border-red-500/20">+{kw}</span>
                                                ))}
                                            </div>
                                            <p className="text-slate-400 text-xs md:text-[13px] leading-loose font-medium italic p-4 md:p-5 bg-white/[0.02] rounded-2xl border border-white/5 italic">
                                                "{result.atsAnalysis?.improvements?.[0]}"
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-slate-900/50 border border-amber-500/10 p-8 md:p-10 rounded-3xl md:rounded-[3rem] space-y-6 md:space-y-8 backdrop-blur-md text-slate-100">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 md:w-12 h-10 md:h-12 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center">
                                                    <Sparkles size={24} className="md:w-7 md:h-7" />
                                                </div>
                                                <div>
                                                    <h4 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">Market Pulse</h4>
                                                    <p className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest">Macro Trends</p>
                                                </div>
                                            </div>
                                            <span className="text-base md:text-xl font-black text-amber-400 uppercase tracking-widest">{result.marketDemand?.demandLevel}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 md:gap-6">
                                            <div className="p-4 md:p-5 rounded-2xl md:rounded-3xl bg-white/[0.03] border border-white/5 space-y-1 md:space-y-2">
                                                <p className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-[.2em]">Competition</p>
                                                <p className="text-base md:text-lg font-black text-white">{result.marketDemand?.competitionLevel}</p>
                                            </div>
                                            <div className="p-4 md:p-5 rounded-2xl md:rounded-3xl bg-white/[0.03] border border-white/5 space-y-1 md:space-y-2">
                                                <p className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-[.2em]">Salary Gap</p>
                                                <p className="text-base md:text-lg font-black text-white">{result.marketDemand?.averageSalary}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Skills Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
                                    <div className="bg-slate-900/50 border border-emerald-500/10 p-8 md:p-10 rounded-3xl md:rounded-[3rem] space-y-6 md:space-y-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 md:w-12 h-10 md:h-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/10">
                                                <CheckCircle2 size={24} className="md:w-7 md:h-7" />
                                            </div>
                                            <h4 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">Matching Skills</h4>
                                        </div>
                                        <div className="flex flex-wrap gap-2 md:gap-2.5">
                                            {result.matchingSkills?.slice(0, 10).map((skill, index) => (
                                                <span key={index} className="px-3 md:px-5 py-2 md:py-2.5 bg-emerald-500/10 text-emerald-100 border border-emerald-500/20 rounded-xl md:rounded-2xl text-[10px] md:text-[13px] font-black uppercase tracking-widest">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-slate-900/50 border border-orange-500/10 p-8 md:p-10 rounded-3xl md:rounded-[3rem] space-y-6 md:space-y-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 md:w-12 h-10 md:h-12 bg-orange-500/20 text-orange-400 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/10">
                                                <XCircle size={24} className="md:w-7 md:h-7" />
                                            </div>
                                            <h4 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">Skill Gaps</h4>
                                        </div>
                                        <div className="flex flex-wrap gap-2 md:gap-2.5">
                                            {result.missingSkills?.slice(0, 10).map((skill, index) => (
                                                <span key={index} className="px-3 md:px-5 py-2 md:py-2.5 bg-orange-500/10 text-orange-100 border border-orange-500/20 rounded-xl md:rounded-2xl text-[10px] md:text-[13px] font-black uppercase tracking-widest">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Decision Marker */}
                                <div className="bg-slate-900 border border-white/5 p-8 md:p-12 rounded-[2rem] md:rounded-[4rem]">
                                    <div className="flex flex-col lg:flex-row gap-8 md:gap-12 items-center text-center lg:text-left">
                                        <div className="space-y-4 flex-1">
                                            <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
                                                <div className="w-12 md:w-14 h-12 md:h-14 bg-purple-500/20 text-purple-400 rounded-[1.2rem] md:rounded-[1.5rem] flex items-center justify-center">
                                                    <UserCheck size={28} className="md:w-8 md:h-8" />
                                                </div>
                                                <h4 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase">Decision Panel Verdict</h4>
                                            </div>
                                            <p className="text-slate-400 text-base md:text-lg font-medium leading-relaxed italic">"{result.recruiterDecision?.reason}"</p>
                                        </div>
                                        <button 
                                            onClick={() => setResult(null)} 
                                            className="w-full lg:w-auto px-10 md:px-12 py-4 md:py-5 bg-white/5 hover:bg-white text-slate-400 hover:text-slate-900 font-black uppercase tracking-[.3em] text-[10px] md:text-[11px] rounded-[1.5rem] md:rounded-[2rem] transition-all border border-white/10 active:scale-95"
                                        >
                                            Reset Simulation
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                    height: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 20px;
                    transition: all 0.3s;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
};

export default Dashboard;
