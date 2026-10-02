import React, { useState, useEffect } from 'react';
import {
  Brain,
  Sparkles,
  Play,
  CheckCircle2,
  AlertCircle,
  Send,
  Zap,
  ArrowRight,
  RefreshCw,
  Cpu,
  Layers,
  Terminal,
} from 'lucide-react';
import { fetchAiAnalysis, executeAiCommand } from '../services/api';
import { AgentId } from '../types/orchestrator';

interface AiMasterOrchestratorProps {
  ecosystemSummary: any;
  onExecuteAgentTask: (agentId: AgentId, prompt: string) => Promise<void>;
  onShowToast: (msg: string) => void;
}

export const AiMasterOrchestrator: React.FC<AiMasterOrchestratorProps> = ({
  ecosystemSummary,
  onExecuteAgentTask,
  onShowToast,
}) => {
  const [analysis, setAnalysis] = useState<any>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [commandInput, setCommandInput] = useState('');
  const [isExecutingCommand, setIsExecutingCommand] = useState(false);
  const [commandResult, setCommandResult] = useState<any>(null);
  const [executingActionId, setExecutingActionId] = useState<string | null>(null);

  const loadAnalysis = async () => {
    setIsLoadingAnalysis(true);
    try {
      const res = await fetchAiAnalysis(ecosystemSummary);
      setAnalysis(res);
    } catch (err) {
      console.warn(err);
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  useEffect(() => {
    loadAnalysis();
  }, []);

  const handleRunCommand = async () => {
    if (!commandInput.trim()) return;
    setIsExecutingCommand(true);
    setCommandResult(null);
    try {
      const res = await executeAiCommand(commandInput, ecosystemSummary);
      setCommandResult(res);
      onShowToast(`Master AI executed directive: "${commandInput.slice(0, 30)}..."`);
      setCommandInput('');
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsExecutingCommand(false);
    }
  };

  const handleExecuteAction = async (action: any) => {
    setExecutingActionId(action.id);
    onShowToast(`Master AI dispatching ${action.agentId.toUpperCase()} Agent...`);
    try {
      await onExecuteAgentTask(action.agentId, action.payloadPrompt);
      // Remove action from list or mark done
      setAnalysis((prev: any) => ({
        ...prev,
        recommendedActions: prev.recommendedActions.filter((a: any) => a.id !== action.id),
      }));
    } finally {
      setExecutingActionId(null);
    }
  };

  const sampleCommands = [
    'Triage latest inbound emails, extract client action items to Google Tasks, and secure a Google Meet session',
    'Evaluate Q4 Google Ads ROAS and generate executive performance summary for Google Drive',
    'Convert priority #1 whitepaper into a Google Vids storyboard and publish metadata to YouTube',
    'Structure an enterprise workflow intake survey in Google Forms and link responses to Google Sheets',
  ];

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 flex flex-col gap-6 shadow-xl relative overflow-hidden">
      {/* Decorative subtle background aura */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600/20 via-indigo-600/20 to-violet-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-sm">
            <Brain className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-100 tracking-tight">
                Master AI Orchestrator Core
              </h2>
              <span className="text-xs text-blue-400 font-mono">· Gemini 3.8</span>
            </div>
            <p className="text-xs text-slate-400">
              Autonomous oversight, system bottleneck detection, and intelligent task decomposition across 13 agents
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={isLoadingAnalysis}
            onClick={loadAnalysis}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium px-3.5 py-2 rounded-xl border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAnalysis ? 'animate-spin' : ''}`} />
            <span>Refresh Analysis</span>
          </button>
        </div>
      </div>

      {/* Executive Briefing & Health Status */}
      {analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 relative z-10">
          {/* Executive Synthesis */}
          <div className="lg:col-span-2 p-5 bg-slate-950/70 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Autonomous Executive Strategic Briefing
              </span>
              <span className="text-xs font-mono font-semibold text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{analysis.overallHealth || 'OPTIMAL'}</span>
              </span>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              {analysis.executiveSummary}
            </p>

            {/* Insights bullets */}
            {analysis.detectedInsights && analysis.detectedInsights.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium block">
                  Observed System State
                </span>
                <div className="space-y-1 text-xs text-slate-300">
                  {analysis.detectedInsights.map((insight: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-blue-400 font-mono text-[11px] mt-0.5">·</span>
                      <span className="leading-snug">{insight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recommended Dispatches */}
          <div className="p-5 bg-slate-950/70 rounded-xl border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Recommended Agent Dispatches
              </div>

              <div className="space-y-2">
                {(analysis.recommendedActions || []).map((action: any) => (
                  <div
                    key={action.id}
                    className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">
                        {action.actionTitle}
                      </span>
                      <span className="text-[10px] font-mono text-blue-400 uppercase">
                        {action.agentId} Agent
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">
                      {action.reason}
                    </p>
                    <button
                      disabled={executingActionId === action.id}
                      onClick={() => handleExecuteAction(action)}
                      className="w-full flex items-center justify-center gap-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-[11px] font-semibold py-1 px-2 rounded border border-blue-500/30 transition-colors mt-2"
                    >
                      {executingActionId === action.id ? (
                        <>
                          <span className="w-3 h-3 border-2 border-blue-300 border-t-transparent rounded-full animate-spin" />
                          <span>Dispatching...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3 h-3 text-amber-400" />
                          <span>Execute Recommendation</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Natural Language Executive Command Terminal */}
      <div className="p-5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <Terminal className="w-4 h-4 text-blue-400" />
            <span>Autonomous Directive Console</span>
          </div>
          <span className="text-[11px] text-slate-400">
            Type any operational instruction across all 13 Google agents
          </span>
        </div>

        {/* Input line */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Instruct the Master AI to coordinate agents (e.g. 'Audit client emails, book meeting, and create onboarding questionnaire')..."
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRunCommand()}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <button
            disabled={!commandInput.trim() || isExecutingCommand}
            onClick={handleRunCommand}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95 shrink-0"
          >
            {isExecutingCommand ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Orchestrating...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Execute Directive</span>
              </>
            )}
          </button>
        </div>

        {/* Suggested Directives Chips */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium block">
            Suggested Directives
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {sampleCommands.map((sample, i) => (
              <button
                key={i}
                onClick={() => setCommandInput(sample)}
                className="text-left p-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-blue-500/40 text-slate-300 hover:text-white transition-colors text-[11px] truncate"
              >
                "{sample}"
              </button>
            ))}
          </div>
        </div>

        {/* Live Command Execution Outcome */}
        {commandResult && (
          <div className="p-4 bg-slate-900 rounded-xl border border-blue-500/30 text-xs space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-blue-400 font-semibold">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Master AI Decomposed Plan & Outcome</span>
              </span>
              <span className="font-mono text-[10px] text-slate-400">
                {commandResult.timestamp}
              </span>
            </div>

            <p className="text-slate-200 leading-relaxed">
              {commandResult.executiveResponse}
            </p>

            {commandResult.plan && commandResult.plan.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                {commandResult.plan.map((step: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-2 bg-slate-950/60 rounded-lg border border-slate-800/80"
                  >
                    <span className="w-5 h-5 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-mono text-[10px] font-bold shrink-0">
                      {step.step || idx + 1}
                    </span>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200 uppercase font-mono text-[10px]">
                          {step.agentId} Agent
                        </span>
                        <span aria-hidden="true" className="text-slate-700">·</span>
                        <span className="text-slate-300">{step.action}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">{step.outputSummary}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
