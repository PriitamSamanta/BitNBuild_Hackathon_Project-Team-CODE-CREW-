'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { INCIDENT_TYPE_META, SEVERITY_META, RESOURCE_TYPE_META, type IncidentType, type Severity, type ResourceType } from '@/types';

const tooltipStyle = { backgroundColor: '#102A43', border: '1px solid #1E3A5F', borderRadius: '8px', fontSize: '12px', color: '#fff' };
const EMPTY = <div className="flex h-[240px] items-center justify-center text-sm text-muted">No data available yet</div>;

export function Analytics() {
  const { incidents, resources } = useApp();
  const types = Object.keys(INCIDENT_TYPE_META) as IncidentType[];
  const severities = Object.keys(SEVERITY_META) as Severity[];
  const resourceTypes = Object.keys(RESOURCE_TYPE_META) as ResourceType[];

  const incidentsByType = types.map((type) => ({ name: INCIDENT_TYPE_META[type].label, value: incidents.filter((i) => i.type === type).length, color: INCIDENT_TYPE_META[type].color }));
  const severityDistribution = severities.map((severity) => ({ name: SEVERITY_META[severity].label, value: incidents.filter((i) => i.severity === severity).length, color: SEVERITY_META[severity].color }));
  const resourceUtilization = resourceTypes.map((type) => ({ name: RESOURCE_TYPE_META[type].label, available: resources.filter((r) => r.type === type && r.status === 'available').length, dispatched: resources.filter((r) => r.type === type && r.status === 'dispatched').length, busy: resources.filter((r) => r.type === type && r.status === 'busy').length }));

  const weeklyTrend = Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(); date.setHours(0, 0, 0, 0); date.setDate(date.getDate() - (6 - offset));
    const next = new Date(date); next.setDate(date.getDate() + 1);
    return { day: date.toLocaleDateString('en-IN', { weekday: 'short' }), incidents: incidents.filter((i) => { const d = new Date(i.createdAt); return d >= date && d < next; }).length, resolved: incidents.filter((i) => { const d = i.resolvedAt ? new Date(i.resolvedAt) : null; return !!d && d >= date && d < next; }).length };
  });

  const responseTime = severities.map((severity) => {
    const rows = incidents.filter((i) => i.severity === severity && i.actualArrival);
    const minutes = rows.map((i) => (new Date(i.actualArrival!).getTime() - new Date(i.createdAt).getTime()) / 60000).filter(Number.isFinite);
    return { period: SEVERITY_META[severity].label, fire: severity === 'critical' ? average(minutes) : 0, accident: severity === 'high' ? average(minutes) : 0, medical: severity === 'medium' ? average(minutes) : 0, flood: severity === 'low' ? average(minutes) : 0 };
  });

  const frequentAreas = Object.entries(incidents.reduce<Record<string, { area: string; type: string; count: number }>>((acc, incident) => { const key = incident.location.trim() || 'Unknown'; acc[key] ??= { area: key, type: INCIDENT_TYPE_META[incident.type].label, count: 0 }; acc[key].count += 1; return acc; }, {})).map(([, value]) => value).sort((a, b) => b.count - a.count).slice(0, 5);

  return (
    <div className="space-y-4">
      <div><h2 className="text-xl font-bold text-white">Analytics</h2><p className="mt-0.5 text-sm text-secondary">Live analytics derived from the current frontend data store.</p></div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Incidents by Type">{incidents.length ? <ResponsiveContainer width="100%" height={240}><PieChart><Pie data={incidentsByType} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={45} paddingAngle={2}>{incidentsByType.map((entry) => <Cell key={entry.name} fill={entry.color} stroke="#102A43" strokeWidth={2} />)}</Pie><Tooltip contentStyle={tooltipStyle} /><Legend wrapperStyle={{ fontSize: '11px', color: '#94A3B8' }} iconType="circle" /></PieChart></ResponsiveContainer> : EMPTY}</ChartCard>
        <ChartCard title="Incident Severity">{incidents.length ? <ResponsiveContainer width="100%" height={240}><BarChart data={severityDistribution}><CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" vertical={false} /><XAxis dataKey="name" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={{ stroke: '#1E3A5F' }} tickLine={false} /><YAxis allowDecimals={false} tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={tooltipStyle} /><Bar dataKey="value" radius={[6, 6, 0, 0]}>{severityDistribution.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Bar></BarChart></ResponsiveContainer> : EMPTY}</ChartCard>
        <ChartCard title="Response Time (minutes)">{incidents.some((i) => i.actualArrival) ? <ResponsiveContainer width="100%" height={240}><BarChart data={responseTime}><CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" vertical={false} /><XAxis dataKey="period" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={{ stroke: '#1E3A5F' }} tickLine={false} /><YAxis allowDecimals={false} tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={tooltipStyle} /><Bar dataKey="fire" fill="#EF233C" name="Critical" /><Bar dataKey="accident" fill="#F59E0B" name="High" /><Bar dataKey="medical" fill="#10B981" name="Medium" /><Bar dataKey="flood" fill="#1565D8" name="Low" /></BarChart></ResponsiveContainer> : EMPTY}</ChartCard>
        <ChartCard title="7-Day Trend"><ResponsiveContainer width="100%" height={240}><AreaChart data={weeklyTrend}><CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" vertical={false} /><XAxis dataKey="day" tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={{ stroke: '#1E3A5F' }} tickLine={false} /><YAxis allowDecimals={false} tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={tooltipStyle} /><Area type="monotone" dataKey="incidents" stroke="#E63946" fill="#E63946" fillOpacity={0.12} name="Incidents" /><Area type="monotone" dataKey="resolved" stroke="#10B981" fill="#10B981" fillOpacity={0.12} name="Resolved" /><Legend /></AreaChart></ResponsiveContainer></ChartCard>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Resource Utilization">{resources.length ? <ResponsiveContainer width="100%" height={220}><BarChart data={resourceUtilization} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="#1E3A5F" horizontal={false} /><XAxis type="number" allowDecimals={false} tick={{ fill: '#94A3B8', fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis type="category" dataKey="name" tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} width={90} /><Tooltip contentStyle={tooltipStyle} /><Bar dataKey="available" stackId="a" fill="#10B981" name="Available" /><Bar dataKey="dispatched" stackId="a" fill="#1565D8" name="Dispatched" /><Bar dataKey="busy" stackId="a" fill="#F59E0B" name="Busy" /></BarChart></ResponsiveContainer> : <div className="flex h-[220px] items-center justify-center text-sm text-muted">No resource data available yet</div>}</ChartCard>
        <div className="rounded-xl border border-navy-border bg-navy-card p-4"><h3 className="mb-3 text-sm font-bold text-white">Frequently Affected Areas</h3>{frequentAreas.length ? <div className="space-y-2">{frequentAreas.map((area, i) => <div key={area.area} className="flex items-center gap-3 rounded-lg border border-navy-border bg-navy-secondary/40 p-2.5"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-navy-card text-xs font-bold text-royal">{i + 1}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-white">{area.area}</p><p className="text-[11px] text-secondary">{area.type}</p></div><div className="flex items-center gap-2"><TrendingUp size={14} className="text-emergency" /><span className="text-sm font-bold text-white">{area.count}</span></div></div>)}</div> : <div className="flex h-40 items-center justify-center text-sm text-muted">No incident locations recorded yet.</div>}</div>
      </div>
    </div>
  );
}
function average(values: number[]) { return values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0; }
function ChartCard({ title, children }: { title: string; children: React.ReactNode }) { return <div className="rounded-xl border border-navy-border bg-navy-card p-4"><h3 className="mb-3 text-sm font-bold text-white">{title}</h3>{children}</div>; }
