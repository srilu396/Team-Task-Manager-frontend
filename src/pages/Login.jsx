import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
);

const BackgroundNodes = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Top Right Corner Arcs */}
      <circle cx="90%" cy="10%" r="15%" fill="none" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="6 6" />
      <circle cx="90%" cy="10%" r="25%" fill="none" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="6 6" />
      <circle cx="90%" cy="10%" r="35%" fill="none" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="6 6" />
      
      {/* Bottom Left Corner Arcs */}
      <circle cx="10%" cy="90%" r="15%" fill="none" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="6 6" />
      <circle cx="10%" cy="90%" r="25%" fill="none" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="6 6" />
      <circle cx="10%" cy="90%" r="35%" fill="none" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="6 6" />
    </svg>

    {/* Top Right Images */}
    <div className="absolute top-[10%] right-[25%] w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm bg-blue-100 p-0.5">
      <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" alt="Avatar" className="w-full h-full object-cover rounded-full" />
    </div>
    <div className="absolute top-[25%] right-[10%] w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm bg-blue-100 p-0.5">
      <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80" alt="Avatar" className="w-full h-full object-cover rounded-full" />
    </div>
    <div className="absolute top-[5%] right-[12%] w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-sm bg-blue-100 p-0.5">
      <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80" alt="Avatar" className="w-full h-full object-cover rounded-full" />
    </div>
    <div className="absolute top-[20%] right-[35%] w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-sm bg-blue-100 p-0.5">
      <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" alt="Avatar" className="w-full h-full object-cover rounded-full" />
    </div>
    <div className="absolute top-[35%] right-[18%] w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm bg-blue-100 p-0.5">
      <img src="https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=100&q=80" alt="Avatar" className="w-full h-full object-cover rounded-full" />
    </div>

    {/* Bottom Left Images */}
    <div className="absolute bottom-[25%] left-[10%] w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-sm bg-yellow-100 p-0.5">
      <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=100&q=80" alt="Avatar" className="w-full h-full object-cover rounded-full" />
    </div>
    <div className="absolute bottom-[10%] left-[25%] w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm bg-yellow-100 p-0.5">
      <img src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=100&q=80" alt="Avatar" className="w-full h-full object-cover rounded-full" />
    </div>
    <div className="absolute bottom-[5%] left-[12%] w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm bg-yellow-100 p-0.5">
      <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80" alt="Avatar" className="w-full h-full object-cover rounded-full" />
    </div>
    <div className="absolute bottom-[35%] left-[20%] w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm bg-yellow-100 p-0.5">
      <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80" alt="Avatar" className="w-full h-full object-cover rounded-full" />
    </div>
    <div className="absolute bottom-[20%] left-[35%] w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-sm bg-yellow-100 p-0.5">
      <img src="https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&w=100&q=80" alt="Avatar" className="w-full h-full object-cover rounded-full" />
    </div>
  </div>
);

