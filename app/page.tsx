"use client";

/**
 * YouTube Downloader Frontend
 * Sanitized URL logic included
 */
import { useState, useEffect } from "react";
import axios from "axios";
import { 
  Download, Loader2, Sun, Moon, Play, Video, Music, 
  Activity, AlertCircle, Globe, Clock, User, Eye,
  ArrowRight, CheckCircle2, XCircle, Info, ChevronDown, 
  Search, X, ShieldCheck, Zap, Heart
} from "lucide-react";
import { useTheme } from "./components/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000").replace(/\/+$/, "");

interface Format {
  format_id: string;
  extension: string;
  resolution: string;
  filesize: string;
  type: string;
  quality_score: number;
  note?: string;
  is_combined: boolean;
}

interface VideoInfo {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  formats: Format[];
  uploader?: string;
  view_count?: number;
}

interface Progress {
  percent: string;
  speed?: string;
  eta?: string;
  status?: string;
}

const ProgressBar = ({ progress, status }: { progress: Progress, status: string | null }) => {
  const percent = parseFloat(progress?.percent?.replace('%', '') || '0');
  
  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-6 right-6 z-[60] w-80 bg-card shadow-2xl rounded-2xl p-6 border border-border/50 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            {status === 'merging' ? (
              <Activity className="w-4 h-4 text-primary animate-pulse" />
            ) : (
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
            )}
          </div>
          <span className="text-sm font-bold text-foreground">
            {status === 'merging' ? 'Processing...' : 'Downloading...'}
          </span>
        </div>
        <span className="text-sm font-black text-primary">{progress?.percent || '0%'}</span>
      </div>
      <div className="w-full bg-secondary h-3 rounded-full overflow-hidden border border-border/20">
        <motion.div 
          className="h-full bg-primary shadow-[0_0_10px_rgba(34,197,94,0.3)]"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <div className="mt-4 flex justify-between text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
        <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> {progress?.speed || 'N/A'}</span>
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {progress?.eta || 'N/A'}</span>
      </div>
    </motion.div>
  );
};

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [url, setUrl] = useState("");
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<Progress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string>("");

  useEffect(() => {
    if (videoInfo && videoInfo.formats && videoInfo.formats.length > 0) {
      // Find the first video format or audio if no video
      const firstVideo = videoInfo.formats.find(f => f.type !== "Audio Only");
      setSelectedFormat(firstVideo?.format_id || videoInfo.formats[0].format_id);
    }
  }, [videoInfo]);

  const fetchVideoInfo = async () => {
    if (!url) return;
    setLoading(true);
    setVideoInfo(null);
    setError(null);
    try {
      const response = await axios.post(`${BACKEND_URL}/fetch`, { url });
      setVideoInfo(response.data);
    } catch (e: any) { 
      setError(e.response?.data?.error || "Unable to fetch video details. Please check the link and try again.");
    } finally { 
      setLoading(false); 
    }
  };

  const downloadVideo = () => {
    if (!selectedFormat || !videoInfo) return;
    
    setDownloading(selectedFormat);
    setDownloadProgress({ percent: '0%', speed: 'Initializing...', eta: '...' });
    
    axios.post(`${BACKEND_URL}/download`, { url, format_id: selectedFormat, title: videoInfo.title })
      .then(res => {
        const { task_id } = res.data;
        const check = setInterval(async () => {
          try {
            const statusRes = await axios.get(`${BACKEND_URL}/status/${task_id}`);
            const progRes = await axios.get(`${BACKEND_URL}/progress/${task_id}`);
            
            if (statusRes.data.status === 'downloading') {
                setDownloadProgress({ ...progRes.data, status: 'downloading' });
            } else if (statusRes.data.status === 'merging') {
                setDownloadProgress({ percent: '100%', status: 'merging' });
            } else if (statusRes.data.status === 'finished') {
              clearInterval(check);
              setDownloadProgress(null);
              setDownloading(null);
              window.open(`${BACKEND_URL}/file/${task_id}`, '_blank');
            } else if (statusRes.data.status === 'error') {
              clearInterval(check);
              setError("Download failed: " + statusRes.data.message);
              setDownloadProgress(null);
              setDownloading(null);
            }
          } catch {
            clearInterval(check);
            setDownloadProgress(null);
            setDownloading(null);
          }
        }, 1000);
      })
      .catch(() => { 
        setError("Failed to start download process."); 
        setDownloading(null); 
        setDownloadProgress(null);
      });
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 font-sans">
      {/* Background Polish */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20 dark:opacity-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full" />
      </div>

      <header className="bg-card border-b border-border/40 py-4 px-6 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.location.reload()}>
            <div className="bg-primary p-2 rounded-xl text-white shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <Download className="w-5 h-5" />
            </div>
            <span className="font-black text-2xl tracking-tighter text-foreground">Save<span className="text-primary">Media</span></span>
          </div>
          <button 
            onClick={toggleTheme} 
            className="p-2.5 rounded-xl bg-secondary dark:bg-slate-800 hover:scale-110 transition-all active:scale-95 border border-border/50 shadow-sm"
          >
            {theme === 'light' ? <Moon className="w-5 h-5 text-slate-600" /> : <Sun className="w-5 h-5 text-yellow-400" />}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-16 md:py-24 relative z-10">
        <section className="text-center mb-16">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest mb-6 border border-primary/20"
          >
            <Zap className="w-3 h-3" /> Faster than ever
          </motion.div>
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black mb-6 text-foreground leading-[1.1] tracking-tight"
          >
            Download <span className="text-primary italic">Anything</span> <br className="hidden md:block" /> From Anywhere
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-600 dark:text-slate-400 mb-12 text-lg md:text-xl font-medium max-w-2xl mx-auto"
          >
            Paste the link below and get your high-quality media in seconds. No ads, no limits.
          </motion.p>

          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="relative max-w-3xl mx-auto"
          >
            <div className="bg-card rounded-2xl border-2 border-border/60 p-2 flex flex-col md:flex-row gap-2 input-focus-ring transition-custom shadow-2xl shadow-primary/5">
              <div className="flex-1 flex items-center px-4">
                <Search className="w-6 h-6 text-slate-400 mr-3" />
                <input 
                  type="text" 
                  placeholder="Paste video link here..." 
                  className="flex-1 py-4 outline-none bg-transparent text-foreground text-lg font-medium placeholder:text-slate-400" 
                  value={url} 
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchVideoInfo()}
                />
                {url && (
                  <button onClick={() => setUrl("")} className="p-1 hover:bg-secondary rounded-full text-slate-400">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              <button 
                onClick={fetchVideoInfo} 
                disabled={loading || !url} 
                className="bg-primary hover:bg-green-600 text-white px-10 py-4 rounded-xl font-black text-lg flex items-center justify-center gap-3 btn-hover-effect disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Download"}
                {!loading && <ArrowRight className="w-6 h-6" />}
              </button>
            </div>
          </motion.div>
        </section>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              key="error-message"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 p-5 rounded-2xl mb-12 flex items-center gap-4"
            >
              <div className="bg-red-100 dark:bg-red-900/40 p-2 rounded-lg">
                <AlertCircle className="w-5 h-5 shrink-0" />
              </div>
              <p className="font-bold text-sm">{error}</p>
            </motion.div>
          )}

          {videoInfo && (
            <motion.div 
              key="video-details"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border/50 rounded-3xl p-6 md:p-10 shadow-2xl flex flex-col md:flex-row gap-10 overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[60px] pointer-events-none" />
              
              <div className="w-full md:w-[40%] shrink-0">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl group border border-border/50">
                  <img 
                    src={videoInfo.thumbnail} 
                    className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-700" 
                    alt="Thumbnail" 
                  />
                  <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md text-white px-3 py-1 rounded-lg text-xs font-black">
                    {videoInfo.duration}
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <div className="bg-white/20 p-4 rounded-full backdrop-blur-md border border-white/30">
                      <Play className="w-10 h-10 text-white fill-current" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-between py-2">
                <div>
                  <h2 className="text-2xl md:text-3xl font-black mb-5 leading-tight tracking-tight text-foreground">
                    {videoInfo.title}
                  </h2>
                  <div className="flex flex-wrap gap-5 mb-8">
                    {videoInfo.uploader && (
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-lg border border-border/30">
                        <User className="w-3.5 h-3.5 text-primary" />
                        {videoInfo.uploader}
                      </div>
                    )}
                    {videoInfo.view_count && (
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-lg border border-border/30">
                        <Eye className="w-3.5 h-3.5 text-primary" />
                        {videoInfo.view_count.toLocaleString()} Views
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-5">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <select 
                        className="w-full appearance-none bg-secondary/50 border-2 border-border/50 rounded-2xl py-5 px-6 pr-14 font-black text-foreground outline-none focus:border-primary/50 transition-all shadow-inner text-sm md:text-base"
                        value={selectedFormat}
                        onChange={(e) => setSelectedFormat(e.target.value)}
                        disabled={!!downloading}
                      >
                        {videoInfo.formats && videoInfo.formats.filter(f => f.type !== "Audio Only").length > 0 && (
                          <optgroup label="Video Options" className="font-bold">
                            {videoInfo.formats.filter(f => f.type !== "Audio Only").map((f, i) => (
                              <option key={`v-${i}`} value={f.format_id} className="font-medium">
                                {f.resolution} {f.extension.toUpperCase()} ({f.filesize})
                              </option>
                            ))}
                          </optgroup>
                        )}
                        {videoInfo.formats && videoInfo.formats.filter(f => f.type === "Audio Only").length > 0 && (
                          <optgroup label="Audio Extractions" className="font-bold">
                            {videoInfo.formats.filter(f => f.type === "Audio Only").map((f, i) => (
                              <option key={`a-${i}`} value={f.format_id} className="font-medium">
                                {f.resolution} {f.extension.toUpperCase()} ({f.filesize})
                              </option>
                            ))}
                          </optgroup>
                        )}
                        {(!videoInfo.formats || videoInfo.formats.length === 0) && (
                          <option value="">No formats available</option>
                        )}
                      </select>
                      <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    </div>
                    <button 
                      onClick={downloadVideo}
                      disabled={!!downloading || !selectedFormat}
                      className="bg-primary hover:bg-green-600 text-white px-12 py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 btn-hover-effect disabled:opacity-50 shadow-xl shadow-primary/20"
                    >
                      {downloading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Download className="w-6 h-6" />}
                      {downloading ? "Working..." : "Save Now"}
                    </button>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-primary" /> Verified & High-Speed Link
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Benefits Section */}
        <section className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-card p-8 rounded-3xl border border-border/50 shadow-xl hover:translate-y-[-4px] transition-transform">
            <div className="bg-primary/10 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h4 className="font-black uppercase tracking-tight mb-3">Instant Speed</h4>
            <p className="text-sm text-slate-500 font-medium">Download high-definition videos in the blink of an eye.</p>
          </div>
          <div className="bg-card p-8 rounded-3xl border border-border/50 shadow-xl hover:translate-y-[-4px] transition-transform">
            <div className="bg-primary/10 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <h4 className="font-black uppercase tracking-tight mb-3">100% Secure</h4>
            <p className="text-sm text-slate-500 font-medium">No tracking, no logs. Your privacy is our top priority.</p>
          </div>
          <div className="bg-card p-8 rounded-3xl border border-border/50 shadow-xl hover:translate-y-[-4px] transition-transform">
            <div className="bg-primary/10 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Globe className="w-6 h-6 text-primary" />
            </div>
            <h4 className="font-black uppercase tracking-tight mb-3">Global Access</h4>
            <p className="text-sm text-slate-500 font-medium">Works with thousands of sites including YT, IG, and TikTok.</p>
          </div>
        </section>

        {/* How to Section */}
        <section className="mt-24">
          <h3 className="text-2xl md:text-3xl font-black mb-10 text-center uppercase tracking-tight">How it works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { step: "01", title: "Copy URL", text: "Grab the video link from your browser's address bar." },
              { step: "02", title: "Paste & Click", text: "Drop it into our search box and hit download." },
              { step: "03", title: "Save Media", text: "Choose your quality and save it to your device." }
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <span className="text-5xl font-black text-primary/10 mb-4">{s.step}</span>
                <h5 className="font-black uppercase tracking-tight mb-2">{s.title}</h5>
                <p className="text-sm text-slate-500 font-medium px-4">{s.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="relative mt-20 border-t border-border/40 bg-card/30 backdrop-blur-md overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        </div>
        
        <div className="max-w-6xl mx-auto px-6 pt-16 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <div className="bg-primary p-2 rounded-xl text-white shadow-lg shadow-primary/20">
                  <Download className="w-5 h-5" />
                </div>
                <span className="font-black text-2xl tracking-tighter text-foreground">Save<span className="text-primary">Media</span></span>
              </div>
              <p className="text-muted-foreground text-sm font-medium leading-relaxed max-w-sm">
                The most reliable high-speed video downloader on the web. 
                Experience seamless media extraction with zero ads and maximum privacy.
              </p>
              <div className="flex items-center gap-4 mt-8">
                {['twitter', 'github', 'mail'].map((social) => (
                  <button key={social} className="w-10 h-10 rounded-xl bg-secondary hover:bg-primary hover:text-white transition-all duration-300 flex items-center justify-center border border-border/50 group">
                    <div className="w-5 h-5 group-hover:scale-110 transition-transform">
                      {social === 'twitter' && <Globe className="w-full h-full" />}
                      {social === 'github' && <Zap className="w-full h-full" />}
                      {social === 'mail' && <Activity className="w-full h-full" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h5 className="font-black text-xs uppercase tracking-[0.2em] text-foreground mb-6">Product</h5>
              <ul className="space-y-4 text-sm font-bold text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Video Downloader</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">MP3 Converter</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Browser Extension</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">API Access</a></li>
              </ul>
            </div>

            <div>
              <h5 className="font-black text-xs uppercase tracking-[0.2em] text-foreground mb-6">Support</h5>
              <ul className="space-y-4 text-sm font-bold text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border/20 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2 order-2 md:order-1">
              MADE WITH <Heart className="w-3 h-3 text-red-500 fill-current" /> BY SAVEMEDIA TEAM © 2026
            </div>
            <div className="flex items-center gap-6 order-1 md:order-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest">Systems Online</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">Secure SSL</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {downloadProgress && <ProgressBar key="download-progress" progress={downloadProgress} status={downloading} />}
      </AnimatePresence>
    </div>
  );
}
