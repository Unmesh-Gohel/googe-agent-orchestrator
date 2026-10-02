import React, { useState } from 'react';
import { X, Sparkles, Send, Workflow, CheckCircle2, ArrowRight } from 'lucide-react';
import { executePipeline } from '../services/api';

interface MissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMissionDispatched: (result: any) => void;
}

export const MissionModal: React.FC<MissionModalProps> = ({
  isOpen,
  onClose,
  onMissionDispatched,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);

  if (!isOpen) return null;

  const presets = [
    {
      title: 'Full Autonomous Content & Deck Pipeline',
      prompt:
        'Scout breakthrough AI automation trends via News Agent, record ideas in Google Sheets, draft an enterprise whitepaper in Google Docs, build a 5-slide deck via Slides Agent, and archive in Google Drive.',
    },
    {
      title: 'Inbound Client Inquiries to Google Meet',
      prompt:
        'Triage inbound enterprise consultation inquiries via Gmail Agent, extract scheduling requirements, book Google Meet sessions via Calendar Agent, and dispatch confirmation replies.',
    },
    {
      title: 'YouTube Growth & Google Ads Synergy',
      prompt:
        'Analyze YouTube retention curves and competitor search gaps, draft video storyboard via Google Vids, and deploy a high-ROAS Google Ads campaign with Drive reporting.',
    },
  ];

  const handleDispatch = async () => {
    if (!prompt.trim()) return;
    setIsExecuting(true);
    try {
      const res = await executePipeline('content_engine', prompt);
      setExecutionResult(res);
      onMissionDispatched(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Sparkles className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">
                Dispatch Multi-Agent Mission
              </h3>
              <p className="text-xs text-slate-400">
                High-level goal decomposed and orchestrated across 11 specialized Google agents
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Preset Chips */}
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium block mb-2">
              Select Preset Objective
            </span>
            <div className="space-y-2">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => setPrompt(preset.prompt)}
                  className="w-full text-left p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-blue-500/50 transition-all text-xs group"
                >
                  <div className="font-semibold text-slate-200 group-hover:text-blue-300">
                    {preset.title}
                  </div>
                  <div className="text-slate-400 mt-0.5 line-clamp-1">
                    {preset.prompt}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Mission Objective Textarea */}
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium block mb-1">
              Custom Mission Prompt
            </span>
            <textarea
              rows={3}
              placeholder="Describe the desired ecosystem objective in natural language..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 leading-relaxed resize-none"
            />
          </div>

          {/* Result preview */}
          {executionResult && (
            <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Mission Pipeline Successfully Dispatched!</span>
              </div>
              <p className="text-slate-300">
                {executionResult.log?.summary ||
                  'Stages executed across News, Sheets, Docs, Slides, and Drive agents.'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>

          <button
            disabled={isExecuting || !prompt.trim()}
            onClick={handleDispatch}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/10 transition-all active:scale-95"
          >
            {isExecuting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Orchestrating Agents...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Dispatch Multi-Agent Mission</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
