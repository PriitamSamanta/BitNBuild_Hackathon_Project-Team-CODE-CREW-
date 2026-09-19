import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { MapPin, Maximize2, RefreshCw, Crosshair } from 'lucide-react';
import { useApp } from '@/src/context/AppContext';
import {
  INCIDENT_TYPE_META,
  STATUS_META,
  SEVERITY_META,
  TEAM_STATUS_META,
  CITY_CENTER,
  type Incident,
  type Coordinates,
} from '@/src/types';

interface LiveMapProps {
  onIncidentClick?: (id: string) => void;
  height?: string;
  showTeams?: boolean;
  showHospitals?: boolean;
  fullscreen?: boolean;
  className?: string;
}

function createIncidentIcon(incident: Incident): L.DivIcon {
  const typeMeta = INCIDENT_TYPE_META[incident.type];
  const sevMeta = SEVERITY_META[incident.severity];
  const isResolved = incident.status === 'resolved';
  const pulse = !isResolved && incident.severity === 'critical';

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center;">
        ${pulse ? `<div class="marker-pulse" style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: ${sevMeta.color};"></div>` : ''}
        <div style="position: relative; width: 30px; height: 30px; border-radius: 50%; background: ${isResolved ? '#10B981' : sevMeta.color}; border: 2px solid #fff; display: flex; align-items: center; justify-content: center; font-size: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.4);">
          ${typeMeta.emoji}
        </div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -18],
  });
}

