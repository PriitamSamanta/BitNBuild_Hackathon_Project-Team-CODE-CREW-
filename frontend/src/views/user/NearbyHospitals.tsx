'use client';

import { useState } from 'react';
import { Bed, Heart, Truck, MapPin, Search, PhoneCall, Navigation } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export function NearbyHospitals() {
  const { hospitals } = useApp();
  const [search, setSearch] = useState('');

  const filtered = hospitals.filter(
    (h) =>
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Emergency Hospitals &amp; Services</h2>
          <p className="text-sm text-secondary mt-0.5">
            {hospitals.length} certified emergency trauma facilities with live bed availability.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search hospitals or areas..."
            className="w-full rounded-xl border border-navy-border bg-navy-card py-2 pl-9 pr-3 text-xs text-white placeholder:text-muted focus:border-royal focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((hospital) => {
          const statusColor =
            hospital.status === 'available'
              ? '#10B981'
              : hospital.status === 'busy'
                ? '#F59E0B'
                : '#EF233C';

          return (
            <div
              key={hospital.id}
              className="rounded-2xl border border-navy-border bg-navy-card p-5 space-y-4 shadow-lg hover:border-white/20 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-response/15 text-xl">
                      🏥
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white leading-snug">{hospital.name}</h3>
                      <p className="text-[11px] text-secondary flex items-center gap-1 mt-0.5">
                        <MapPin size={11} className="text-muted shrink-0" />
                        <span>{hospital.location}</span>
                      </p>
                    </div>
                  </div>

                  <span
                    className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase shrink-0"
                    style={{ color: statusColor, backgroundColor: `${statusColor}20` }}
                  >
                    {hospital.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl bg-navy-secondary/60 p-2.5 space-y-0.5">
                    <div className="flex items-center gap-1 text-muted text-[10px] uppercase">
                      <Bed size={12} />
                      <span>Emergency Beds</span>
                    </div>
                    <p className="text-base font-extrabold text-white">{hospital.emergencyBeds}</p>
                  </div>

                  <div className="rounded-xl bg-navy-secondary/60 p-2.5 space-y-0.5">
                    <div className="flex items-center gap-1 text-muted text-[10px] uppercase">
                      <Heart size={12} />
                      <span>ICU Capacity</span>
                    </div>
                    <p className="text-base font-extrabold text-white">{hospital.icuBeds}</p>
                  </div>

                  <div className="rounded-xl bg-navy-secondary/60 p-2.5 space-y-0.5">
                    <div className="flex items-center gap-1 text-muted text-[10px] uppercase">
                      <Truck size={12} />
                      <span>Ambulances</span>
                    </div>
                    <p className="text-base font-extrabold text-white">{hospital.ambulance}</p>
                  </div>

                  <div className="rounded-xl bg-navy-secondary/60 p-2.5 space-y-0.5">
                    <div className="flex items-center gap-1 text-muted text-[10px] uppercase">
                      <Navigation size={12} />
                      <span>Distance</span>
                    </div>
                    <p className="text-base font-extrabold text-royal">{hospital.distance} km</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2 border-t border-navy-border/50">
                <a
                  href={`tel:108`}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-royal/15 hover:bg-royal/25 text-royal py-2 text-xs font-bold transition-colors"
                >
                  <PhoneCall size={13} />
                  <span>Call Emergency Desk</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
