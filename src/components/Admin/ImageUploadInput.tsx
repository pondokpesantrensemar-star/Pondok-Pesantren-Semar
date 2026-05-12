
import React, { useRef, useState } from 'react';
import { Upload, Link as LinkIcon, Image as ImageIcon, Loader2, X, Trash2 } from 'lucide-react';
import { compressImage } from '../../lib/imageUtils';
import { toast } from 'react-hot-toast';

interface ImageUploadInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export default function ImageUploadInput({ value, onChange, label, placeholder, className = "" }: ImageUploadInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(!value || !value.startsWith('data:'));

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const base64 = await compressImage(file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 })
      });
      
      if (!response.ok) throw new Error('Upload failed');
      
      const data = await response.json();
      onChange(data.url);
      setShowUrlInput(false);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Gagal memproses gambar.");
    } finally {
      setIsUploading(false);
    }
  };

  const isUploaded = value && (value.startsWith('data:') || value.startsWith('/api/images'));

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <label className="text-[10px] font-bold admin-text-muted uppercase tracking-widest mb-2 block transition-colors">{label}</label>}
      
      <div className="space-y-3">
        {/* Upload Area */}
        {!showUrlInput && isUploaded ? (
          <div className="relative group rounded-xl overflow-hidden border border-pesantren-green/30 dark:border-pesantren-green/50 bg-pesantren-green/5 p-2 flex items-center gap-3 transition-colors">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 dark:bg-slate-800 shrink-0 transition-colors">
              <img src={value} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-pesantren-green uppercase truncate">Gambar Terpilih (Upload)</p>
              <p className="text-[9px] admin-text-muted transition-colors transition-colors">Siap disimpan di database</p>
            </div>
            <button 
              type="button"
              onClick={() => {
                onChange('');
                setShowUrlInput(true);
              }}
              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 admin-text-muted hover:text-red-500 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-100 dark:border-slate-800 rounded-xl hover:border-pesantren-green hover:bg-pesantren-green/5 transition-all text-xs font-bold admin-text-muted hover:text-pesantren-green"
            >
              {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              Upload dari HP / PC
            </button>
            <button
              type="button"
              onClick={() => setShowUrlInput(true)}
              className="flex items-center justify-center gap-2 p-4 border border-gray-100 dark:border-slate-800 rounded-xl bg-gray-50 dark:bg-slate-900/50 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all text-xs font-bold admin-text-muted"
            >
              <LinkIcon size={16} />
              Gunakan Link URL
            </button>
          </div>
        )}

        {showUrlInput && (
          <div className="relative">
            <LinkIcon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 admin-text-muted transition-colors" />
            <input
              type="url"
              placeholder={placeholder || "https://..."}
              className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-100 dark:border-slate-800 p-4 pl-12 rounded-xl focus:ring-2 focus:ring-pesantren-green outline-none text-xs font-medium admin-text-main transition-colors"
              value={isUploaded ? '' : value}
              onChange={(e) => onChange(e.target.value)}
            />
            {isUploaded && (
              <button 
                type="button"
                onClick={() => setShowUrlInput(false)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-pesantren-green bg-pesantren-green/10 px-2 py-1 rounded"
              >
                KEMBALI KE FILE
              </button>
            )}
          </div>
        )}
      </div>

      <input 
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>
  );
}
