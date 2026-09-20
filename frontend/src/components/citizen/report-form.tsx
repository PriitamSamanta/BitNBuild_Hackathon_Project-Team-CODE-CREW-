'use client';

import React, { useState } from 'react';
import {
  Zap,
  Shield,
  Lock,
  Send,
  Camera,
  Image as ImageIcon,
  Mic,
  MapPin,
  Sparkles,
  Flame,
  Car,
  Waves,
  HeartPulse,
  Biohazard,
  Building,
  TreePine,
  MoreHorizontal,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { citizenReportSchema, CitizenReportFormData } from '@/lib/validations';
import {
  IncidentCategory,
  LocationCoordinates,
  ReportMode,
  IncidentAttachment,
  CitizenIncident,
} from '@/types/incident';
import { submitCitizenReport } from '@/lib/citizenApi';
import { PhotoModal } from './photo-modal';
import { VoiceRecorderModal } from './voice-recorder-modal';
import { SuccessModal } from './success-modal';

interface ReportFormProps {
  currentLocation: LocationCoordinates;
  onLocationChange: (loc: LocationCoordinates) => void;
  onTrackIncident: (code: string) => void;
}

const INCIDENT_CATEGORIES: {
  id: IncidentCategory;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}[] = [
  { id: 'fire', label: 'Fire', icon: Flame, color: 'text-red-400' },
  { id: 'accident', label: 'Accident', icon: Car, color: 'text-amber-400' },
  { id: 'flood', label: 'Flood', icon: Waves, color: 'text-blue-400' },
  { id: 'medical', label: 'Medical', icon: HeartPulse, color: 'text-emerald-400' },
  { id: 'chemical', label: 'Chemical', icon: Biohazard, color: 'text-orange-400' },
  { id: 'infrastructure', label: 'Infrastructure', icon: Building, color: 'text-cyan-400' },
  { id: 'natural', label: 'Natural', icon: TreePine, color: 'text-lime-400' },
  { id: 'other', label: 'Other', icon: MoreHorizontal, color: 'text-slate-400' },
];

export function ReportForm({
  currentLocation,
  onLocationChange,
  onTrackIncident,
}: ReportFormProps) {
  const [selectedMode, setSelectedMode] = useState<ReportMode>('photo');
  const [selectedCategory, setSelectedCategory] = useState<IncidentCategory | undefined>(undefined);
  const [locating, setLocating] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [submittedIncident, setSubmittedIncident] = useState<CitizenIncident | null>(null);
  const [attachedMedia, setAttachedMedia] = useState<IncidentAttachment | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<CitizenReportFormData>({
    resolver: zodResolver(citizenReportSchema) as any,
    defaultValues: {
      mode: 'photo' as const,
      description: '',
      location: currentLocation,
    },
  });

  const descriptionValue = watch('description') || '';

  // Use browser geolocation API with fallback
  const handleUseCurrentLocation = () => {
    setLocating(true);
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newLoc: LocationCoordinates = {
            lat: Number(pos.coords.latitude.toFixed(4)),
            lng: Number(pos.coords.longitude.toFixed(4)),
            address: `Near Current GPS, Bodakdev, Ahmedabad (${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)})`,
            area: 'SG Highway',
            accuracyMeters: pos.coords.accuracy,
          };
          onLocationChange(newLoc);
          setValue('location', newLoc);
          setLocating(false);
          setLocationSuccess(true);
          setTimeout(() => setLocationSuccess(false), 3000);
        },
        (err) => {
          console.warn('Geolocation denied or unavailable, using Ahmedabad center:', err);
          const fallbackLoc: LocationCoordinates = {
            lat: 23.0225,
            lng: 72.5714,
            address: 'SG Highway, Bodakdev, Ahmedabad, Gujarat',
            area: 'SG Highway',
          };
          onLocationChange(fallbackLoc);
          setValue('location', fallbackLoc);
          setLocating(false);
          setLocationSuccess(true);
          setTimeout(() => setLocationSuccess(false), 3000);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setLocating(false);
    }
  };

  const handleSelectMode = (mode: ReportMode) => {
    setSelectedMode(mode);
    setValue('mode', mode);
    if (mode === 'photo' || mode === 'gallery') {
      setIsPhotoModalOpen(true);
    } else if (mode === 'voice') {
      setIsVoiceModalOpen(true);
    }
  };

  const handleToggleCategory = (catId: IncidentCategory) => {
    const next = selectedCategory === catId ? undefined : catId;
    setSelectedCategory(next);
    setValue('category', next);
  };

  const onSubmit: SubmitHandler<CitizenReportFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      const created = await submitCitizenReport({
        mode: selectedMode,
        category: selectedCategory,
        description: data.description || (attachedMedia ? `Incident reported via ${selectedMode} with media attached.` : 'Citizen emergency reported.'),
        location: currentLocation,
        attachment: attachedMedia,
        reportedAt: new Date().toISOString(),
        anonymous: true,
      });
      setSubmittedIncident(created);
      setIsSuccessModalOpen(true);
    } catch (err) {
      console.error('Submission failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Hero Banner matching Image 1 */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            See an Emergency?
          </h1>
          <p className="text-2xl sm:text-3xl font-black text-red-500 tracking-tight">
            Report it. Save Lives.
          </p>
          <p className="text-xs sm:text-sm text-slate-400 font-medium pt-1">
            A quick report can make a big difference.
          </p>
        </div>

        {/* Trust Badges matching Image 1 */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#12141F] border border-white/[0.08] shadow-sm">
            <Zap className="w-4 h-4 text-amber-400" />
            <div className="text-left">
              <span className="block text-xs font-bold text-white leading-none">Fast</span>
              <span className="text-[10px] text-slate-400">Report in seconds</span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#12141F] border border-white/[0.08] shadow-sm">
            <Shield className="w-4 h-4 text-emerald-400" />
            <div className="text-left">
              <span className="block text-xs font-bold text-white leading-none">Anonymous</span>
              <span className="text-[10px] text-slate-400">No login required</span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#12141F] border border-white/[0.08] shadow-sm">
            <Lock className="w-4 h-4 text-blue-400" />
            <div className="text-left">
              <span className="block text-xs font-bold text-white leading-none">
                Your Data is Safe
              </span>
              <span className="text-[10px] text-slate-400">Secure & confidential</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Form Canvas */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Report an Incident Box */}
        <div className="bg-[#12141F] border border-white/[0.08] rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
          {/* Card Title & GPS action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/30 shrink-0">
                <Send className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Report an Incident
                </h2>
                <p className="text-xs text-slate-400">
                  Choose the easiest way to report. It&apos;s fast and simple.
                </p>
              </div>
            </div>

            {/* Use My Current Location Pill */}
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={locating}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                locationSuccess
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-[#090A0F] hover:bg-[#181B2A] text-blue-400 hover:text-blue-300 border-blue-500/30'
              }`}
            >
              {locating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : locationSuccess ? (
                <CheckCircle className="w-3.5 h-3.5" />
              ) : (
                <MapPin className="w-3.5 h-3.5" />
              )}
              <span>
                {locating
                  ? 'Detecting GPS...'
                  : locationSuccess
                  ? 'Location Acquired'
                  : 'Use My Current Location'}
              </span>
            </button>
          </div>

          {/* 3 Intake Mode Cards matching Image 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Mode 1: Photo */}
            <button
              type="button"
              onClick={() => handleSelectMode('photo')}
              className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden group ${
                selectedMode === 'photo'
                  ? 'bg-[#181B2A] border-red-500 ring-1 ring-red-500/40 shadow-lg shadow-red-500/10'
                  : 'bg-[#090A0F]/70 border-white/[0.06] hover:border-white/[0.15]'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center mb-3">
                <Camera className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-sm font-bold text-white">Photo</h3>
              <p className="text-xs text-slate-400 mt-0.5">Take a photo</p>
            </button>

            {/* Mode 2: Gallery */}
            <button
              type="button"
              onClick={() => handleSelectMode('gallery')}
              className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden group ${
                selectedMode === 'gallery'
                  ? 'bg-[#181B2A] border-red-500 ring-1 ring-red-500/40 shadow-lg shadow-red-500/10'
                  : 'bg-[#090A0F]/70 border-white/[0.06] hover:border-white/[0.15]'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center mb-3">
                <ImageIcon className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-sm font-bold text-white">Gallery</h3>
              <p className="text-xs text-slate-400 mt-0.5">Upload from device</p>
            </button>

            {/* Mode 3: Voice Report */}
            <button
              type="button"
              onClick={() => handleSelectMode('voice')}
              className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden group ${
                selectedMode === 'voice'
                  ? 'bg-[#181B2A] border-red-500 ring-1 ring-red-500/40 shadow-lg shadow-red-500/10'
                  : 'bg-[#090A0F]/70 border-white/[0.06] hover:border-white/[0.15]'
              }`}
            >
              <div className="absolute top-3 right-3">
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  Recommended
                </span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-3">
                <Mic className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-sm font-bold text-white">Voice Report</h3>
              <p className="text-xs text-slate-400 mt-0.5">Tap and speak</p>
            </button>
          </div>

          {/* Attached Media Pill if any */}
          {attachedMedia && (
            <div className="bg-[#090A0F] border border-emerald-500/30 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle className="w-4 h-4" />
                <span className="text-white font-medium">{attachedMedia.name}</span>
                <span className="text-slate-400 font-mono">attached</span>
              </div>
              <button
                type="button"
                onClick={() => setAttachedMedia(undefined)}
                className="text-slate-400 hover:text-red-400 text-[11px]"
              >
                Remove
              </button>
            </div>
          )}

          {/* AI Banner matching Image 1 & 2 */}
          <div className="bg-gradient-to-r from-indigo-950/60 via-purple-950/50 to-[#12141F] border border-indigo-500/30 rounded-xl p-3.5 flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
            <p className="text-xs text-indigo-200">
              <span className="font-semibold text-white">Res-Q AI</span> will automatically detect
              the incident type and severity for you.
            </p>
          </div>

          {/* 4. Select Incident Type Pills matching Image 2 */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200">Select Incident Type</label>
              <span className="text-[11px] text-slate-400">
                Optional — AI can detect this automatically
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {INCIDENT_CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleToggleCategory(cat.id)}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-red-500/20 text-white border-red-500 shadow-sm shadow-red-500/20'
                        : 'bg-[#090A0F]/80 text-slate-300 border-white/[0.06] hover:border-white/[0.15] hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${cat.color}`} />
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Your Location Card matching Image 2 */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-200">Your Location</label>
            <div className="bg-[#090A0F] border border-white/[0.08] rounded-xl p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-blue-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-amber-400 truncate">
                    {currentLocation.address || 'SG Highway, Bodakdev, Ahmedabad, Gujarat'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    GPS: {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold hover:underline shrink-0"
              >
                Change Location
              </button>
            </div>
          </div>

          {/* 6. Short Description Textarea with 0/300 counter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200">
                Add a Short Description
              </label>
              <span className="text-[11px] text-slate-400">Optional</span>
            </div>

            <div className="relative">
              <textarea
                {...register('description')}
                rows={3}
                maxLength={300}
                placeholder="You can speak or type a short description..."
                className="w-full bg-[#090A0F] border border-white/[0.1] rounded-xl p-3.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500/60 transition-colors pr-12 resize-none"
              />
              {/* Mic shortcut icon inside textarea */}
              <button
                type="button"
                onClick={() => setIsVoiceModalOpen(true)}
                className="absolute right-3.5 top-3.5 p-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors"
                title="Speak description"
              >
                <Mic className="w-4 h-4" />
              </button>
              {/* 0/300 Counter */}
              <div className="absolute right-3.5 bottom-2.5 text-[10px] font-mono text-slate-400">
                <span
                  className={
                    descriptionValue.length > 250
                      ? 'text-amber-400 font-bold'
                      : descriptionValue.length >= 300
                      ? 'text-red-400 font-bold'
                      : ''
                  }
                >
                  {descriptionValue.length}
                </span>
                /300
              </div>
            </div>
            {errors.description && (
              <p className="text-[11px] text-red-400">{errors.description.message}</p>
            )}
          </div>

          {/* 7. Primary CTA: Full-width Red Gradient Send Report */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-xl font-extrabold text-sm sm:text-base text-white bg-gradient-to-r from-red-600 via-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-98 shadow-xl shadow-red-600/30 border border-red-500/50 flex items-center justify-center gap-2.5 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Submitting to Res-Q Network...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Send Report</span>
                </>
              )}
            </button>
            <p className="text-center text-[11px] text-slate-400">
              Your report will be analyzed by our AI system and sent to the relevant authorities.
            </p>
          </div>
        </div>
      </form>

      {/* Modals */}
      <PhotoModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        mode={selectedMode === 'gallery' ? 'gallery' : 'photo'}
        onPhotoSelected={(attachment, detectedCat, aiTag) => {
          setAttachedMedia(attachment);
          if (detectedCat) {
            setSelectedCategory(detectedCat);
            setValue('category', detectedCat);
          }
          if (aiTag && !descriptionValue) {
            setValue('description', aiTag);
          }
        }}
      />

      <VoiceRecorderModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onAudioRecorded={(attachment, transcript) => {
          setAttachedMedia(attachment);
          if (!descriptionValue) {
            setValue('description', transcript);
          }
        }}
      />

      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        incident={submittedIncident}
        onTrackIncident={onTrackIncident}
      />
    </div>
  );
}
