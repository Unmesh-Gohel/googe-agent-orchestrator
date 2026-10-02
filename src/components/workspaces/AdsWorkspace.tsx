import React, { useState } from 'react';
import { AdCampaignArtifact } from '../../types/orchestrator';
import {
  TrendingUp,
  Target,
  DollarSign,
  MousePointer,
  Sparkles,
  HardDrive,
  CheckCircle2,
  BarChart2,
} from 'lucide-react';
import { executeAgentTask } from '../../services/api';

interface AdsWorkspaceProps {
  campaign: AdCampaignArtifact;
  onCampaignUpdated: (campaign: AdCampaignArtifact) => void;
}

export const AdsWorkspace: React.FC<AdsWorkspaceProps> = ({
  campaign,
  onCampaignUpdated,
}) => {
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleOptimize = async () => {
    setIsOptimizing(true);
    const res = await executeAgentTask(
      'ads',
      'Optimize Google Ads bids, adjust target CPA, and export updated ROI report to Google Drive'
    );
    if (res.artifactData) {
      onCampaignUpdated({
        ...campaign,
        conversions: campaign.conversions + 12,
        clicks: campaign.clicks + 85,
        roas: '394%',
      });
    }
    setIsOptimizing(false);
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 flex flex-col gap-6 shadow-xl">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-600/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <TrendingUp className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-100 tracking-tight">
                Google Ads Agent Workspace
              </h2>
              <span className="text-xs text-slate-400">· Campaign ID: {campaign.id}</span>
            </div>
            <p className="text-xs text-slate-400">
              Autonomous ad campaign management, smart bidding optimization, and Drive report syncing
            </p>
          </div>
        </div>

        <button
          disabled={isOptimizing}
          onClick={handleOptimize}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-md active:scale-95"
        >
          {isOptimizing ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>Optimizing Bids...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Optimize Bids & Sync Report</span>
            </>
          )}
        </button>
      </div>

      {/* Main Campaign Performance KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
            Daily Budget
          </span>
          <span className="text-base font-semibold font-mono text-slate-100">
            {campaign.budgetDaily}
          </span>
        </div>

        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
            Impressions
          </span>
          <span className="text-base font-semibold font-mono text-slate-100 tabular-nums">
            {campaign.impressions.toLocaleString()}
          </span>
        </div>

        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
            Clicks
          </span>
          <span className="text-base font-semibold font-mono text-slate-100 tabular-nums">
            {campaign.clicks.toLocaleString()}
          </span>
        </div>

        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
            CTR
          </span>
          <span className="text-base font-semibold font-mono text-blue-400 tabular-nums">
            {campaign.ctr}
          </span>
        </div>

        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
            Conversions
          </span>
          <span className="text-base font-semibold font-mono text-emerald-400 tabular-nums">
            {campaign.conversions}
          </span>
        </div>

        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
            Return on Ad Spend
          </span>
          <span className="text-base font-semibold font-mono text-emerald-400 tabular-nums">
            {campaign.roas}
          </span>
        </div>
      </div>

      {/* Campaign Details & Target Keywords */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Ad Copy Preview */}
        <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">
              Autonomous Ad Copy Variant
            </span>
            <span className="text-emerald-400 font-mono text-[11px]">
              Quality Score: 9/10
            </span>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-1.5">
            <span className="text-[11px] text-slate-500 font-mono">
              Ad · https://orchestrator.google.com/enterprise
            </span>
            <h4 className="text-sm font-semibold text-blue-400 hover:underline cursor-pointer">
              Google Agent Orchestrator | Autonomous Workspace Multi-Agents
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Unify Gmail, Calendar, Drive, and Sheets into an interconnected autonomous agent swarm. Reduce scheduling latency by 84%. Request technical demo today.
            </p>
          </div>
        </div>

        {/* Target Keywords */}
        <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Target Keywords & Search Volume
          </div>

          <div className="space-y-2">
            {campaign.targetKeywords.map((kw, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800/80 text-xs text-slate-200"
              >
                <span>{kw}</span>
                <span className="font-mono text-blue-400 text-[11px]">
                  High Intent
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
