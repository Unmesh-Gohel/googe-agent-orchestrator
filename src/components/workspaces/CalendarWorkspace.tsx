import React, { useState } from 'react';
import { CalendarArtifact } from '../../types/orchestrator';
import {
  Calendar as CalendarIcon,
  Video,
  Clock,
  Users,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Plus,
} from 'lucide-react';
import { executeAgentTask } from '../../services/api';

interface CalendarWorkspaceProps {
  events: CalendarArtifact[];
  onAddEvent: (event: CalendarArtifact) => void;
}

export const CalendarWorkspace: React.FC<CalendarWorkspaceProps> = ({
  events,
  onAddEvent,
}) => {
  const [isBooking, setIsBooking] = useState(false);

  const handleBookSession = async () => {
    setIsBooking(true);
    const newEvent: CalendarArtifact = {
      id: `cal-${Date.now()}`,
      title: 'Google Agent Orchestrator - Enterprise Demo & Q&A',
      time: 'Tuesday, Oct 9, 2026 · 3:00 PM - 3:45 PM PDT',
      duration: '45 mins',
      meetLink: 'https://meet.google.com/ais-demo-live',
      attendees: ['alex.vance@autonomous-ai.org', 'team@google-orchestrator.internal'],
      notes:
        'Demonstrating Gmail-to-Calendar handoffs, Google Drive storage management, and live Ads reporting.',
      status: 'confirmed',
    };
    onAddEvent(newEvent);

    await executeAgentTask(
      'calendar',
      'Schedule 45m Google Meet demo for Alex Vance and dispatch confirmation link to Gmail Agent',
      { event: newEvent }
    );
    setIsBooking(false);
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 flex flex-col gap-6 shadow-xl">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <CalendarIcon className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-100 tracking-tight">
              Google Calendar Agent Workspace
            </h2>
            <p className="text-xs text-slate-400">
              Autonomous schedule coordination, Google Meet generation, and calendar conflict resolution
            </p>
          </div>
        </div>

        <button
          disabled={isBooking}
          onClick={handleBookSession}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-md active:scale-95"
        >
          {isBooking ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>Securing Slot...</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule Next Google Meet Session</span>
            </>
          )}
        </button>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold uppercase tracking-wider">
            Confirmed Calendar Meetings ({events.length})
          </span>
          <span className="text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>0 Conflicts Detected</span>
          </span>
        </div>

        {events.map((event) => (
          <div
            key={event.id}
            className="p-5 bg-slate-950/60 rounded-xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-100">
                  {event.title}
                </h3>
                <span className="text-[11px] font-mono text-emerald-400 uppercase">
                  · {event.status}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  <span className="font-mono tabular-nums">{event.time}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  <span>{event.attendees.length} Attendees</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                {event.notes}
              </p>

              <div className="text-[11px] text-slate-500 flex items-center gap-1 flex-wrap">
                <span>Attendees:</span>
                {event.attendees.map((att, i) => (
                  <span key={i} className="text-slate-400 font-mono">
                    {att}
                    {i < event.attendees.length - 1 ? ' · ' : ''}
                  </span>
                ))}
              </div>
            </div>

            {/* Meet Link CTA */}
            <div className="shrink-0 flex items-center gap-3">
              <a
                href={event.meetLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-4 py-2 rounded-lg border border-slate-700 transition-colors"
              >
                <Video className="w-4 h-4 text-emerald-400" />
                <span>Join Google Meet</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
