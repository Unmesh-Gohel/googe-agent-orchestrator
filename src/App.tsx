import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  AgentDefinition,
  AgentId,
  InterAgentMessage,
  PipelineDefinition,
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
} from './types/orchestrator';
import {
  INITIAL_AGENTS,
  INITIAL_PIPELINES,
  INITIAL_MESSAGES,
  INITIAL_EMAILS,
  INITIAL_CALENDAR_EVENTS,
  INITIAL_SHEET_ROWS,
  INITIAL_DOC_ARTICLE,
  INITIAL_SLIDES,
  INITIAL_DRIVE_FILES,
  INITIAL_ADS_CAMPAIGN,
  INITIAL_VIDEO_SCENES,
  INITIAL_YOUTUBE_ANALYTICS,
  INITIAL_TASKS,
  INITIAL_FORMS,
} from './data/initialEcosystem';
import { Header } from './components/Header';
import { TopologyGraph } from './components/TopologyGraph';
import { AgentFleetGrid } from './components/AgentFleetGrid';
import { DraggableDashboardGrid } from './components/dashboard/DraggableDashboardGrid';
import { AgentDetailModal } from './components/AgentDetailModal';
import { MessageBusStream } from './components/MessageBusStream';
import { PipelineExecutor } from './components/PipelineExecutor';
import { MissionModal } from './components/MissionModal';
import { GoogleAccountsModal } from './components/GoogleAccountsModal';
import { AiMasterOrchestrator } from './components/AiMasterOrchestrator';
import { WorkspaceHub } from './components/workspaces/WorkspaceHub';
import { executeAgentTask } from './services/api';
import { initAuth } from './services/auth';
import {
  Layers,
  Sparkles,
  ArrowRight,
  Radio,
  CheckCircle2,
  Clock,
  Zap,
  Activity,
  Workflow,
  ShieldCheck,
  FolderKanban,
  Brain,
} from 'lucide-react';

