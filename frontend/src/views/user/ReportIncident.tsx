'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Siren,
  MapPin,
  CheckCircle,
  Loader2,
  ArrowRight,
  Upload,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/context/AppContext';
import {
  INCIDENT_TYPE_META,
  SEVERITY_META,
  type IncidentType,
  type Severity,
  type Incident,
} from '@/types';
import type { UserPageId } from '@/components/user/UserHeader';

const reportSchema = z.object({
  location: z.string().trim().min(3, 'Location is required'),
  description: z.string().trim().min(10, 'Please provide at least 10 characters detailing the incident'),
  peopleAffected: z.number().int().min(0).max(10000),
});

type FormValues = {
  location: string;
  description: string;
  peopleAffected: number;
};

interface ReportIncidentProps {
  onNavigate: (page: UserPageId) => void;
  onIncidentReported?: (id: string) => void;
}

export function ReportIncident({ onNavigate, onIncidentReported }: ReportIncidentProps) {
  const { addIncident, addNotification } = useApp();

  const [selectedType, setSelectedType] = useState<IncidentType>('accident');
  const [selectedSeverity, setSelectedSeverity] = useState<Severity>('critical');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | undefined>();
  const [locating, setLocating] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      location: 'SG Highway, Bodakdev, Ahmedabad',
      description: '',
      peopleAffected: 2,
    },
  });

  const handleUseCurrentLocation = () => {
    setLocating(true);
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCoords(c);
          setValue('location', `Lat: ${c.lat.toFixed(4)}, Lng: ${c.lng.toFixed(4)} (GPS captured)`);
          setLocating(false);
        },
        () => {
          const fallback = { lat: 23.0225, lng: 72.5714 };
          setCoords(fallback);
          setValue('location', 'SG Highway, Bodakdev, Ahmedabad');
          setLocating(false);
        },
        { timeout: 3500 }
      );
    } else {
      const fallback = { lat: 23.0225, lng: 72.5714 };
      setCoords(fallback);
      setValue('location', 'SG Highway, Bodakdev, Ahmedabad');
      setLocating(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    setIsSubmitting(true);
    const now = new Date().toISOString();
    const id = `INC-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

    const score = selectedSeverity === 'critical' ? 95 : selectedSeverity === 'high' ? 80 : selectedSeverity === 'medium' ? 55 : 30;

    const newIncident: Incident = {
      id,
      type: selectedType,
      title: `${INCIDENT_TYPE_META[selectedType].label} Emergency`,
      location: values.location,
      coordinates: coords || { lat: 23.0225, lng: 72.5714 },
      severity: selectedSeverity,
      score,
      confidence: 96,
      source: 'citizen',
      peopleAffected: values.peopleAffected,
      status: 'reported',
      assignedTeamss: [],
      recommendedResources: [],
      createdAt: now,
      updatedAt: now,
      description: values.description,
      timeline: [
        {
          time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          event: 'Incident reported by citizen',
          icon: '📝',
        },
        {
          time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          event: `Assigned priority: ${selectedSeverity.toUpperCase()}`,
          icon: '⚠️',
        },
      ],
      duplicateReports: 1,
      riskFactors: [`Severity: ${selectedSeverity}`, `Affected: ${values.peopleAffected}`],
      escalationLevel: selectedSeverity === 'critical' ? 3 : selectedSeverity === 'high' ? 2 : 1,
      trackingCode: id,
      reportedBy: 'Citizen',
    };

    try {
      await addIncident(newIncident);
      setSubmittedId(id);

      addNotification({
        type: selectedSeverity === 'critical' ? 'critical' : 'info',
        title: `Report Submitted: ${newIncident.title}`,
        message: `Report #${id} logged at ${values.location}. Dispatched to Command Center.`,
        incidentId: id,
      });

      if (onIncidentReported) {
        onIncidentReported(id);
      }
    } catch (error) {
      console.error('Failed to submit report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-white">Report An Emergency</h2>
        <p className="text-sm text-secondary mt-1">
          Submit details for rapid incident triage and response dispatch by Res-Q Emergency Command.
        </p>
      </div>

      {submittedId ? (
        /* Success Screen */
        <div className="rounded-2xl border border-response/40 bg-navy-card p-6 text-center space-y-4 shadow-xl animate-fade-in">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-response/20 text-response border border-response/40">
            <CheckCircle size={36} />
          </div>

          <div>
            <h3 className="text-xl font-bold text-white">Emergency Report Logged</h3>
            <p className="text-sm text-secondary mt-1">
              Your incident report has been securely registered and broadcasted to emergency responders.
            </p>
          </div>

          <div className="rounded-xl border border-navy-border bg-navy-secondary/60 p-4 max-w-md mx-auto text-left space-y-1">
            <p className="text-xs uppercase font-bold text-muted">Tracking Code / Incident ID</p>
            <p className="text-xl font-mono font-extrabold text-white">{submittedId}</p>
            <p className="text-xs text-secondary">
              Use this tracking code to monitor field dispatch status in real time.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              onClick={() => onNavigate('tracking')}
              className="w-full sm:w-auto bg-emergency hover:bg-emergency-critical text-white font-bold"
            >
              Track Report Status <ArrowRight size={16} className="ml-1" />
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSubmittedId(null);
                setPhotoPreview(null);
              }}
              className="w-full sm:w-auto border-navy-border text-secondary hover:text-white"
            >
              File Another Report
            </Button>
          </div>
        </div>
      ) : (
        /* Report Form */
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Incident Type Grid */}
          <div className="rounded-2xl border border-navy-border bg-navy-card p-5 space-y-3 shadow-lg">
            <label className="block text-xs font-bold uppercase tracking-wider text-secondary">
              1. Select Incident Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {(Object.keys(INCIDENT_TYPE_META) as IncidentType[]).map((type) => {
                const meta = INCIDENT_TYPE_META[type];
                const active = selectedType === type;
                return (
                  <button
                    type="button"
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`flex items-center gap-2.5 rounded-xl border p-3 text-sm font-semibold transition-all ${
                      active
                        ? 'border-emergency/60 bg-emergency/15 text-white shadow-md shadow-emergency/10'
                        : 'border-navy-border bg-navy-secondary/50 text-secondary hover:text-white hover:bg-navy-secondary'
                    }`}
                  >
                    <span className="text-xl">{meta.emoji}</span>
                    <span>{meta.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Severity Selector */}
          <div className="rounded-2xl border border-navy-border bg-navy-card p-5 space-y-3 shadow-lg">
            <label className="block text-xs font-bold uppercase tracking-wider text-secondary">
              2. Severity Level
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {(['low', 'medium', 'high', 'critical'] as Severity[]).map((sev) => {
                const meta = SEVERITY_META[sev];
                const active = selectedSeverity === sev;
                return (
                  <button
                    type="button"
                    key={sev}
                    onClick={() => setSelectedSeverity(sev)}
                    className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 px-3 text-xs font-extrabold uppercase tracking-wide transition-all ${
                      active
                        ? 'border-white text-white shadow-lg'
                        : 'border-navy-border bg-navy-secondary/50 text-secondary hover:text-white'
                    }`}
                    style={
                      active
                        ? { backgroundColor: meta.color, borderColor: meta.color }
                        : {}
                    }
                  >
                    <span>{meta.emoji}</span>
                    <span>{meta.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location & People Affected */}
          <div className="rounded-2xl border border-navy-border bg-navy-card p-5 space-y-4 shadow-lg">
            <label className="block text-xs font-bold uppercase tracking-wider text-secondary">
              3. Location &amp; People Involved
            </label>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-white">Incident Address / Landmark</span>
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={locating}
                    className="flex items-center gap-1 text-xs font-semibold text-royal hover:underline"
                  >
                    {locating ? (
                      <>
                        <Loader2 size={12} className="animate-spin" />
                        <span>Locating...</span>
                      </>
                    ) : (
                      <>
                        <MapPin size={12} />
                        <span>Use My GPS</span>
                      </>
                    )}
                  </button>
                </div>
                <Input
                  {...register('location')}
                  placeholder="Street name, landmark, intersection, or city area"
                  className="bg-navy-secondary border-navy-border text-white"
                />
                {errors.location && (
                  <p className="mt-1 text-xs text-emergency">{errors.location.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-white mb-1.5">
                  Estimated People Affected / In Danger
                </label>
                <Input
                  type="number"
                  min={0}
                  {...register('peopleAffected', { valueAsNumber: true })}
                  className="bg-navy-secondary border-navy-border text-white max-w-xs"
                />
                {errors.peopleAffected && (
                  <p className="mt-1 text-xs text-emergency">{errors.peopleAffected.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Description & Photo Attachment */}
          <div className="rounded-2xl border border-navy-border bg-navy-card p-5 space-y-4 shadow-lg">
            <label className="block text-xs font-bold uppercase tracking-wider text-secondary">
              4. Incident Description &amp; Details
            </label>

            <div>
              <Textarea
                rows={4}
                {...register('description')}
                placeholder="Describe what you see: flames, trapped individuals, vehicle types, injuries, hazardous smoke, or road blockages..."
                className="bg-navy-secondary border-navy-border text-white"
              />
              {errors.description && (
                <p className="mt-1 text-xs text-emergency">{errors.description.message}</p>
              )}
            </div>

            {/* Photo upload simulator */}
            <div>
              <p className="text-xs font-medium text-white mb-2">Attach Incident Photo (Optional)</p>
              {photoPreview ? (
                <div className="relative inline-block rounded-xl overflow-hidden border border-navy-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photoPreview} alt="Upload preview" className="h-32 w-auto object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotoPreview(null)}
                    className="absolute top-1 right-1 rounded-full bg-black/70 p-1 text-white hover:bg-black"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-2 rounded-xl border border-dashed border-navy-border hover:border-royal/60 bg-navy-secondary/30 p-4 text-xs text-secondary cursor-pointer transition-colors max-w-md">
                  <Upload size={18} className="text-royal" />
                  <span>Click to select or capture a photo from camera</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
              )}
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-emergency hover:bg-emergency-critical py-3.5 text-sm font-extrabold text-white shadow-xl shadow-emergency/25 transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Submitting Report...
                </>
              ) : (
                <>
                  <Siren size={18} className="mr-2" />
                  Submit Emergency Report
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onNavigate('dashboard')}
              className="border-navy-border text-secondary hover:text-white"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
