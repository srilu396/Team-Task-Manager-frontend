import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/auth.service';
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
      <circle cx="90%" cy="10%" r="15%" fill="none" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="6 6" />
      <circle cx="90%" cy="10%" r="25%" fill="none" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="6 6" />
      <circle cx="10%" cy="90%" r="15%" fill="none" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="6 6" />
      <circle cx="10%" cy="90%" r="25%" fill="none" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="6 6" />
    </svg>
  </div>
);

const CheckIcon = ({ met }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-3.5 h-3.5 ${met ? 'text-emerald-500' : 'text-slate-300'}`}>
    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
  </svg>
);

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [errorMessage, setErrorMessage] = useState('');

  const { showToast } = useContext(ToastContext);
  const navigate = useNavigate();

  // Password Strength Calculation
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const criteriaMet = [hasMinLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

  const getStrengthLabel = () => {
    if (!password) return { text: '', color: 'bg-slate-200', textColor: 'text-slate-400', width: 'w-0' };
    if (criteriaMet <= 2) return { text: 'Weak', color: 'bg-rose-500', textColor: 'text-rose-500', width: 'w-1/3' };
    if (criteriaMet <= 4) return { text: 'Medium', color: 'bg-amber-500', textColor: 'text-amber-500', width: 'w-2/3' };
    return { text: 'Strong', color: 'bg-emerald-500', textColor: 'text-emerald-500', width: 'w-full' };
  };

  const strength = getStrengthLabel();

  // 5-second Auto-Redirect Effect on Success
  useEffect(() => {
    let timer;
    if (submitted && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (submitted && countdown === 0) {
      navigate('/login');
    }
    return () => clearInterval(timer);
  }, [submitted, countdown, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !email.includes('@')) {
      const msg = 'Please enter a valid email address';
      setErrorMessage(msg);
      showToast(msg, 'error');
      return;
    }

    if (criteriaMet < 5) {
      const msg = 'Please ensure your password satisfies all strength criteria';
      setErrorMessage(msg);
      showToast(msg, 'error');
      return;
    }

    if (password !== confirmPassword) {
      const msg = 'Passwords do not match.';
      setErrorMessage(msg);
      showToast(msg, 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.resetPasswordDirect(email, password, confirmPassword);
      if (res.success) {
        setSubmitted(true);
        showToast('Password updated successfully.', 'success');
      } else {
        const msg = res.message || 'Failed to update password';
        setErrorMessage(msg);
        showToast(msg, 'error');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Error processing password reset request';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-4 sm:p-6 relative">
      <BackgroundNodes />

      <div className="w-full max-w-[460px] bg-white rounded-[1.5rem] shadow-2xl p-6 sm:p-10 relative z-10 border border-slate-100">
        
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <img src="/logo.svg" alt="TaskNova" className="w-10 h-10" />
          <span className="text-2xl font-extrabold text-indigo-600">
            Task<span className="text-purple-600">Nova</span>
          </span>
        </div>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Reset Password</h2>
          <p className="text-gray-500 text-sm">
            Enter your registered email and new password to update your credentials directly.
          </p>
        </div>

        {submitted ? (
          <div className="space-y-6">
            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-emerald-900 mb-1">Password updated successfully.</h3>
              <p className="text-xs text-emerald-700 font-medium mt-2">
                Redirecting to Login in <span className="font-extrabold text-emerald-900">{countdown}</span> seconds...
              </p>
            </div>

            <button
              onClick={() => navigate('/login')}
              className="block w-full py-3 text-center bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-lg font-bold text-sm shadow-md transition-all transform hover:-translate-y-0.5"
            >
              Go to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Inline Error Alert */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-semibold flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 flex-shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Registered Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Registered Email</label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrorMessage('');
                }}
                required
                placeholder="name@company.com"
                className="w-full border border-gray-200 rounded-lg py-2.5 px-3.5 text-gray-700 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-gray-400 transition-all bg-gray-50 focus:bg-white"
              />
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessage('');
                  }}
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

              {/* Password Strength Bar */}
              {password && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Strength:</span>
                    <span className={`font-bold ${strength.textColor}`}>{strength.text}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300`}></div>
                  </div>
                </div>
              )}
            </div>

            {/* Password Criteria Checklist */}
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg text-xs space-y-1">
              <div className="text-slate-500 font-semibold mb-1">Password Requirements:</div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                  <CheckIcon met={hasMinLength} /> 8+ characters
                </div>
                <div className={`flex items-center gap-1.5 ${hasUpper ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                  <CheckIcon met={hasUpper} /> Uppercase letter
                </div>
                <div className={`flex items-center gap-1.5 ${hasLower ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                  <CheckIcon met={hasLower} /> Lowercase letter
                </div>
                <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                  <CheckIcon met={hasNumber} /> Number
                </div>
                <div className={`flex items-center gap-1.5 col-span-2 ${hasSpecial ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                  <CheckIcon met={hasSpecial} /> Special character (!@#$%^&*)
                </div>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrorMessage('');
                  }}
                  required
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-lg py-2.5 pl-3.5 pr-10 text-gray-700 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-gray-400 transition-all bg-gray-50 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-rose-500 font-medium mt-1">Passwords do not match</p>
              )}
            </div>

            {/* Reset Password Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !email || !password || !confirmPassword}
                className={`w-full py-3 rounded-lg font-bold transition-all text-white text-sm shadow-md flex items-center justify-center gap-2 ${
                  email && password && confirmPassword && !loading
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 hover:shadow-lg hover:shadow-indigo-200 transform hover:-translate-y-0.5'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating Password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </div>

            <div className="mt-6 text-center text-sm text-gray-600 font-medium pt-2">
              Remember your password?{' '}
              <Link to="/login" className="text-indigo-600 hover:underline font-bold ml-1">
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