export default function App() {
  // Navigation View State
  const [currentView, setCurrentView] = useState<
    'dashboard' | 'ai-manager' | 'topology' | 'pipelines' | 'workspaces' | 'messages'
  >('dashboard');
  const [workspaceInitialTab, setWorkspaceInitialTab] = useState<string>('gmail');

  // Google Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAccountsModalOpen, setIsAccountsModalOpen] = useState(false);

  // Orchestrator State
  const [agents, setAgents] = useState<AgentDefinition[]>(INITIAL_AGENTS);
  const [messages, setMessages] = useState<InterAgentMessage[]>(INITIAL_MESSAGES);
  const [pipelines, setPipelines] = useState<PipelineDefinition[]>(INITIAL_PIPELINES);
  const [activeHandoff, setActiveHandoff] = useState<{ source: AgentId; target: AgentId } | null>(
    null
  );

  // Workspaces Data
  const [emails, setEmails] = useState<EmailArtifact[]>(INITIAL_EMAILS);
  const [calendarEvents, setCalendarEvents] = useState<CalendarArtifact[]>(INITIAL_CALENDAR_EVENTS);
  const [sheetRows, setSheetRows] = useState<SheetRowArtifact[]>(INITIAL_SHEET_ROWS);
  const [docArticle, setDocArticle] = useState<DocArticleArtifact>(INITIAL_DOC_ARTICLE);
  const [slides, setSlides] = useState<SlideArtifact[]>(INITIAL_SLIDES);
  const [driveFiles, setDriveFiles] = useState<DriveItemArtifact[]>(INITIAL_DRIVE_FILES);
  const [adsCampaign, setAdsCampaign] = useState<AdCampaignArtifact>(INITIAL_ADS_CAMPAIGN);
  const [videoScenes, setVideoScenes] = useState<VideoSceneArtifact[]>(INITIAL_VIDEO_SCENES);
  const [youtubeAnalytics, setYoutubeAnalytics] = useState<YouTubeAnalyticsArtifact>(
    INITIAL_YOUTUBE_ANALYTICS
  );
  const [tasks, setTasks] = useState<TaskItemArtifact[]>(INITIAL_TASKS);
  const [forms, setForms] = useState<FormArtifact[]>(INITIAL_FORMS);

  // Modals & Active Controls
  const [selectedAgent, setSelectedAgent] = useState<AgentDefinition | null>(null);
  const [isMissionModalOpen, setIsMissionModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize Auth Listener on load
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, _token) => {
        setCurrentUser(user);
      },
      () => {
        setCurrentUser(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  const handleAuthSuccess = (user: User, token: string) => {
    setCurrentUser(user);
    showToast(`Signed in as ${user.displayName || user.email}`);
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    showToast('Signed out of Google account.');
  };

  const handleSyncLiveData = (liveData: any) => {
    if (liveData.calendarEvents && liveData.calendarEvents.length > 0) {
      const converted = liveData.calendarEvents.map((evt: any, idx: number) => ({
        id: evt.id || `live-cal-${idx}`,
        title: evt.summary || 'Live Calendar Event',
        time: evt.start?.dateTime ? new Date(evt.start.dateTime).toLocaleString() : 'Upcoming',
        duration: '30-45 mins',
        meetLink: evt.hangoutLink || evt.htmlLink || 'https://meet.google.com',
        attendees: [currentUser?.email || 'user@gmail.com'],
        notes: 'Synchronized live from connected Google Calendar account.',
        status: 'confirmed' as const,
      }));
      setCalendarEvents((prev) => [...converted, ...prev]);
    }

    if (liveData.driveFiles && liveData.driveFiles.length > 0) {
      const convertedFiles = liveData.driveFiles.map((f: any, idx: number) => ({
        id: f.id || `live-drive-${idx}`,
        name: f.name || 'Drive File',
        folder: '07_Live_Google_Drive_Files',
        type: (f.mimeType?.includes('sheet')
          ? 'sheet'
          : f.mimeType?.includes('presentation')
          ? 'slide'
          : f.mimeType?.includes('video')
          ? 'video'
          : 'doc') as any,
        size: f.size ? `${(parseInt(f.size) / (1024 * 1024)).toFixed(1)} MB` : '1.2 MB',
        lastModified: f.modifiedTime ? new Date(f.modifiedTime).toLocaleDateString() : 'Recent',
        originAgent: 'drive' as const,
      }));
      setDriveFiles((prev) => [...convertedFiles, ...prev]);
    }

    if (liveData.gmailProfile) {
      showToast(`Synchronized live Gmail inbox (${liveData.gmailProfile.messagesTotal} messages)`);
    } else {
      showToast('Live Google Workspace data synchronized!');
    }
  };

  // Helper to trigger specific agent
  const handleTriggerAgent = async (agentId: AgentId) => {
    // Set agent status to running
    setAgents((prev) =>
      prev.map((a) => (a.id === agentId ? { ...a, status: 'running' } : a))
    );

    showToast(`Dispatched operational cycle to ${agentId.toUpperCase()} Agent...`);

    const result = await executeAgentTask(agentId);

    // Update agent state
    setAgents((prev) =>
      prev.map((a) =>
        a.id === agentId
          ? {
              ...a,
              status: 'idle',
              tasksExecuted: a.tasksExecuted + 1,
              lastActive: 'Just now',
            }
          : a
      )
    );

    // If handoff occurred, pulse topology edge & append message
    if (result.handoffTo) {
      setActiveHandoff({ source: agentId, target: result.handoffTo });
      setTimeout(() => setActiveHandoff(null), 3000);

      const newMsg: InterAgentMessage = {
        id: `msg-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        sourceAgent: agentId,
        targetAgent: result.handoffTo,
        messageType: 'HANDOFF',
        summary: result.summary,
        details: result.handoffPayload,
      };
      setMessages((prev) => [newMsg, ...prev]);
    }

    showToast(`✓ ${agentId.toUpperCase()} Agent completed task successfully`);
  };

  // Open Workspace tab directly
  const handleOpenWorkspace = (agentId: AgentId) => {
    const tabMap: Record<AgentId, string> = {
      gmail: 'gmail',
      calendar: 'calendar',
      tasks: 'tasks',
      sheets: 'sheets',
      forms: 'forms',
      news: 'sheets',
      docs: 'docs',
      slides: 'slides',
      drive: 'drive',
      vids: 'vids',
      videos: 'youtube',
      youtube_analytics: 'youtube',
      ads: 'ads',
    };
    setWorkspaceInitialTab(tabMap[agentId] || 'gmail');
    setCurrentView('workspaces');
  };

  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleAddTask = (task: TaskItemArtifact) => {
    setTasks((prev) => [task, ...prev]);
    showToast(`Task added: "${task.title}"`);
  };

  const handleAddForm = (form: FormArtifact) => {
    setForms((prev) => [form, ...prev]);
    showToast(`Google Form created: "${form.title}"`);
  };

  const handleStreamFormToSheets = (form: FormArtifact) => {
    setActiveHandoff({ source: 'forms', target: 'sheets' });
    setTimeout(() => setActiveHandoff(null), 3000);

    const newRow: SheetRowArtifact = {
      id: `row-${Date.now()}`,
      topic: `Intake Submission: ${form.title}`,
      source: 'Google Forms Inbound Route',
      viralScore: 89,
      assignedAgent: 'Google Sheets Agent',
      status: 'In Production',
      format: 'Spreadsheet Response Row',
      updatedAt: 'Just now',
    };
    setSheetRows((prev) => [newRow, ...prev]);

    const newMsg: InterAgentMessage = {
      id: `msg-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      sourceAgent: 'forms',
      targetAgent: 'sheets',
      messageType: 'DATA_SYNC',
      summary: `Streamed submissions from "${form.title}" into Google Sheets Tracker`,
      details: 'Automatic schema field mapping executed.',
    };
    setMessages((prev) => [newMsg, ...prev]);
    showToast(`Streamed responses from "${form.title}" into Google Sheets`);
  };

  // Handlers for cross-agent actions in workspaces
  const handleTriggerCalendarHandoff = (email: EmailArtifact) => {
    setActiveHandoff({ source: 'gmail', target: 'calendar' });
    setTimeout(() => setActiveHandoff(null), 3000);

    const newEvent: CalendarArtifact = {
      id: `cal-${Date.now()}`,
      title: `Consultation: ${email.subject.replace(/^Re:\s*/i, '')}`,
      time: 'Friday, Oct 5, 2026 · 2:00 PM - 2:45 PM PDT',
      duration: '45 mins',
      meetLink: 'https://meet.google.com/ais-orch-meet',
      attendees: [email.from, 'team@google-orchestrator.internal'],
      notes: `Booked via Gmail Agent parsing of inbound inquiry from ${email.from}.`,
      status: 'confirmed',
    };
    setCalendarEvents((prev) => [newEvent, ...prev]);

    const newMsg: InterAgentMessage = {
      id: `msg-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      sourceAgent: 'gmail',
      targetAgent: 'calendar',
      messageType: 'HANDOFF',
      summary: `Parsed email from ${email.from} -> Created 45m Google Meet session`,
      details: `Google Meet link generated: ${newEvent.meetLink}`,
    };
    setMessages((prev) => [newMsg, ...prev]);
    showToast('Gmail Agent handed off meeting creation to Calendar Agent');
  };

  const handleTriggerDocsFromSheet = (row: SheetRowArtifact) => {
    setActiveHandoff({ source: 'sheets', target: 'docs' });
    setTimeout(() => setActiveHandoff(null), 3000);

    setDocArticle((prev) => ({
      ...prev,
      title: row.topic,
      summary: `Enterprise technical brief examining ${row.topic}. Generated from Google Sheets priority queue.`,
      updatedAt: 'Just now',
    }));

    const newMsg: InterAgentMessage = {
      id: `msg-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      sourceAgent: 'sheets',
      targetAgent: 'docs',
      messageType: 'TRIGGER',
      summary: `Triggered Docs Agent to draft full article for: "${row.topic}"`,
      details: `Viral score: ${row.viralScore}/100. Status: In Production.`,
    };
    setMessages((prev) => [newMsg, ...prev]);
    showToast('Sheets Agent triggered Docs Agent to author whitepaper');
  };

  const handleTriggerSlidesFromDocs = () => {
    setActiveHandoff({ source: 'docs', target: 'slides' });
    setTimeout(() => setActiveHandoff(null), 3000);

    const newMsg: InterAgentMessage = {
      id: `msg-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      sourceAgent: 'docs',
      targetAgent: 'slides',
      messageType: 'HANDOFF',
      summary: `Extracted key insights from "${docArticle.title}" to generate 5-slide Executive Deck`,
      details: 'Passed executive summary & section headers to Google Slides Agent.',
    };
    setMessages((prev) => [newMsg, ...prev]);
    showToast('Docs Agent passed presentation outline to Slides Agent');
  };

  const handleTriggerDriveSave = () => {
    const newDriveItem: DriveItemArtifact = {
      id: `drive-${Date.now()}`,
      name: 'Executive_Briefing_Deck_Updated.gslides',
      folder: '03_Client_Presentations',
      type: 'slide',
      size: '9.2 MB',
      lastModified: 'Just now',
      originAgent: 'slides',
    };
    setDriveFiles((prev) => [newDriveItem, ...prev]);
    showToast('Saved presentation deck to Google Drive /MyDrive/Agent_Orchestrator/');
  };

  const handleTriggerPublishVideo = () => {
    setActiveHandoff({ source: 'vids', target: 'videos' });
    setTimeout(() => setActiveHandoff(null), 3000);

    const newMsg: InterAgentMessage = {
      id: `msg-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      sourceAgent: 'vids',
      targetAgent: 'videos',
      messageType: 'HANDOFF',
      summary: 'Storyboards rendered in Google Vids -> Sent package to Google Videos Agent',
      details: 'Metadata, timestamps, and thumbnail concept prepared for YouTube.',
    };
    setMessages((prev) => [newMsg, ...prev]);
    showToast('Google Vids Agent handed off video package to Google Videos Agent');
  };

  const handleInjectTopicToNews = (topic: string) => {
    setActiveHandoff({ source: 'youtube_analytics', target: 'news' });
    setTimeout(() => setActiveHandoff(null), 3000);

    const newRow: SheetRowArtifact = {
      id: `row-${Date.now()}`,
      topic,
      source: 'YouTube Competitor Gap Intelligence',
      viralScore: 95,
      assignedAgent: 'Google Docs Agent',
      status: 'Discovered',
      format: 'Video + Docs Article',
      updatedAt: 'Just now',
    };
    setSheetRows((prev) => [newRow, ...prev]);

    const newMsg: InterAgentMessage = {
      id: `msg-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      sourceAgent: 'youtube_analytics',
      targetAgent: 'news',
      messageType: 'HANDOFF',
      summary: `Competitor gap topic "${topic}" fed back into News & Sheets agents`,
      details: 'Closed-loop cycle initialized: ready for research & content production.',
    };
    setMessages((prev) => [newMsg, ...prev]);
    showToast(`Injected high-demand topic into Google News & Sheets: "${topic}"`);
  };

  const ecosystemSummary = {
    totalAgents: agents.length,
    activeAgents: agents.filter((a) => a.status !== 'paused').length,
    pendingEmailsCount: emails.filter((e) => e.status === 'received').length,
    confirmedEventsCount: calendarEvents.length,
    pendingTasksCount: tasks.filter((t) => !t.completed).length,
    driveFilesCount: driveFiles.length,
    sheetRowsCount: sheetRows.length,
    formResponsesCount: forms.reduce((acc, f) => acc + f.responseCount, 0),
    adRoas: adsCampaign.roas,
    recentLogSummaries: messages.slice(0, 5).map((m) => `${m.sourceAgent} -> ${m.targetAgent || 'system'}: ${m.summary}`),
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        onOpenMission={() => setIsMissionModalOpen(true)}
        onOpenAccounts={() => setIsAccountsModalOpen(true)}
        currentUser={currentUser}
        activeAgentsCount={agents.filter((a) => a.status !== 'paused').length}
        totalAgentsCount={agents.length}
        isPipelineRunning={false}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Quick System Metric Strip */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 shadow-sm">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium block mb-1">
              Active Agents
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono text-slate-100 tabular-nums">
                11/11
              </span>
              <span className="text-[11px] text-emerald-400 font-medium">100% Operational</span>
            </div>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 shadow-sm">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium block mb-1">
              Total Dispatches
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono text-slate-100 tabular-nums">
                2,488
              </span>
              <span className="text-[11px] text-blue-400 font-medium">+14 Today</span>
            </div>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 shadow-sm">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium block mb-1">
              Cross-Agent Handoffs
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono text-slate-100 tabular-nums">
                {messages.length}
              </span>
              <span className="text-[11px] text-emerald-400 font-medium">Zero-Latency</span>
            </div>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 shadow-sm">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium block mb-1">
              Drive Assets Managed
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono text-slate-100 tabular-nums">
                {driveFiles.length} files
              </span>
              <span className="text-[11px] text-amber-400 font-medium">274 MB</span>
            </div>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 shadow-sm col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium block mb-1">
              Avg Inter-Agent Latency
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold font-mono text-slate-100 tabular-nums">
                380ms
              </span>
              <span className="text-[11px] text-emerald-400 font-medium">Gemini 3.8</span>
            </div>
          </div>
        </section>

        {/* View Content Rendering */}
        {currentView === 'dashboard' && (
          <div className="space-y-8">
            {/* Quick Hero Dispatch Callout */}
            <div className="bg-gradient-to-r from-blue-950/40 via-slate-900/80 to-indigo-950/40 p-6 rounded-2xl border border-blue-500/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1.5 max-w-2xl">
                <span className="text-xs font-mono text-blue-400 font-semibold tracking-wide">
                  Centralized Agent Oversight & Workload Delegation
                </span>
                <h1 className="text-xl font-bold text-slate-100 tracking-tight">
                  Autonomous Multi-Agent Google Ecosystem
                </h1>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Coordinates communication (Gmail, Calendar), storage (Drive), content creation
                  (Docs, Sheets, News, Slides), media production (Vids, Videos), advertising
                  (Ads), and channel analytics (YouTube) in real time.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0 flex-wrap">
                <button
                  onClick={() => setCurrentView('ai-manager')}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-500/10 transition-all active:scale-95"
                >
                  <Brain className="w-3.5 h-3.5 text-blue-200" />
                  <span>Master AI Autopilot</span>
                </button>

                <button
                  onClick={() => setCurrentView('topology')}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-700 transition-colors"
                >
                  <span>Explore Topology</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setIsMissionModalOpen(true)}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-700 transition-all active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Dispatch Mission</span>
                </button>
              </div>
            </div>

            {/* Draggable & Resizable Agent & Workspace Grid */}
            <DraggableDashboardGrid
              agents={agents}
              emails={emails}
              calendarEvents={calendarEvents}
              tasks={tasks}
              sheetRows={sheetRows}
              forms={forms}
              driveFiles={driveFiles}
              youtubeAnalytics={youtubeAnalytics}
              onSelectAgent={setSelectedAgent}
              onTriggerAgent={handleTriggerAgent}
              onOpenWorkspace={handleOpenWorkspace}
              onToggleTask={handleToggleTask}
            />

            {/* Message Stream Summary on Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <PipelineExecutor
                  pipelines={pipelines}
                  onOpenWorkspace={handleOpenWorkspace}
                  onPipelineSuccess={(pipeId, result) => {
                    showToast(`Pipeline "${pipeId}" executed across ecosystem`);
                  }}
                />
              </div>

              <div>
                <MessageBusStream
                  messages={messages.slice(0, 6)}
                  onTriggerSampleHandoff={() => {
                    handleTriggerAgent('news');
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {currentView === 'ai-manager' && (
          <div className="space-y-6">
            <AiMasterOrchestrator
              ecosystemSummary={ecosystemSummary}
              onExecuteAgentTask={handleTriggerAgent}
              onShowToast={showToast}
            />
          </div>
        )}

        {currentView === 'topology' && (
          <div className="space-y-6">
            <TopologyGraph
              agents={agents}
              onSelectAgent={setSelectedAgent}
              onTriggerAgent={handleTriggerAgent}
              activeHandoff={activeHandoff}
            />
          </div>
        )}

        {currentView === 'pipelines' && (
          <div className="space-y-6">
            <PipelineExecutor
              pipelines={pipelines}
              onOpenWorkspace={handleOpenWorkspace}
              onPipelineSuccess={(pipeId, result) => {
                showToast(`Pipeline "${pipeId}" completed successfully!`);
              }}
            />
          </div>
        )}

        {currentView === 'workspaces' && (
          <WorkspaceHub
            initialTab={workspaceInitialTab}
            emails={emails}
            calendarEvents={calendarEvents}
            sheetRows={sheetRows}
            docArticle={docArticle}
            slides={slides}
            driveFiles={driveFiles}
            adsCampaign={adsCampaign}
            videoScenes={videoScenes}
            youtubeAnalytics={youtubeAnalytics}
            tasks={tasks}
            forms={forms}
            onTriggerCalendarHandoff={handleTriggerCalendarHandoff}
            onNewEmail={(newEm) => setEmails((prev) => [newEm, ...prev])}
            onAddCalendarEvent={(newEv) => setCalendarEvents((prev) => [newEv, ...prev])}
            onAddSheetRow={(newR) => setSheetRows((prev) => [newR, ...prev])}
            onTriggerDocsArticle={handleTriggerDocsFromSheet}
            onArticleUpdated={setDocArticle}
            onTriggerSlides={handleTriggerSlidesFromDocs}
            onTriggerDriveSave={handleTriggerDriveSave}
            onCampaignUpdated={setAdsCampaign}
            onTriggerPublish={handleTriggerPublishVideo}
            onInjectTopicToNews={handleInjectTopicToNews}
            onToggleTask={handleToggleTask}
            onAddTask={handleAddTask}
            onAddForm={handleAddForm}
            onStreamFormToSheets={handleStreamFormToSheets}
            currentUser={currentUser}
            onAuthSuccess={handleAuthSuccess}
          />
        )}

        {currentView === 'messages' && (
          <MessageBusStream
            messages={messages}
            onTriggerSampleHandoff={() => {
              handleTriggerAgent('gmail');
            }}
          />
        )}
      </main>

      {/* Agent Inspector Modal */}
      <AgentDetailModal
        agent={selectedAgent}
        onClose={() => setSelectedAgent(null)}
        onExecutionComplete={(result) => {
          showToast(`Execution completed for ${selectedAgent?.shortName}`);
        }}
      />

      {/* Mission Dispatcher Modal */}
      <MissionModal
        isOpen={isMissionModalOpen}
        onClose={() => setIsMissionModalOpen(false)}
        onMissionDispatched={(res) => {
          showToast('Multi-Agent Mission dispatched across ecosystem!');
        }}
      />

      {/* Google Accounts & Authentication Modal */}
      <GoogleAccountsModal
        isOpen={isAccountsModalOpen}
        onClose={() => setIsAccountsModalOpen(false)}
        currentUser={currentUser}
        onAuthSuccess={handleAuthSuccess}
        onSignOut={handleSignOut}
        onSyncLiveData={handleSyncLiveData}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-blue-500/50 text-slate-100 text-xs px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-2.5 animate-in slide-in-from-bottom duration-200">
          <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/80 py-6 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-400">
            <span>Google Agent Orchestrator</span>
            <span aria-hidden="true">·</span>
            <span>Gemini Agent Platform</span>
            <span aria-hidden="true">·</span>
            <span>11 Specialized Workspace Agents</span>
          </div>
          <div className="text-slate-500 font-mono text-[11px]">
            Connected: Gmail · Calendar · Drive · Docs · Sheets · News · Ads · Vids · Slides · Videos · YouTube
          </div>
        </div>
      </footer>
    </div>
  );
}