function createTeamIcon(emoji: string, color: string): L.DivIcon {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="position: relative; width: 24px; height: 24px; border-radius: 50%; background: ${color}; border: 2px solid #fff; display: flex; align-items: center; justify-content: center; font-size: 11px; box-shadow: 0 2px 6px rgba(0,0,0,0.4);">
        ${emoji}
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

function createHospitalIcon(): L.DivIcon {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="width: 26px; height: 26px; border-radius: 6px; background: #102A43; border: 2px solid #10B981; display: flex; align-items: center; justify-content: center; font-size: 13px; box-shadow: 0 2px 6px rgba(0,0,0,0.4);">
        🏥
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

export function LiveMap({
  onIncidentClick,
  height = '400px',
  showTeams = true,
  showHospitals = true,
  fullscreen = false,
  className = '',
}: LiveMapProps) {
  const { incidents, teams, hospitals } = useApp();
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);
  const teamMarkersRef = useRef<L.LayerGroup | null>(null);
  const hospitalMarkersRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [CITY_CENTER.lat, CITY_CENTER.lng],
      zoom: 12,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    markersRef.current = L.layerGroup().addTo(map);
    teamMarkersRef.current = L.layerGroup().addTo(map);
    hospitalMarkersRef.current = L.layerGroup().addTo(map);

    mapRef.current = map;

    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !markersRef.current) return;
    markersRef.current.clearLayers();

    incidents.filter((incident) => incident.coordinates).forEach((incident) => {
      const typeMeta = INCIDENT_TYPE_META[incident.type];
      const statusMeta = STATUS_META[incident.status];
      const marker = L.marker([incident.coordinates.lat, incident.coordinates.lng], {
        icon: createIncidentIcon(incident),
      });

      marker.bindPopup(`
        <div style="min-width: 200px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <span style="font-size: 18px;">${typeMeta.emoji}</span>
            <div>
              <div style="font-weight: 700; color: #fff; font-size: 13px;">INCIDENT #${incident.id}</div>
              <div style="color: #94A3B8; font-size: 11px;">${typeMeta.label}</div>
            </div>
          </div>
          <div style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; color: ${SEVERITY_META[incident.severity].color}; background: ${SEVERITY_META[incident.severity].bgColor}; border: 1px solid ${SEVERITY_META[incident.severity].borderColor}; margin-bottom: 6px;">
            ${SEVERITY_META[incident.severity].label} · ${incident.score}/100
          </div>
          <div style="color: #fff; font-size: 12px; margin-bottom: 4px;">📍 ${incident.location}</div>
          <div style="color: #94A3B8; font-size: 11px; margin-bottom: 4px;">👥 ${incident.peopleAffected} people affected</div>
          ${incident.assignedTeams.length > 0 ? `<div style="color: #94A3B8; font-size: 11px; margin-bottom: 4px;">🚒 ${incident.assignedTeams.length} team(s) dispatched</div>` : ''}
          <div style="color: ${statusMeta.color}; font-size: 11px; font-weight: 600; margin-bottom: 8px;">${statusMeta.dot} ${statusMeta.label}</div>
          ${onIncidentClick ? `<button onclick="window.__resq_open_incident('${incident.id}')" style="width: 100%; padding: 6px 12px; border-radius: 8px; background: #E63946; color: #fff; font-size: 12px; font-weight: 700; border: none; cursor: pointer;">VIEW INCIDENT</button>` : ''}
        </div>
      `);

      markersRef.current!.addLayer(marker);
    });
  }, [incidents, onIncidentClick]);

  useEffect(() => {
    if (!mapRef.current || !teamMarkersRef.current || !showTeams) return;
    teamMarkersRef.current.clearLayers();

    teams.forEach((team) => {
      if (team.status === 'offline') return;
      const meta = TEAM_STATUS_META[team.status];
      const emoji =
        team.type === 'fire' ? '🚒' :
        team.type === 'medical' ? '🚑' :
        team.type === 'chemical' ? '☣' :
        team.type === 'flood' ? '🚤' : '🚗';
      const marker = L.marker([team.coordinates.lat, team.coordinates.lng], {
        icon: createTeamIcon(emoji, meta.color),
      });
      marker.bindPopup(`
        <div style="min-width: 160px;">
          <div style="font-weight: 700; color: #fff; font-size: 13px;">${team.name}</div>
          <div style="color: #94A3B8; font-size: 11px; margin-top: 2px;">🚗 ${team.vehicle}</div>
          <div style="color: ${meta.color}; font-size: 11px; font-weight: 600; margin-top: 4px;">${meta.dot} ${meta.label}</div>
          ${team.eta ? `<div style="color: #94A3B8; font-size: 11px; margin-top: 2px;">ETA: ${team.eta} min</div>` : ''}
          ${team.destination ? `<div style="color: #94A3B8; font-size: 11px;">→ ${team.destination}</div>` : ''}
        </div>
      `);
      teamMarkersRef.current!.addLayer(marker);
    });
  }, [teams, showTeams]);

  useEffect(() => {
    if (!mapRef.current || !hospitalMarkersRef.current || !showHospitals) return;
    hospitalMarkersRef.current.clearLayers();

    hospitals.forEach((h) => {
      const marker = L.marker([h.coordinates.lat, h.coordinates.lng], {
        icon: createHospitalIcon(),
      });
      marker.bindPopup(`
        <div style="min-width: 160px;">
          <div style="font-weight: 700; color: #fff; font-size: 13px;">🏥 ${h.name}</div>
          <div style="color: #94A3B8; font-size: 11px; margin-top: 2px;">📍 ${h.location}</div>
          <div style="color: #fff; font-size: 11px; margin-top: 4px;">Emergency Beds: ${h.emergencyBeds}</div>
          <div style="color: #fff; font-size: 11px;">ICU: ${h.icuBeds}</div>
          <div style="color: ${h.status === 'available' ? '#10B981' : h.status === 'busy' ? '#F59E0B' : '#EF233C'}; font-size: 11px; font-weight: 600; margin-top: 4px;">${h.status.toUpperCase()}</div>
        </div>
      `);
      hospitalMarkersRef.current!.addLayer(marker);
    });
  }, [hospitals, showHospitals]);

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        mapRef.current?.setView([pos.coords.latitude, pos.coords.longitude], 14);
      },
      () => {
        mapRef.current?.setView([CITY_CENTER.lat, CITY_CENTER.lng], 13);
      },
    );
  };

  const handleRefresh = () => {
    mapRef.current?.invalidateSize();
  };

  const handleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen?.();
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-navy-border ${className}`}
      style={{ height }}
    >
      <div ref={containerRef} className="h-full w-full" />

      <div className="absolute right-3 top-3 z-[500] flex flex-col gap-1.5">
        <button
          onClick={handleLocate}
          title="Locate me"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-navy-border bg-navy-card/90 text-secondary shadow-lg backdrop-blur transition-colors hover:text-white"
        >
          <Crosshair size={16} />
        </button>
        <button
          onClick={handleRefresh}
          title="Refresh"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-navy-border bg-navy-card/90 text-secondary shadow-lg backdrop-blur transition-colors hover:text-white"
        >
          <RefreshCw size={16} />
        </button>
        <button
          onClick={handleFullscreen}
          title="Fullscreen"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-navy-border bg-navy-card/90 text-secondary shadow-lg backdrop-blur transition-colors hover:text-white"
        >
          <Maximize2 size={16} />
        </button>
      </div>

      <div className="absolute bottom-3 left-3 z-[500] flex flex-wrap gap-2 rounded-lg border border-navy-border bg-navy-card/90 px-3 py-2 shadow-lg backdrop-blur">
        <span className="flex items-center gap-1 text-[10px] text-secondary">
          <span className="h-2.5 w-2.5 rounded-full bg-emergency-critical" /> Critical
        </span>
        <span className="flex items-center gap-1 text-[10px] text-secondary">
          <span className="h-2.5 w-2.5 rounded-full bg-warning" /> High
        </span>
        <span className="flex items-center gap-1 text-[10px] text-secondary">
          <span className="h-2.5 w-2.5 rounded-full bg-warning" /> Medium
        </span>
        <span className="flex items-center gap-1 text-[10px] text-secondary">
          <span className="h-2.5 w-2.5 rounded-full bg-royal" /> Low
        </span>
        <span className="flex items-center gap-1 text-[10px] text-secondary">
          <span className="h-2.5 w-2.5 rounded-full bg-response" /> Resolved
        </span>
      </div>
    </div>
  );
}

export { MapPin };
