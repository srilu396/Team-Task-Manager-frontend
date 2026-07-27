import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { showToast } = useContext(ToastContext);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [countdown, setCountdown] = useState(5);

  // Live password validation criteria
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const isFormValid = hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial && passwordsMatch;

  // Auto redirect countdown after successful password reset
  useEffect(() => {
    let timer;
    if (isSuccess && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isSuccess && countdown === 0) {
      navigate('/login');
    }
    return () => clearInterval(timer);
  }, [isSuccess, countdown, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!token) {
      setIsExpired(true);
      return;
    }

    if (!isFormValid) {
      if (!passwordsMatch) {
        const msg = 'Passwords do not match';
        setErrorMessage(msg);
        showToast(msg, 'error');
      } else {
        const msg = 'Please fulfill all password security requirements';
        setErrorMessage(msg);
        showToast(msg, 'error');
      }
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      setIsSuccess(true);
      showToast('Password updated successfully.', 'success');
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Password reset failed';
      setErrorMessage(errorMsg);
      showToast(errorMsg, 'error');
      if (errorMsg.toLowerCase().includes('expired') || errorMsg.toLowerCase().includes('invalid')) {
        setIsExpired(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center p-4 sm:p-6 relative">
      <BackgroundNodes />

      <div className="w-full max-w-[480px] bg-white rounded-[1.5rem] shadow-2xl p-6 sm:p-10 relative z-10 border border-slate-100">
        <div className="flex items-center justify-center gap-3 mb-6">
          <img src="/logo.svg" alt="TaskNova" className="w-10 h-10" />
          <span className="text-2xl font-extrabold text-indigo-600">
            Task<span className="text-purple-600">Nova</span>
          </span>
        </div>

        {isExpired ? (
          <div className="text-center space-y-6">
            <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Reset Link Expired or Invalid</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              This password reset link is invalid or has expired after 15 minutes. Please request a new reset link to update your password.
            </p>
            <Link
              to="/forgot-password"
              className="block w-full py-3 text-center bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-bold text-sm shadow-md transition-all"
            >
              Request New Reset Link
            </Link>
          </div>
        ) : isSuccess ? (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Password updated successfully.</h2>
            <p className="text-gray-500 text-sm">
              Your TaskNova account password has been updated. Redirecting to login in <span className="font-bold text-indigo-600">{countdown}</span> seconds...
            </p>
            <Link
              to="/login"
              className="block w-full py-3 text-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm shadow-md transition-all"
            >
              Go to Login
            </Link>
          </div>
        ) : (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-1">Set New Password</h2>
              <p className="text-gray-500 text-sm">Create a strong, secure password for your account.</p>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-medium flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 shrink-0 text-rose-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full border border-gray-200 rounded-lg py-2.5 pl-3.5 pr-10 text-gray-700 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-gray-50 focus:bg-white"
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

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full border border-gray-200 rounded-lg py-2.5 pl-3.5 pr-10 text-gray-700 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-gray-50 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {confirmPassword && (
                  <p className={`text-xs mt-1 font-medium ${passwordsMatch ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {passwordsMatch ? '✓ Passwords match' : '✕ Passwords do not match'}
                  </p>
                )}
              </div>

              {/* Password Requirements Checklist */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                <div className="font-semibold text-slate-700 mb-1">Password Requirements:</div>
                <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
                  <span>{hasMinLength ? '✓' : '○'}</span> At least 8 characters long
                </div>
                <div className={`flex items-center gap-1.5 ${hasUpper ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
                  <span>{hasUpper ? '✓' : '○'}</span> At least one uppercase letter (A-Z)
                </div>
                <div className={`flex items-center gap-1.5 ${hasLower ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
                  <span>{hasLower ? '✓' : '○'}</span> At least one lowercase letter (a-z)
                </div>
                <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
                  <span>{hasNumber ? '✓' : '○'}</span> At least one number (0-9)
                </div>
                <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
                  <span>{hasSpecial ? '✓' : '○'}</span> At least one special character (!@#$%^&*)
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || !isFormValid}
                  className={`w-full py-3 rounded-lg font-bold transition-all text-white text-sm shadow-md flex items-center justify-center gap-2 ${
                    isFormValid && !loading
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
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
