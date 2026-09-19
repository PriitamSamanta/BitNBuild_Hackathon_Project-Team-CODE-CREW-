'use client';

import { useMemo, useState } from 'react';
import { Flame, Waves, Car, Biohazard, Filter } from 'lucide-react';
import { LiveMap } from '@/src/components/LiveMap';
import { useApp } from '@/src/context/AppContext';
import type { IncidentType } from '@/src/types';

type RiskType = Extract<IncidentType, 'fire' | 'flood' | 'accident' | 'chemical'>;
const RISK_META: Record<RiskType, { label: string; emoji: string; icon: typeof Flame; color: string }> = { fire: { label: 'Fire Risk', emoji: '🔥', icon: Flame, color: '#EF233C' }, flood: { label: 'Flood Risk', emoji: '🌊', icon: Waves, color: '#1565D8' }, accident: { label: 'Accident Risk', emoji: '🚗', icon: Car, color: '#F59E0B' }, chemical: { label: 'Chemical Risk', emoji: '☣', icon: Biohazard, color: '#7C3AED' } };

export function RiskHeatmap() {
  const { incidents } = useApp();
  const [riskType, setRiskType] = useState<RiskType>('fire');
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [minRisk, setMinRisk] = useState(0);
  const now = Date.now();
  const cutoff = period === 'week' ? now - 7 * 86400000 : period === 'month' ? now - 30 * 86400000 : now - 365 * 86400000;

  const areas = useMemo(() => {
    const grouped = new Map<string, { area: string; score: number; count: number }>();
    incidents.filter((i) => new Date(i.createdAt).getTime() >= cutoff && i.type === riskType).forEach((incident) => {
      const current = grouped.get(incident.location) ?? { area: incident.location || 'Unknown', score: 0, count: 0 };
      current.score += incident.score;
      current.count += 1;
      grouped.set(incident.location, current);
    });
    return [...grouped.values()].map((a) => ({ ...a, risk: Math.min(100, Math.round(a.score / a.count)) })).filter((a) => a.risk >= minRisk).sort((a, b) => b.risk - a.risk);
  }, [cutoff, incidents, minRisk, riskType]);

  const meta = RISK_META[riskType];
  const getRiskLevel = (val: number) => val >= 75 ? { label: 'CRITICAL', color: '#EF233C' } : val >= 50 ? { label: 'HIGH', color: '#F59E0B' } : val >= 25 ? { label: 'MEDIUM', color: '#1565D8' } : { label: 'LOW', color: '#64748B' };

  return <div className="space-y-4"><div><h2 className="text-xl font-bold text-white">Risk Heatmap</h2><p className="mt-0.5 text-sm text-secondary">Risk is calculated from actual incidents recorded in the selected period.</p></div>
    <div className="flex flex-wrap items-center gap-2"><Filter size={14} className="text-muted" />{(Object.keys(RISK_META) as RiskType[]).map((t) => { const m = RISK_META[t]; const Icon = m.icon; return <button key={t} onClick={() => setRiskType(t)} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${riskType === t ? 'text-white' : 'bg-navy-card text-secondary hover:text-white'}`} style={riskType === t ? { backgroundColor: `${m.color}20`, color: m.color } : undefined}><Icon size={13} />{m.label}</button>; })}<div className="ml-auto flex items-center gap-2"><select value={period} onChange={(e) => setPeriod(e.target.value as typeof period)} className="rounded-lg border border-navy-border bg-navy-card px-2.5 py-1.5 text-xs text-white"><option value="week">This Week</option><option value="month">This Month</option><option value="year">This Year</option></select><select value={minRisk} onChange={(e) => setMinRisk(Number(e.target.value))} className="rounded-lg border border-navy-border bg-navy-card px-2.5 py-1.5 text-xs text-white"><option value={0}>All Risk Levels</option><option value={25}>Medium+</option><option value={50}>High+</option><option value={75}>Critical Only</option></select></div></div>
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]"><LiveMap height="400px" showTeams={false} showHospitals={false} /><div className="max-h-[400px] space-y-2 overflow-y-auto"><h3 className="mb-1 text-sm font-bold text-white">High-Risk Areas</h3>{areas.length ? areas.map((area) => { const level = getRiskLevel(area.risk); return <div key={area.area} className="rounded-xl border border-navy-border bg-navy-card p-3"><div className="mb-2 flex items-center justify-between"><p className="truncate text-sm font-semibold text-white">{area.area}</p><span className="text-xs font-bold" style={{ color: level.color }}>{level.label}</span></div><div className="relative h-2 w-full overflow-hidden rounded-full bg-navy-secondary"><div className="h-full rounded-full" style={{ width: `${area.risk}%`, backgroundColor: level.color }} /></div><div className="mt-1.5 flex items-center justify-between text-[11px]"><span className="text-secondary">{meta.emoji} {meta.label} · {area.count} incident(s)</span><span className="font-bold" style={{ color: level.color }}>{area.risk}/100</span></div></div>; }) : <div className="rounded-xl border border-dashed border-navy-border p-6 text-center text-sm text-muted">No matching incidents recorded yet.</div>}</div></div>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{(Object.keys(RISK_META) as RiskType[]).map((t) => { const m = RISK_META[t]; const Icon = m.icon; const relevant = incidents.filter((i) => i.type === t && new Date(i.createdAt).getTime() >= cutoff); const avg = relevant.length ? Math.round(relevant.reduce((sum, i) => sum + i.score, 0) / relevant.length) : 0; return <div key={t} className="rounded-xl border border-navy-border bg-navy-card p-3"><div className="mb-1 flex items-center gap-2"><Icon size={14} style={{ color: m.color }} /><span className="text-xs font-medium text-secondary">{m.label}</span></div><p className="text-xl font-extrabold" style={{ color: m.color }}>{avg}</p><p className="text-[10px] text-muted">avg risk score</p></div>; })}</div>
  </div>;
}
