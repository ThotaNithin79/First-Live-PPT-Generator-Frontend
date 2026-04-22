import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axiosConfig';
import { 
    History, Search, ChevronLeft, ChevronRight, X, 
    User, Activity, Eye, Info, AlertCircle, 
    CheckCircle2 // Fix: Added the missing import here
} from 'lucide-react';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchCode, setSearchCode] = useState('');
    
    // Modal state for viewing full JSON details
    const [selectedLog, setSelectedLog] = useState(null);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const endpoint = searchCode.trim() ? `/audit/${searchCode.trim()}` : '/audit';
            const response = await api.get(endpoint, { params: { page, size: 10 } });
            
            if (response.data.success) {
                setLogs(response.data.data.content);
                setTotalPages(response.data.data.totalPages);
            }
        } catch (error) {
            toast.error('Security system unable to retrieve audit trail.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [page]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(0);
        fetchLogs();
    };

    const getActionColor = (action) => {
        if (action.includes('CREATE')) return 'bg-green-50 text-green-700 border-green-100';
        if (action.includes('DELETE')) return 'bg-red-50 text-red-700 border-red-100';
        if (action.includes('SYNC')) return 'bg-purple-50 text-purple-700 border-purple-100';
        return 'bg-blue-50 text-blue-700 border-blue-100';
    };

    const formatJsonSnippet = (jsonStr) => {
        if (!jsonStr || jsonStr === '{}') return <span className="text-gray-300 italic text-[10px]">Null State</span>;
        try {
            const data = JSON.parse(jsonStr);
            return (
                <div className="space-y-1">
                    {Object.entries(data).slice(0, 2).map(([key, val]) => (
                        <div key={key} className="text-[10px] flex space-x-1 truncate">
                            <span className="font-black text-gray-400 uppercase">{key}:</span>
                            <span className="text-gray-600 truncate">{String(val)}</span>
                        </div>
                    ))}
                    {Object.keys(data).length > 2 && <span className="text-[9px] text-primary font-black uppercase tracking-tighter">+ details</span>}
                </div>
            );
        } catch { return <span className="text-[10px] text-gray-500">{jsonStr}</span>; }
    };

    return (
        <div className="space-y-8 pb-10 animate-in fade-in duration-500">
            {/* --- HEADER --- */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-secondary rounded-2xl shadow-xl">
                        <History className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">System Audit</h1>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Immutable Security Event Logs</p>
                    </div>
                </div>
            </div>

            {/* --- SEARCHBAR --- */}
            <div className="bg-white p-3 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col md:flex-row gap-3">
                <form onSubmit={handleSearch} className="flex-1 flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative group">
                        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                        </div>
                        <input 
                            type="text" 
                            className="w-full pl-16 pr-4 py-4 bg-transparent outline-none font-bold text-gray-700 placeholder:text-gray-300 text-lg" 
                            placeholder="Filter by EXACT Media Code (e.g. HYD-101)..." 
                            value={searchCode} 
                            onChange={(e) => setSearchCode(e.target.value)} 
                        />
                    </div>
                    <button type="submit" className="bg-secondary text-white px-10 py-4 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-gray-800 transition-all shadow-xl active:scale-95">Verify Registry</button>
                </form>
                {searchCode && (
                    <button onClick={() => { setSearchCode(''); setPage(0); fetchLogs(); }} className="bg-gray-100 text-gray-400 px-6 py-4 rounded-[2rem] font-bold hover:bg-gray-200 transition-all active:scale-95">Reset</button>
                )}
            </div>

            {/* --- CONTENT AREA --- */}
            
            {/* DESKTOP TABLE VIEW (lg+) */}
            <div className="hidden lg:block bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Timestamp</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Action</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Resource</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Authority</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">State Delta</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Inspect</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan="6" className="p-20 text-center text-gray-400 animate-pulse font-black uppercase text-xs tracking-widest">Accessing Encrypted Logs...</td></tr>
                            ) : logs.length === 0 ? (
                                <tr><td colSpan="6" className="p-20 text-center text-gray-500 font-bold italic">Zero logs found for this query.</td></tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50/50 transition-all">
                                        <td className="p-6">
                                            <p className="text-xs font-black text-gray-800">{new Date(log.modifiedAt).toLocaleDateString()}</p>
                                            <p className="text-[10px] font-bold text-gray-400 mt-0.5">{new Date(log.modifiedAt).toLocaleTimeString()}</p>
                                        </td>
                                        <td className="p-6">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getActionColor(log.action)}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="p-6 text-sm font-black text-secondary">{log.mediaCode}</td>
                                        <td className="p-6">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center text-[10px] font-black text-primary uppercase">{log.modifiedByEmail.charAt(0)}</div>
                                                <span className="text-xs font-bold text-gray-600">{log.modifiedByEmail}</span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="grid grid-cols-2 gap-4 max-w-xs">
                                                <div className="opacity-40">{formatJsonSnippet(log.oldData)}</div>
                                                <div>{formatJsonSnippet(log.newData)}</div>
                                            </div>
                                        </td>
                                        <td className="p-6 text-center">
                                            <button onClick={() => setSelectedLog(log)} className="p-2 bg-white border border-gray-200 text-gray-400 hover:text-primary hover:border-primary rounded-xl transition-all shadow-sm active:scale-90">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MOBILE CARD VIEW (<lg) */}
            <div className="lg:hidden space-y-4">
                {loading ? (
                    <div className="p-12 text-center text-gray-400 font-black uppercase text-xs animate-pulse">Synchronizing...</div>
                ) : logs.map((log) => (
                    <div key={log.id} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden active:scale-95 transition-all" onClick={() => setSelectedLog(log)}>
                        <div className={`absolute top-0 left-0 w-2 h-full ${log.action.includes('CREATE') ? 'bg-green-500' : log.action.includes('DELETE') ? 'bg-red-500' : 'bg-blue-500'}`} />
                        
                        <div className="flex justify-between items-start mb-4 pl-2">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(log.modifiedAt).toLocaleString()}</p>
                                <h3 className="text-xl font-black text-gray-800 tracking-tight">{log.mediaCode}</h3>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${getActionColor(log.action)}`}>
                                {log.action}
                            </span>
                        </div>

                        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-2xl mb-4">
                            <User className="w-4 h-4 text-primary" />
                            <span className="text-xs font-bold text-gray-600 truncate">{log.modifiedByEmail}</span>
                        </div>

                        <button className="w-full py-3 bg-secondary text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center space-x-2">
                            <Eye className="w-3 h-3" />
                            <span>Inspect Delta State</span>
                        </button>
                    </div>
                ))}
            </div>

            {/* --- PAGINATION --- */}
            <div className="bg-white p-4 rounded-[2rem] border border-gray-100 flex items-center justify-between shadow-sm font-black text-xs">
                <p className="hidden sm:block text-gray-400 uppercase tracking-widest ml-4">Registry Page: {page + 1} / {totalPages || 1}</p>
                <div className="flex w-full sm:w-auto gap-3">
                    <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0 || loading} className="flex-1 sm:flex-none flex items-center justify-center px-6 py-3 border-2 border-gray-100 rounded-[1.5rem] hover:bg-gray-50 disabled:opacity-30 transition-all uppercase tracking-widest">Prev</button>
                    <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1 || loading} className="flex-1 sm:flex-none flex items-center justify-center px-6 py-3 border-2 border-gray-100 rounded-[1.5rem] hover:bg-gray-50 disabled:opacity-30 transition-all uppercase tracking-widest">Next</button>
                </div>
            </div>

            {/* --- FULL JSON INSPECTOR MODAL --- */}
            {selectedLog && (
                <div className="fixed inset-0 bg-secondary/95 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in zoom-in duration-200">
                    <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh] border border-white/20">
                        
                        <div className="flex justify-between items-center p-8 border-b border-gray-100 bg-gray-50/50">
                            <div>
                                <h2 className="text-3xl font-black text-gray-800 tracking-tighter flex items-center">
                                    <Activity className="w-8 h-8 mr-4 text-primary" /> Log Inspector
                                </h2>
                                <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.4em] mt-2 ml-12 italic">ID: {selectedLog.id} | Resource: {selectedLog.mediaCode}</p>
                            </div>
                            <button onClick={() => setSelectedLog(null)} className="text-gray-300 hover:text-primary transition-all bg-white rounded-full p-3 shadow-xl border border-gray-100 active:scale-90">
                                <X className="w-8 h-8" />
                            </button>
                        </div>

                        <div className="p-10 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* BEFORE STATE */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center px-2">
                                    <AlertCircle className="w-4 h-4 mr-2" /> Initial State (Before)
                                </h3>
                                <div className="bg-secondary p-6 rounded-[2.5rem] shadow-inner h-[350px] overflow-y-auto border-t-8 border-gray-700">
                                    <pre className="text-[11px] font-mono text-gray-400 leading-relaxed">
                                        {selectedLog.oldData ? JSON.stringify(JSON.parse(selectedLog.oldData), null, 4) : "// No previous data (Entry Initialization)"}
                                    </pre>
                                </div>
                            </div>

                            {/* AFTER STATE */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center px-2">
                                    <CheckCircle2 className="w-4 h-4 mr-2" /> Modified State (After)
                                </h3>
                                <div className="bg-gray-50 p-6 rounded-[2.5rem] shadow-inner h-[350px] overflow-y-auto border-t-8 border-primary">
                                    <pre className="text-[11px] font-mono text-secondary leading-relaxed font-bold">
                                        {selectedLog.newData ? JSON.stringify(JSON.parse(selectedLog.newData), null, 4) : "// Resource Purged from Database"}
                                    </pre>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex justify-end">
                            <button onClick={() => setSelectedLog(null)} className="px-12 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest text-white bg-secondary hover:bg-gray-800 shadow-xl transition-all active:scale-95">Dismiss Inspector</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuditLogs;