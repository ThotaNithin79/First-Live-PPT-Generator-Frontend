import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import {
    Search, ChevronLeft, ChevronRight, Upload, RefreshCw,
    Presentation, Edit, X, ImageIcon, Trash2,
    AlertTriangle, Info, FileSpreadsheet, CheckCircle2, UploadCloud,
    Eye, LayoutGrid, Sparkles, Loader2, MapPin, Box, Layers, Building2, Lightbulb, Zap
} from 'lucide-react';

// ==========================================
// 1. ROBUST HELPER: SECURE IMAGE LOADER
// ==========================================
const SecureImage = ({ fileName, className, alt = "Media Asset" }) => {
    const [imgUrl, setImgUrl] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // PREVENTION: Stop 'null' or empty strings from hitting the backend
        if (!fileName || fileName === "null" || fileName === "") {
            setLoading(false);
            return;
        }

        let objectUrl = null;
        setLoading(true);

        // Path is relative to /api (provided by axiosConfig baseURL)
        api.get(`/media/view-image/${fileName}`, { responseType: 'blob' })
            .then(res => {
                objectUrl = URL.createObjectURL(res.data);
                setImgUrl(objectUrl);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });

        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [fileName]);

    if (loading) {
        return (
            <div className={`${className} bg-gray-50 flex items-center justify-center`}>
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return imgUrl ? (
        <img src={imgUrl} className={className} alt={alt} loading="lazy" />
    ) : (
        <div className={`${className} bg-gray-100 flex flex-col items-center justify-center text-gray-300`}>
            <ImageIcon className="w-10 h-10 mb-2 opacity-20" />
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">No Visual</span>
        </div>
    );
};

// ==========================================
// 2. PREVIEW MODAL COMPONENT
// ==========================================
const ImagePreviewModal = ({ fileName, onClose }) => (
    <div className="fixed inset-0 bg-secondary/98 backdrop-blur-2xl flex flex-col items-center justify-center z-[110] p-4 animate-in fade-in duration-300">
        <button onClick={onClose} className="absolute top-6 right-6 p-4 bg-white/10 hover:bg-primary text-white rounded-full transition-all shadow-2xl active:scale-90">
            <X className="w-8 h-8" />
        </button>
        <div className="max-w-7xl w-full flex flex-col items-center">
            <div className="bg-white/5 p-3 rounded-[2.5rem] shadow-2xl border border-white/10 flex items-center justify-center min-h-[300px] w-full max-w-5xl">
                <SecureImage fileName={fileName} className="max-h-[75vh] w-full rounded-[1.5rem] object-contain shadow-2xl" alt="Preview" />
            </div>
            <div className="mt-10 text-center bg-white/5 px-10 py-4 rounded-full border border-white/10 backdrop-blur-md">
                <p className="text-white font-mono text-xl tracking-[0.2em] uppercase font-black">{fileName}</p>
                <div className="flex items-center justify-center space-x-2 mt-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                    <p className="text-primary text-[10px] font-black uppercase tracking-widest">Secure Authenticated Stream</p>
                </div>
            </div>
        </div>
    </div>
);


const MediaDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [mediaList, setMediaList] = useState([]);
    const [loading, setLoading] = useState(true);

    // Pagination & Search
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [selectedCodes, setSelectedCodes] = useState([]);

    // UI States
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editMedia, setEditMedia] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const fileInputRef = useRef(null);
    const singleImageInputRef = useRef(null);

    // Live Search Logic (400ms Debounce)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setPage(0);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchMedia = async () => {
        setLoading(true);
        try {
            const params = { page: page, size: 12 };
            if (debouncedSearchTerm.trim()) params.location = debouncedSearchTerm.trim();

            const response = await api.get('/media', { params });
            if (response.data.success) {
                setMediaList(response.data.data.content);
                const pages = response.data.data.page?.totalPages ?? response.data.data.totalPages;
                setTotalPages(pages);
            }
        } catch (error) {
            toast.error('Inventory Sync Error');
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchMedia(); }, [page, debouncedSearchTerm]);

    const handleSelectOne = (code) => {
        setSelectedCodes(prev => prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]);
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const currentCodes = mediaList.map(m => m.mediaCode);
            setSelectedCodes([...new Set([...selectedCodes, ...currentCodes])]);
        } else {
            const currentCodes = mediaList.map(m => m.mediaCode);
            setSelectedCodes(selectedCodes.filter(c => !currentCodes.includes(c)));
        }
    };

    const handleBulkUpload = async (event) => {
        const file = event.target.files[0]; if (!file) return;
        const formData = new FormData(); formData.append('file', file);
        setIsUploadModalOpen(false); setIsUploading(true);
        const loadToast = toast.loading('Synchronizing Data Matrix...');
        try {
            const res = await api.post('/media/bulk-upload', formData);
            if (res.data.success) {
                toast.success(res.data.message, { id: loadToast });
                setPage(0); setSearchTerm(''); fetchMedia();
            }
        } catch (err) { toast.error('Upload Failed', { id: loadToast }); }
        finally { setIsUploading(false); }
    };

    const handleSyncImages = async () => {
        setIsSyncing(true);
        const loadToast = toast.loading('Performing deep asset sync...');
        try {
            const res = await api.post('/media/sync-images');
            if (res.data.success) {
                toast.success(res.data.message, { id: loadToast });
                fetchMedia();
            }
        } catch (err) { toast.error('Sync failed', { id: loadToast }); }
        finally { setIsSyncing(false); }
    };

    const openEditModal = (media, e) => {
        e.stopPropagation();
        setEditMedia({ ...media });
        setIsEditModalOpen(true);
    };

    const handleTextUpdate = async (e) => {
        e.preventDefault(); setIsSaving(true);
        try {
            const res = await api.put(`/media/${editMedia.id}`, editMedia);
            if (res.data.success) {
                toast.success('Updated');
                setMediaList(prev => prev.map(m => m.id === editMedia.id ? res.data.data : m));
                setIsEditModalOpen(false);
            }
        } catch (err) { toast.error('Rejected'); }
        finally { setIsSaving(false); }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0]; if (!file) return;
        const formData = new FormData(); formData.append('file', file);
        try {
            const res = await api.post(`/media/${editMedia.id}/image`, formData);
            if (res.data.success) {
                toast.success('Visual Linked');
                setEditMedia(res.data.data);
                setMediaList(prev => prev.map(m => m.id === editMedia.id ? res.data.data : m));
            }
        } catch (err) { toast.error('Failed'); }
    };

    const handleRemoveImage = async () => {
        if (!window.confirm('Purge mapping?')) return;
        try {
            const res = await api.delete(`/media/${editMedia.id}/image`);
            if (res.data.success) {
                toast.success('Purged');
                setEditMedia(res.data.data);
                setMediaList(prev => prev.map(m => m.id === editMedia.id ? res.data.data : m));
            }
        } catch (err) { toast.error('Failed'); }
    };

    return (
        <div className="space-y-8 pb-32 max-w-[1920px] mx-auto animate-in fade-in duration-700">

            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
                <div className="flex items-center space-x-5">
                    <div className="p-4 bg-secondary rounded-[1.5rem] shadow-2xl border-b-4 border-primary">
                        <LayoutGrid className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-secondary tracking-tighter uppercase italic">Sri Balaji Ads<span className="text-primary not-italic text-2xl ml-2 font-light">| Inventory</span></h1>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] mt-1">Global Asset Control Matrix</p>
                    </div>
                </div>

                {user?.role === 'EDITOR' && (
                    <div className="flex flex-wrap items-center gap-3">
                        <button onClick={() => setIsUploadModalOpen(true)} className="flex-1 md:flex-none flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95">
                            <Upload className="w-4 h-4" /><span>Import Data</span>
                        </button>
                        <button onClick={handleSyncImages} className="flex-1 md:flex-none flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95">
                            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} /><span>Deep Sync</span>
                        </button>
                    </div>
                )}
            </div>

            {/* --- SEARCH & SELECT --- */}
            <div className="bg-white p-3 mx-4 rounded-[3rem] shadow-xl border border-gray-100 flex flex-col xl:flex-row items-center gap-4">
                <div className="flex-1 w-full relative group">
                    <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-300 group-focus-within:text-primary transition-colors" />
                    <input type="text" className="w-full pl-16 pr-14 py-5 bg-gray-50 border-2 border-transparent focus:border-primary/10 rounded-[2.5rem] focus:ring-8 focus:ring-primary/5 focus:bg-white outline-none transition-all font-bold text-secondary placeholder:text-gray-300 text-lg shadow-inner" placeholder="Live filtering by location, direction or site code..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    {loading && searchTerm && <Loader2 className="absolute right-14 top-1/2 -translate-y-1/2 w-6 h-6 text-primary animate-spin" />}
                </div>

                <div className="w-full xl:w-auto px-8 flex items-center justify-end xl:border-l border-gray-100">
                    <label className="flex items-center space-x-5 cursor-pointer group py-2">
                        <div className="flex flex-col text-right">
                            <span className="text-xs font-black text-secondary uppercase tracking-widest group-hover:text-primary transition-colors leading-none">Select Range</span>
                            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1">For Presentation</span>
                        </div>
                        <input type="checkbox" className="w-9 h-9 text-primary rounded-2xl border-gray-200 focus:ring-primary cursor-pointer transition-all shadow-md" onChange={handleSelectAll} checked={mediaList.length > 0 && mediaList.every(m => selectedCodes.includes(m.mediaCode))} />
                    </label>
                </div>
            </div>

            {/* --- THE CINEMATIC GRID (Image on TOP, Wide Card) --- */}
            {loading && mediaList.length === 0 ? (
                <div className="py-40 text-center bg-white rounded-[4rem] border border-gray-100 shadow-2xl animate-pulse mx-4">
                    <Loader2 className="w-16 h-16 mx-auto mb-6 text-primary/40 animate-spin" />
                    <p className="font-black text-gray-300 uppercase tracking-[0.5em] text-sm">Syncing Matrix...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8 px-4">
                    {mediaList.map((media) => (
                        <div
                            key={media.id}
                            className={`flex flex-col bg-white rounded-[3rem] border-t-8 transition-all duration-500 shadow-lg hover:shadow-2xl overflow-hidden cursor-pointer group ${selectedCodes.includes(media.mediaCode) ? 'border-primary ring-8 ring-primary/5 bg-red-50/10' : 'border-red-600 hover:-translate-y-2'
                                }`}
                            onClick={() => handleSelectOne(media.mediaCode)}
                        >
                            {/* --- TOP: LARGE LANDSCAPE VISUAL --- */}
                            <div className="relative aspect-[21/9] w-full bg-secondary overflow-hidden border-b border-gray-50">
                                <SecureImage fileName={media.imageFileName} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 via-transparent to-transparent opacity-60"></div>

                                <div className="absolute top-5 left-5 z-10">
                                    <span className="px-4 py-1.5 bg-primary text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl border border-white/20 font-mono">{media.mediaCode}</span>
                                </div>

                                <div className="absolute top-5 right-5 z-20" onClick={(e) => e.stopPropagation()}>
                                    <input type="checkbox" className="w-8 h-8 text-primary bg-white/20 backdrop-blur-md rounded-xl border-white/40 focus:ring-primary cursor-pointer shadow-2xl transition-transform hover:scale-110" checked={selectedCodes.includes(media.mediaCode)} onChange={() => handleSelectOne(media.mediaCode)} />
                                </div>

                                {media.imageFileName && (
                                    <button onClick={(e) => { e.stopPropagation(); setPreviewImage(media.imageFileName); }} className="absolute bottom-5 right-5 p-4 bg-white/95 hover:bg-primary text-secondary hover:text-white rounded-2xl transition-all shadow-2xl active:scale-90 z-10">
                                        <Eye className="w-6 h-6" />
                                    </button>
                                )}
                            </div>

                            {/* --- BOTTOM: COMPACT DATA BAR --- */}
                            <div className="p-8 flex-1 flex flex-col bg-white">
                                <div className="mb-6">
                                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">{media.mediaType}</span>
                                    <h3 className="text-xl font-black text-secondary leading-tight line-clamp-1 uppercase tracking-tighter mt-1">{media.location || 'Site Ref Missing'}</h3>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-gray-50 p-4 rounded-2xl flex items-center space-x-3 border border-gray-100">
                                        <Building2 className="w-5 h-5 text-primary/40 shrink-0" />
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Location</span>
                                            <span className="text-xs font-black text-secondary uppercase truncate">{media.city || 'N/A'}</span>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-2xl flex items-center space-x-3 border border-gray-100">
                                        <Box className="w-5 h-5 text-primary/40 shrink-0" />
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Specifications</span>
                                            <span className="text-xs font-black text-secondary uppercase font-mono">{media.specifications || 'N/A'}</span>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-2xl flex items-center space-x-3 border border-gray-100">
                                        <Lightbulb className="w-5 h-5 text-primary/40 shrink-0" />
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Illumination</span>
                                            <span className="text-xs font-black text-secondary uppercase truncate">{media.illumination || 'N/A'}</span>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-2xl flex items-center space-x-3 border border-gray-100">
                                        <Zap className="w-5 h-5 text-primary/40 shrink-0" />
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Traffic View</span>
                                            <span className="text-xs font-black text-secondary uppercase truncate">{media.trafficView || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-auto">
                                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] italic underline">Active Segment</p>
                                    {user?.role === 'EDITOR' && (
                                        <button onClick={(e) => openEditModal(media, e)} className="flex items-center px-8 py-3 bg-secondary text-white rounded-2xl hover:bg-primary transition-all shadow-xl active:scale-95 font-black text-[11px] uppercase tracking-widest">
                                            <Edit className="w-4 h-4 mr-2 text-primary" /> Modify Resource
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* --- 4. PAGINATION --- */}
            <div className="mx-4 bg-white p-5 rounded-[3rem] border border-gray-100 flex items-center justify-between shadow-2xl">
                <p className="hidden sm:block text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-8">Registry Index: {page + 1} / {totalPages || 1}</p>
                <div className="flex w-full sm:w-auto gap-4">
                    <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0 || loading} className="flex-1 sm:flex-none flex items-center justify-center px-12 py-5 border-2 border-gray-100 rounded-[2rem] hover:bg-secondary hover:text-white disabled:opacity-30 transition-all font-black text-xs active:scale-95">Prev</button>
                    <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1 || loading} className="flex-1 sm:flex-none flex items-center justify-center px-12 py-5 border-2 border-gray-100 rounded-[2rem] hover:bg-secondary hover:text-white transition-all font-black text-xs active:scale-95">Next</button>
                </div>
            </div>

            {/* --- 5. FLOATING PPT CONSOLE --- */}
            {selectedCodes.length > 0 && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[94%] max-w-4xl bg-secondary/98 backdrop-blur-3xl text-white px-10 py-6 rounded-[4rem] shadow-2xl flex items-center justify-between z-50 border border-white/10 animate-in slide-in-from-bottom-40 duration-700">
                    <div className="flex items-center space-x-8">
                        <div className="w-16 h-16 bg-primary rounded-3xl flex items-center justify-center shadow-2xl transform -rotate-6">
                            <span className="text-2xl font-black text-white leading-none tracking-tighter">{selectedCodes.length}</span>
                        </div>
                        <div className="hidden lg:block leading-tight"><p className="text-lg font-black uppercase tracking-tighter text-white italic">Compilation Unit Ready</p><p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.5em]">Assets staged for PPT construction</p></div>
                    </div>
                    <div className="flex items-center space-x-6">
                        <button onClick={() => navigate('/ppt-generator', { state: { selectedCodes } })} className="bg-white text-secondary hover:bg-primary hover:text-white px-12 py-5 rounded-[2.5rem] font-black text-xs tracking-[0.3em] transition-all flex items-center space-x-4 shadow-2xl active:scale-95 uppercase group"><Presentation className="w-6 h-6 text-primary group-hover:text-white" /><span>Initialize Build</span></button>
                        <button onClick={() => setSelectedCodes([])} className="p-3 bg-white/5 hover:bg-red-500/20 rounded-full text-gray-500 hover:text-red-500 active:scale-75"><X className="w-7 h-7" /></button>
                    </div>
                </div>
            )}

            {/* --- MODALS --- */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 bg-secondary/95 backdrop-blur-md flex items-center justify-center z-[120] p-4 animate-in zoom-in duration-200">
                    <div className="bg-white rounded-[4rem] shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col max-h-[92vh] border-8 border-white">
                        <div className="flex justify-between items-center p-12 border-b bg-gray-50/50">
                            <div><h2 className="text-5xl font-black text-secondary tracking-tighter flex items-center italic"><FileSpreadsheet className="w-12 h-12 mr-5 text-green-600" />Import Engine</h2><p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.6em] mt-3 ml-16 italic">Synchronized Binary Ingestion</p></div>
                            <button onClick={() => setIsUploadModalOpen(false)} className="bg-white shadow-2xl p-4 rounded-full text-gray-300 hover:text-primary active:scale-90 transition-all"><X className="w-10 h-10" /></button>
                        </div>
                        <div className="p-12 overflow-y-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
                            <div className="space-y-12">
                                <div><h3 className="text-2xl font-black text-secondary tracking-tight mb-8 border-l-8 border-primary pl-6 uppercase italic">The Logical Pattern</h3><div className="grid grid-cols-2 gap-4 bg-secondary p-10 rounded-[3rem] shadow-2xl">{["1. Media Code", "2. Company", "3. Media Type", "4. City", "5. Location", "6. Specifications", "7. Illumination", "8. Traffic View", "9. Coordinates", "10. Map Link"].map(c => <div key={c} className="text-[10px] font-mono font-bold text-gray-400 flex items-center"><div className="w-2 h-2 bg-primary mr-4 rounded-full shadow-lg shadow-red-500/50" /> {c}</div>)}</div></div>
                                <div className="bg-red-50 p-10 rounded-[3rem] border-2 border-red-100 shadow-inner"><h3 className="text-sm font-black text-red-800 uppercase tracking-[0.2em] mb-4 flex items-center"><AlertTriangle className="w-6 h-6 mr-3" /> Integrity Shield</h3><p className="text-xs text-red-700 font-bold leading-relaxed uppercase tracking-widest">Duplicates will perform an automatic OVERWRITE. Audit trails logged permanently.</p></div>
                            </div>
                            <div className="flex flex-col"><div className="flex-1 flex flex-col justify-center items-center p-16 border-8 border-dashed border-gray-100 rounded-[5rem] bg-gray-50 cursor-pointer group hover:bg-green-50/50 hover:border-green-400 transition-all shadow-inner" onClick={() => fileInputRef.current.click()}><div className="w-32 h-32 bg-white rounded-[3rem] shadow-2xl flex items-center justify-center mb-10 group-hover:scale-110"><UploadCloud className="w-16 h-16 text-gray-200" /></div><p className="text-3xl font-black text-secondary tracking-tighter uppercase italic text-center">Inject Spreadsheet</p><input type="file" accept=".xlsx, .xls" ref={fileInputRef} onChange={handleBulkUpload} className="hidden" /></div></div>
                        </div>
                    </div>
                </div>
            )}

            {isEditModalOpen && editMedia && (
                <div className="fixed inset-0 bg-secondary/95 backdrop-blur-md flex items-center justify-center z-[120] p-4 animate-in fade-in">
                    <div className="bg-white rounded-[4rem] shadow-2xl w-full max-w-7xl max-h-[92vh] overflow-hidden flex flex-col border-8 border-white font-bold">
                        <div className="flex justify-between items-center p-12 border-b bg-gray-50/50"><div><h2 className="text-4xl font-black text-secondary flex items-center uppercase italic tracking-tighter"><Edit className="w-10 h-10 mr-6 text-primary" />Editor Console</h2><p className="text-gray-400 font-black text-[10px] uppercase mt-2 ml-16">Registry: {editMedia.mediaCode}</p></div><button onClick={() => setIsEditModalOpen(false)} className="bg-white shadow-2xl p-4 rounded-full text-gray-300 hover:text-primary active:scale-90 transition-all"><X className="w-10 h-10" /></button></div>
                        <div className="p-12 overflow-y-auto flex-1 bg-white">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                                <div className="lg:col-span-2">
                                    <form id="editForm" onSubmit={handleTextUpdate} className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                                        {[
                                            { label: 'Site Code', key: 'mediaCode', req: true },
                                            { label: 'Authority', key: 'company', req: true },
                                            { label: 'Format Type', key: 'mediaType', req: true },
                                            { label: 'Location (City)', key: 'city' },
                                            { label: 'Landmark Context', key: 'location', full: true },
                                            { label: 'Specifications', key: 'specifications', ph: '1280x600' },
                                            { label: 'Illumination', key: 'illumination', ph: 'Front-Lit / Non-Lit' },
                                            { label: 'Traffic Flow', key: 'trafficView' },
                                            { label: 'Coordinates', key: 'coordinates' },
                                            { label: 'Map Link', key: 'streetViewLink', full: true }
                                        ].map(f => (
                                            <div key={f.key} className={f.full ? 'sm:col-span-2' : ''}>
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 block pl-4">{f.label}</label>
                                                <input type="text" required={f.req} value={editMedia[f.key] || ''} placeholder={f.ph} onChange={(e) => setEditMedia({ ...editMedia, [f.key]: e.target.value })} className="w-full p-6 bg-gray-50 border-4 border-gray-50 rounded-[2rem] outline-none focus:bg-white focus:border-primary/20 transition-all font-black text-lg text-secondary shadow-inner" />
                                            </div>
                                        ))}
                                    </form>
                                </div>
                                <div className="bg-secondary rounded-[4rem] p-12 h-fit space-y-10 shadow-2xl relative border-t-8 border-primary overflow-hidden">
                                    <h3 className="text-[11px] font-black uppercase text-gray-400 tracking-[0.4em] flex items-center border-b border-white/5 pb-8"><ImageIcon className="w-6 h-6 mr-4 text-primary" /> Visual Identity</h3>
                                    {editMedia.imageFileName ? (
                                        <div className="space-y-10">
                                            <div className="relative group overflow-hidden rounded-[2.5rem] aspect-video border-4 border-white shadow-2xl bg-black"><SecureImage fileName={editMedia.imageFileName} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-125 opacity-90 group-hover:opacity-100" /><div className="absolute inset-0 bg-secondary/60 opacity-0 group-hover:opacity-100 flex items-center justify-center duration-300"><button type="button" onClick={() => setPreviewImage(editMedia.imageFileName)} className="p-6 bg-white rounded-full shadow-2xl transform scale-50 group-hover:scale-100 transition-all"><Eye className="w-10 h-10 text-secondary" /></button></div></div>
                                            <div className="space-y-4"><button type="button" onClick={() => singleImageInputRef.current.click()} className="w-full py-6 bg-white text-secondary rounded-[1.5rem] font-black text-xs uppercase tracking-[0.4em] active:scale-95 shadow-2xl hover:bg-primary hover:text-white">Update Asset</button><button type="button" onClick={handleRemoveImage} className="w-full py-6 border-4 border-white/5 text-red-500 rounded-[1.5rem] font-black text-xs uppercase active:scale-95">Purge Asset</button></div>
                                        </div>
                                    ) : (
                                        <button type="button" onClick={() => singleImageInputRef.current.click()} className="w-full py-20 border-8 border-dashed border-white/5 rounded-[4rem] font-black text-primary uppercase text-2xl active:scale-95 transition-all">Attach Visual</button>
                                    )}<input type="file" ref={singleImageInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                                </div>
                            </div>
                        </div>
                        <div className="p-12 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-6"><button type="button" onClick={() => setIsEditModalOpen(false)} className="px-16 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] text-gray-400 bg-white border-4 border-gray-100 active:scale-95 transition-all">Abort Mission</button><button type="submit" form="editForm" disabled={isSaving} className="px-24 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] text-white bg-secondary shadow-2xl active:scale-95 disabled:opacity-50 transition-all hover:bg-black">Commit Changes</button></div>
                    </div>
                </div>
            )}

            {/* --- GLOBAL PREVIEW --- */}
            {previewImage && <ImagePreviewModal fileName={previewImage} onClose={() => setPreviewImage(null)} />}
        </div>
    );
};

export default MediaDashboard;