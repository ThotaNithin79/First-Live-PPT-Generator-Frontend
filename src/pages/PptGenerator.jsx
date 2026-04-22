import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axiosConfig';
import { 
    Presentation, Download, ArrowLeft, FileSpreadsheet, 
    CheckCircle2, RefreshCw, Layers, Briefcase, Info, 
    AlertCircle, Sparkles // Added the missing Sparkles icon here
} from 'lucide-react';

const PptGenerator = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Defensive state handling
    const [mediaCodesInput, setMediaCodesInput] = useState("");
    const [brandingCompany, setBrandingCompany] = useState('NO_LOGO');
    const [isGenerating, setIsGenerating] = useState(false);

    // Initialize selection from Dashboard state securely
    useEffect(() => {
        if (location.state?.selectedCodes) {
            setMediaCodesInput(location.state.selectedCodes.join('\n'));
        }
    }, [location.state]);

    const companyOptions = [
        { id: 'NO_LOGO', label: 'Generic (No Branding)', desc: 'Clean slides without welcome/thank you pages.' },
        { id: 'SBA', label: 'SBA Branding', desc: 'Standard Balaji Ads welcome and footer logos.' },
        { id: 'OUTSPACE', label: 'Outspace Branding', desc: 'Premium Outspace media presentation style.' },
        { id: 'YUVA', label: 'Yuva Branding', desc: 'Modern Yuva company identity slides.' }
    ];

    const handleGenerate = async (e) => {
        e.preventDefault();

        // Sanitize input: Split by newline or comma, trim, and remove empty entries
        const codesArray = mediaCodesInput
            .split(/[\n,]+/)
            .map(code => code.trim())
            .filter(code => code !== '');

        if (codesArray.length === 0) {
            toast.error("Resource error: At least one media code is required.");
            return;
        }

        setIsGenerating(true);
        const loadToast = toast.loading('Compiling presentation and streaming binary data...');

        try {
            // responseType: 'blob' is mandatory for downloading binary files
            const response = await api.post('/ppt/generate', {
                mediaCodes: codesArray,
                brandingCompany: brandingCompany
            }, {
                responseType: 'blob' 
            });

            // Standard PPTX MIME type
            const blob = new Blob([response.data], { 
                type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' 
            });
            
            const contentDisposition = response.headers['content-disposition'];
            let filename = `${brandingCompany === 'NO_LOGO' ? 'Media' : brandingCompany}_Presentation.pptx`;
            
            // Extract server-provided filename if present
            if (contentDisposition && contentDisposition.includes('filename="')) {
                filename = contentDisposition.split('filename="')[1].split('"')[0];
            }

            // ROBUST DOWNLOAD TRIGGER: Uses a temporary hidden anchor tag
            const url = window.URL.createObjectURL(blob);
            const link = document.body.appendChild(document.createElement('a'));
            link.href = url;
            link.download = filename;
            link.style.display = 'none';
            link.click();
            
            // Cleanup with slight delay to ensure browser stream completion
            setTimeout(() => {
                window.URL.revokeObjectURL(url);
                document.body.removeChild(link);
            }, 100);

            toast.success("Presentation generated successfully.", { id: loadToast });
            
        } catch (error) {
            console.error("PPT Generation Error:", error);
            
            // Handle error response hidden inside a Blob
            if (error.response && error.response.data instanceof Blob) {
                const reader = new FileReader();
                reader.onload = () => {
                    try {
                        const errObj = JSON.parse(reader.result);
                        toast.error(errObj.message || "Engine Error", { id: loadToast });
                    } catch {
                        toast.error("Failed to compile assets.", { id: loadToast });
                    }
                };
                reader.readAsText(error.response.data);
            } else {
                toast.error("Network error. Server unreachable.", { id: loadToast });
            }
        } finally {
            setIsGenerating(false);
        }
    };

    const codeCount = mediaCodesInput.split(/[\n,]+/).filter(c => c.trim() !== '').length;

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-10 animate-in fade-in duration-500">
            
            {/* --- TOP NAVIGATION BAR --- */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center space-x-4">
                    <button 
                        onClick={() => navigate('/')} 
                        className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 text-gray-400 hover:text-primary transition-all active:scale-90"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center">
                            <Presentation className="w-8 h-8 mr-3 text-primary" />
                            Generator
                        </h1>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Export Engine v2.0</p>
                    </div>
                </div>
                
                <div className="hidden md:flex items-center space-x-2 bg-secondary/5 px-4 py-2 rounded-2xl border border-secondary/5">
                    <Layers className="w-4 h-4 text-secondary/40" />
                    <span className="text-[10px] font-black text-secondary/50 uppercase tracking-widest">Enterprise PPTX Binary Stream</span>
                </div>
            </div>

            {/* --- MAIN GENERATOR INTERFACE --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left: Input Area */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-black text-gray-800 uppercase tracking-widest flex items-center">
                                    <FileSpreadsheet className="w-5 h-5 mr-3 text-primary" />
                                    Source Media Codes
                                </label>
                                <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all ${codeCount > 0 ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-gray-50 text-gray-400'}`}>
                                    {codeCount} Assets detected
                                </span>
                            </div>

                            <div className="relative group">
                                <textarea
                                    required
                                    rows={10}
                                    className="w-full p-6 bg-gray-50 border-2 border-gray-100 rounded-[2rem] focus:ring-4 focus:ring-primary/5 focus:border-primary focus:bg-white outline-none transition-all font-mono text-sm text-gray-700 leading-relaxed resize-none shadow-inner"
                                    placeholder="Paste Media Codes here...&#10;Ex:&#10;HYD-001&#10;BLR-105, MC0946"
                                    value={mediaCodesInput}
                                    onChange={(e) => setMediaCodesInput(e.target.value)}
                                />
                                <div className="absolute top-6 right-6 opacity-10 group-focus-within:opacity-100 group-focus-within:text-primary transition-all duration-500">
                                    <Sparkles className="w-8 h-8" />
                                </div>
                            </div>

                            <div className="flex items-start p-5 bg-blue-50 border border-blue-100 rounded-[1.5rem]">
                                <Info className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
                                <p className="text-[10px] text-blue-700 font-black leading-relaxed uppercase tracking-widest">
                                    System Intelligence: Spaces, commas, and newlines are processed automatically. 
                                    Slides will be sequenced based on the entry order.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Branding & Action */}
                <div className="space-y-6">
                    <div className="bg-secondary rounded-[2.5rem] p-8 shadow-2xl border-t-8 border-primary relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
                        
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-8 flex items-center">
                            <Briefcase className="w-4 h-4 mr-3 text-primary" />
                            Identity Config
                        </h3>

                        <div className="space-y-4">
                            {companyOptions.map((option) => (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => setBrandingCompany(option.id)}
                                    className={`w-full p-5 rounded-3xl text-left transition-all border-2 flex items-start space-x-4 group active:scale-95 ${
                                        brandingCompany === option.id 
                                        ? 'bg-white border-primary shadow-xl shadow-red-900/20' 
                                        : 'bg-white/5 border-white/10 hover:border-white/20'
                                    }`}
                                >
                                    <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${brandingCompany === option.id ? 'border-primary' : 'border-gray-600'}`}>
                                        {brandingCompany === option.id && <div className="w-2.5 h-2.5 bg-primary rounded-full animate-in zoom-in" />}
                                    </div>
                                    <div>
                                        <p className={`text-sm font-black uppercase tracking-widest transition-colors ${brandingCompany === option.id ? 'text-secondary' : 'text-gray-300'}`}>
                                            {option.label}
                                        </p>
                                        <p className={`text-[9px] mt-1 font-bold uppercase tracking-tight leading-relaxed ${brandingCompany === option.id ? 'text-gray-500' : 'text-gray-500'}`}>
                                            {option.desc}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="mt-10 space-y-4">
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating || codeCount === 0}
                                className="w-full py-5 bg-primary hover:bg-red-700 text-white rounded-[2rem] font-black text-xs tracking-[0.3em] uppercase transition-all shadow-2xl shadow-red-500/40 flex items-center justify-center space-x-3 disabled:opacity-30 active:scale-95"
                            >
                                {isGenerating ? (
                                    <>
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                        <span>Assembling Binary...</span>
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-5 h-5" />
                                        <span>Download PPTX</span>
                                    </>
                                )}
                            </button>
                            
                            <p className="text-center text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                                High-Resolution OpenXML Packaging
                            </p>
                        </div>
                    </div>

                    <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100 flex items-start">
                        <AlertCircle className="w-5 h-5 text-amber-500 mr-3 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-[10px] font-black text-amber-800 uppercase tracking-widest mb-1">Visual Integrity</h4>
                            <p className="text-[10px] text-amber-700 font-bold leading-relaxed uppercase tracking-tight">
                                Ensure requested codes have a "Linked" status for optimal rendering.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PptGenerator;