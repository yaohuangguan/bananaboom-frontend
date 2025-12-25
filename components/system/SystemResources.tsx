import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from '../../i18n/LanguageContext';
import { featureService } from '../../services/featureService';
import { apiService } from '../../services/api';
import { CloudinaryUsage } from '../../types';
import { toast } from '../Toast';
import { DeleteModal } from '../DeleteModal';

export const SystemResources: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'CLOUDINARY' | 'R2'>('CLOUDINARY');

  // Cloudinary State
  const [usageData, setUsageData] = useState<CloudinaryUsage | null>(null);
  const [loadingUsage, setLoadingUsage] = useState(false);
  const [isCloudinaryLibraryOpen, setIsCloudinaryLibraryOpen] = useState(false);
  const [cloudinaryImages, setCloudinaryImages] = useState<{ url: string; public_id: string }[]>(
    []
  );
  const [loadingCloudinaryLib, setLoadingCloudinaryLib] = useState(false);

  // R2 State
  const [r2Files, setR2Files] = useState<any[]>([]);
  const [loadingR2, setLoadingR2] = useState(false);
  const [r2Cursor, setR2Cursor] = useState<string | undefined>(undefined);
  const [r2HasMore, setR2HasMore] = useState(true);

  // Common Delete State
  const [fileToDelete, setFileToDelete] = useState<{
    id: string;
    type: 'CLOUDINARY' | 'R2';
  } | null>(null);

  // --- Cloudinary Logic ---
  const fetchUsage = async () => {
    setLoadingUsage(true);
    try {
      const data = await featureService.getCloudinaryUsage();
      setUsageData(data);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load metrics.');
    } finally {
      setLoadingUsage(false);
    }
  };

  const handleOpenCloudinaryLibrary = async () => {
    setIsCloudinaryLibraryOpen(true);
    setLoadingCloudinaryLib(true);
    try {
      const imgs = await apiService.getRecentImages();
      setCloudinaryImages(imgs);
    } catch (e) {
      toast.error('Failed to load images');
    } finally {
      setLoadingCloudinaryLib(false);
    }
  };

  // --- R2 Logic ---
  const fetchR2Files = async (cursor?: string) => {
    setLoadingR2(true);
    try {
      const res: any = await featureService.getR2Files(20, cursor);
      if (res.success) {
        // Updated to match API: { success: true, data: [], pagination: { nextCursor, hasMore } }
        const incomingFiles = res.data || [];
        const pagination = res.pagination || {};

        setR2Files((prev) => (cursor ? [...prev, ...incomingFiles] : incomingFiles));
        setR2Cursor(pagination.nextCursor);
        setR2HasMore(!!pagination.hasMore);
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load R2 files');
    } finally {
      setLoadingR2(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'CLOUDINARY' && !usageData) {
      fetchUsage();
    } else if (activeTab === 'R2' && r2Files.length === 0) {
      fetchR2Files();
    }
  }, [activeTab]);

  const handleLoadMoreR2 = () => {
    if (r2HasMore && !loadingR2) {
      fetchR2Files(r2Cursor);
    }
  };

  // --- Common Delete Logic ---
  const confirmDeleteFile = async () => {
    if (!fileToDelete) return;
    const { id, type } = fileToDelete;

    try {
      if (type === 'CLOUDINARY') {
        setCloudinaryImages((prev) => prev.filter((img) => img.public_id !== id));
        await apiService.deleteCloudinaryImage(id);
        fetchUsage(); // Refresh usage stats
      } else {
        // R2 Delete using ID
        setR2Files((prev) => prev.filter((f) => f.id !== id));
        await featureService.deleteR2File(id);
      }
      toast.success('File deleted successfully');
    } catch (e) {
      console.error(e);
      toast.error('Delete failed');
    } finally {
      setFileToDelete(null);
    }
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Tab Switcher */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('CLOUDINARY')}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${activeTab === 'CLOUDINARY' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
        >
          Cloudinary
        </button>
        <button
          onClick={() => setActiveTab('R2')}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${activeTab === 'R2' ? 'bg-white dark:bg-slate-700 shadow-sm text-orange-500' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
        >
          R2 Storage
        </button>
      </div>

      {/* --- CLOUDINARY VIEW --- */}
      {activeTab === 'CLOUDINARY' && (
        <>
          {loadingUsage && !usageData ? (
            <div className="flex flex-col items-center justify-center min-h-[300px]">
              <i className="fas fa-circle-notch fa-spin text-4xl text-blue-500 mb-4"></i>
              <p className="text-slate-400 font-mono text-sm uppercase">Loading Metrics...</p>
            </div>
          ) : usageData ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Overall Status */}
              <div className="lg:col-span-1 space-y-8">
                {/* Plan Card */}
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/20 transition-colors"></div>

                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl shadow-lg">
                        <i className="fas fa-cloud"></i>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 dark:text-white">
                          {t.system.cloudinary.title}
                        </h3>
                        <p className="text-xs text-slate-500 uppercase tracking-wider">
                          {usageData.plan} Plan
                        </p>
                      </div>
                    </div>

                    {/* Library Button */}
                    <button
                      onClick={handleOpenCloudinaryLibrary}
                      className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-white hover:bg-blue-500 dark:hover:bg-blue-500 flex items-center justify-center transition-all shadow-sm"
                      title="Manage Image Library"
                    >
                      <i className="fas fa-images"></i>
                    </button>
                  </div>

                  {/* Circular Progress for Total Credits */}
                  <div className="flex flex-col items-center justify-center py-4">
                    <div className="relative w-40 h-40">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="transparent"
                          className="text-slate-100 dark:text-slate-800"
                        />
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="transparent"
                          strokeDasharray={440}
                          strokeDashoffset={440 - (440 * usageData.credits.used_percent) / 100}
                          className={`transition-all duration-1000 ease-out ${
                            usageData.credits.used_percent > 80
                              ? 'text-red-500'
                              : usageData.credits.used_percent > 50
                                ? 'text-amber-500'
                                : 'text-emerald-500'
                          }`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-slate-800 dark:text-white">
                          {usageData.credits.used_percent.toFixed(1)}%
                        </span>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
                          {t.system.cloudinary.credits}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-4 text-center">
                      {usageData.credits.usage.toFixed(2)} used of {usageData.credits.limit} monthly
                      credits
                    </p>
                  </div>
                </div>

                {/* Resources Summary */}
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-lg">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
                    {t.system.cloudinary.resources}
                  </h4>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-600 dark:text-slate-300">
                      <i className="fas fa-images mr-2 text-indigo-400"></i> Media Assets
                    </span>
                    <span className="font-mono font-bold text-slate-800 dark:text-white">
                      {formatNumber(usageData.resources)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-600 dark:text-slate-300">
                      <i className="fas fa-magic mr-2 text-purple-400"></i> Derived
                    </span>
                    <span className="font-mono font-bold text-slate-800 dark:text-white">
                      {formatNumber(usageData.derived_resources)}
                    </span>
                  </div>
                  <div className="h-px bg-slate-100 dark:bg-slate-800 my-3"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-300">
                      <i className="fas fa-exchange-alt mr-2 text-emerald-400"></i> Requests
                    </span>
                    <span className="font-mono font-bold text-slate-800 dark:text-white">
                      {formatNumber(usageData.requests)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Detailed Metrics */}
              <div className="lg:col-span-2 space-y-6">
                {/* Storage Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                        <i className="fas fa-hdd"></i>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-white">
                          {t.system.cloudinary.storage}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {formatBytes(usageData.storage.usage)} Used
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
                      {usageData.storage.credits_usage.toFixed(2)} Credits
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-orange-500 h-full rounded-full"
                      style={{
                        width: `${(usageData.storage.credits_usage / usageData.credits.usage) * 100}%`
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-end mt-1">
                    <span className="text-[10px] text-slate-400">
                      {((usageData.storage.credits_usage / usageData.credits.usage) * 100).toFixed(
                        1
                      )}
                      % of total usage
                    </span>
                  </div>
                </div>

                {/* Bandwidth Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                        <i className="fas fa-network-wired"></i>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-white">
                          {t.system.cloudinary.bandwidth}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {formatBytes(usageData.bandwidth.usage)} Consumed
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
                      {usageData.bandwidth.credits_usage.toFixed(2)} Credits
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-cyan-500 h-full rounded-full"
                      style={{
                        width: `${(usageData.bandwidth.credits_usage / usageData.credits.usage) * 100}%`
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-end mt-1">
                    <span className="text-[10px] text-slate-400">
                      {(
                        (usageData.bandwidth.credits_usage / usageData.credits.usage) *
                        100
                      ).toFixed(1)}
                      % of total usage
                    </span>
                  </div>
                </div>

                {/* Transformations Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                        <i className="fas fa-sync-alt"></i>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-white">
                          {t.system.cloudinary.transformations}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {formatNumber(usageData.transformations.usage)} Operations
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
                      {usageData.transformations.credits_usage.toFixed(2)} Credits
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-purple-500 h-full rounded-full"
                      style={{
                        width: `${(usageData.transformations.credits_usage / usageData.credits.usage) * 100}%`
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-end mt-1">
                    <span className="text-[10px] text-slate-400">
                      {(
                        (usageData.transformations.credits_usage / usageData.credits.usage) *
                        100
                      ).toFixed(1)}
                      % of total usage
                    </span>
                  </div>
                </div>

                {/* Objects Count (Simple Stat) */}
                <div className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 text-slate-500 flex items-center justify-center shadow-sm">
                      <i className="fas fa-cubes"></i>
                    </div>
                    <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest text-sm">
                      {t.system.cloudinary.objects}
                    </span>
                  </div>
                  <span className="text-2xl font-mono font-bold text-slate-900 dark:text-white">
                    {formatNumber(usageData.objects.usage)}
                  </span>
                </div>
              </div>
            </div>
          ) : null}
        </>
      )}

      {/* --- R2 VIEW --- */}
      {activeTab === 'R2' && (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl h-[600px] flex flex-col relative">
          <div className="flex justify-between items-center mb-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-lg">
                <i className="fas fa-layer-group"></i>
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                  Cloudflare R2 Objects
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {r2Files.length} Loaded
                </p>
              </div>
            </div>
            <button onClick={() => fetchR2Files()} className="text-slate-400 hover:text-blue-500">
              <i className="fas fa-sync"></i>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 bg-slate-50 dark:bg-black/20 rounded-2xl">
            {r2Files.length === 0 && !loadingR2 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <i className="fas fa-box-open text-4xl mb-3 opacity-50"></i>
                <p>Bucket is empty or failed to load.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {r2Files.map((file) => (
                  <div
                    key={file.id}
                    className="group relative aspect-square bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-slate-200 dark:border-slate-700"
                  >
                    <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-900 relative">
                      {/* Pattern background for transparency */}
                      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:8px_8px]"></div>

                      {file.type === 'image' ||
                      /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.name) ? (
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-full h-full object-contain p-2"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-400">
                          <i className="fas fa-file-alt text-3xl mb-2"></i>
                          <span className="text-[10px] font-bold uppercase">
                            {file.type || 'FILE'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Overlay Info */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-between p-3">
                      <div className="flex justify-end transform translate-y-[-10px] group-hover:translate-y-0 transition-transform">
                        <button
                          onClick={() => setFileToDelete({ id: file.id, type: 'R2' })}
                          className="w-8 h-8 rounded-full bg-red-500/90 hover:bg-red-600 text-white flex items-center justify-center shadow-lg backdrop-blur-sm transition-transform hover:scale-110"
                          title="Delete File"
                        >
                          <i className="fas fa-trash-alt text-xs"></i>
                        </button>
                      </div>

                      <div className="transform translate-y-[10px] group-hover:translate-y-0 transition-transform">
                        <div
                          className="text-white text-xs font-bold truncate mb-1"
                          title={file.name}
                        >
                          {file.name}
                        </div>
                        <div className="flex justify-between items-end text-[10px] text-white/70 font-mono border-t border-white/10 pt-2">
                          <div className="flex flex-col">
                            <span>{formatBytes(file.size)}</span>
                            <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                          </div>
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-white hover:text-blue-300 transition-colors"
                            title="Open Link"
                          >
                            <i className="fas fa-external-link-alt"></i>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {loadingR2 && (
              <div className="py-4 text-center text-slate-400 animate-pulse">
                <i className="fas fa-circle-notch fa-spin mr-2"></i> Fetching objects...
              </div>
            )}

            {!loadingR2 && r2HasMore && (
              <button
                onClick={handleLoadMoreR2}
                className="w-full py-3 mt-4 text-xs font-bold uppercase text-slate-500 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:text-blue-500 hover:border-blue-500 transition-colors"
              >
                Load More
              </button>
            )}
          </div>
        </div>
      )}

      {/* --- SHARED MODALS --- */}

      {/* Cloudinary Modal */}
      {isCloudinaryLibraryOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-5xl h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 relative">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <i className="fas fa-images"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      Cloudinary Library
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {cloudinaryImages.length} Assets
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCloudinaryLibraryOpen(false)}
                  className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-slate-100 dark:bg-black/20 custom-scrollbar">
                {loadingCloudinaryLib ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <i className="fas fa-circle-notch fa-spin text-3xl mb-4 text-blue-500"></i>
                    <p className="font-mono text-xs uppercase tracking-widest">
                      Fetching Assets...
                    </p>
                  </div>
                ) : cloudinaryImages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <i className="fas fa-folder-open text-5xl mb-4 opacity-50"></i>
                    <p>No images found in library.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {cloudinaryImages.map((img) => (
                      <div
                        key={img.public_id}
                        className="group relative aspect-square bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-slate-200 dark:border-slate-700"
                      >
                        <img
                          src={img.url}
                          alt="Asset"
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                          <button
                            onClick={() =>
                              setFileToDelete({ id: img.public_id, type: 'CLOUDINARY' })
                            }
                            className="w-10 h-10 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all flex items-center justify-center hover:bg-red-600 shadow-lg"
                            title="Delete Asset"
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur p-1 text-[9px] text-white/80 font-mono truncate text-center opacity-0 group-hover:opacity-100 transition-opacity">
                          {img.public_id}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={!!fileToDelete}
        onClose={() => setFileToDelete(null)}
        onConfirm={confirmDeleteFile}
        title="Delete File"
        message={`Permanently remove this file from ${fileToDelete?.type === 'R2' ? 'R2 Storage' : 'Cloudinary'}?`}
        requireInput={false}
        buttonText="Delete"
        zIndexClass="z-[10000]"
      />
    </div>
  );
};
