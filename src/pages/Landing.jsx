import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Folder, Check, Clock } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Landing = () => {
  const { user, isAdmin } = useContext(AuthContext);

  const getWorkspaceLink = () => {
    if (!user) return '/login';
    return isAdmin ? '/dashboard' : '/my-tasks';
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-800 font-sans relative overflow-hidden flex flex-col justify-between">
      
      {/* Background Grid Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#F1F5F9_1px,transparent_1px),linear-gradient(to_bottom,#F1F5F9_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-35 pointer-events-none z-0"></div>

      {/* 1. BRAND HEADER (Flat clean style matching the reference image) */}
      <header className="w-full max-w-7xl mx-auto px-6 sm:px-12 py-6 flex items-center justify-between relative z-30">
        
        {/* Left: Brand Branding Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-100 group-hover:scale-105 transition-all">
            <img src="/logo.svg" alt="TaskNova" className="w-5 h-5" />
          </div>
          <span className="text-xl font-extrabold text-indigo-600 tracking-tight">
            Task<span className="text-violet-600 font-bold">Nova</span>
          </span>
        </Link>

        {/* Right: Exactly ONE Clean Button */}
        <div>
          {user ? (
            <Link 
              to={getWorkspaceLink()} 
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-md hover:shadow-lg transition-all text-xs flex items-center gap-1.5"
            >
              Workspace <ArrowRight size={13} />
            </Link>
          ) : (
            <Link 
              to="/login" 
              className="bg-slate-900 hover:bg-indigo-600 text-white font-bold py-2.5 px-6 rounded-xl shadow-sm hover:shadow-md transition-all text-xs"
            >
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-6 sm:px-12 grid lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10 py-6">
        
        {/* Left Column - Bold and Minimal Text Layout */}
        <div className="lg:col-span-5 flex flex-col justify-center text-left relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Unique micro announcement badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100/60 text-indigo-600 font-bold text-[10px] uppercase tracking-wider mb-6 shadow-sm">
              <Sparkles size={11} className="animate-pulse" /> Unified Task Workspace
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.04] mb-6">
              Project <br />
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                managers tool
              </span>
            </h1>
            
            <p className="text-slate-500 text-base sm:text-lg font-semibold leading-relaxed mb-8 max-w-sm">
              Coordinate schedules, delegate tasks, and accelerate your project velocity inside TaskNova's unified collaborative workspace.
            </p>

            {/* Exactly ONE Hero Button - Direct Action */}
            <div className="flex items-center">
              <Link 
                to={user ? getWorkspaceLink() : "/signup"} 
                className="w-full sm:w-auto text-center bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-4 px-8 rounded-2xl shadow-xl shadow-indigo-100 hover:shadow-2xl hover:shadow-indigo-200 transition-all text-sm flex items-center justify-center gap-2 group border border-transparent"
              >
                {user ? 'Open Workspace' : 'Get started free'} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Right Column - Custom SVG Gradient Wave Shape & Floating hero_image */}
        <div className="lg:col-span-7 w-full h-full min-h-[460px] sm:min-h-[540px] flex items-center justify-center relative select-none">
          
          {/* 1. EXACT WAVE BG SHAPE: Cubic Bezier curve matching the reference wave's round belly exactly */}
          <div className="absolute right-[-100px] lg:right-[-200px] top-[-5%] w-[110%] lg:w-[130%] h-[110%] z-0 pointer-events-none select-none">
            <svg 
              className="w-full h-full" 
              viewBox="0 0 100 100" 
              preserveAspectRatio="none" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#C084FC" />   {/* Soft lavender */}
                  <stop offset="40%" stopColor="#8B5CF6" />  {/* Rich violet */}
                  <stop offset="100%" stopColor="#4F46E5" /> {/* Indigo */}
                </linearGradient>
              </defs>
              {/* Perfectly sweeping smooth curve mimicking the reference wave shape exactly */}
              <path 
                d="M 45,0 C 25,25 5,50 5,72 C 5,90 20,100 35,100 L 100,100 L 100,0 Z" 
                fill="url(#waveGrad)" 
              />
            </svg>
            
            {/* Soft inner lighting blobs inside the SVG fluid shape boundary */}
            <div className="absolute top-[20%] right-[20%] w-72 h-72 bg-pink-400/35 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '8s' }}></div>
            <div className="absolute bottom-[20%] left-[15%] w-60 h-60 bg-cyan-300/25 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '6s' }}></div>
          </div>

          {/* 2. FLOATING IMAGE CONTAINER */}
          <div className="relative w-full max-w-[620px] h-[380px] sm:h-[440px] flex items-center justify-center z-10 mr-0 lg:mr-[-40px]">
            
            {/* Dynamic floating ground shadow */}
            <motion.div 
              className="absolute bottom-[-20px] w-80 h-7 bg-slate-950/15 rounded-full blur-2xl z-0"
              animate={{ 
                scale: [0.93, 1.05, 0.93],
                opacity: [0.4, 0.75, 0.4]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />

            {/* Central Dominant hero_image Visual */}
            <motion.div
              className="w-full h-full flex items-center justify-center p-2"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                y: [0, -14, 0] // Floating animation
              }}
              transition={{
                y: {
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut"
                },
                default: { duration: 0.6 }
              }}
            >
              <img 
                src="/hero_image.png" 
                alt="Bespoke Project Managers Tool Mockup" 
                className="w-full h-full object-contain scale-[1.08] sm:scale-[1.12] drop-shadow-[0_25px_50px_rgba(0,0,0,0.18)] select-none hover:scale-[1.15] sm:hover:scale-[1.18] transition-transform duration-500"
              />
            </motion.div>

            {/* 3. FLOATING GLASSMORPHIC PARALLAX BADGES */}
            
            {/* Top-Left: Project Status Badge */}
            <motion.div 
              className="absolute -top-4 -left-8 bg-white/85 backdrop-blur-md border border-slate-100 rounded-2xl p-3.5 shadow-xl flex items-center gap-3 z-20 pointer-events-none"
              animate={{ y: [0, -8, 0], x: [0, 4, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-sm">
                <Folder size={16} />
              </div>
              <div>
                <h4 className="text-slate-800 font-extrabold text-[11px] leading-tight">Web Dashboard</h4>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div className="w-10/12 bg-indigo-600 h-full rounded-full"></div>
                  </div>
                  <span className="text-[9px] font-bold text-slate-500">84%</span>
                </div>
              </div>
            </motion.div>

            {/* Bottom-Right: Success Completed Badge */}
            <motion.div 
              className="absolute -bottom-6 -right-6 bg-white/85 backdrop-blur-md border border-slate-100 rounded-2xl p-3.5 shadow-xl flex items-center gap-3 z-20 pointer-events-none"
              animate={{ y: [0, 8, 0], x: [0, -4, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm">
                <Check size={16} strokeWidth={3} />
              </div>
              <div>
                <h4 className="text-slate-800 font-extrabold text-[11px] leading-tight">Task Completed</h4>
                <p className="text-[9px] font-bold text-slate-400 mt-0.5">Updated just now</p>
              </div>
            </motion.div>

            {/* Middle-Right: Active Task Count Notification */}
            <motion.div 
              className="absolute top-1/4 -right-10 bg-indigo-900/90 backdrop-blur-md text-white border border-indigo-700/35 rounded-2xl p-2.5 shadow-xl flex items-center gap-2 z-20 pointer-events-none"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            >
              <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-200 flex items-center justify-center shrink-0">
                <Clock size={12} />
              </div>
              <span className="text-[10px] font-extrabold pr-1">4 Active Tasks</span>
            </motion.div>

          </div>

        </div>
      </main>

      {/* Spacer */}
      <div className="h-6 sm:h-8 relative z-10"></div>

    </div>
  );
};

export default Landing;
