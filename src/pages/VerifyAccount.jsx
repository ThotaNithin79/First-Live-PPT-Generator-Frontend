import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axiosConfig';
import { KeyRound, Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, X } from 'lucide-react';

const VerifyAccount = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const navigate = useNavigate();

    const handleVerify = async (e) => {
        e.preventDefault();
        setIsVerifying(true);
        const toastId = toast.loading('Authenticating identity and provisioning account...');

        try {
            const response = await api.post('/auth/verify-otp', { 
                email: email.trim(), 
                otp: otp.trim(), 
                password 
            });

            if (response.data.success) {
                toast.success('Identity verified. Welcome to the platform!', { id: toastId });
                navigate('/login');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Verification failed. Invalid OTP.', { id: toastId });
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 animate-in fade-in duration-500">
            <div className="max-w-md w-full bg-white rounded-[2rem] shadow-2xl shadow-gray-200/50 p-10 border border-gray-100 relative overflow-hidden">
                
                {/* Visual Accent */}
                <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>

                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-[1.5rem] bg-green-50 mb-6 shadow-inner">
                        <ShieldCheck className="w-10 h-10 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Account Setup</h1>
                    <p className="text-[10px] font-black text-gray-400 mt-2 uppercase tracking-[0.2em]">Validate Invitation Credentials</p>
                </div>

                <form onSubmit={handleVerify} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">Identity Email</label>
                        <div className="relative group">
                            <Mail className="absolute left-5 top-4 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                            <input 
                                type="email" 
                                required 
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-gray-800" 
                                placeholder="user@domain.com" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">Secure OTP</label>
                        <div className="relative group">
                            <KeyRound className="absolute left-5 top-4 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                            <input 
                                type="text" 
                                required 
                                maxLength="6" 
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/10 outline-none transition-all font-mono text-xl font-black tracking-[0.5em] text-center text-gray-800" 
                                placeholder="000000" 
                                value={otp} 
                                onChange={(e) => setOtp(e.target.value)} 
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">Access Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-5 top-4 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                            <input 
                                type={showPassword ? "text" : "password"} 
                                required 
                                minLength="8" 
                                className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-gray-800" 
                                placeholder="Minimum 8 characters" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-400 hover:text-primary transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isVerifying} 
                        className="w-full bg-secondary hover:bg-gray-900 text-white font-black text-xs uppercase tracking-[0.2em] py-5 rounded-[1.5rem] shadow-xl transition-all flex justify-center items-center active:scale-95 disabled:opacity-50 mt-4"
                    >
                        <span>{isVerifying ? 'Verifying...' : 'Finalize Credentials'}</span>
                        {!isVerifying && <ArrowRight className="w-4 h-4 ml-3" />}
                    </button>
                </form>

                <div className="mt-10 pt-6 border-t border-gray-100 text-center">
                    <Link to="/login" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-colors">
                        Return to authentication
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default VerifyAccount;