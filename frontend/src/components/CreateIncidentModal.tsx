'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Siren, Loader2, Brain, Sparkles } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/context/AppContext';
import { analyzeIncident, type AIAnalysisResult } from '@/services/aiService';
import { INCIDENT_TYPE_META, type IncidentSource, type IncidentType } from '@/types';

const schema = z.object({
  location: z.string().trim().min(2, 'Location is required'),
  description: z.string().trim().min(10, 'Please provide at least 10 characters'),
  peopleAffected: z.coerce.number().int().min(0).max(100000),
  source: z.enum(['citizen', 'call', 'iot', 'field', 'hospital', 'government']),
  priority: z.enum(['normal', 'high']),
});
type FormValues = z.infer<typeof schema>;

interface Props { open: boolean; onClose: () => void; onCreated: (id: string) => void; }

export function CreateIncidentModal({ open, onClose, onCreated }: Props) {
  const { incidents, resources, addIncident, addNotification } = useApp();
  const [type, setType] = useState<IncidentType>('fire');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | undefined>();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { location: '', description: '', peopleAffected: 0, source: 'citizen', priority: 'normal' },
  });

  const close = () => { reset(); setType('fire'); setResult(null); setAnalyzing(false); setCoordinates(undefined); onClose(); };

  const getBrowserCoordinates = () => new Promise<{ lat: number; lng: number } | undefined>((resolve) => {
    if (!navigator.geolocation) return resolve(undefined);
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
      () => resolve(undefined),
      { enableHighAccuracy: false, timeout: 4000 },
    );
  });

  const onAnalyze = async (values: FormValues) => {
    setAnalyzing(true); setResult(null);
    const coords = await getBrowserCoordinates();
    setCoordinates(coords);
    const analysis = await analyzeIncident(values.description, values.peopleAffected, values.source, incidents, resources.filter((r) => r.status === 'available'), coords);
    setResult(analysis); setAnalyzing(false);
  };

  const createIncident = (values: FormValues) => {
    if (!result) return;
    const now = new Date().toISOString();
    const id = `INC-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const title = INCIDENT_TYPE_META[result.type].label;
    const incident = {
      id, type: result.type, title, location: values.location, coordinates,
      severity: result.severity, score: result.score, confidence: result.confidence,
      source: values.source, peopleAffected: values.peopleAffected, status: 'verified' as const,
      assignedTeams: [], recommendedResources: result.recommendedResources, createdAt: now, updatedAt: now,
      description: values.description,
      timeline: [
        { time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }), event: 'Incident created', icon: '📝' },
        { time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }), event: `AI classified as ${title}`, icon: '🤖' },
        { time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }), event: `Severity: ${result.severity.toUpperCase()} (${result.score}/100)`, icon: '⚠' },
      ],
      duplicateReports: result.duplicateReports, riskFactors: result.riskFactors, escalationLevel: 0,
    };
    addIncident(incident);
    addNotification({ type: result.severity === 'critical' ? 'critical' : 'info', title: `New incident: ${title}`, message: `${title} at ${values.location} — Score ${result.score}/100`, incidentId: id });
    close(); onCreated(id);
  };

  return <Modal open={open} onClose={close} title="Create Incident" subtitle="Frontend-only workflow — backend endpoint can be connected later" icon={<Siren size={20} />} maxWidth="max-w-xl">
    <form onSubmit={handleSubmit(result ? createIncident : onAnalyze)} className="space-y-4">
      <div><label className="mb-1.5 block text-xs font-semibold text-secondary">Incident Type</label><div className="grid grid-cols-3 gap-2">{(Object.keys(INCIDENT_TYPE_META) as IncidentType[]).map((t) => <button type="button" key={t} onClick={() => setType(t)} className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${type === t ? 'border-emergency/50 bg-emergency/10 text-white' : 'border-navy-border bg-navy-secondary text-secondary hover:text-white'}`}><span>{INCIDENT_TYPE_META[t].emoji}</span>{INCIDENT_TYPE_META[t].label}</button>)}</div></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="mb-1.5 block text-xs font-semibold text-secondary">Location</label><Input {...register('location')} placeholder="Enter incident location" />{errors.location && <p className="mt-1 text-xs text-emergency">{errors.location.message}</p>}</div>
        <div><label className="mb-1.5 block text-xs font-semibold text-secondary">People Affected</label><Input type="number" min={0} {...register('peopleAffected')} />{errors.peopleAffected && <p className="mt-1 text-xs text-emergency">{errors.peopleAffected.message}</p>}</div>
      </div>
      <div><label className="mb-1.5 block text-xs font-semibold text-secondary">Description</label><Textarea rows={3} {...register('description')} placeholder="Describe what happened, hazards, injuries, or other relevant details." />{errors.description && <p className="mt-1 text-xs text-emergency">{errors.description.message}</p>}</div>
      <div className="grid grid-cols-2 gap-3"><div><label className="mb-1.5 block text-xs font-semibold text-secondary">Source</label><select {...register('source')} className="h-9 w-full rounded-lg border border-navy-border bg-navy-secondary px-3 text-sm text-white"><option value="citizen">Citizen</option><option value="call">Emergency Call</option><option value="iot">IoT Sensor</option><option value="field">Field Team</option><option value="hospital">Hospital</option><option value="government">Government</option></select></div><div><label className="mb-1.5 block text-xs font-semibold text-secondary">Priority</label><select {...register('priority')} className="h-9 w-full rounded-lg border border-navy-border bg-navy-secondary px-3 text-sm text-white"><option value="normal">Normal</option><option value="high">High Priority</option></select></div></div>
      {analyzing && <div className="rounded-xl border border-aipurple/30 bg-aipurple/5 p-4"><div className="mb-3 flex items-center gap-2"><Loader2 size={16} className="animate-spin text-aipurple" /><span className="text-sm font-semibold text-aipurple">Analyzing...</span></div><div className="relative h-1 overflow-hidden rounded-full bg-navy-secondary"><div className="scan-line absolute inset-y-0 w-1/3" /></div><p className="mt-2 text-xs text-secondary">Running the local classification and validation pipeline.</p></div>}
      {result && !analyzing && <div className="rounded-xl border border-response/30 bg-response/5 p-4"><div className="mb-3 flex items-center gap-2"><Brain size={16} className="text-response" /><span className="text-sm font-semibold text-response">Analysis Complete</span><Sparkles size={14} className="ml-auto text-aipurple" /></div><div className="grid grid-cols-2 gap-3 text-sm"><div><p className="text-xs text-secondary">Type</p><p className="font-semibold text-white">{INCIDENT_TYPE_META[result.type].emoji} {INCIDENT_TYPE_META[result.type].label}</p></div><div><p className="text-xs text-secondary">Severity</p><p className="font-semibold uppercase text-white">{result.severity} — {result.score}/100</p></div><div><p className="text-xs text-secondary">Confidence</p><p className="font-semibold text-aipurple">{result.confidence}%</p></div><div><p className="text-xs text-secondary">Location coordinates</p><p className="font-semibold text-white">{coordinates ? 'Browser location captured' : 'Not available'}</p></div></div></div>}
      <div className="flex gap-2"><Button type="button" variant="outline" onClick={close}>Cancel</Button>{!result ? <Button type="submit" disabled={analyzing}><Brain size={16} />{analyzing ? 'Analyzing...' : 'Run Analysis'}</Button> : <Button type="submit" disabled={analyzing}><Siren size={16} />Create Incident</Button>}</div>
    </form>
  </Modal>;
}
