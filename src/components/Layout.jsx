import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Image as ImageIcon, Users, History, Presentation, Menu, X, User } from 'lucide-react';

const Layout = () => {
    const { user, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/', label: 'Dashboard', icon: <ImageIcon className="w-5 h-5" />, roles: ['ADMIN', 'EDITOR', 'VIEWER'] },
        { path: '/ppt-generator', label: 'PPT Generator', icon: <Presentation className="w-5 h-5" />, roles: ['ADMIN', 'EDITOR', 'VIEWER'] },
        { path: '/users', label: 'Users', icon: <Users className="w-5 h-5" />, roles: ['ADMIN'] },
        { path: '/audit', label: 'System Logs', icon: <History className="w-5 h-5" />, roles: ['ADMIN'] },
    ];

    const NavLinks = () => (
        <nav className="flex-1 px-4 py-4 space-y-1">
            {navItems.map((item) => {
                if (!item.roles.includes(user?.role)) return null;
                const isActive = location.pathname === item.path;
                return (
                    <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                ? 'bg-primary text-white shadow-lg shadow-red-200'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                            }`}
                    >
                        <span className={`${isActive ? 'text-white' : 'group-hover:text-primary transition-colors'}`}>
                            {item.icon}
                        </span>
                        <span className="font-semibold tracking-wide text-sm">{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );

    return (
        <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">

            {/* --- 1. DESKTOP SIDEBAR --- */}
            <aside className="hidden lg:flex w-72 bg-secondary text-white flex-col shadow-2xl z-20">
                <div className="p-8 flex items-center justify-start space-x-3">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-red-900/20">
                        <Presentation className="text-white w-6 h-6" />
                    </div>
                    {/* CHANGED NAME BELOW */}
                    <h1 className="text-xl font-black tracking-tighter uppercase italic">
                        PPT<span className="text-primary not-italic uppercase"> Generator</span>
                    </h1>
                </div>
                <NavLinks />
                <div className="p-6 border-t border-gray-800">
                    <button onClick={handleLogout} className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-500 transition-all font-bold">
                        <LogOut className="w-5 h-5" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* --- 2. MOBILE DRAWER --- */}
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" onClick={() => setIsMobileMenuOpen(false)} />
            )}
            <aside className={`lg:hidden fixed top-0 left-0 h-full w-80 bg-secondary text-white z-[70] transform transition-transform duration-300 ease-in-out flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-8 flex justify-between items-center border-b border-gray-800">
                    <h1 className="text-xl font-black tracking-tighter uppercase italic">Media<span className="text-primary not-italic">SBA</span></h1>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-gray-800 rounded-lg"><X /></button>
                </div>
                <NavLinks />
                <div className="p-6 mt-auto">
                    <button onClick={handleLogout} className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-red-500 bg-red-500/10 font-bold">
                        <LogOut className="w-5 h-5" /><span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* --- 3. MAIN CONTENT AREA --- */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* Navbar */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 lg:px-10 z-10">
                    <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                        <Menu className="w-6 h-6" />
                    </button>

                    <div className="hidden md:block">
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em]">Management Portal</h2>
                    </div>

                    {/* CORRECTED PROFILE DATA SECTION */}
                    <div className="flex items-center space-x-3 md:space-x-4">
                        <div className="text-right">
                            {/* Email/Username: Now visible on all screens with truncation for mobile safety */}
                            <p className="text-[13px] sm:text-sm font-black text-gray-800 leading-none max-w-[100px] sm:max-w-none truncate">
                                {user?.email?.split('@')[0]}
                            </p>
                            {/* Role Label */}
                            <span className="text-[9px] sm:text-[10px] font-bold text-primary uppercase tracking-widest block mt-0.5 sm:mt-1">
                                {user?.role}
                            </span>
                        </div>

                        {/* User Icon Badge */}
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-primary shadow-inner group cursor-pointer hover:border-primary/30 transition-all">
                            <User className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-10">
                    <div className="max-w-[1600px] mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;