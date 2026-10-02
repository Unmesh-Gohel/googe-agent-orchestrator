import React, { useState } from 'react';
import { AgentDefinition, AgentId } from '../types/orchestrator';
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
  ArrowRight,
  Sparkles,
  Info,
} from 'lucide-react';

interface TopologyGraphProps {
  agents: AgentDefinition[];
  onSelectAgent: (agent: AgentDefinition) => void;
  onTriggerAgent: (agentId: AgentId) => void;
  activeHandoff?: { source: AgentId; target: AgentId } | null;
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

// Precise layout coordinates (percentage based inside a 1000 x 600 canvas)
const NODE_POSITIONS: Record<AgentId, { x: number; y: number }> = {
  // Communication & Scheduling (Left-Top)
  gmail: { x: 140, y: 130 },
  calendar: { x: 140, y: 310 },
  tasks: { x: 140, y: 480 },

  // Content Engine (Center-Left to Center-Right)
  news: { x: 380, y: 80 },
  forms: { x: 380, y: 220 },
  sheets: { x: 380, y: 360 },
  docs: { x: 580, y: 170 },
  slides: { x: 580, y: 330 },

  // Central Asset Hub
  drive: { x: 380, y: 490 },

  // Media & Video (Right-Top)
  vids: { x: 780, y: 140 },
  videos: { x: 780, y: 300 },

  // Growth & Analytics (Right-Bottom)
  youtube_analytics: { x: 880, y: 460 },
  ads: { x: 640, y: 490 },
};

// Explicit directional connections between agents
const EDGES: { source: AgentId; target: AgentId; label: string }[] = [
  { source: 'gmail', target: 'calendar', label: 'Meeting Intent' },
  { source: 'calendar', target: 'gmail', label: 'Invite Confirmation' },
  { source: 'gmail', target: 'tasks', label: 'Action Items' },
  { source: 'forms', target: 'sheets', label: 'Form Responses' },
  { source: 'news', target: 'sheets', label: 'Topic Ideas' },
  { source: 'sheets', target: 'docs', label: 'Article Dispatch' },
  { source: 'docs', target: 'slides', label: 'Key Takeaways' },
  { source: 'docs', target: 'tasks', label: 'Task Follow-up' },
  { source: 'docs', target: 'vids', label: 'Script Narrative' },
  { source: 'vids', target: 'videos', label: 'Storyboard Frames' },
  { source: 'videos', target: 'youtube_analytics', label: 'Video Publish' },
  { source: 'youtube_analytics', target: 'news', label: 'Trend Feedback Loop' },
  { source: 'ads', target: 'drive', label: 'Audit Reports' },
  { source: 'docs', target: 'drive', label: 'Articles' },
  { source: 'slides', target: 'drive', label: 'Presentations' },
  { source: 'gmail', target: 'drive', label: 'Dossiers' },
];

export const TopologyGraph: React.FC<TopologyGraphProps> = ({
  agents,
  onSelectAgent,
  onTriggerAgent,
  activeHandoff,
}) => {
  const [hoveredAgentId, setHoveredAgentId] = useState<AgentId | null>(null);

  const hoveredAgent = agents.find((a) => a.id === hoveredAgentId);

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 flex flex-col gap-6 shadow-xl relative overflow-hidden">
      {/* Topology Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-100 tracking-tight">
            Inter-Agent Topology & Communication Bus
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Interactive map of interconnected Google agents and real-time handoff channels
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span>Communication</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Content & Workspace</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-500"></span>
            <span>Media & Video</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Advertising & Growth</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas Map */}
      <div className="relative w-full h-[580px] bg-slate-950/70 rounded-xl border border-slate-800/80 overflow-hidden">
        {/* Subtle grid pattern background */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.2) 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />

        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 580">
          <defs>
            <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.6" />
            </linearGradient>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#64748b" />
            </marker>
            <marker
              id="arrow-active"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#38bdf8" />
            </marker>
          </defs>

          {/* Render Connections */}
          {EDGES.map((edge, idx) => {
            const src = NODE_POSITIONS[edge.source];
            const dst = NODE_POSITIONS[edge.target];
            if (!src || !dst) return null;

            const isHighlighted =
              hoveredAgentId === edge.source || hoveredAgentId === edge.target;
            const isActiveHandoff =
              activeHandoff &&
              activeHandoff.source === edge.source &&
              activeHandoff.target === edge.target;

            // Curved quadratic bezier path
            const dx = dst.x - src.x;
            const dy = dst.y - src.y;
            const cx = (src.x + dst.x) / 2 - dy * 0.12;
            const cy = (src.y + dst.y) / 2 + dx * 0.12;
            const pathD = `M ${src.x} ${src.y} Q ${cx} ${cy} ${dst.x} ${dst.y}`;

            return (
              <g key={idx}>
                {/* Background line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={
                    isActiveHandoff
                      ? '#38bdf8'
                      : isHighlighted
                      ? '#93c5fd'
                      : '#334155'
                  }
                  strokeWidth={isActiveHandoff ? 2.5 : isHighlighted ? 2 : 1.2}
                  strokeDasharray={edge.label.includes('Feedback') ? '4 3' : undefined}
                  markerEnd={isActiveHandoff ? 'url(#arrow-active)' : 'url(#arrow)'}
                  className="transition-all duration-300"
                />

                {/* Animated transmission pulse if active */}
                {isActiveHandoff && (
                  <circle r="4" fill="#38bdf8">
                    <animateMotion
                      dur="1.5s"
                      repeatCount="indefinite"
                      path={pathD}
                    />
                  </circle>
                )}
              </g>
            );
          })}
        </svg>

        {/* Render Interactive Nodes */}
        {agents.map((agent) => {
          const pos = NODE_POSITIONS[agent.id];
          if (!pos) return null;

          const IconComponent = ICON_MAP[agent.icon] || Info;
          const isHovered = hoveredAgentId === agent.id;
          const isSource = hoveredAgentId && agent.connectedAgents.includes(hoveredAgentId);
          const isTarget = hoveredAgentId && hoveredAgent?.connectedAgents.includes(agent.id);

          // Domain color accents
          const domainColor =
            agent.domain === 'communication'
              ? 'border-blue-500/50 text-blue-400 bg-blue-500/10'
              : agent.domain === 'workspace'
              ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10'
              : agent.domain === 'media'
              ? 'border-violet-500/50 text-violet-400 bg-violet-500/10'
              : 'border-amber-500/50 text-amber-400 bg-amber-500/10';

          return (
            <div
              key={agent.id}
              style={{
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                transform: 'translate(-50%, -50%)',
              }}
              onMouseEnter={() => setHoveredAgentId(agent.id)}
              onMouseLeave={() => setHoveredAgentId(null)}
              onClick={() => onSelectAgent(agent)}
              className={`absolute cursor-pointer transition-all duration-200 z-20 group ${
                isHovered ? 'scale-110' : ''
              }`}
            >
              {/* Node Card */}
              <div
                className={`relative px-3 py-2 rounded-xl bg-slate-900 border ${
                  isHovered
                    ? 'border-blue-400 shadow-lg shadow-blue-500/20'
                    : isSource || isTarget
                    ? 'border-indigo-400 shadow-md'
                    : 'border-slate-800 hover:border-slate-700'
                } flex items-center gap-2.5 backdrop-blur-sm`}
              >
                {/* Agent Icon */}
                <div
                  className={`w-8 h-8 rounded-lg ${domainColor} flex items-center justify-center shrink-0 border`}
                >
                  <IconComponent className="w-4 h-4" />
                </div>

                {/* Agent Title & Metrics */}
                <div className="text-left">
                  <div className="text-xs font-semibold text-slate-100 flex items-center gap-1.5 whitespace-nowrap">
                    <span>{agent.shortName}</span>
                    {agent.status === 'running' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                    <span>{agent.googleService}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums text-slate-300">
                      {agent.avgLatencyMs}ms
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Hover Inspector Preview Overlay at bottom right */}
        {hoveredAgent && (
          <div className="absolute bottom-4 left-4 max-w-md bg-slate-900/95 border border-slate-700/80 p-4 rounded-xl shadow-2xl backdrop-blur-md z-30 animate-in fade-in duration-150">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
                  {hoveredAgent.domainLabel}
                </span>
                <h4 className="text-sm font-semibold text-slate-100">
                  {hoveredAgent.name}
                </h4>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTriggerAgent(hoveredAgent.id);
                }}
                className="flex items-center gap-1 text-[11px] bg-blue-600 hover:bg-blue-500 text-white font-medium px-2.5 py-1 rounded-md transition-colors"
              >
                <Sparkles className="w-3 h-3" />
                <span>Run Agent</span>
              </button>
            </div>

            <p className="text-xs text-slate-300 line-clamp-2 mb-3">
              {hoveredAgent.description}
            </p>

            <div className="grid grid-cols-3 gap-2 border-t border-slate-800 pt-2 text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px]">Success Rate</span>
                <span className="font-mono font-medium text-emerald-400">
                  {hoveredAgent.successRate}%
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Executed</span>
                <span className="font-mono font-medium text-slate-200">
                  {hoveredAgent.tasksExecuted} tasks
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Latency</span>
                <span className="font-mono font-medium text-slate-200">
                  {hoveredAgent.avgLatencyMs} ms
                </span>
              </div>
            </div>

            <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-500">Connected to:</span>
              {hoveredAgent.connectedAgents.map((connId, i) => (
                <span key={connId} className="text-blue-300 font-medium">
                  {connId.toUpperCase()}
                  {i < hoveredAgent.connectedAgents.length - 1 ? ' · ' : ''}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Domain Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
        <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800/80">
          <div className="text-xs font-semibold text-blue-400 mb-1">
            Communication & Scheduling
          </div>
          <p className="text-xs text-slate-300">
            Gmail Agent extracts client requirements; Calendar Agent resolves availability and books Google Meet.
          </p>
        </div>

        <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800/80">
          <div className="text-xs font-semibold text-emerald-400 mb-1">
            Content & Workspace
          </div>
          <p className="text-xs text-slate-300">
            News Agent curates topics; Sheets Agent ranks viral priority; Docs & Slides agents produce articles and decks.
          </p>
        </div>

        <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800/80">
          <div className="text-xs font-semibold text-violet-400 mb-1">
            Media & Distribution
          </div>
          <p className="text-xs text-slate-300">
            Google Vids Agent generates video scenes and AI Studio prompts; Videos Agent deploys directly to YouTube.
          </p>
        </div>

        <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800/80">
          <div className="text-xs font-semibold text-amber-400 mb-1">
            Advertising & Growth
          </div>
          <p className="text-xs text-slate-300">
            YouTube Analytics discovers competitor gaps; Google Ads Agent launches high-ROAS acquisition campaigns.
          </p>
        </div>
      </div>
    </div>
  );
};
