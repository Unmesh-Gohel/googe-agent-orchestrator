import React, { useState } from 'react';
import { DocArticleArtifact } from '../../types/orchestrator';
import {
  FileText,
  Sparkles,
  Presentation,
  HardDrive,
  Copy,
  Check,
  Clock,
  User,
  Share2,
} from 'lucide-react';
import { executeAgentTask } from '../../services/api';

interface DocsWorkspaceProps {
  article: DocArticleArtifact;
  onTriggerSlides: () => void;
  onArticleUpdated: (updated: DocArticleArtifact) => void;
}

export const DocsWorkspace: React.FC<DocsWorkspaceProps> = ({
  article,
  onTriggerSlides,
  onArticleUpdated,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  const handleCopy = () => {
    const text = `${article.title}\n\nSummary:\n${article.summary}\n\n` +
      article.sections.map((s) => `${s.heading}\n${s.body}`).join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = async () => {
    setIsSynthesizing(true);
    const res = await executeAgentTask(
      'docs',
      'Regenerate enterprise deep-dive article on Autonomous Multi-Agent Swarms with updated empirical benchmarks'
    );
    if (res.artifactData) {
      onArticleUpdated({
        ...article,
        summary: res.summary || article.summary,
        updatedAt: 'Just now',
      });
    }
    setIsSynthesizing(false);
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 flex flex-col gap-6 shadow-xl">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <FileText className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-100 tracking-tight">
                Google Docs Agent Workspace
              </h2>
              <span className="text-xs text-slate-400">· Autonomous_Agent_Swarms.gdoc</span>
            </div>
            <p className="text-xs text-slate-400">
              Full-length technical synthesis, structured executive documentation, and downstream deck handoffs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium px-3 py-2 rounded-xl border border-slate-700 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Text'}</span>
          </button>

          <button
            disabled={isSynthesizing}
            onClick={handleRegenerate}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-md active:scale-95"
          >
            {isSynthesizing ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Synthesizing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Regenerate via Docs Agent</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Rendered Google Doc Preview */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-8 max-w-4xl mx-auto w-full shadow-inner space-y-6">
        {/* Document Title & Meta */}
        <div className="border-b border-slate-800/80 pb-6">
          <h1 className="text-2xl font-bold text-slate-100 mb-3 tracking-tight">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <span className="text-slate-300 font-medium">{article.author}</span>
            <span aria-hidden="true">·</span>
            <span>{article.readingTime}</span>
            <span aria-hidden="true">·</span>
            <span>Updated {article.updatedAt}</span>
          </div>

          {/* Tags as clean unboxed text */}
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-3 flex-wrap">
            <span className="text-slate-500">Categories:</span>
            {article.tags.map((tag, i) => (
              <span key={i} className="text-blue-300">
                {tag}
                {i < article.tags.length - 1 ? ' · ' : ''}
              </span>
            ))}
          </div>
        </div>

        {/* Executive Summary Callout */}
        <div className="p-5 bg-blue-950/20 border-l-4 border-blue-500 rounded-r-xl space-y-2">
          <h3 className="text-xs uppercase tracking-wider font-semibold text-blue-400">
            Executive Summary
          </h3>
          <p className="text-xs text-slate-200 leading-relaxed">
            {article.summary}
          </p>
        </div>

        {/* Article Sections */}
        <div className="space-y-6 pt-2">
          {article.sections.map((section, idx) => (
            <div key={idx} className="space-y-2">
              <h2 className="text-sm font-semibold text-slate-100">
                {section.heading}
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                {section.body}
              </p>
            </div>
          ))}
        </div>

        {/* Handoff Footer Banner */}
        <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            Document ready for downstream presentation & media production.
          </div>
          <button
            onClick={onTriggerSlides}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-blue-300 hover:text-blue-200 text-xs font-semibold px-4 py-2 rounded-lg border border-slate-700 transition-colors"
          >
            <Presentation className="w-4 h-4 text-blue-400" />
            <span>Pass to Google Slides Agent</span>
          </button>
        </div>
      </div>
    </div>
  );
};
