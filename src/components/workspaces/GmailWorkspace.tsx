import React, { useState } from 'react';
import { EmailArtifact } from '../../types/orchestrator';
import {
  Mail,
  Send,
  Calendar,
  CheckCircle2,
  Sparkles,
  Inbox,
  ArrowRight,
  User,
  Clock,
} from 'lucide-react';
import { executeAgentTask } from '../../services/api';

interface GmailWorkspaceProps {
  emails: EmailArtifact[];
  onTriggerCalendarHandoff: (email: EmailArtifact) => void;
  onNewEmail: (email: EmailArtifact) => void;
}

export const GmailWorkspace: React.FC<GmailWorkspaceProps> = ({
  emails,
  onTriggerCalendarHandoff,
  onNewEmail,
}) => {
  const [selectedEmailId, setSelectedEmailId] = useState<string>(emails[0]?.id || '');
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedEmail = emails.find((e) => e.id === selectedEmailId) || emails[0];

  const handleSimulateInbound = async () => {
    setIsProcessing(true);
    const newInbound: EmailArtifact = {
      id: `email-${Date.now()}`,
      from: 'alex.vance@autonomous-ai.org',
      to: 'team@google-orchestrator.internal',
      subject: 'Inquiry: Deploying Agent Orchestrator for 500-person Engineering Team',
      date: 'Just now',
      body: `Hi Google Agent Team,\n\nWe have reviewed your multi-agent architecture and would love to schedule a working session next Tuesday at 3:00 PM PST.\n\nOur team is eager to see the Gmail-to-Calendar handoff and automated Sheets tracking live.\n\nBest regards,\nAlex Vance\nHead of Engineering, Autonomous AI`,
      status: 'received',
      handoffTriggered: false,
    };
    onNewEmail(newInbound);
    setSelectedEmailId(newInbound.id);

    // Run Gmail agent with Gemini or fallback
    await executeAgentTask(
      'gmail',
      'Parse inbound meeting request and hand off scheduling to Calendar Agent',
      { email: newInbound }
    );
    setIsProcessing(false);
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 flex flex-col gap-6 shadow-xl">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Mail className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-100 tracking-tight">
              Google Gmail Agent Workspace
            </h2>
            <p className="text-xs text-slate-400">
              Inbound parsing, automated meeting extraction, and zero-latency Calendar Agent handoffs
            </p>
          </div>
        </div>

        <button
          disabled={isProcessing}
          onClick={handleSimulateInbound}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-md active:scale-95"
        >
          {isProcessing ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>Parsing Email...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulate Inbound Client Email</span>
            </>
          )}
        </button>
      </div>

      {/* Two-Column Gmail Interface */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Email Threads List */}
        <div className="space-y-2 border-r border-slate-800/80 pr-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
            <span>Inbox ({emails.length})</span>
            <span className="text-[11px] text-emerald-400">Synced</span>
          </div>

          {emails.map((email) => {
            const isSelected = email.id === selectedEmail?.id;
            return (
              <div
                key={email.id}
                onClick={() => setSelectedEmailId(email.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all duration-150 ${
                  isSelected
                    ? 'bg-blue-950/40 border-blue-500/60 shadow-sm'
                    : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span className="font-semibold text-slate-200 truncate max-w-[140px]">
                    {email.from.split('@')[0]}
                  </span>
                  <span className="font-mono tabular-nums">{email.date}</span>
                </div>
                <div className="text-xs font-medium text-slate-100 truncate mb-1">
                  {email.subject}
                </div>
                <div className="text-[11px] text-slate-400 line-clamp-1">
                  {email.body}
                </div>
                {email.handoffTriggered && (
                  <div className="mt-2 text-[10px] text-blue-400 flex items-center gap-1 font-mono">
                    <CheckCircle2 className="w-3 h-3 text-blue-400" />
                    <span>Handoff to Calendar Triggered</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Email Detail View */}
        {selectedEmail ? (
          <div className="md:col-span-2 flex flex-col justify-between bg-slate-950/60 rounded-xl border border-slate-800 p-5 space-y-4">
            <div>
              {/* Email Meta Header */}
              <div className="border-b border-slate-800 pb-3 mb-4">
                <h3 className="text-sm font-semibold text-slate-100 mb-2">
                  {selectedEmail.subject}
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                  <div>
                    <span className="text-slate-500">From: </span>
                    <span className="text-slate-200">{selectedEmail.from}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500">Date: </span>
                    <span className="text-slate-200">{selectedEmail.date}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">To: </span>
                    <span className="text-slate-200">{selectedEmail.to}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500">Status: </span>
                    <span className="text-emerald-400 capitalize">{selectedEmail.status}</span>
                  </div>
                </div>
              </div>

              {/* Email Body */}
              <div className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                {selectedEmail.body}
              </div>
            </div>

            {/* Agent Action Banner */}
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center justify-between gap-4 mt-6">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span>
                  Meeting intent detected in email body. Delegate to Google Calendar Agent?
                </span>
              </div>
              <button
                onClick={() => onTriggerCalendarHandoff(selectedEmail)}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-sm shrink-0"
              >
                <span>Handoff to Calendar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="md:col-span-2 flex items-center justify-center p-12 text-xs text-slate-400">
            Select an email thread from the inbox.
          </div>
        )}
      </div>
    </div>
  );
};
