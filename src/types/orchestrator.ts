export type AgentId =
  | 'gmail'
  | 'calendar'
  | 'drive'
  | 'docs'
  | 'sheets'
  | 'news'
  | 'ads'
  | 'vids'
  | 'slides'
  | 'videos'
  | 'youtube_analytics'
  | 'tasks'
  | 'forms';

export type AgentDomain =
  | 'communication'
  | 'workspace'
  | 'media'
  | 'growth';

export type AgentStatus = 'idle' | 'running' | 'syncing' | 'completed' | 'paused';

export interface AgentDefinition {
  id: AgentId;
  name: string;
  shortName: string;
  domain: AgentDomain;
  domainLabel: string;
  role: string;
  description: string;
  icon: string;
  status: AgentStatus;
  successRate: number; // e.g. 99.6
  avgLatencyMs: number; // e.g. 380
  tasksExecuted: number;
  lastActive: string;
  connectedAgents: AgentId[];
  capabilities: string[];
  systemInstruction: string;
  googleService: string;
}

export interface InterAgentMessage {
  id: string;
  timestamp: string;
  sourceAgent: AgentId | 'orchestrator';
  targetAgent?: AgentId;
  messageType: 'HANDOFF' | 'DATA_SYNC' | 'TRIGGER' | 'EXECUTION';
  summary: string;
  details?: string;
}

export interface PipelineStage {
  agentId: AgentId;
  stepName: string;
  description: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  outputSummary?: string;
}

export interface PipelineDefinition {
  id: string;
  name: string;
  tagline: string;
  description: string;
  involvedAgents: AgentId[];
  stages: PipelineStage[];
}

export interface EmailArtifact {
  id: string;
  from: string;
  to: string;
  subject: string;
  date: string;
  body: string;
  status: 'draft' | 'sent' | 'received';
  handoffTriggered?: boolean;
}

export interface CalendarArtifact {
  id: string;
  title: string;
  time: string;
  duration: string;
  meetLink: string;
  attendees: string[];
  notes: string;
  status: 'confirmed' | 'tentative';
}

export interface SheetRowArtifact {
  id: string;
  topic: string;
  source: string;
  viralScore: number;
  assignedAgent: string;
  status: 'Discovered' | 'In Production' | 'Published' | 'Archived';
  format: string;
  updatedAt: string;
}

export interface DocArticleArtifact {
  id: string;
  title: string;
  author: string;
  readingTime: string;
  tags: string[];
  summary: string;
  sections: { heading: string; body: string }[];
  updatedAt: string;
}

export interface SlideArtifact {
  slideNumber: number;
  title: string;
  subtitle?: string;
  bullets?: string[];
  speakerNotes: string;
  visualConcept?: string;
}

export interface DriveItemArtifact {
  id: string;
  name: string;
  folder: string;
  type: 'doc' | 'sheet' | 'slide' | 'video' | 'pdf' | 'report' | 'form';
  size: string;
  lastModified: string;
  originAgent: AgentId;
}

export interface AdCampaignArtifact {
  id: string;
  name: string;
  status: 'ACTIVE' | 'LEARNING' | 'PAUSED';
  budgetDaily: string;
  impressions: number;
  clicks: number;
  ctr: string;
  conversions: number;
  cpa: string;
  roas: string;
  targetKeywords: string[];
}

export interface VideoSceneArtifact {
  sceneNumber: number;
  visual: string;
  audioNarration: string;
  duration: string;
}

export interface YouTubeAnalyticsArtifact {
  monthlyViews: number;
  watchTimeHours: number;
  ctr: string;
  topVideos: { title: string; views: string; retention: string }[];
  breakoutTopics: { topic: string; trend: string }[];
  competitorGaps: string[];
}

export interface TaskItemArtifact {
  id: string;
  title: string;
  notes?: string;
  due?: string;
  completed: boolean;
  assignedAgent: AgentId;
  priority: 'High' | 'Medium' | 'Low';
  originSource?: string;
}

export interface FormQuestion {
  id: string;
  title: string;
  type: 'TEXT' | 'PARAGRAPH' | 'CHOICE';
  options?: string[];
  required: boolean;
}

export interface FormArtifact {
  id: string;
  title: string;
  description: string;
  formUrl: string;
  responseCount: number;
  questions: FormQuestion[];
  linkedSheetName: string;
  lastResponseAt?: string;
}
