
'use client';

import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapPin, Maximize2, RefreshCw, Crosshair } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import {
  INCIDENT_TYPE_META,
  STATUS_META,
  SEVERITY_META,
  TEAM_STATUS_META,
  CITY_CENTER,
  type Incident,
} from '@/types';

interface LiveMapProps {
  onIncidentClick?: (id: string) => void;
  height?: string;
  showTeams?: boolean;
  showHospitals?: boolean;
  fullscreen?: boolean;
  className?: string;
  userLocation?: { lat: number; lng: number; address?: string; area?: string };
  onLocationSelect?: (coords: { lat: number; lng: number; address?: string; area?: string }) => void;
  showLegend?: boolean;
}

type LeafletApi = typeof import('leaflet');
type LeafletMap = import('leaflet').Map;
type LeafletLayerGroup = import('leaflet').LayerGroup;

function createUserLocationIcon(L: LeafletApi) {
  return L.divIcon({
    className: 'custom-user-marker',
    html: `
      <div style="position:relative;display:flex;align-items:center;justify-content:center;">
        <div class="marker-pulse" style="position:absolute;width:44px;height:44px;border-radius:50%;background:#ef233c;opacity:0.5;"></div>
        <div style="position:relative;width:28px;height:28px;border-radius:50%;background:#ef233c;border:3px solid #ffffff;display:flex;align-items:center;justify-content:center;box-shadow:0 0 16px rgba(239,35,60,0.8);font-size:13px;">
          📍
        </div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -24],
  });
}

function createIncidentIcon(L: LeafletApi, incident: Incident) {
  const typeMeta = INCIDENT_TYPE_META[incident.type] ?? {
    label: incident.type || 'Unknown',
    emoji: '🚨',
    color: '#94A3B8',
  };

  const sevMeta = SEVERITY_META[incident.severity] ?? {
    label: incident.severity || 'Unknown',
    color: '#94A3B8',
    bgColor: '#94A3B820',
    borderColor: '#94A3B8',
  };
  const isResolved = incident.status === 'resolved';
  const pulse = !isResolved && incident.severity === 'critical';

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="position:relative;display:flex;align-items:center;justify-content:center;">
        ${pulse
        ? `<div class="marker-pulse" style="position:absolute;width:36px;height:36px;border-radius:50%;background:${sevMeta.color};"></div>`
        : ''
      }
        <div style="position:relative;width:30px;height:30px;border-radius:50%;background:${isResolved ? '#10B981' : sevMeta.color
      };border:2px solid #fff;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,.4);">
          ${typeMeta.emoji}
        </div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -18],
  });
}

function createTeamIcon(
  L: LeafletApi,
  emoji: string,
  color: string
) {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="position:relative;width:24px;height:24px;border-radius:50%;background:${color};border:2px solid #fff;display:flex;align-items:center;justify-content:center;font-size:11px;box-shadow:0 2px 6px rgba(0,0,0,.4);">
        ${emoji}
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

function createHospitalIcon(L: LeafletApi) {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="width:26px;height:26px;border-radius:6px;background:#102A43;border:2px solid #10B981;display:flex;align-items:center;justify-content:center;font-size:13px;box-shadow:0 2px 6px rgba(0,0,0,.4);">
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
  className = '',
  userLocation,
  onLocationSelect,
  showLegend = true,
}: LiveMapProps) {
  const { incidents, teams, hospitals } = useApp();

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const leafletRef = useRef<LeafletApi | null>(null);

  const markersRef = useRef<LeafletLayerGroup | null>(null);
  const teamMarkersRef = useRef<LeafletLayerGroup | null>(null);
  const hospitalMarkersRef = useRef<LeafletLayerGroup | null>(null);
  const userMarkerRef = useRef<import('leaflet').Marker | null>(null);

  const [mapReady, setMapReady] = useState(false);

  // Leaflet is loaded ONLY in the browser.
  useEffect(() => {
    let cancelled = false;
    let map: LeafletMap | null = null;

    const initializeMap = async () => {
      if (!containerRef.current || mapRef.current) return;

      const leafletModule = await import('leaflet');

      if (cancelled || !containerRef.current || mapRef.current) return;

      const L = (leafletModule.default ?? leafletModule) as LeafletApi;
      leafletRef.current = L;

      map = L.map(containerRef.current, {
        center: [CITY_CENTER.lat, CITY_CENTER.lng],
        zoom: 12,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors',
        }
      ).addTo(map);

      markersRef.current = L.layerGroup().addTo(map);
      teamMarkersRef.current = L.layerGroup().addTo(map);
      hospitalMarkersRef.current = L.layerGroup().addTo(map);

      mapRef.current = map;
      setMapReady(true);

      requestAnimationFrame(() => {
        map?.invalidateSize();
      });
    };

    initializeMap();

    return () => {
      cancelled = true;
      setMapReady(false);

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      markersRef.current = null;
      teamMarkersRef.current = null;
      hospitalMarkersRef.current = null;
      leafletRef.current = null;
    };
  }, []);

  // Incident markers
  useEffect(() => {
    if (
      !mapReady ||
      !mapRef.current ||
      !markersRef.current ||
      !leafletRef.current
    ) {
      return;
    }

    const L = leafletRef.current;
    const layer = markersRef.current;

    layer.clearLayers();

    incidents.forEach((incident) => {
      const coordinates = incident.coordinates;
      if (!coordinates) return;

      const typeMeta = INCIDENT_TYPE_META[incident.type] ?? {
        label: incident.type || 'Unknown',
        emoji: '🚨',
        color: '#94A3B8',
      };

      const statusMeta = STATUS_META[incident.status] ?? {
        label: incident.status?.replace(/-/g, ' ') || 'Unknown',
        color: '#94A3B8',
        dot: '●',
      };

      const severityMeta = SEVERITY_META[incident.severity] ?? {
        label: incident.severity || 'Unknown',
        color: '#94A3B8',
        bgColor: '#94A3B820',
        borderColor: '#94A3B8',
      };

      const marker = L.marker(
        [coordinates.lat, coordinates.lng],
        {
          icon: createIncidentIcon(L, incident),
        }
      );

      marker.bindPopup(`
        <div style="min-width:200px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
            <span style="font-size:18px;">${typeMeta.emoji}</span>
            <div>
              <div style="font-weight:700;color:#fff;font-size:13px;">
                INCIDENT #${incident.id}
              </div>
              <div style="color:#94A3B8;font-size:11px;">
                ${typeMeta.label}
              </div>
            </div>
          </div>

          <div style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:700;color:${severityMeta.color};background:${severityMeta.bgColor};border:1px solid ${severityMeta.borderColor};margin-bottom:6px;">
            ${severityMeta.label} · ${incident.score}/100
          </div>

          <div style="color:#fff;font-size:12px;margin-bottom:4px;">
            📍 ${incident.location}
          </div>

          <div style="color:#94A3B8;font-size:11px;margin-bottom:4px;">
            👥 ${incident.peopleAffected} people affected
          </div>

          ${incident.assignedTeamss.length > 0
          ? `<div style="color:#94A3B8;font-size:11px;margin-bottom:4px;">
                   🚒 ${incident.assignedTeamss.length} team(s) dispatched
                 </div>`
          : ''
        }

          <div style="color:${statusMeta.color};font-size:11px;font-weight:600;margin-bottom:8px;">
            ● ${statusMeta.label}
          </div>
        </div>
      `);

      // Avoid inline window.__... handlers. Leaflet owns the event.
      if (onIncidentClick) {
        marker.on('popupopen', () => {
          // The popup itself stays safe and server-independent.
        });

        marker.on('click', () => {
          onIncidentClick(incident.id);
        });
      }

      layer.addLayer(marker);
    });
  }, [incidents, onIncidentClick, mapReady]);

  // Team markers
  useEffect(() => {
    if (
      !mapReady ||
      !mapRef.current ||
      !teamMarkersRef.current ||
      !leafletRef.current
    ) {
      return;
    }

    const layer = teamMarkersRef.current;

    layer.clearLayers();

    if (!showTeams) return;

    const L = leafletRef.current;

    teams.forEach((team) => {
      if (team.status === 'offline') return;

      const meta = TEAM_STATUS_META[team.status];

      const emoji =
        team.type === 'fire'
          ? '🚒'
          : team.type === 'medical'
            ? '🚑'
            : team.type === 'chemical'
              ? '☣'
              : team.type === 'flood'
                ? '🚤'
                : '🚗';

      const marker = L.marker(
        [team.coordinates.lat, team.coordinates.lng],
        {
          icon: createTeamIcon(L, emoji, meta.color),
        }
      );

      marker.bindPopup(`
        <div style="min-width:160px;">
          <div style="font-weight:700;color:#fff;font-size:13px;">
            ${team.name}
          </div>

          <div style="color:#94A3B8;font-size:11px;margin-top:2px;">
            🚗 ${team.vehicle}
          </div>

          <div style="color:${meta.color};font-size:11px;font-weight:600;margin-top:4px;">
            ● ${meta.label}
          </div>

          ${team.eta
          ? `<div style="color:#94A3B8;font-size:11px;margin-top:2px;">
                   ETA: ${team.eta} min
                 </div>`
          : ''
        }

          ${team.destination
          ? `<div style="color:#94A3B8;font-size:11px;">
                   → ${team.destination}
                 </div>`
          : ''
        }
        </div>
      `);

      layer.addLayer(marker);
    });
  }, [teams, showTeams, mapReady]);

  // Hospital markers
  useEffect(() => {
    if (
      !mapReady ||
      !mapRef.current ||
      !hospitalMarkersRef.current ||
      !leafletRef.current
    ) {
      return;
    }

    const layer = hospitalMarkersRef.current;

    layer.clearLayers();

    if (!showHospitals) return;

    const L = leafletRef.current;

    hospitals.forEach((hospital) => {
      const marker = L.marker(
        [hospital.coordinates.lat, hospital.coordinates.lng],
        {
          icon: createHospitalIcon(L),
        }
      );

      const statusColor =
        hospital.status === 'available'
          ? '#10B981'
          : hospital.status === 'busy'
            ? '#F59E0B'
            : '#EF233C';

      marker.bindPopup(`
        <div style="min-width:160px;">
          <div style="font-weight:700;color:#fff;font-size:13px;">
            🏥 ${hospital.name}
          </div>

          <div style="color:#94A3B8;font-size:11px;margin-top:2px;">
            📍 ${hospital.location}
          </div>

          <div style="color:#fff;font-size:11px;margin-top:4px;">
            Emergency Beds: ${hospital.emergencyBeds}
          </div>

          <div style="color:#fff;font-size:11px;">
            ICU: ${hospital.icuBeds}
          </div>

          <div style="color:${statusColor};font-size:11px;font-weight:600;margin-top:4px;">
            ${hospital.status.toUpperCase()}
          </div>
        </div>
      `);

      layer.addLayer(marker);
    });
  }, [hospitals, showHospitals, mapReady]);

  // User Location marker (pulsing pin for citizen location)
  useEffect(() => {
    if (!mapReady || !mapRef.current || !leafletRef.current) return;
    const L = leafletRef.current;
    const map = mapRef.current;

    if (userLocation) {
      if (!userMarkerRef.current) {
        const marker = L.marker([userLocation.lat, userLocation.lng], {
          icon: createUserLocationIcon(L),
          zIndexOffset: 1200,
        });
        marker.bindPopup(`
          <div style="min-width:180px;padding:3px 0;">
            <div style="font-weight:700;color:#fff;font-size:13px;margin-bottom:3px;">📍 Your Location</div>
            <div style="color:#CBD5E1;font-size:11px;margin-bottom:4px;">${userLocation.address || 'Ahmedabad, Gujarat'}</div>
            <div style="color:#94A3B8;font-size:10px;font-family:monospace;">Lat: ${userLocation.lat.toFixed(4)}, Lng: ${userLocation.lng.toFixed(4)}</div>
          </div>
        `);
        marker.addTo(map);
        userMarkerRef.current = marker;
      } else {
        userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
        userMarkerRef.current.setPopupContent(`
          <div style="min-width:180px;padding:3px 0;">
            <div style="font-weight:700;color:#fff;font-size:13px;margin-bottom:3px;">📍 Your Location</div>
            <div style="color:#CBD5E1;font-size:11px;margin-bottom:4px;">${userLocation.address || 'Ahmedabad, Gujarat'}</div>
            <div style="color:#94A3B8;font-size:10px;font-family:monospace;">Lat: ${userLocation.lat.toFixed(4)}, Lng: ${userLocation.lng.toFixed(4)}</div>
          </div>
        `);
      }
    } else if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }
  }, [hospitals, showHospitals, mapReady, userLocation]);

  // Click on map to select location
  useEffect(() => {
    if (!mapReady || !mapRef.current || !onLocationSelect) return;
    const map = mapRef.current;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleMapClick = (e: any) => {
      const lat = Number(e.latlng.lat.toFixed(4));
      const lng = Number(e.latlng.lng.toFixed(4));
      const area = 'SG Highway';
      const address = `SG Highway, Bodakdev, Ahmedabad, Gujarat`;
      onLocationSelect({ lat, lng, area, address });
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [mapReady, onLocationSelect]);

  const handleLocate = () => {
    if (!navigator.geolocation || !mapRef.current) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        mapRef.current?.setView(
          [position.coords.latitude, position.coords.longitude],
          14
        );
      },
      () => {
        mapRef.current?.setView(
          [CITY_CENTER.lat, CITY_CENTER.lng],
          13
        );
      }
    );
  };

  const handleRefresh = () => {
    mapRef.current?.invalidateSize();
  };

  const handleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await containerRef.current.requestFullscreen?.();
      }

      setTimeout(() => {
        mapRef.current?.invalidateSize();
      }, 150);
    } catch {
      // Fullscreen can be blocked by browser permissions.
    }
  };

  return (
    <div
      className={`isolate relative z-0 overflow-hidden rounded-xl border border-navy-border ${className}`}
      style={{ height }}
    >
      <div ref={containerRef} className="h-full w-full" />

      <div className="absolute right-3 top-3 z-10 flex flex-col gap-1.5">
        <button
          type="button"
          onClick={handleLocate}
          title="Locate me"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-navy-border bg-navy-card/90 text-secondary shadow-lg backdrop-blur transition-colors hover:text-white"
        >
          <Crosshair size={16} />
        </button>

        <button
          type="button"
          onClick={handleRefresh}
          title="Refresh map"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-navy-border bg-navy-card/90 text-secondary shadow-lg backdrop-blur transition-colors hover:text-white"
        >
          <RefreshCw size={16} />
        </button>

        <button
          type="button"
          onClick={handleFullscreen}
          title="Fullscreen"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-navy-border bg-navy-card/90 text-secondary shadow-lg backdrop-blur transition-colors hover:text-white"
        >
          <Maximize2 size={16} />
        </button>
      </div>

      {showLegend && (
        <div className="absolute bottom-3 left-3 z-10 flex flex-wrap gap-2 rounded-lg border border-navy-border bg-navy-card/90 px-3 py-2 shadow-lg backdrop-blur">
          <span className="flex items-center gap-1 text-[10px] text-secondary">
            <span className="h-2.5 w-2.5 rounded-full bg-emergency-critical" />
            Critical
          </span>

          <span className="flex items-center gap-1 text-[10px] text-secondary">
            <span className="h-2.5 w-2.5 rounded-full bg-warning" />
            High
          </span>

          <span className="flex items-center gap-1 text-[10px] text-secondary">
            <span className="h-2.5 w-2.5 rounded-full bg-warning" />
            Medium
          </span>

          <span className="flex items-center gap-1 text-[10px] text-secondary">
            <span className="h-2.5 w-2.5 rounded-full bg-royal" />
            Low
          </span>

          <span className="flex items-center gap-1 text-[10px] text-secondary">
            <span className="h-2.5 w-2.5 rounded-full bg-response" />
            Resolved
          </span>
        </div>
      )}
    </div>
  );
}

export { MapPin };
