import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../api/axiosConfig';
import { Lock, Mail, KeyRound, X, ArrowRight, CheckCircle2, Eye, EyeOff, ShieldCheck, Zap } from 'lucide-react';

// Assuming logo is in your assets folder
import logo from '../assets/logo.png'; 

const Login = () => {
    // Main Login State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    
    // Forgot Password Modal State
    const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
    const [forgotStep, setForgotStep] = useState(1);
    const [forgotEmail, setForgotEmail] = useState('');
    const [resetOtp, setResetOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [showResetPassword, setShowResetPassword] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await api.post('/auth/login', { email, password });
            if (response.data.success) {
                const { token, role, email: userEmail } = response.data.data;
                login(token, role, userEmail);
                toast.success('System Access Granted');
                navigate('/');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Authentication Failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendResetOtp = async (e) => {
        e.preventDefault();
        setIsSendingOtp(true);
        const toastId = toast.loading('Locating registry and dispatching code...');
        try {
            const response = await api.post('/auth/forgot-password', { email: forgotEmail.trim() });
            if (response.data.success) {
                toast.success('Verification code sent to your inbox', { id: toastId });
                setForgotStep(2);
            }
        } catch (error) {
            toast.error('Identity not found in our records', { id: toastId });
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setIsResetting(true);
        const toastId = toast.loading('Synchronizing new security keys...');
        try {
            const response = await api.post('/auth/reset-password', { 
                email: forgotEmail.trim(), 
                otp: resetOtp.trim(), 
                newPassword: newPassword 
            });
            if (response.data.success) {
                toast.success('Credentials updated successfully', { id: toastId });
                setIsForgotModalOpen(false);
                setForgotStep(1);
                setEmail(forgotEmail);
            }
        } catch (error) {
            toast.error('Invalid or Expired Code', { id: toastId });
        } finally {
            setIsResetting(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col lg:flex-row animate-in fade-in duration-700">
            
            {/* LEFT SIDE: BRANDING VISUAL (Hidden on small screens) */}
            <div className="hidden lg:flex lg:w-1/2 bg-secondary relative items-center justify-center overflow-hidden">
                {/* Abstract Design Background */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary blur-[120px]"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary blur-[120px]"></div>
                </div>

                <div className="relative z-10 text-center px-12 space-y-8">
                    <img src={logo} alt="Sri Balaji Ads" className="w-64 mx-auto drop-shadow-2xl invert brightness-0" />
                    <div className="space-y-2">
                        <h2 className="text-4xl font-black text-white tracking-tighter">MEDIA MANAGEMENT <span className="text-primary italic font-black">PORTAL</span></h2>
                        <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-xs">Proprietary Technology of Sri Balaji Ads</p>
                    </div>
                    <div className="flex items-center justify-center space-x-6 pt-10">
                        <div className="flex flex-col items-center">
                            <ShieldCheck className="text-primary w-8 h-8 mb-2" />
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Secure Access</span>
                        </div>
                        <div className="w-[1px] h-10 bg-gray-700"></div>
                        <div className="flex flex-col items-center">
                            <Zap className="text-primary w-8 h-8 mb-2" />
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Live Sync</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE: LOGIN FORM */}
            <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 lg:bg-white">
                <div className="max-w-md w-full space-y-10">
                    
                    {/* Mobile Logo Only */}
                    <div className="lg:hidden text-center">
                        <img src={logo} alt="Sri Balaji Ads" className="w-48 mx-auto mb-4" />
                    </div>

                    <div className="space-y-2 text-center lg:text-left">
                        <h3 className="text-3xl font-black text-gray-900 tracking-tight">Access Registry</h3>
                        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Identify yourself to continue</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2 px-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Identity Email</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-300 group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    autoComplete="username"
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-secondary shadow-inner"
                                    placeholder="yourname@sribalajiads.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2 px-1">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Security Key</label>
                                <button type="button" onClick={() => setIsForgotModalOpen(true)} className="text-[10px] font-black text-primary hover:text-secondary uppercase tracking-widest transition-all">Recover Access</button>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-300 group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    type={showLoginPassword ? "text" : "password"}
                                    required
                                    autoComplete="current-password"
                                    className="w-full pl-12 pr-14 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-secondary shadow-inner"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                                    className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-400 hover:text-primary transition-colors"
                                >
                                    {showLoginPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-secondary hover:bg-gray-900 text-white font-black text-xs uppercase tracking-[0.2em] py-5 rounded-2xl shadow-2xl transition-all flex justify-center items-center disabled:opacity-50 active:scale-95 group"
                        >
                            {isLoading ? 'Establishing Link...' : 'Authorize Login'}
                            {!isLoading && <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>

                    <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">New User?</p>
                        <Link to="/verify-account" className="px-6 py-2 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-primary/10 hover:bg-primary hover:text-white transition-all shadow-sm">
                            Setup Account
                        </Link>
                    </div>
                </div>
            </div>

            {/* --- FORGOT PASSWORD MODAL (MATCHING CORPORATE THEME) --- */}
            {isForgotModalOpen && (
                <div className="fixed inset-0 bg-secondary/95 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in zoom-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden relative border border-white/20">
                        <button onClick={() => { setIsForgotModalOpen(false); setForgotStep(1); }} className="absolute top-6 right-6 p-2 text-gray-300 hover:text-primary active:scale-90 transition-all"><X className="w-8 h-8" /></button>
                        
                        <div className="p-10">
                            <h2 className="text-3xl font-black text-gray-900 tracking-tighter mb-2">Access Recovery</h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-10 leading-relaxed italic">
                                {forgotStep === 1 ? "Initialize encrypted code sequence via identity email" : "Validate code and re-map security credentials"}
                            </p>

                            {forgotStep === 1 && (
                                <form onSubmit={handleSendResetOtp} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Identity Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-5 top-4 h-5 w-5 text-gray-300" />
                                            <input type="email" required className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-secondary/20 outline-none font-bold text-gray-800 transition-all" placeholder="user@domain.com" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} />
                                        </div>
                                    </div>
                                    <button type="submit" disabled={isSendingOtp} className="w-full bg-primary hover:bg-red-700 text-white font-black text-xs uppercase tracking-[0.2em] py-5 rounded-[1.5rem] transition-all flex justify-center items-center shadow-xl shadow-red-200">
                                        <span>{isSendingOtp ? 'Processing...' : 'Request Verification'}</span>
                                    </button>
                                </form>
                            )}

                            {forgotStep === 2 && (
                                <form onSubmit={handleResetPassword} className="space-y-6 animate-in slide-in-from-right-10 duration-500">
                                    <div className="p-4 bg-green-50 border-2 border-green-100 rounded-2xl flex items-center text-green-700 text-[10px] font-black uppercase tracking-widest shadow-sm">
                                        <CheckCircle2 className="w-5 h-5 mr-3 text-green-500" />
                                        Verification Code Dispatched
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">OTP Code</label>
                                        <input type="text" required maxLength="6" className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-primary/20 outline-none tracking-[1em] font-mono text-xl font-black text-center text-gray-800" placeholder="000000" value={resetOtp} onChange={(e) => setResetOtp(e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">New Security Key</label>
                                        <div className="relative">
                                            <Lock className="absolute left-5 top-4 h-5 w-5 text-gray-300" />
                                            <input type={showResetPassword ? "text" : "password"} required minLength="8" className="w-full pl-12 pr-14 py-4 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-primary/20 outline-none font-bold text-gray-800" placeholder="Minimum 8 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                                            <button type="button" onClick={() => setShowResetPassword(!showResetPassword)} className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-400">{showResetPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
                                        </div>
                                    </div>
                                    <button type="submit" disabled={isResetting} className="w-full bg-secondary hover:bg-gray-900 text-white font-black text-xs uppercase tracking-[0.2em] py-5 rounded-[1.5rem] transition-all shadow-2xl active:scale-95">Update Credentials</button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;