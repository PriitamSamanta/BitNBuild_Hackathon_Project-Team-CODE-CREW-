import { useState } from 'react';
import { Zap, Check, X, Truck, Send } from 'lucide-react';
import { Modal } from './Modal';
import { useApp } from '@/context/AppContext';
import { generateActionPlan } from '@/services/aiService';
import { INCIDENT_TYPE_META, type Incident } from '@/types';

interface ActionPlanModalProps {
  open: boolean;
  onClose: () => void;
  incident: Incident | null;
  onDispatch?: () => void;
}

export function ActionPlanModal({ open, onClose, incident, onDispatch }: ActionPlanModalProps) {
  const { dispatchTeam, teams, addNotification } = useApp();
  const [approved, setApproved] = useState(false);
  const [dispatched, setDispatched] = useState(false);

  if (!incident) return null;

  const plan = generateActionPlan(incident);
  const typeMeta = INCIDENT_TYPE_META[incident.type];
  const availableTeams = teams.filter(
    (t) => t.status === 'available' && t.type === incident.type,
  );

  const handleApprove = () => {
    setApproved(true);
    addNotification({
      type: 'ai',
      title: 'AI Action Plan Approved',
      message: `Plan approved for Incident #${incident.id}`,
      incidentId: incident.id,
    });
  };

  const handleDispatch = () => {
    const toDispatch = availableTeams.slice(0, incident.score > 75 ? 2 : 1);
    toDispatch.forEach((team) => dispatchTeam(team.id, incident.id));
    setDispatched(true);
    addNotification({
      type: 'success',
      title: 'Teams Dispatched',
      message: `${toDispatch.length} team(s) dispatched to Incident #${incident.id}`,
      incidentId: incident.id,
    });
    onDispatch?.();
    setTimeout(onClose, 1200);
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        setApproved(false);
        setDispatched(false);
        onClose();
      }}
      title="AI Response Plan"
      subtitle={`Incident #${incident.id} — ${typeMeta.emoji} ${incident.title}`}
      icon={<Zap size={20} className="text-aipurple" />}
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-xl border border-navy-border bg-navy-secondary/60 p-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl" style={{ backgroundColor: `${typeMeta.color}20` }}>
            {typeMeta.emoji}
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white">{incident.title}</p>
            <p className="text-xs text-secondary">{incident.location}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-extrabold" style={{ color: typeMeta.color }}>{incident.score}</p>
            <p className="text-[10px] text-muted uppercase">{incident.severity}</p>
          </div>
        </div>

        <div>
          <h4 className="mb-2 text-sm font-bold text-white">Immediate Actions</h4>
          <div className="space-y-2">
            {plan.immediateActions.map((action) => (
              <div
                key={action.step}
                className="flex items-center gap-3 rounded-lg border border-navy-border bg-navy-secondary/40 p-2.5"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-navy-card text-xs font-bold text-royal">
                  {String(action.step).padStart(2, '0')}
                </span>
                <span className="text-base">{action.emoji}</span>
                <span className="text-sm text-white flex-1">{action.action}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-warning/30 bg-warning/5 p-3">
          <h4 className="mb-1.5 text-sm font-bold text-warning">Escalation</h4>
          <p className="whitespace-pre-line text-xs text-secondary">{plan.escalation}</p>
        </div>

        {dispatched ? (
          <div className="flex items-center justify-center gap-2 rounded-lg bg-response/10 p-3 text-response animate-fade-in">
            <Check size={18} />
            <span className="text-sm font-bold">Teams Dispatched Successfully</span>
          </div>
        ) : (
          <div className="flex gap-2">
            {!approved ? (
              <button
                onClick={handleApprove}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-aipurple px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-aipurple/80"
              >
                <Check size={16} />
                Approve Plan
              </button>
            ) : (
              <button
                onClick={handleDispatch}
                disabled={availableTeams.length === 0}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emergency px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-emergency-critical disabled:opacity-50"
              >
                <Send size={16} />
                Dispatch ({availableTeams.length} available)
              </button>
            )}
            <button
              onClick={() => {
                setApproved(false);
                setDispatched(false);
                onClose();
              }}
              className="flex items-center justify-center gap-2 rounded-lg border border-navy-border bg-navy-secondary px-4 py-2.5 text-sm font-medium text-secondary transition-all hover:text-white"
            >
              <X size={16} />
              {approved ? 'Cancel' : 'Modify'}
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
