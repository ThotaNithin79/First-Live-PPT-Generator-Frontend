import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { 
    Shield, ShieldAlert, ShieldCheck, UserX, UserCheck, 
    ChevronLeft, ChevronRight, UserPlus, X, Mail, 
    Fingerprint, Info, Search, Loader2 // Fix: Added Info and Loader2 to imports
} from 'lucide-react';

const UserManagement = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Invite User Modal State
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('VIEWER'); 
    const [isInviting, setIsInviting] = useState(false);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/users', { params: { page, size: 10 } });
            if (response.data.success) {
                setUsers(response.data.data.content);
                setTotalPages(response.data.data.totalPages);
            }
        } catch (error) {
            toast.error('Authority error: Unable to retrieve directory.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [page]);

    const handleRoleChange = async (userId, newRole) => {
        const toastId = toast.loading('Re-assigning authority level...');
        try {
            await api.put(`/users/${userId}/role`, { role: newRole });
            toast.success('Access level updated successfully', { id: toastId });
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update rejected by system', { id: toastId });
        }
    };

    const handleStatusChange = async (userId, currentStatus) => {
        const action = currentStatus ? 'Deactivating' : 'Activating';
        const toastId = toast.loading(`${action} security profile...`);
        try {
            await api.put(`/users/${userId}/status`, { isActive: !currentStatus });
            toast.success('Credential status synced', { id: toastId });
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Action denied', { id: toastId });
        }
    };

    const handleInviteUser = async (e) => {
        e.preventDefault();
        setIsInviting(true);
        const toastId = toast.loading('Initializing secure OTP sequence...');
        try {
            const response = await api.post('/admin/invite-user', { 
                email: inviteEmail.trim(), 
                role: inviteRole 
            });
            if (response.data.success) {
                toast.success('Encrypted invite dispatched.', { id: toastId });
                setIsInviteModalOpen(false);
                setInviteEmail('');
                setInviteRole('VIEWER');
                fetchUsers();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Dispatch failed', { id: toastId });
        } finally {
            setIsInviting(false);
        }
    };

    return (
        <div className="space-y-8 pb-10 animate-in fade-in duration-500">
            
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-secondary rounded-2xl shadow-xl border border-white/10">
                        <Shield className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight text-secondary">Access Control</h1>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Sri Balaji Ads Directory</p>
                    </div>
                </div>

                <button 
                    onClick={() => setIsInviteModalOpen(true)}
                    className="flex items-center justify-center space-x-3 bg-primary hover:bg-red-700 text-white px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all shadow-2xl shadow-red-200 active:scale-95"
                >
                    <UserPlus className="w-5 h-5" />
                    <span>Invite Resource</span>
                </button>
            </div>

            {/* --- TABLE (Desktop/PC View) --- */}
            <div className="hidden lg:block bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Identity / Email</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Authority Level</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Security Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan="4" className="p-20 text-center text-gray-400 animate-pulse font-black uppercase text-xs">Querying Encrypted Directory...</td></tr>
                            ) : (
                                users.map((u) => (
                                    <tr key={u.id} className="hover:bg-gray-50/50 transition-all">
                                        <td className="p-6">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-secondary font-black border border-gray-200 uppercase">
                                                    {u.email.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-secondary leading-none">{u.email}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tighter italic">Resource ID: {u.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <select
                                                value={u.role}
                                                onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                                className={`text-[10px] font-black uppercase tracking-widest rounded-xl px-4 py-2 border transition-all cursor-pointer outline-none ${
                                                    u.role === 'ADMIN' ? 'bg-red-50 text-red-700 border-red-100' :
                                                    u.role === 'EDITOR' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                    'bg-gray-100 text-gray-700 border-gray-200'
                                                }`}
                                            >
                                                <option value="ADMIN">ADMINISTRATOR</option>
                                                <option value="EDITOR">EDITOR</option>
                                                <option value="VIEWER">VIEWER</option>
                                            </select>
                                        </td>
                                        <td className="p-6">
                                            <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border ${u.isActive ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                                                {u.isActive ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                                                <span className="text-[10px] font-black uppercase tracking-widest">{u.isActive ? 'Authorized' : 'Suspended'}</span>
                                            </div>
                                        </td>
                                        <td className="p-6 text-center">
                                            <button
                                                onClick={() => handleStatusChange(u.id, u.isActive)}
                                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                                    u.isActive 
                                                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                                                        : 'bg-green-600 text-white shadow-lg shadow-green-100'
                                                }`}
                                            >
                                                {u.isActive ? 'Suspend' : 'Reinstate'}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- CARDS (Mobile/Tablet View) --- */}
            <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
                {loading ? (
                    <div className="p-12 text-center text-gray-400 font-black uppercase text-xs animate-pulse">Syncing...</div>
                ) : (
                    users.map((u) => (
                        <div key={u.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden flex flex-col">
                            <div className="flex items-center space-x-4 mb-6">
                                <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center text-primary font-black text-xl border-b-4 border-primary">
                                    {u.email.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-black text-secondary truncate">{u.email}</h3>
                                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tighter border ${u.isActive ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-500 border-red-100'}`}>
                                        {u.isActive ? 'Authorized' : 'Suspended'}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3 mb-6 font-bold uppercase tracking-widest text-[9px]">
                                <label className="text-gray-400 px-2">Assigned Authority</label>
                                <select
                                    value={u.role}
                                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                    className="w-full bg-gray-50 p-4 rounded-2xl border-none text-secondary appearance-none"
                                >
                                    <option value="ADMIN">ADMINISTRATOR</option>
                                    <option value="EDITOR">EDITOR</option>
                                    <option value="VIEWER">VIEWER</option>
                                </select>
                            </div>

                            <button
                                onClick={() => handleStatusChange(u.id, u.isActive)}
                                className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center space-x-2 ${
                                    u.isActive 
                                        ? 'bg-gray-100 text-gray-500' 
                                        : 'bg-green-600 text-white shadow-xl'
                                }`}
                            >
                                {u.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                <span>{u.isActive ? 'Revoke Access' : 'Restore Access'}</span>
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* --- PAGINATION --- */}
            <div className="bg-white p-4 rounded-[2rem] border border-gray-100 flex items-center justify-between shadow-sm font-black text-xs">
                <p className="hidden sm:block text-gray-400 uppercase tracking-widest ml-4">Directory Page: {page + 1} / {totalPages || 1}</p>
                <div className="flex w-full sm:w-auto gap-3">
                    <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0 || loading} className="flex-1 sm:flex-none flex items-center justify-center px-6 py-3 border-2 border-gray-100 rounded-[1.5rem] hover:bg-gray-50 disabled:opacity-30 transition-all uppercase tracking-widest active:scale-95 font-black">Prev</button>
                    <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1 || loading} className="flex-1 sm:flex-none flex items-center justify-center px-6 py-3 border-2 border-gray-100 rounded-[1.5rem] hover:bg-gray-50 disabled:opacity-30 transition-all uppercase tracking-widest active:scale-95 font-black">Next</button>
                </div>
            </div>

            {/* --- INVITE MODAL --- */}
            {isInviteModalOpen && (
                <div className="fixed inset-0 bg-secondary/95 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in zoom-in duration-200">
                    <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl overflow-hidden flex flex-col border border-white/20">
                        
                        <div className="p-10 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <div>
                                <h2 className="text-4xl font-black text-gray-800 tracking-tighter flex items-center">
                                    <UserPlus className="w-10 h-10 mr-4 text-primary" /> New Entry
                                </h2>
                                <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.4em] mt-2 ml-14 italic">Provision Secure Credentials</p>
                            </div>
                            <button onClick={() => setIsInviteModalOpen(false)} className="text-gray-300 hover:text-primary transition-all bg-white rounded-full p-3 shadow-xl border border-gray-100 active:scale-90"><X className="w-8 h-8" /></button>
                        </div>
                        
                        <form onSubmit={handleInviteUser} className="p-10 space-y-8">
                            <div className="space-y-6">
                                <div className="space-y-3 px-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center">
                                        <Mail className="w-3 h-3 mr-2" /> Target Resource Email
                                    </label>
                                    <input 
                                        type="email" 
                                        required 
                                        placeholder="authorized.user@sribalajiads.com"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        className="w-full p-5 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-secondary shadow-inner"
                                    />
                                </div>
                                
                                <div className="space-y-3 px-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center">
                                        <Fingerprint className="w-3 h-3 mr-2" /> Authority Mapping
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-black">
                                        {['VIEWER', 'EDITOR', 'ADMIN'].map((role) => (
                                            <button
                                                key={role}
                                                type="button"
                                                onClick={() => setInviteRole(role)}
                                                className={`py-4 rounded-2xl text-[10px] uppercase tracking-widest transition-all border-2 ${
                                                    inviteRole === role 
                                                        ? 'bg-secondary text-primary border-primary shadow-xl shadow-red-900/10' 
                                                        : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'
                                                }`}
                                            >
                                                {role}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 pt-6">
                                <button type="button" onClick={() => setIsInviteModalOpen(false)} className="flex-1 px-8 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-gray-400 bg-gray-50 hover:bg-gray-100 transition-all active:scale-95">Abort</button>
                                <button type="submit" disabled={isInviting} className="flex-1 px-8 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white bg-primary hover:bg-red-700 shadow-2xl shadow-red-200 transition-all active:scale-95 disabled:opacity-50">
                                    {isInviting ? 'Dispatched...' : 'Confirm Invite'}
                                </button>
                            </div>
                            
                            {/* FIX: Info component now works correctly because of the import above */}
                            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex items-start">
                                <Info className="w-4 h-4 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                                <p className="text-[9px] text-blue-600 font-bold leading-relaxed uppercase tracking-tight">
                                    Resource will receive a cryptographic OTP via identity mail. Authorization remains 
                                    pending until verified by the target resource.
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;