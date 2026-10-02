import React, { useState } from 'react';
import { YouTubeAnalyticsArtifact } from '../../types/orchestrator';
import {
  Video,
  BarChart3,
  TrendingUp,
  ArrowUpRight,
  Eye,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { executeAgentTask } from '../../services/api';

interface YouTubeWorkspaceProps {
  analytics: YouTubeAnalyticsArtifact;
  onInjectTopicToNews: (topic: string) => void;
}

export const YouTubeWorkspace: React.FC<YouTubeWorkspaceProps> = ({
  analytics,
  onInjectTopicToNews,
}) => {
  const [injectedTopic, setInjectedTopic] = useState<string | null>(null);

  const handleInject = async (topic: string) => {
    setInjectedTopic(topic);
    onInjectTopicToNews(topic);
    await executeAgentTask(
      'youtube_analytics',
      `Feedback high-demand topic "${topic}" to Google News Agent to begin new discovery cycle`
    );
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 flex flex-col gap-6 shadow-xl">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-600/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <Video className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-100 tracking-tight">
                YouTube Videos & Analytics Agent Hub
              </h2>
              <span className="text-xs text-slate-400">· Closed-Loop Feedback Engine</span>
            </div>
            <p className="text-xs text-slate-400">
              Video publication manager, retention curves analysis, and feedback injection into News & Sheets agents
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>
            Channel Views (30d):{' '}
            <span className="font-mono text-slate-200">
              {analytics.monthlyViews.toLocaleString()}
            </span>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Watch Time:{' '}
            <span className="font-mono text-slate-200">
              {analytics.watchTimeHours.toLocaleString()}h
            </span>
          </span>
        </div>
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Top Published Videos */}
        <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Top Performing Video Assets
          </div>

          <div className="space-y-2.5">
            {analytics.topVideos.map((vid, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-900/80 rounded-lg border border-slate-800/80 space-y-1"
              >
                <div className="text-xs font-medium text-slate-200 line-clamp-1">
                  {vid.title}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>{vid.views} views</span>
                  <span className="text-emerald-400">Retention: {vid.retention}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Breakout Search Queries */}
        <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Surging Search Velocity
          </div>

          <div className="space-y-2.5">
            {analytics.breakoutTopics.map((topic, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-900/80 rounded-lg border border-slate-800/80 flex items-center justify-between gap-2"
              >
                <span className="text-xs text-slate-200 font-medium">{topic.topic}</span>
                <span className="text-[11px] font-mono text-emerald-400 font-semibold shrink-0">
                  {topic.trend}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Competitor Gaps & Ecosystem Loop */}
        <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Competitor Content Gaps</span>
            <span className="text-amber-400 font-mono text-[10px]">High Opportunity</span>
          </div>

          <div className="space-y-2.5">
            {analytics.competitorGaps.map((gap, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-900/80 rounded-lg border border-slate-800/80 space-y-2"
              >
                <p className="text-xs text-slate-300 leading-snug">"{gap}"</p>
                <button
                  onClick={() => handleInject(gap)}
                  className="w-full flex items-center justify-center gap-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-[11px] font-semibold py-1.5 px-2 rounded border border-blue-500/30 transition-colors"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Feed into Google News Agent</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Injected Notification */}
      {injectedTopic && (
        <div className="p-4 bg-blue-950/30 border border-blue-500/40 rounded-xl text-xs flex items-center gap-2 text-blue-300 animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>
            Topic "{injectedTopic}" dispatched directly to Google News & Google Sheets Agents!
          </span>
        </div>
      )}
    </div>
  );
};
