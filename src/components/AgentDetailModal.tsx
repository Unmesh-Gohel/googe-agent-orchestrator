import React, { useState } from 'react';
import { AgentDefinition, AgentId } from '../types/orchestrator';
import {
  X,
  Play,
  Sparkles,
  Cpu,
  Layers,
  CheckCircle2,
  Clock,
  Send,
  Terminal,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { executeAgentTask } from '../services/api';

interface AgentDetailModalProps {
  agent: AgentDefinition | null;
  onClose: () => void;
  onExecutionComplete: (result: any) => void;
}

export const AgentDetailModal: React.FC<AgentDetailModalProps> = ({
  agent,
  onClose,
  onExecutionComplete,
}) => {
  const [customPrompt, setCustomPrompt] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [lastOutput, setLastOutput] = useState<any>(null);

  if (!agent) return null;

  const handleRunTask = async () => {
    setIsRunning(true);
    try {
      const result = await executeAgentTask(agent.id, customPrompt || undefined);
      setLastOutput(result);
      onExecutionComplete(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  const samplePrompts: Record<AgentId, string[]> = {
    gmail: [
      'Parse incoming enterprise consultation email and hand off meeting creation to Calendar Agent',
      'Compose executive response summarizing AI Agent Orchestration framework',
    ],
    calendar: [
      'Find optimal 45m Google Meet slot for Friday and notify Gmail Agent',
      'Resolve scheduling conflict for Multi-Agent Architecture review',
    ],
    news: [
      'Curate top 3 enterprise AI automation developments and calculate viral relevance',
      'Search breaking Google Workspace agent integrations and forward to Sheets',
    ],
    sheets: [
      'Append priority AI topics into editorial roadmap with calculated viral index',
      'Calculate content production velocity and update status to In Production',
    ],
    docs: [
      'Draft 1,400-word enterprise whitepaper on Autonomous Agent Swarms',
      'Synthesize executive summary from Sheets priority backlog',
    ],
    slides: [
      'Build 5-slide briefing deck with speaker notes and visual concept diagrams',
      'Extract key metrics from Docs article for client roadmap presentation',
    ],
    drive: [
      'Organize and index all ecosystem deliverables into /MyDrive/Agent_Orchestrator/',
      'Audit storage quotas and update folder access permissions',
    ],
    vids: [
      'Create 90-second video storyboard with AI Studio scene prompts and timing',
      'Draft dual-speaker voiceover script for multi-agent demonstration',
    ],
    videos: [
      'Package 1080p video asset with chapter timestamps and SEO tags for YouTube',
      'Generate thumbnail prompt concepts and release metadata',
    ],
    youtube_analytics: [
      'Detect audience retention drop-offs and highlight competitor search gaps',
      'Recommend high-growth video topics to inject into News and Sheets agents',
    ],
    ads: [
      'Optimize Google Ads Search bids for Enterprise AI Agent keywords',
      'Generate monthly Ads ROI performance report and save to Google Drive',
    ],
    tasks: [
      'Extract actionable tasks from latest email threads and assign priorities',
      'Synchronize project execution deadlines with Google Calendar Agent',
    ],
    forms: [
      'Generate client intake survey schema for enterprise AI agent requirements',
      'Configure automatic submission ingestion directly into Google Sheets',
    ],
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-mono text-sm font-semibold">
              <Cpu className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-slate-100">
                  {agent.name}
                </h3>
                <span className="text-xs text-slate-400">· {agent.googleService}</span>
              </div>
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <span>{agent.domainLabel}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums text-emerald-400">
                  {agent.successRate}% Success
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums text-slate-300">
                  {agent.avgLatencyMs}ms Latency
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Agent Role & Overview */}
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium block mb-1">
              Operational Scope
            </span>
            <p className="text-sm text-slate-200 leading-relaxed">
              {agent.description}
            </p>
          </div>

          {/* Inter-Agent Handoff Connections */}
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium block mb-2">
              Autonomous Inter-Agent Handoffs
            </span>
            <div className="flex flex-wrap gap-2 text-xs">
              {agent.connectedAgents.map((connId) => (
                <div
                  key={connId}
                  className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 px-2.5 py-1 rounded-lg text-slate-300"
                >
                  <ArrowRight className="w-3 h-3 text-blue-400" />
                  <span className="font-medium text-slate-200 uppercase">
                    {connId} Agent
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* System Instruction (Persona & Constraints) */}
          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 font-mono text-xs text-slate-300">
            <div className="flex items-center gap-2 text-slate-400 text-[11px] uppercase tracking-wider mb-2 font-sans font-medium">
              <Terminal className="w-3.5 h-3.5 text-blue-400" />
              <span>System Prompt & Instruction</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              "{agent.systemInstruction}"
            </p>
          </div>

          {/* Capabilities Grid */}
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium block mb-2">
              Agent Capabilities & Tools
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {agent.capabilities.map((cap, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-2 bg-slate-950/50 border border-slate-800/80 rounded-lg text-slate-300"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{cap}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Direct Manual Dispatcher */}
          <div className="border-t border-slate-800 pt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
                Dispatch Task to {agent.shortName}
              </span>
              <span className="text-[11px] text-blue-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Powered by Gemini 3.8</span>
              </span>
            </div>

            {/* Quick suggested prompt chips */}
            <div className="space-y-1.5 mb-3">
              <span className="text-[11px] text-slate-400">Quick suggestions:</span>
              <div className="flex flex-col gap-1.5">
                {(samplePrompts[agent.id] || []).map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCustomPrompt(sample)}
                    className="text-left text-xs p-2 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-blue-500/50 text-slate-300 hover:text-white transition-colors"
                  >
                    "{sample}"
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder={`Instruct ${agent.shortName} (or leave empty for default operational cycle)...`}
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                disabled={isRunning}
                onClick={handleRunTask}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800/50 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95 shrink-0"
              >
                {isRunning ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Executing...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Dispatch</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Execution Result Preview if ran */}
          {lastOutput && (
            <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-xs space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-emerald-400 font-semibold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Execution Output · {lastOutput.source}</span>
                </span>
                <span className="font-mono tabular-nums text-[11px] text-slate-400">
                  {lastOutput.timestamp}
                </span>
              </div>
              <p className="text-slate-200">{lastOutput.summary}</p>
              {lastOutput.handoffTo && (
                <div className="flex items-center gap-1.5 text-blue-300 pt-1 border-t border-slate-800">
                  <span>Handoff to:</span>
                  <span className="font-semibold uppercase">{lastOutput.handoffTo} Agent</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-slate-400">{lastOutput.handoffPayload}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>Tasks Executed:</span>
            <span className="font-mono tabular-nums text-slate-200">
              {agent.tasksExecuted}
            </span>
            <span aria-hidden="true">·</span>
            <span>Last Active:</span>
            <span className="text-slate-300">{agent.lastActive}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
