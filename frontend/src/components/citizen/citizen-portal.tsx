'use client';

import React, { useState } from 'react';
import { CitizenHeader } from './citizen-header';
import { CitizenSidebar } from './citizen-sidebar';
import { ReportForm } from './report-form';
import { ContextMap } from './context-map';
import { SafetyTipsPanel } from './safety-tips-panel';
import { EmergencyCallModal } from './emergency-call-modal';
import { TrackReportModal } from './track-report-modal';
import { EmergencyContactsView } from './emergency-contacts-view';
import { HowItWorksView } from './how-it-works-view';
import { HelpSupportView } from './help-support-view';
import { LocationCoordinates } from '@/types/incident';

export function CitizenPortal() {
  const [currentSection, setCurrentSection] = useState<string>('report');
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [trackingCodeToLookup, setTrackingCodeToLookup] = useState('');

  // Default Ahmedabad coordinates matching Image 1
  const [currentLocation, setCurrentLocation] = useState<LocationCoordinates>({
    lat: 23.0225,
    lng: 72.5714,
    area: 'SG Highway',
    address: 'SG Highway, Bodakdev, Ahmedabad, Gujarat',
  });

  const handleTrackIncident = (code: string) => {
    setTrackingCodeToLookup(code);
    setIsTrackModalOpen(true);
  };

  const handleSidebarSelect = (sectionId: string) => {
    if (sectionId === 'track') {
      setIsTrackModalOpen(true);
    } else {
      setCurrentSection(sectionId);
    }
  };

  const handleHeaderTab = (tab: string) => {
    if (tab === 'track') {
      setIsTrackModalOpen(true);
    } else if (tab === 'safety') {
      setCurrentSection('safety');
    } else if (tab === 'home' || tab === 'report') {
      setCurrentSection('report');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090A0F] text-slate-100 selection:bg-red-500 selection:text-white">
      {/* 1. Top Header matching Image 1 */}
      <CitizenHeader
        activeTab={currentSection === 'report' ? 'report' : currentSection}
        onTabChange={handleHeaderTab}
        onEmergencyClick={() => setIsEmergencyModalOpen(true)}
      />

      {/* 2. Main Body with Sticky Left Sidebar & Smooth Page Scroll */}
      <div className="flex-1 flex w-full max-w-[1720px] mx-auto items-start">
        {/* Left Sidebar matching Image 1 */}
        <CitizenSidebar
          currentSection={currentSection}
          onSelectSection={handleSidebarSelect}
          className="hidden md:flex sticky top-[69px] h-[calc(100vh-69px)] overflow-y-auto shrink-0"
        />

        {/* Main Content Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {currentSection === 'report' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
              {/* Left Form Canvas (approx 60% / 7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                <ReportForm
                  currentLocation={currentLocation}
                  onLocationChange={setCurrentLocation}
                  onTrackIncident={handleTrackIncident}
                />
              </div>

              {/* Right Context Canvas (approx 40% / 5 cols) */}
              <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-[85px]">
                <ContextMap
                  currentLocation={currentLocation}
                  onLocationChange={setCurrentLocation}
                />
                <SafetyTipsPanel
                  onOpenEmergencyCall={() => setIsEmergencyModalOpen(true)}
                />
              </div>
            </div>
          )}

          {currentSection === 'safety' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-8">
                <SafetyTipsPanel
                  onOpenEmergencyCall={() => setIsEmergencyModalOpen(true)}
                />
              </div>
              <div className="lg:col-span-4">
                <ContextMap
                  currentLocation={currentLocation}
                  onLocationChange={setCurrentLocation}
                />
              </div>
            </div>
          )}

          {currentSection === 'contacts' && (
            <div className="max-w-4xl mx-auto">
              <EmergencyContactsView
                onCallInitiate={(num) => {
                  window.location.href = `tel:${num}`;
                }}
              />
            </div>
          )}

          {currentSection === 'how-it-works' && (
            <div className="max-w-4xl mx-auto">
              <HowItWorksView onStartReporting={() => setCurrentSection('report')} />
            </div>
          )}

          {currentSection === 'support' && (
            <div className="max-w-4xl mx-auto">
              <HelpSupportView />
            </div>
          )}
        </main>
      </div>

      {/* Global Modals */}
      <EmergencyCallModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        userLocation={currentLocation}
      />

      <TrackReportModal
        isOpen={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
        initialTrackingCode={trackingCodeToLookup}
      />
    </div>
  );
}
