import { useState } from 'react';
import { Hospital as HospitalIcon, Bed, Heart, Truck, MapPin, Brain } from 'lucide-react';
import { useApp } from '@/src/context/AppContext';
import { Modal } from '@/src/components/Modal';
import { allocateHospitals } from '@/src/services/aiService';
import type { Hospital } from '@/src/types';

export function Hospitals() {
  const { hospitals, incidents } = useApp();
  const [allocModal, setAllocModal] = useState(false);

  const criticalIncident = incidents.find((i) => i.severity === 'critical' && i.status !== 'resolved');
  const allocation = criticalIncident ? allocateHospitals(criticalIncident.peopleAffected, hospitals) : [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-white">Hospital Coordination</h2>
          <p className="text-sm text-secondary mt-0.5">{hospitals.length} hospitals — manage emergency capacity</p>
        </div>
        <button
          onClick={() => setAllocModal(true)}
          className="flex items-center gap-2 rounded-lg bg-aipurple px-3 py-2 text-sm font-bold text-white transition-all hover:bg-aipurple/80"
        >
          <Brain size={15} />
          AI Hospital Allocation
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {hospitals.map((h) => (
          <HospitalCard key={h.id} hospital={h} />
        ))}
      </div>

      <Modal
        open={allocModal}
        onClose={() => setAllocModal(false)}
        title="AI Hospital Allocation"
        subtitle={criticalIncident ? `Mass-casualty distribution for Incident #${criticalIncident.id}` : 'No active mass-casualty incidents'}
        icon={<Brain size={20} className="text-aipurple" />}
      >
        {criticalIncident ? (
          <div className="space-y-3">
            <div className="rounded-lg bg-navy-secondary/60 p-3">
              <p className="text-xs text-secondary">Incident</p>
              <p className="text-sm font-bold text-white">{criticalIncident.title} — {criticalIncident.peopleAffected} patients</p>
            </div>
            <div className="space-y-2">
              {allocation.map((a, i) => (
                <div key={a.hospital.id} className="flex items-center gap-3 rounded-lg border border-navy-border bg-navy-secondary/40 p-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-royal/20 text-royal text-xs font-bold">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">{a.hospital.name}</p>
                    <p className="text-xs text-secondary">{a.hospital.emergencyBeds} beds · {a.hospital.distance} km</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-extrabold text-royal">{a.patients}</p>
                    <p className="text-[10px] text-muted">patients</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted text-center py-4">No active mass-casualty incidents</p>
        )}
      </Modal>
    </div>
  );
}

function HospitalCard({ hospital }: { hospital: Hospital }) {
  const statusColor = hospital.status === 'available' ? '#10B981' : hospital.status === 'busy' ? '#F59E0B' : '#EF233C';

  return (
    <div className="rounded-xl border border-navy-border bg-navy-card p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-response/15 text-lg">
            🏥
          </div>
          <div>
            <p className="text-sm font-bold text-white">{hospital.name}</p>
            <p className="text-[11px] text-secondary">{hospital.location}</p>
          </div>
        </div>
        <span className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase" style={{ color: statusColor, backgroundColor: `${statusColor}20` }}>
          {hospital.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg bg-navy-secondary/50 p-2.5">
          <div className="flex items-center gap-1.5 text-muted mb-0.5">
            <Bed size={12} />
            <span className="text-[10px] uppercase">Emergency Beds</span>
          </div>
          <p className="font-bold text-white">{hospital.emergencyBeds}</p>
        </div>
        <div className="rounded-lg bg-navy-secondary/50 p-2.5">
          <div className="flex items-center gap-1.5 text-muted mb-0.5">
            <Heart size={12} />
            <span className="text-[10px] uppercase">ICU Beds</span>
          </div>
          <p className="font-bold text-white">{hospital.icuBeds}</p>
        </div>
        <div className="rounded-lg bg-navy-secondary/50 p-2.5">
          <div className="flex items-center gap-1.5 text-muted mb-0.5">
            <Truck size={12} />
            <span className="text-[10px] uppercase">Ambulances</span>
          </div>
          <p className="font-bold text-white">{hospital.ambulance}</p>
        </div>
        <div className="rounded-lg bg-navy-secondary/50 p-2.5">
          <div className="flex items-center gap-1.5 text-muted mb-0.5">
            <MapPin size={12} />
            <span className="text-[10px] uppercase">Distance</span>
          </div>
          <p className="font-bold text-white">{hospital.distance} km</p>
        </div>
      </div>
    </div>
  );
}

export { HospitalIcon };
