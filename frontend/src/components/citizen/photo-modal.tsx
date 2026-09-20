'use client';

import React, { useState } from 'react';
import { Camera, Image as ImageIcon, X, Check, Sparkles, Upload } from 'lucide-react';
import { IncidentAttachment, IncidentCategory } from '@/types/incident';

interface PhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'photo' | 'gallery';
  onPhotoSelected: (
    attachment: IncidentAttachment,
    detectedCategory?: IncidentCategory,
    aiTag?: string
  ) => void;
}

const SAMPLE_INCIDENT_PHOTOS = [
  {
    title: 'Structure Fire Hazard',
    category: 'fire' as IncidentCategory,
    aiTag: 'Heavy smoke & active flames detected (97% confidence)',
    url: 'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Roadside Vehicle Collision',
    category: 'accident' as IncidentCategory,
    aiTag: 'Traffic collision & road blockage (94% confidence)',
    url: 'https://images.unsplash.com/photo-1543393470-b2c833b9549f?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Urban Waterlogging / Flood',
    category: 'flood' as IncidentCategory,
    aiTag: 'Submerged roadway & storm runoff (92% confidence)',
    url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80',
  },
];

export function PhotoModal({ isOpen, onClose, mode, onPhotoSelected }: PhotoModalProps) {
  const [selectedSampleIndex, setSelectedSampleIndex] = useState<number>(0);
  const [customFileUrl, setCustomFileUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const activePhoto = customFileUrl
    ? {
        title: 'Uploaded Device Photo',
        category: 'fire' as IncidentCategory,
        aiTag: 'Visual emergency detected (89% confidence)',
        url: customFileUrl,
      }
    : SAMPLE_INCIDENT_PHOTOS[selectedSampleIndex];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setCustomFileUrl(previewUrl);
    }
  };

  const handleConfirm = () => {
    const attachment: IncidentAttachment = {
      id: `img-${Date.now()}`,
      type: 'image',
      url: activePhoto.url,
      name: `${activePhoto.title.replace(/\s+/g, '-')}.jpg`,
      sizeBytes: 1024 * 340,
    };
    onPhotoSelected(attachment, activePhoto.category, activePhoto.aiTag);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#12141F] border border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between bg-[#161928]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center">
              {mode === 'photo' ? (
                <Camera className="w-4 h-4 text-red-400" />
              ) : (
                <ImageIcon className="w-4 h-4 text-blue-400" />
              )}
            </div>
            <div>
              <h3 className="text-white font-bold text-base">
                {mode === 'photo' ? 'Capture Incident Photo' : 'Upload From Gallery'}
              </h3>
              <p className="text-xs text-slate-400">
                AI will inspect the image to pinpoint hazard category and severity
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Main Photo Preview */}
          <div className="relative w-full h-52 rounded-xl overflow-hidden border border-white/[0.1] bg-[#090A0F] group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activePhoto.url}
              alt="Incident preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-xs font-semibold text-white">{activePhoto.aiTag}</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-500/30 text-red-300 border border-red-500/40">
                {activePhoto.category}
              </span>
            </div>
          </div>

          {/* Quick Select Presets or Device File Upload */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">
              {mode === 'photo' ? 'Select Preset Camera Scene' : 'Select or Browse Local File'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {SAMPLE_INCIDENT_PHOTOS.map((sample, idx) => (
                <button
                  key={sample.title}
                  type="button"
                  onClick={() => {
                    setCustomFileUrl(null);
                    setSelectedSampleIndex(idx);
                  }}
                  className={`p-2 rounded-xl border text-left text-xs transition-all ${
                    !customFileUrl && selectedSampleIndex === idx
                      ? 'border-red-500 bg-red-500/10 text-white'
                      : 'border-white/[0.08] bg-[#090A0F] text-slate-400 hover:text-white'
                  }`}
                >
                  <p className="font-semibold truncate">{sample.title.split(' ')[0]}</p>
                  <p className="text-[10px] text-slate-500 uppercase">{sample.category}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Custom File Upload Option */}
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="w-full py-2.5 px-4 bg-[#090A0F] border border-dashed border-white/[0.15] hover:border-white/[0.3] rounded-xl flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-white transition-colors">
              <Upload className="w-4 h-4 text-blue-400" />
              <span>{customFileUrl ? 'Choose Different File' : 'Or upload image from your device'}</span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-white/[0.08] flex items-center justify-end gap-3 bg-[#161928]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl shadow-lg shadow-red-600/30 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Confirm & Attach</span>
          </button>
        </div>
      </div>
    </div>
  );
}
