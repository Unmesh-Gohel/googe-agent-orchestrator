import React, { useState } from 'react';
import { User } from 'firebase/auth';
import {
  EmailArtifact,
  CalendarArtifact,
  SheetRowArtifact,
  DocArticleArtifact,
  SlideArtifact,
  DriveItemArtifact,
  AdCampaignArtifact,
  VideoSceneArtifact,
  YouTubeAnalyticsArtifact,
  TaskItemArtifact,
  FormArtifact,
  AgentId,
} from '../../types/orchestrator';
import {
  Mail,
  Calendar,
  Table,
  FileText,
  Presentation,
  HardDrive,
  TrendingUp,
  Clapperboard,
  Video,
  CheckSquare,
  ClipboardList,
} from 'lucide-react';
import { GmailWorkspace } from './GmailWorkspace';
import { CalendarWorkspace } from './CalendarWorkspace';
import { SheetsWorkspace } from './SheetsWorkspace';
import { DocsWorkspace } from './DocsWorkspace';
import { SlidesWorkspace } from './SlidesWorkspace';
import { DriveWorkspace } from './DriveWorkspace';
import { AdsWorkspace } from './AdsWorkspace';
import { VidsWorkspace } from './VidsWorkspace';
import { YouTubeWorkspace } from './YouTubeWorkspace';
import { TasksWorkspace } from './TasksWorkspace';
import { FormsWorkspace } from './FormsWorkspace';

interface WorkspaceHubProps {
  initialTab?: string;
  emails: EmailArtifact[];
  calendarEvents: CalendarArtifact[];
  sheetRows: SheetRowArtifact[];
  docArticle: DocArticleArtifact;
  slides: SlideArtifact[];
  driveFiles: DriveItemArtifact[];
  adsCampaign: AdCampaignArtifact;
  videoScenes: VideoSceneArtifact[];
  youtubeAnalytics: YouTubeAnalyticsArtifact;
  tasks: TaskItemArtifact[];
  forms: FormArtifact[];
  onTriggerCalendarHandoff: (email: EmailArtifact) => void;
  onNewEmail: (email: EmailArtifact) => void;
  onAddCalendarEvent: (event: CalendarArtifact) => void;
  onAddSheetRow: (row: SheetRowArtifact) => void;
  onTriggerDocsArticle: (row: SheetRowArtifact) => void;
  onArticleUpdated: (article: DocArticleArtifact) => void;
  onTriggerSlides: () => void;
  onTriggerDriveSave: () => void;
  onCampaignUpdated: (campaign: AdCampaignArtifact) => void;
  onTriggerPublish: () => void;
  onInjectTopicToNews: (topic: string) => void;
  onToggleTask: (taskId: string) => void;
  onAddTask: (task: TaskItemArtifact) => void;
  onAddForm: (form: FormArtifact) => void;
  onStreamFormToSheets: (form: FormArtifact) => void;
  currentUser?: User | null;
  onAuthSuccess?: (user: User, token: string) => void;
}

export const WorkspaceHub: React.FC<WorkspaceHubProps> = ({
  initialTab = 'gmail',
  emails,
  calendarEvents,
  sheetRows,
  docArticle,
  slides,
  driveFiles,
  adsCampaign,
  videoScenes,
  youtubeAnalytics,
  tasks,
  forms,
  onTriggerCalendarHandoff,
  onNewEmail,
  onAddCalendarEvent,
  onAddSheetRow,
  onTriggerDocsArticle,
  onArticleUpdated,
  onTriggerSlides,
  onTriggerDriveSave,
  onCampaignUpdated,
  onTriggerPublish,
  onInjectTopicToNews,
  onToggleTask,
  onAddTask,
  onAddForm,
  onStreamFormToSheets,
  currentUser,
  onAuthSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  const tabs = [
    { id: 'gmail', label: 'Gmail', icon: Mail, color: 'text-blue-400' },
    { id: 'calendar', label: 'Calendar', icon: Calendar, color: 'text-blue-400' },
    { id: 'tasks', label: 'Google Tasks', icon: CheckSquare, color: 'text-blue-400' },
    { id: 'sheets', label: 'Sheets Tracker', icon: Table, color: 'text-emerald-400' },
    { id: 'forms', label: 'Google Forms', icon: ClipboardList, color: 'text-violet-400' },
    { id: 'docs', label: 'Docs Articles', icon: FileText, color: 'text-blue-400' },
    { id: 'slides', label: 'Slides Decks', icon: Presentation, color: 'text-violet-400' },
    { id: 'drive', label: 'Drive Storage', icon: HardDrive, color: 'text-amber-400' },
    { id: 'ads', label: 'Google Ads', icon: TrendingUp, color: 'text-amber-400' },
    { id: 'vids', label: 'Google Vids', icon: Clapperboard, color: 'text-violet-400' },
    { id: 'youtube', label: 'YouTube Hub', icon: Video, color: 'text-rose-400' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Workspace Switcher Bar */}
      <div className="bg-slate-900/90 p-2 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : tab.color}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Workspace View */}
      {activeTab === 'gmail' && (
        <GmailWorkspace
          emails={emails}
          onTriggerCalendarHandoff={(email) => {
            onTriggerCalendarHandoff(email);
            setActiveTab('calendar');
          }}
          onNewEmail={onNewEmail}
        />
      )}

      {activeTab === 'calendar' && (
        <CalendarWorkspace
          events={calendarEvents}
          onAddEvent={onAddCalendarEvent}
        />
      )}

      {activeTab === 'tasks' && (
        <TasksWorkspace
          tasks={tasks}
          onToggleTask={onToggleTask}
          onAddTask={onAddTask}
        />
      )}

      {activeTab === 'sheets' && (
        <SheetsWorkspace
          rows={sheetRows}
          onTriggerDocsArticle={(row) => {
            onTriggerDocsArticle(row);
            setActiveTab('docs');
          }}
          onAddRow={onAddSheetRow}
        />
      )}

      {activeTab === 'forms' && (
        <FormsWorkspace
          forms={forms}
          onAddForm={onAddForm}
          onStreamToSheets={(form) => {
            onStreamFormToSheets(form);
            setActiveTab('sheets');
          }}
        />
      )}

      {activeTab === 'docs' && (
        <DocsWorkspace
          article={docArticle}
          onTriggerSlides={() => {
            onTriggerSlides();
            setActiveTab('slides');
          }}
          onArticleUpdated={onArticleUpdated}
        />
      )}

      {activeTab === 'slides' && (
        <SlidesWorkspace
          slides={slides}
          onTriggerDriveSave={() => {
            onTriggerDriveSave();
            setActiveTab('drive');
          }}
        />
      )}

      {activeTab === 'drive' && (
        <DriveWorkspace
          files={driveFiles}
          currentUser={currentUser}
          onAuthSuccess={onAuthSuccess}
        />
      )}

      {activeTab === 'ads' && (
        <AdsWorkspace
          campaign={adsCampaign}
          onCampaignUpdated={onCampaignUpdated}
        />
      )}

      {activeTab === 'vids' && (
        <VidsWorkspace
          scenes={videoScenes}
          onTriggerPublish={() => {
            onTriggerPublish();
            setActiveTab('youtube');
          }}
        />
      )}

      {activeTab === 'youtube' && (
        <YouTubeWorkspace
          analytics={youtubeAnalytics}
          onInjectTopicToNews={(topic) => {
            onInjectTopicToNews(topic);
            setActiveTab('sheets');
          }}
        />
      )}
    </div>
  );
};
