'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Play, Pause, RotateCcw, Check, X, Sparkles } from 'lucide-react';
import { IncidentAttachment } from '@/types/incident';

interface VoiceRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAudioRecorded: (attachment: IncidentAttachment, transcriptionText: string) => void;
}

export function VoiceRecorderModal({
  isOpen,
  onClose,
  onAudioRecorded,
}: VoiceRecorderModalProps) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [recorded, setRecorded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (recording) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev >= 60) {
            handleStopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [recording]);

  const handleStartRecording = () => {
    setSeconds(0);
    setRecorded(false);
    setRecording(true);
  };

  const handleStopRecording = () => {
    setRecording(false);
    setRecorded(true);
  };

  const handleReset = () => {
    setRecording(false);
    setRecorded(false);
    setSeconds(0);
    setPlaying(false);
  };

  const handleAttach = () => {
    const attachment: IncidentAttachment = {
      id: `audio-${Date.now()}`,
      type: 'audio',
      url: 'mock://resq/audio-report.m4a',
      name: `Voice-Report-${new Date().toLocaleTimeString().replace(/:/g, '')}.m4a`,
      durationSeconds: seconds || 12,
    };
    const transcription =
      'Emergency reported: Smoke and flames observed near commercial premises. Immediate assistance requested.';
    onAudioRecorded(attachment, transcription);
    onClose();
  };

  if (!isOpen) return null;

  const formatSec = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#12141F] border border-white/[0.1] rounded-2xl shadow-2xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Recommended
            </span>
            <h3 className="text-white font-bold text-base">Voice Emergency Report</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Waveform Visualizer & Timer */}
        <div className="bg-[#090A0F] border border-white/[0.08] rounded-2xl p-6 flex flex-col items-center justify-center space-y-4">
          <div className="text-3xl font-mono font-black text-white tracking-wider">
            {formatSec(seconds)}
          </div>

          {/* Animated audio bar simulation */}
          <div className="flex items-center justify-center gap-1.5 h-12 w-full px-4">
            {[40, 75, 20, 90, 60, 30, 85, 45, 95, 30, 65, 80, 25, 70, 50, 85, 35, 90, 45, 60].map(
              (height, i) => (
                <div
                  key={i}
                  className={`w-1.5 rounded-full transition-all duration-150 ${
                    recording
                      ? 'bg-gradient-to-t from-red-600 to-rose-400 animate-pulse'
                      : recorded
                      ? 'bg-emerald-500'
                      : 'bg-slate-700'
                  }`}
                  style={{
                    height: recording ? `${Math.max(15, Math.round(height * Math.random()))}%` : recorded ? `${height}%` : '20%',
                  }}
                />
              )
            )}
          </div>

          <p className="text-xs text-slate-400 text-center">
            {recording
              ? 'Recording in progress... Speak clearly describing the incident'
              : recorded
              ? 'Recording captured. AI voice transcription ready.'
              : 'Tap the microphone button to start recording (Max 60s)'}
          </p>
        </div>

        {/* Primary Controls */}
        <div className="flex items-center justify-center gap-4">
          {!recording && !recorded && (
            <button
              type="button"
              onClick={handleStartRecording}
              className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-600/40 transition-transform active:scale-95"
              title="Start Recording"
            >
              <Mic className="w-7 h-7" />
            </button>
          )}

          {recording && (
            <button
              type="button"
              onClick={handleStopRecording}
              className="w-16 h-16 rounded-full bg-red-600 animate-pulse text-white flex items-center justify-center shadow-lg shadow-red-600/50 transition-transform active:scale-95"
              title="Stop Recording"
            >
              <Square className="w-7 h-7 fill-white" />
            </button>
          )}

          {recorded && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPlaying(!playing)}
                className="w-12 h-12 rounded-full bg-[#181B2A] border border-white/[0.1] text-white flex items-center justify-center hover:bg-[#202438] transition-colors"
                title={playing ? 'Pause' : 'Playback'}
              >
                {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="w-12 h-12 rounded-full bg-[#181B2A] border border-white/[0.1] text-slate-400 hover:text-white flex items-center justify-center hover:bg-[#202438] transition-colors"
                title="Rerecord"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* AI Voice-to-Text Transcription Preview */}
        {recorded && (
          <div className="bg-[#181B2A] border border-indigo-500/30 rounded-xl p-3.5 space-y-1.5">
            <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Res-Q AI Speech-to-Text</span>
            </div>
            <p className="text-xs text-indigo-100 italic leading-relaxed">
              &quot;Emergency reported: Smoke and flames observed near commercial premises. Immediate assistance requested.&quot;
            </p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          {recorded && (
            <button
              type="button"
              onClick={handleAttach}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl shadow-lg shadow-red-600/30 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Attach Voice Memo</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
