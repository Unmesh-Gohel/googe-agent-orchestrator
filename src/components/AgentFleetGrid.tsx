import React, { useState } from 'react';
import { AgentDefinition, AgentDomain, AgentId } from '../types/orchestrator';
import {
  Mail,
  Calendar,
  Newspaper,
  Table,
  FileText,
  Presentation,
  HardDrive,
  Clapperboard,
  Video,
  BarChart3,
  TrendingUp,
  CheckSquare,
  ClipboardList,
  Play,
  Settings2,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

interface AgentFleetGridProps {
  agents: AgentDefinition[];
  onSelectAgent: (agent: AgentDefinition) => void;
  onTriggerAgent: (agentId: AgentId) => void;
  onOpenWorkspace: (agentId: AgentId) => void;
}

const ICON_MAP: Record<string, any> = {
  Mail,
  Calendar,
  Newspaper,
  Table,
  FileText,
  Presentation,
  HardDrive,
  Clapperboard,
  Video,
  BarChart3,
  TrendingUp,
  CheckSquare,
  ClipboardList,
};

export const AgentFleetGrid: React.FC<AgentFleetGridProps> = ({
  agents,
  onSelectAgent,
  onTriggerAgent,
  onOpenWorkspace,
}) => {
  const [filterDomain, setFilterDomain] = useState<'all' | AgentDomain>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAgents = agents.filter((agent) => {
    const matchesDomain = filterDomain === 'all' || agent.domain === filterDomain;
    const matchesSearch =
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDomain && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
        {/* Domain Segmented Control */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterDomain('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              filterDomain === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            All Agents ({agents.length})
          </button>
          <button
            onClick={() => setFilterDomain('communication')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              filterDomain === 'communication'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Communication & Scheduling
          </button>
          <button
            onClick={() => setFilterDomain('workspace')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              filterDomain === 'workspace'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Content & Workspace
          </button>
          <button
            onClick={() => setFilterDomain('media')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              filterDomain === 'media'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Media & Distribution
          </button>
          <button
            onClick={() => setFilterDomain('growth')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              filterDomain === 'growth'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Advertising & Growth
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <input
            type="text"
            placeholder="Filter agents by capability..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Grid of Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAgents.map((agent) => {
          const IconComponent = ICON_MAP[agent.icon] || Mail;

          // Domain accent styling
          const accentColor =
            agent.domain === 'communication'
              ? 'text-blue-400 bg-blue-500/10 border-blue-500/30'
              : agent.domain === 'workspace'
              ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
              : agent.domain === 'media'
              ? 'text-violet-400 bg-violet-500/10 border-violet-500/30'
              : 'text-amber-400 bg-amber-500/10 border-amber-500/30';

          return (
            <div
              key={agent.id}
              className="bg-slate-900/90 rounded-xl border border-slate-800 hover:border-slate-700/90 p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-lg hover:shadow-slate-950/40 group relative overflow-hidden"
            >
              {/* Top Row: Icon & Status */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl ${accentColor} border flex items-center justify-center shrink-0`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-100 group-hover:text-blue-300 transition-colors">
                        {agent.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                        <span>{agent.googleService}</span>
                        <span aria-hidden="true">·</span>
                        <span>{agent.domainLabel}</span>
                      </div>
                    </div>
                  </div>

                  {/* Active / Running Indicator */}
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        agent.status === 'running'
                          ? 'bg-amber-400 animate-ping'
                          : 'bg-emerald-500'
                      }`}
                    />
                    <span className="capitalize text-slate-400 font-mono text-[10px]">
                      {agent.status}
                    </span>
                  </div>
                </div>

                {/* Role & Description */}
                <p className="text-xs text-slate-300 line-clamp-3 mb-4 leading-relaxed">
                  {agent.description}
                </p>

                {/* Capabilities list */}
                <div className="space-y-1 mb-4 border-t border-slate-800/80 pt-3">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium block">
                    Core Capabilities
                  </span>
                  <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-300">
                    {agent.capabilities.slice(0, 3).map((cap, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-950/60 border border-slate-800 px-2 py-0.5 rounded text-[11px] text-slate-300"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Section: Telemetry & Actions */}
              <div className="border-t border-slate-800/80 pt-3 mt-auto">
                {/* Metrics Bar */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3 bg-slate-950/40 p-2 rounded-lg border border-slate-800/60">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Success</span>
                    <span className="font-mono tabular-nums text-emerald-400 font-medium">
                      {agent.successRate}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Latency</span>
                    <span className="font-mono tabular-nums text-slate-200 font-medium">
                      {agent.avgLatencyMs}ms
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Executed</span>
                    <span className="font-mono tabular-nums text-slate-200 font-medium">
                      {agent.tasksExecuted}
                    </span>
                  </div>
                </div>

                {/* Interactive Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onTriggerAgent(agent.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-2 px-3 rounded-lg transition-colors shadow-sm active:scale-98"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Run Agent</span>
                  </button>

                  <button
                    onClick={() => onSelectAgent(agent)}
                    title="Inspect Agent Architecture & System Prompt"
                    className="flex items-center justify-center p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60"
                  >
                    <Settings2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onOpenWorkspace(agent.id)}
                    title="Open Workspace Artifacts"
                    className="flex items-center justify-center p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
