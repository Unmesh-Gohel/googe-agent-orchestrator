import React, { useState } from 'react';
import { DashboardCardConfig } from '../../types/dashboardLayout';
import {
  AgentDefinition,
  AgentId,
  EmailArtifact,
  CalendarArtifact,
  TaskItemArtifact,
  SheetRowArtifact,
  FormArtifact,
  DriveItemArtifact,
  YouTubeAnalyticsArtifact,
} from '../../types/orchestrator';
import { WorkspaceSummaryCard } from './WorkspaceSummaryCard';
import {
  GripVertical,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  EyeOff,
  Play,
  Settings2,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Move,
  Activity,
  Layers,
  Table,
  FileText,
  Presentation,
  HardDrive,
  Mail,
  Calendar,
  Newspaper,
  Clapperboard,
  Video,
  BarChart3,
  TrendingUp,
  CheckSquare,
  ClipboardList,
} from 'lucide-react';

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

interface DraggableCardProps {
  card: DashboardCardConfig;
  isEditMode: boolean;
  agent?: AgentDefinition;
  emails: EmailArtifact[];
  calendarEvents: CalendarArtifact[];
  tasks: TaskItemArtifact[];
  sheetRows: SheetRowArtifact[];
  forms: FormArtifact[];
  driveFiles: DriveItemArtifact[];
  youtubeAnalytics: YouTubeAnalyticsArtifact;
  onSelectAgent: (agent: AgentDefinition) => void;
  onTriggerAgent: (agentId: AgentId) => void;
  onOpenWorkspace: (agentId: AgentId) => void;
  onToggleTask?: (taskId: string) => void;
  onResizeColSpan: (cardId: string, colSpan: 1 | 2 | 3) => void;
  onToggleHeight: (cardId: string) => void;
  onHideCard: (cardId: string) => void;
  onMoveCard: (cardId: string, direction: 'prev' | 'next') => void;
  onDragStart: (e: React.DragEvent, cardId: string) => void;
  onDragOver: (e: React.DragEvent, cardId: string) => void;
  onDrop: (e: React.DragEvent, targetCardId: string) => void;
  onDragEnd: () => void;
  isDragging?: boolean;
}