const carouselImages = [
  "/images/slide1.png",
  "/images/slide2.png",
  "/images/slide3.png",
  "/images/slide4.png"
];

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  
  const [currentImage, setCurrentImage] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setCurrentImage((prev) => prev + 1);
    }, 2000); // 2 seconds scroll
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // When we reach the duplicated first image (index = length), reset to real first image seamlessly
    if (currentImage === carouselImages.length) {
      const resetTimer = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentImage(0);
      }, 500); // Must match the CSS transition duration (500ms)
      return () => clearTimeout(resetTimer);
    }
  }, [currentImage]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(formData.email, formData.password);
      if (data.user.role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/my-tasks');
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-4 sm:p-6 relative">
      <BackgroundNodes />
      
      {/* Main Container */}
      <div className="w-full max-w-[850px] bg-white rounded-[1.5rem] shadow-2xl flex flex-col lg:flex-row overflow-hidden relative z-10 min-h-[500px]">
        
        {/* Left Side - Premium Blue Gradient Theme */}
        <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 p-6 flex-col justify-between relative overflow-hidden rounded-bl-[1.5rem] lg:rounded-tl-[1.5rem] m-1.5 shadow-inner">

          {/* Center Graphic Card with Carousel */}
          <div className="w-full flex justify-center items-center flex-grow z-10 relative perspective-1000">
             <div className="w-full max-w-[320px] relative group cursor-pointer my-8">
               
               {/* 3D Stacked Background Cards */}
               <div className="absolute inset-0 bg-cyan-300/40 rounded-[2.5rem] transform -rotate-6 scale-105 transition-all duration-500 group-hover:-rotate-8 group-hover:scale-110 shadow-lg backdrop-blur-md z-0"></div>
               <div className="absolute inset-0 bg-indigo-400/40 rounded-[2.5rem] transform rotate-3 scale-105 transition-all duration-500 group-hover:rotate-6 group-hover:scale-110 shadow-lg backdrop-blur-md z-0"></div>
               
               {/* Main Shaped Image Container */}
               <div className="w-full bg-white rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden border-2 border-white/80 transition-transform duration-500 group-hover:-translate-y-2">
                 
                 {/* Carousel */}
                 <div className="w-full h-64 sm:h-80 relative bg-white pt-4">
                   <div 
                     className={`flex h-full w-full ${isTransitioning ? 'transition-transform duration-700 ease-out' : ''}`}
                     style={{ transform: `translateX(-${currentImage * 100}%)` }}
                   >
                     {[...carouselImages, carouselImages[0]].map((src, idx) => (
                       <div key={idx} className="w-full h-full flex-shrink-0 bg-transparent flex items-center justify-center p-4">
                         <img 
                           src={src} 
                           alt={`Slide ${idx + 1}`} 
                           className="w-full h-full object-contain scale-[1.3] drop-shadow-xl transition-all duration-700 group-hover:scale-[1.45] group-hover:-translate-y-3 group-hover:drop-shadow-2xl" 
                         />
                       </div>
                     ))}
                   </div>
                 </div>

                 {/* Card Content & Indicators */}
                 <div className="px-6 pb-8 pt-5 text-center bg-white relative z-20">
                   <h3 className="text-slate-800 font-extrabold text-2xl tracking-tight mb-2">Manage Tasks</h3>
                   <p className="text-slate-500 text-sm font-medium leading-relaxed">
                     Collaborate seamlessly. Experience a new dimension of productivity.
                   </p>
                   
                   {/* Indicators */}
                   <div className="flex justify-center gap-2 mt-6">
                     {carouselImages.map((_, idx) => (
                       <div 
                         key={idx} 
                         className={`h-2 rounded-full transition-all duration-500 ${currentImage % carouselImages.length === idx ? 'w-8 bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.6)]' : 'w-2 bg-slate-200 hover:bg-slate-300'}`}
                       />
                     ))}
                   </div>
                 </div>

               </div>
            </div>
          </div>

          {/* Decorative background pattern for left side */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="waves" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M0 30c15 0 15-30 30-30s15 30 30 30-15 30-30 30S0 30 0 30z" fill="none" stroke="#ffffff" strokeWidth="2"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#waves)"/>
            </svg>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-7/12 p-6 lg:p-10 flex flex-col justify-center">
          <div className="max-w-[360px] mx-auto w-full">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              marginBottom: '32px'
            }}>
              <img src="/logo.svg" alt="TaskNova"
                style={{ width: '48px', height: '48px' }}
              />
              <span style={{
                fontSize: '28px',
                fontWeight: '800',
                color: '#4F46E5'
              }}>
                Task<span style={{ color: '#7C3AED' }}>Nova</span>
              </span>
            </div>
            
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-1">Welcome back</h2>
              <p className="text-gray-500 text-sm">Please enter your details to sign in.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email Id</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                  placeholder="name@company.com" 
                  className="w-full border border-gray-200 rounded-lg py-2.5 px-3.5 text-gray-700 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-gray-400 transition-all bg-gray-50 focus:bg-white" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    required 
                    placeholder="••••••••" 
                    className="w-full border border-gray-200 rounded-lg py-2.5 pl-3.5 pr-10 text-gray-700 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-gray-400 transition-all bg-gray-50 focus:bg-white" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  className={`w-full py-3 rounded-lg font-bold transition-all text-white text-sm shadow-md ${formData.email && formData.password ? 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 hover:shadow-lg hover:shadow-indigo-200 transform hover:-translate-y-0.5' : 'bg-gray-300 text-gray-500 shadow-none'}`} 
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600 font-medium">
              Don't have an account? <Link to="/signup" className="text-indigo-600 hover:underline font-bold ml-1">Sign Up</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

