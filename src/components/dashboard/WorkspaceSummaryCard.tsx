import React from 'react';
import { SummaryWidgetType } from '../../types/dashboardLayout';
import {
  EmailArtifact,
  CalendarArtifact,
  TaskItemArtifact,
  SheetRowArtifact,
  FormArtifact,
  DriveItemArtifact,
  YouTubeAnalyticsArtifact,
  AgentId,
} from '../../types/orchestrator';
import {
  CheckSquare,
  Square,
  Calendar,
  Mail,
  Table,
  ClipboardList,
  HardDrive,
  Video,
  ArrowRight,
  ExternalLink,
  Users,
  Clock,
  Sparkles,
} from 'lucide-react';

interface WorkspaceSummaryCardProps {
  summaryType: SummaryWidgetType;
  emails: EmailArtifact[];
  calendarEvents: CalendarArtifact[];
  tasks: TaskItemArtifact[];
  sheetRows: SheetRowArtifact[];
  forms: FormArtifact[];
  driveFiles: DriveItemArtifact[];
  youtubeAnalytics: YouTubeAnalyticsArtifact;
  onOpenWorkspace: (agentId: AgentId) => void;
  onToggleTask?: (taskId: string) => void;
}

export const WorkspaceSummaryCard: React.FC<WorkspaceSummaryCardProps> = ({
  summaryType,
  emails,
  calendarEvents,
  tasks,
  sheetRows,
  forms,
  driveFiles,
  youtubeAnalytics,
  onOpenWorkspace,
  onToggleTask,
}) => {
  switch (summaryType) {
    case 'tasks':
      const pendingTasks = tasks.slice(0, 4);
      return (
        <div className="flex flex-col h-full justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-mono text-emerald-400 font-semibold">
                {tasks.filter((t) => !t.completed).length} Pending Action Items
              </span>
              <span className="font-mono text-slate-500">Google Tasks API</span>
            </div>

            <div className="space-y-1.5">
              {pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-950/50 border border-slate-800/80 hover:border-slate-700/80 text-xs transition-colors"
                >
                  <button
                    onClick={() => onToggleTask && onToggleTask(task.id)}
                    className="mt-0.5 text-blue-400 hover:text-blue-300 shrink-0"
                  >
                    {task.completed ? (
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Square className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div
                      className={`font-medium truncate ${
                        task.completed ? 'line-through text-slate-500' : 'text-slate-200'
                      }`}
                    >
                      {task.title}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span className="text-amber-400 font-mono">{task.priority}</span>
                      <span>·</span>
                      <span>{task.due}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onOpenWorkspace('tasks')}
            className="flex items-center justify-between w-full pt-2 border-t border-slate-800/80 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
          >
            <span>Open Tasks Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      );

    case 'calendar':
      const upcomingMeetings = calendarEvents.slice(0, 2);
      return (
        <div className="flex flex-col h-full justify-between space-y-3">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-mono text-blue-400 font-semibold">
                {calendarEvents.length} Scheduled Consultations
              </span>
              <span className="font-mono text-slate-500">Google Meet Active</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {upcomingMeetings.map((evt) => (
                <div
                  key={evt.id}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs"
                >
                  <div className="font-semibold text-slate-100 truncate">{evt.title}</div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                    <Clock className="w-3 h-3 text-blue-400" />
                    <span>{evt.time}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-mono text-slate-400">
                      {evt.attendees?.[0] || 'Attendee'}
                    </span>
                    <a
                      href={evt.meetLink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-medium"
                    >
                      <span>Join Meet</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onOpenWorkspace('calendar')}
            className="flex items-center justify-between w-full pt-2 border-t border-slate-800/80 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
          >
            <span>Open Calendar Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      );

    case 'sheets':
      const priorityRows = sheetRows.slice(0, 3);
      return (
        <div className="flex flex-col h-full justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-mono text-emerald-400 font-semibold">
                {sheetRows.length} Editorial Backlog Rows
              </span>
              <span className="font-mono text-slate-500">Q4_Content_Automation.gsheet</span>
            </div>

            <div className="space-y-1.5">
              {priorityRows.map((row) => (
                <div
                  key={row.id}
                  className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="truncate">
                    <div className="font-medium text-slate-200 truncate">{row.topic}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {row.source} · {row.format}
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold text-emerald-400">
                      {row.viralScore}/100
                    </span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                        row.status === 'Published'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : row.status === 'In Production'
                          ? 'bg-blue-500/10 text-blue-400'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {row.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onOpenWorkspace('sheets')}
            className="flex items-center justify-between w-full pt-2 border-t border-slate-800/80 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <span>Open Sheets Tracker</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      );

    case 'forms':
      const form = forms[0];
      return (
        <div className="flex flex-col h-full justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-mono text-violet-400 font-semibold flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{form ? form.responseCount : 0} Total Submissions</span>
              </span>
              <span className="font-mono text-slate-500">Google Forms API</span>
            </div>

            {form ? (
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
                <div className="font-semibold text-slate-100 truncate">{form.title}</div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {form.description}
                </p>
                <div className="text-[10px] text-slate-400 font-mono pt-1">
                  Routing: {form.linkedSheetName}
                </div>
              </div>
            ) : null}
          </div>

          <button
            onClick={() => onOpenWorkspace('forms')}
            className="flex items-center justify-between w-full pt-2 border-t border-slate-800/80 text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors"
          >
            <span>Open Forms Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      );

    case 'youtube':
      return (
        <div className="flex flex-col h-full justify-between space-y-3">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-mono text-rose-400 font-semibold">
                {youtubeAnalytics.monthlyViews.toLocaleString()} Monthly Views
              </span>
              <span className="font-mono text-slate-500">Retention: 62% Avg</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">
                  Top Video Performer
                </span>
                <div className="text-xs font-semibold text-slate-200 truncate">
                  {youtubeAnalytics.topVideos[0]?.title}
                </div>
                <div className="text-[11px] text-emerald-400 font-mono">
                  {youtubeAnalytics.topVideos[0]?.views} views · {youtubeAnalytics.topVideos[0]?.retention} retention
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">
                  Breakout Search Gap
                </span>
                <div className="text-xs font-semibold text-slate-200 truncate">
                  {youtubeAnalytics.breakoutTopics[0]?.topic}
                </div>
                <div className="text-[11px] text-blue-400 font-mono">
                  {youtubeAnalytics.breakoutTopics[0]?.trend}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onOpenWorkspace('youtube_analytics')}
            className="flex items-center justify-between w-full pt-2 border-t border-slate-800/80 text-xs font-medium text-rose-400 hover:text-rose-300 transition-colors"
          >
            <span>Open YouTube Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      );

    case 'drive':
    default:
      return (
        <div className="flex flex-col h-full justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-mono text-amber-400 font-semibold">
                {driveFiles.length} Synchronized Deliverables
              </span>
              <span className="font-mono text-slate-500">Drive API v3</span>
            </div>

            <div className="space-y-1.5">
              {driveFiles.slice(0, 3).map((f) => (
                <div
                  key={f.id}
                  className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="truncate text-slate-200 font-medium">{f.name}</div>
                  <span className="font-mono text-[10px] text-slate-400 shrink-0 ml-2">
                    {f.size}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onOpenWorkspace('drive')}
            className="flex items-center justify-between w-full pt-2 border-t border-slate-800/80 text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors"
          >
            <span>Open Drive Storage</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      );
  }
};