export const DraggableCard: React.FC<DraggableCardProps> = ({
  card,
  isEditMode,
  agent,
  emails,
  calendarEvents,
  tasks,
  sheetRows,
  forms,
  driveFiles,
  youtubeAnalytics,
  onSelectAgent,
  onTriggerAgent,
  onOpenWorkspace,
  onToggleTask,
  onResizeColSpan,
  onToggleHeight,
  onHideCard,
  onMoveCard,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragging,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Responsive column span classes
  const colSpanClasses =
    card.colSpan === 3
      ? 'col-span-1 md:col-span-2 lg:col-span-3'
      : card.colSpan === 2
      ? 'col-span-1 md:col-span-2'
      : 'col-span-1';

  // Height classes
  const heightClasses = card.isExpandedHeight
    ? 'min-h-[440px]'
    : 'min-h-[290px]';

  const IconComponent = agent ? ICON_MAP[agent.icon] || Mail : null;

  const accentColor = agent
    ? agent.domain === 'communication'
      ? 'text-blue-400 bg-blue-500/10 border-blue-500/30'
      : agent.domain === 'workspace'
      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
      : agent.domain === 'media'
      ? 'text-violet-400 bg-violet-500/10 border-violet-500/30'
      : 'text-amber-400 bg-amber-500/10 border-amber-500/30'
    : 'text-blue-400 bg-blue-500/10 border-blue-500/30';

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, card.id)}
      onDragOver={(e) => onDragOver(e, card.id)}
      onDrop={(e) => onDrop(e, card.id)}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`${colSpanClasses} ${heightClasses} bg-slate-900/90 rounded-2xl border transition-all duration-200 flex flex-col justify-between p-5 relative overflow-hidden group shadow-md ${
        isDragging
          ? 'opacity-40 ring-2 ring-blue-500/80 scale-[0.98] border-dashed border-blue-400'
          : isEditMode
          ? 'border-blue-500/40 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/10'
          : 'border-slate-800 hover:border-slate-700/90 hover:shadow-xl hover:shadow-slate-950/40'
      }`}
    >
      {/* Top Customization Bar (Visible in Edit Mode or on Hover) */}
      {(isEditMode || isHovered) && (
        <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1 bg-slate-950/90 border border-slate-700/80 rounded-lg p-1 backdrop-blur-md shadow-md animate-in fade-in duration-100">
          {/* ColSpan Switchers */}
          <button
            title="Single Column Width"
            onClick={() => onResizeColSpan(card.id, 1)}
            className={`px-1.5 py-0.5 text-[10px] font-mono rounded ${
              card.colSpan === 1
                ? 'bg-blue-600 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            1x
          </button>
          <button
            title="Two Columns Width"
            onClick={() => onResizeColSpan(card.id, 2)}
            className={`px-1.5 py-0.5 text-[10px] font-mono rounded ${
              card.colSpan === 2
                ? 'bg-blue-600 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            2x
          </button>
          <button
            title="Full Row Width"
            onClick={() => onResizeColSpan(card.id, 3)}
            className={`px-1.5 py-0.5 text-[10px] font-mono rounded ${
              card.colSpan === 3
                ? 'bg-blue-600 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            3x
          </button>

          <span className="w-px h-3 bg-slate-800 mx-0.5" />

          {/* Height Expand/Collapse */}
          <button
            title={card.isExpandedHeight ? 'Compact Height' : 'Expand Height'}
            onClick={() => onToggleHeight(card.id)}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            {card.isExpandedHeight ? (
              <Minimize2 className="w-3 h-3" />
            ) : (
              <Maximize2 className="w-3 h-3" />
            )}
          </button>

          {/* Move Buttons */}
          <button
            title="Move Card Earlier"
            onClick={() => onMoveCard(card.id, 'prev')}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>
          <button
            title="Move Card Later"
            onClick={() => onMoveCard(card.id, 'next')}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <ChevronRight className="w-3 h-3" />
          </button>

          {/* Hide button */}
          <button
            title="Hide Card from Dashboard"
            onClick={() => onHideCard(card.id)}
            className="p-1 rounded text-rose-400 hover:text-rose-300 hover:bg-rose-950/40"
          >
            <EyeOff className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Drag Grip Handle */}
      <div
        className="absolute top-3 left-3 z-10 cursor-grab active:cursor-grabbing p-1 rounded-md text-slate-600 hover:text-blue-400 hover:bg-slate-800/80 transition-colors"
        title="Drag and drop to rearrange"
      >
        <GripVertical className="w-4 h-4" />
      </div>

      {/* Card Content based on type */}
      <div className="flex-1 flex flex-col pt-3">
        {card.type === 'agent' && agent ? (
          /* Agent Card View */
          <div className="flex-1 flex flex-col justify-between space-y-4">
            <div>
              {/* Agent Title & Icon Header */}
              <div className="flex items-start justify-between gap-3 pl-5 mb-3">
                <div className="flex items-center gap-3">
                  {IconComponent && (
                    <div
                      className={`w-10 h-10 rounded-xl ${accentColor} border flex items-center justify-center shrink-0`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-100 group-hover:text-blue-300 transition-colors">
                      {agent.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                      <span className="font-mono">{agent.googleService}</span>
                      <span aria-hidden="true">·</span>
                      <span>{agent.domainLabel}</span>
                    </div>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center gap-1.5 text-[11px] pr-8">
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

              {/* Description */}
              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-3">
                {agent.description}
              </p>

              {/* Core Capabilities */}
              <div className="space-y-1 pt-2 border-t border-slate-800/80 mb-3">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium block">
                  Core Capabilities
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {agent.capabilities.slice(0, card.colSpan > 1 ? 4 : 2).map((cap, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-300 truncate max-w-full"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </div>

              {/* Expanded details if card is expanded */}
              {card.isExpandedHeight && (
                <div className="space-y-2 pt-2 border-t border-slate-800/80 mb-3 text-xs animate-in fade-in duration-150">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium block">
                    Execution Telemetry & Guidelines
                  </span>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-mono bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80">
                    "{agent.systemInstruction}"
                  </p>
                </div>
              )}
            </div>

            {/* Metrics & Actions Footer */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                <span title="Success Rate" className="text-emerald-400">
                  {agent.successRate}%
                </span>
                <span>·</span>
                <span title="Latency">{agent.avgLatencyMs}ms</span>
                <span>·</span>
                <span title="Tasks Executed">{agent.tasksExecuted} runs</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => onOpenWorkspace(agent.id)}
                  title="Open Dedicated Workspace"
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 transition-colors"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onSelectAgent(agent)}
                  title="Configure & Inspect Agent"
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 transition-colors"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onTriggerAgent(agent.id)}
                  title="Execute Single Agent Task"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Run</span>
                </button>
              </div>
            </div>
          </div>
        ) : card.type === 'workspace_summary' && card.summaryType ? (
          /* Workspace Summary View */
          <div className="flex-1 flex flex-col justify-between">
            <div className="flex items-center gap-2 pl-5 mb-3">
              <span className="text-xs font-semibold text-slate-100 tracking-tight">
                {card.title}
              </span>
            </div>

            <div className="flex-1">
              <WorkspaceSummaryCard
                summaryType={card.summaryType}
                emails={emails}
                calendarEvents={calendarEvents}
                tasks={tasks}
                sheetRows={sheetRows}
                forms={forms}
                driveFiles={driveFiles}
                youtubeAnalytics={youtubeAnalytics}
                onOpenWorkspace={onOpenWorkspace}
                onToggleTask={onToggleTask}
              />
            </div>
          </div>
        ) : null}
      </div>

      {/* Drag & Resize Corner Hint */}
      <div
        className="absolute bottom-1 right-1 text-slate-700 group-hover:text-slate-500 pointer-events-none transition-colors"
        title="Resizable card"
      >
        <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="8" cy="12" r="1.5" />
          <circle cx="12" cy="8" r="1.5" />
        </svg>
      </div>
    </div>
  );
};
