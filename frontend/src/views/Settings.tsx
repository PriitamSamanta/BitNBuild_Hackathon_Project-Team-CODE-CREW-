import { RotateCcw, Settings as SettingsIcon, Info, Trash2, Database, Server } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';

export function Settings() {
  const { resetState, incidents, resources, teams, hospitals } = useApp();
  const [confirmReset, setConfirmReset] = useState(false);
  const totalRecords = incidents.length + resources.length + teams.length + hospitals.length;

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h2 className="text-xl font-bold text-white">Settings</h2>
        <p className="mt-0.5 text-sm text-secondary">Frontend configuration and data connection status</p>
      </div>

      <div className="rounded-xl border border-navy-border bg-navy-card p-4">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-royal/15 text-royal"><Server size={18} /></div>
          <div><h3 className="text-sm font-bold text-white">API Connection</h3><p className="text-[11px] text-secondary">Backend endpoints can be connected without changing the UI layer.</p></div>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between rounded-lg bg-navy-secondary/40 px-3 py-2"><span className="text-secondary">Frontend</span><span className="font-medium text-response">Connected</span></div>
          <div className="flex justify-between rounded-lg bg-navy-secondary/40 px-3 py-2"><span className="text-secondary">Backend</span><span className="font-medium text-warning">Endpoints pending</span></div>
          <div className="flex justify-between rounded-lg bg-navy-secondary/40 px-3 py-2"><span className="text-secondary">Data source</span><span className="font-medium text-white">Client-side persistent store</span></div>
          <div className="flex justify-between rounded-lg bg-navy-secondary/40 px-3 py-2"><span className="text-secondary">Current records</span><span className="font-medium text-white">{totalRecords}</span></div>
        </div>
      </div>

      <div className="rounded-xl border border-navy-border bg-navy-card p-4">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-aipurple/15 text-aipurple"><Database size={18} /></div>
          <div><h3 className="text-sm font-bold text-white">Data Layer</h3><p className="text-[11px] text-secondary">No seeded or simulated emergency records are included.</p></div>
        </div>
        <p className="text-sm leading-6 text-secondary">The frontend starts empty. Records created through the UI are stored locally for this frontend-only phase. TanStack Query is the state boundary, so the API adapter can be switched to the Express backend later.</p>
      </div>

      <div className="rounded-xl border border-navy-border bg-navy-card p-4">
        <div className="mb-4 flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-royal/15 text-royal"><Info size={18} /></div><div><h3 className="text-sm font-bold text-white">System Information</h3><p className="text-[11px] text-secondary">RES-Q frontend architecture</p></div></div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between rounded-lg bg-navy-secondary/40 px-3 py-2"><span className="text-secondary">Framework</span><span className="font-medium text-white">Next.js + React</span></div>
          <div className="flex justify-between rounded-lg bg-navy-secondary/40 px-3 py-2"><span className="text-secondary">Language</span><span className="font-medium text-white">TypeScript</span></div>
          <div className="flex justify-between rounded-lg bg-navy-secondary/40 px-3 py-2"><span className="text-secondary">Server state</span><span className="font-medium text-white">TanStack Query</span></div>
          <div className="flex justify-between rounded-lg bg-navy-secondary/40 px-3 py-2"><span className="text-secondary">Forms / validation</span><span className="font-medium text-white">React Hook Form + Zod</span></div>
        </div>
      </div>

      <div className="rounded-xl border border-emergency/30 bg-navy-card p-4">
        <div className="mb-3 flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emergency/15 text-emergency"><Trash2 size={18} /></div><div><h3 className="text-sm font-bold text-white">Clear Frontend Data</h3><p className="text-[11px] text-secondary">Remove records created during local testing.</p></div></div>
        {!confirmReset ? <button onClick={() => setConfirmReset(true)} className="flex items-center gap-2 rounded-lg border border-emergency/40 bg-emergency/10 px-3 py-2 text-sm font-medium text-emergency hover:bg-emergency/20"><RotateCcw size={14} />Clear local data</button> : <div className="flex items-center gap-2"><p className="flex-1 text-sm text-secondary">Clear all locally stored records?</p><button onClick={() => { resetState(); setConfirmReset(false); }} className="rounded-lg bg-emergency px-3 py-2 text-sm font-bold text-white">Yes, clear</button><button onClick={() => setConfirmReset(false)} className="rounded-lg border border-navy-border bg-navy-secondary px-3 py-2 text-sm text-secondary">Cancel</button></div>}
      </div>
    </div>
  );
}

export { SettingsIcon };
