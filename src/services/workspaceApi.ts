import { getAccessToken, ensureAccessToken } from './auth';

export interface GoogleUserProfile {
  emailAddress?: string;
  messagesTotal?: number;
  threadsTotal?: number;
}

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  htmlLink?: string;
  hangoutLink?: string;
}

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
}

export interface GoogleYouTubeChannel {
  id: string;
  title: string;
  subscriberCount?: string;
  videoCount?: string;
  viewCount?: string;
}

export interface GoogleTaskItem {
  id: string;
  title: string;
  notes?: string;
  due?: string;
  status: 'needsAction' | 'completed';
}

export interface GoogleFormItem {
  id: string;
  title: string;
  responderUri?: string;
  revisionId?: string;
}

// Fetch live Tasks from Google Tasks API
export async function fetchLiveTasks(): Promise<GoogleTaskItem[]> {
  const token = await getAccessToken();
  if (!token) return [];

  try {
    const listRes = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!listRes.ok) throw new Error(`Tasks API list returned ${listRes.status}`);
    const listData = await listRes.json();
    const primaryListId = listData.items?.[0]?.id || '@default';

    const tasksRes = await fetch(
      `https://tasks.googleapis.com/tasks/v1/lists/${primaryListId}/tasks?showCompleted=true&maxResults=20`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!tasksRes.ok) throw new Error(`Tasks API tasks returned ${tasksRes.status}`);
    const tasksData = await tasksRes.json();
    return tasksData.items || [];
  } catch (err) {
    console.warn('Live Google Tasks fetch error:', err);
    return [];
  }
}

// Create a new task in Google Tasks API (with confirmation support)
export async function createLiveGoogleTask(
  title: string,
  notes?: string,
  due?: string
): Promise<GoogleTaskItem | null> {
  const token = await getAccessToken();
  if (!token) return null;

  try {
    const res = await fetch('https://tasks.googleapis.com/tasks/v1/lists/@default/tasks', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        notes,
        due: due || new Date(Date.now() + 86400000 * 2).toISOString(),
      }),
    });
    if (!res.ok) throw new Error(`Tasks API create returned ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Live Google Tasks create error:', err);
    return null;
  }
}

// Fetch live Forms from Drive (files with mimeType Google Forms)
export async function fetchLiveForms(): Promise<GoogleFormItem[]> {
  const token = await getAccessToken();
  if (!token) return [];

  try {
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=mimeType%3D%27application%2Fvnd.google-apps.form%27&pageSize=10&fields=files(id,name)`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!res.ok) throw new Error(`Forms Drive search returned ${res.status}`);
    const data = await res.json();
    return (data.files || []).map((f: any) => ({
      id: f.id,
      title: f.name,
      responderUri: `https://docs.google.com/forms/d/${f.id}/viewform`,
    }));
  } catch (err) {
    console.warn('Live Google Forms fetch error:', err);
    return [];
  }
}

// Fetch live Gmail profile info
export async function fetchLiveGmailProfile(): Promise<GoogleUserProfile | null> {
  const token = await getAccessToken();
  if (!token) return null;

  try {
    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error(`Gmail API returned ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Live Gmail API fetch error:', err);
    return null;
  }
}

// Fetch live Google Calendar events
export async function fetchLiveCalendarEvents(): Promise<GoogleCalendarEvent[]> {
  const token = await getAccessToken();
  if (!token) return [];

  try {
    const res = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=10&orderBy=startTime&singleEvents=true&timeMin=' +
        encodeURIComponent(new Date().toISOString()),
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!res.ok) throw new Error(`Calendar API returned ${res.status}`);
    const data = await res.json();
    return data.items || [];
  } catch (err) {
    console.warn('Live Calendar API fetch error:', err);
    return [];
  }
}

// Fetch live Google Drive files
export async function fetchLiveDriveFiles(): Promise<GoogleDriveFile[]> {
  const token = await getAccessToken();
  if (!token) return [];

  try {
    const res = await fetch(
      'https://www.googleapis.com/drive/v3/files?pageSize=15&fields=files(id,name,mimeType,size,modifiedTime)&orderBy=modifiedTime%20desc',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!res.ok) throw new Error(`Drive API returned ${res.status}`);
    const data = await res.json();
    return data.files || [];
  } catch (err) {
    console.warn('Live Drive API fetch error:', err);
    return [];
  }
}

// Fetch live YouTube channel info
export async function fetchLiveYouTubeChannel(): Promise<GoogleYouTubeChannel | null> {
  const token = await getAccessToken();
  if (!token) return null;

  try {
    const res = await fetch(
      'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!res.ok) throw new Error(`YouTube API returned ${res.status}`);
    const data = await res.json();
    const item = data.items?.[0];
    if (!item) return null;
    return {
      id: item.id,
      title: item.snippet?.title || 'YouTube Channel',
      subscriberCount: item.statistics?.subscriberCount,
      videoCount: item.statistics?.videoCount,
      viewCount: item.statistics?.viewCount,
    };
  } catch (err) {
    console.warn('Live YouTube API fetch error:', err);
    return null;
  }
}

export interface DriveFolderResult {
  id: string;
  name: string;
  webViewLink?: string;
}

// Find existing folder by name and parent
export async function findDriveFolder(
  name: string,
  parentFolderId?: string
): Promise<DriveFolderResult | null> {
  const token = await getAccessToken();
  if (!token) return null;

  try {
    let query = `mimeType='application/vnd.google-apps.folder' and name='${name.replace(/'/g, "\\'")}' and trashed=false`;
    if (parentFolderId) {
      query += ` and '${parentFolderId}' in parents`;
    }

    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,webViewLink)`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.files && data.files.length > 0) {
      return data.files[0];
    }
    return null;
  } catch (err) {
    console.warn(`Error finding Drive folder "${name}":`, err);
    return null;
  }
}

// Create a new folder in Google Drive
export async function createDriveFolder(
  name: string,
  parentFolderId?: string
): Promise<DriveFolderResult | null> {
  const token = await getAccessToken();
  if (!token) return null;

  try {
    const metadata: any = {
      name,
      mimeType: 'application/vnd.google-apps.folder',
    };
    if (parentFolderId) {
      metadata.parents = [parentFolderId];
    }

    const res = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    });

    if (!res.ok) {
      throw new Error(`Drive folder creation failed with status ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.warn(`Error creating Drive folder "${name}":`, err);
    return null;
  }
}

// Find or create folder in Google Drive
export async function findOrCreateDriveFolder(
  name: string,
  parentFolderId?: string
): Promise<DriveFolderResult | null> {
  const existing = await findDriveFolder(name, parentFolderId);
  if (existing) return existing;
  return await createDriveFolder(name, parentFolderId);
}

// Create a file in a specific Google Drive folder
export async function createDriveFileInFolder(
  name: string,
  mimeType: string,
  content: string,
  parentFolderId?: string
): Promise<{ id: string; name: string; webViewLink?: string } | null> {
  const token = await getAccessToken();
  if (!token) return null;

  try {
    // Simple multipart or metadata upload
    const metadata: any = {
      name,
      mimeType,
    };
    if (parentFolderId) {
      metadata.parents = [parentFolderId];
    }

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: text/plain; charset=UTF-8\r\n\r\n' +
      content +
      closeDelimiter;

    const res = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartRequestBody,
      }
    );

    if (!res.ok) {
      // Fallback to metadata-only file creation if multipart fails
      const metaRes = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metadata),
      });
      if (metaRes.ok) return await metaRes.json();
      return null;
    }

    return await res.json();
  } catch (err) {
    console.warn(`Error creating Drive file "${name}":`, err);
    return null;
  }
}

export interface WorkspaceFolderDefinition {
  subfolderName: string;
  workspaceKey: string;
  description: string;
  defaultFiles: { name: string; mimeType: string; content: string }[];
}

export const WORKSPACE_SUBFOLDERS: WorkspaceFolderDefinition[] = [
  {
    subfolderName: '01_Gmail_Inquiries',
    workspaceKey: 'gmail',
    description: 'Inbound client email threads, consultation summaries, and contact dossiers',
    defaultFiles: [
      {
        name: 'Sarah_Jenkins_Enterprise_Logistics_Dossier.gdoc',
        mimeType: 'application/vnd.google-apps.document',
        content: 'Client consultation dossier for Sarah Jenkins (Apex Global Logistics). Inbound inquiry parsed by Gmail Agent.',
      },
      {
        name: 'Inbound_Inquiry_Triage_Index.txt',
        mimeType: 'text/plain',
        content: 'Index of inbound leads triaged with sentiment, meeting requirements, and routing tags.',
      },
    ],
  },
  {
    subfolderName: '02_Calendar_Meetings',
    workspaceKey: 'calendar',
    description: 'Google Meet briefing notes, calendar reservations, and consultation agendas',
    defaultFiles: [
      {
        name: 'Executive_Consultation_Google_Meet_Agenda.gdoc',
        mimeType: 'application/vnd.google-apps.document',
        content: 'Meeting agenda for Apex Logistics: AI Agent Swarm Demonstration on Google Meet.',
      },
    ],
  },
  {
    subfolderName: '03_Tasks_Checklists',
    workspaceKey: 'tasks',
    description: 'Google Tasks action checklists, milestone deadlines, and project requirements',
    defaultFiles: [
      {
        name: 'Enterprise_Multi_Agent_Launch_Action_Plan.gdoc',
        mimeType: 'application/vnd.google-apps.document',
        content: 'Prioritized checklist of deliverables: Docs whitepaper, Slides briefing, and Ads setup.',
      },
    ],
  },
  {
    subfolderName: '04_Sheets_Roadmaps',
    workspaceKey: 'sheets',
    description: 'Content automation roadmaps, viral performance trackers, and editorial backlogs',
    defaultFiles: [
      {
        name: 'Q4_Content_Automation_Matrix.gsheet',
        mimeType: 'application/vnd.google-apps.spreadsheet',
        content: 'Topic, Source, Viral Score, Assigned Agent, Status, Format\nAutonomous Agent Swarms, TechCrunch, 94, Google Docs Agent, In Production, Whitepaper (1500w)',
      },
    ],
  },
  {
    subfolderName: '05_Forms_Surveys',
    workspaceKey: 'forms',
    description: 'Client intake questionnaires, workflow surveys, and feedback forms',
    defaultFiles: [
      {
        name: 'Enterprise_AI_Agent_Workflow_Intake_Survey.gform',
        mimeType: 'application/vnd.google-apps.form',
        content: 'Client Intake Survey schema: Company Name, Workflow Bottlenecks, Workspace Integration Goals.',
      },
    ],
  },
  {
    subfolderName: '06_Docs_Articles',
    workspaceKey: 'docs',
    description: 'Comprehensive research whitepapers, architecture documentation, and synthesized articles',
    defaultFiles: [
      {
        name: 'Autonomous_Agent_Swarms_Enterprise_Whitepaper.gdoc',
        mimeType: 'application/vnd.google-apps.document',
        content: 'Autonomous Agent Swarms: The Next Frontier of Enterprise Automation\nAuthored by Google Docs Agent.\nSummary: Transitioning enterprise operations to 24/7 autonomous multi-agent coordination.',
      },
    ],
  },
  {
    subfolderName: '07_Slides_Decks',
    workspaceKey: 'slides',
    description: 'Executive briefing decks, pitch presentations, and visual concept blueprints',
    defaultFiles: [
      {
        name: 'Executive_Briefing_Agent_Orchestration.gslides',
        mimeType: 'application/vnd.google-apps.presentation',
        content: 'Executive Briefing: Multi-Agent Workspace Orchestration.\n5 slides with architecture diagrams and ROI breakdown.',
      },
    ],
  },
  {
    subfolderName: '08_Vids_Storyboards',
    workspaceKey: 'vids',
    description: 'Video storyboards, scene timing, and AI Studio prompt directions',
    defaultFiles: [
      {
        name: 'The_24_7_Agent_Swarm_Storyboard.mp4',
        mimeType: 'video/mp4',
        content: '90-second video storyboard specification with scene cues, visual prompts, and voiceover scripts.',
      },
    ],
  },
  {
    subfolderName: '09_YouTube_Media',
    workspaceKey: 'youtube',
    description: 'YouTube publication bundles, SEO tags, chapter timestamps, and channel retention reports',
    defaultFiles: [
      {
        name: 'Automating_Enterprise_Workflows_Release_Bundle.json',
        mimeType: 'application/json',
        content: '{"title": "Automating Enterprise Workflows with Google Agents in 2026", "chapters": ["0:00 Intro", "1:15 Gmail & Calendar", "3:40 Docs & Slides"], "tags": ["AI Agents", "Google Workspace"]}',
      },
    ],
  },
  {
    subfolderName: '10_Ads_Campaigns',
    workspaceKey: 'ads',
    description: 'Google Ads performance audits, keyword variations, and monthly ROAS reports',
    defaultFiles: [
      {
        name: 'Q4_Enterprise_Ads_Performance_Report.pdf',
        mimeType: 'application/pdf',
        content: 'Google Ads Performance Report: Target ROAS 380%, 284 conversions, Search and Discovery campaigns.',
      },
    ],
  },
];

export interface ProvisioningStatus {
  step: string;
  progress: number;
  rootFolder?: DriveFolderResult;
  subfoldersCreated: { name: string; id: string; webViewLink?: string }[];
  filesCreated: { name: string; folder: string; id: string }[];
}

// Provision Google Agent Orchestrator root folder and all workspace subfolders in Google Drive
export async function provisionGoogleAgentOrchestratorDrive(
  onProgress?: (status: ProvisioningStatus) => void
): Promise<{
  success: boolean;
  rootFolder: DriveFolderResult | null;
  subfolders: { name: string; id: string; webViewLink?: string }[];
  files: { name: string; folder: string; id: string }[];
  error?: string;
}> {
  let token = await getAccessToken();
  if (!token) {
    token = await ensureAccessToken();
  }
  if (!token) {
    return {
      success: false,
      rootFolder: null,
      subfolders: [],
      files: [],
      error: 'Google authentication required. Please sign in with your Google account to grant permission to create folders in Google Drive.',
    };
  }

  const subfoldersResult: { name: string; id: string; webViewLink?: string }[] = [];
  const filesResult: { name: string; folder: string; id: string }[] = [];

  try {
    // 1. Create or find root folder "Google Agent Orchestrator"
    if (onProgress) {
      onProgress({
        step: 'Locating or creating root folder "Google Agent Orchestrator"...',
        progress: 10,
        subfoldersCreated: [],
        filesCreated: [],
      });
    }

    const rootFolder = await findOrCreateDriveFolder('Google Agent Orchestrator');
    if (!rootFolder) {
      throw new Error('Failed to create root folder "Google Agent Orchestrator"');
    }

    // 2. Iterate through each workspace subfolder
    const total = WORKSPACE_SUBFOLDERS.length;
    for (let i = 0; i < total; i++) {
      const def = WORKSPACE_SUBFOLDERS[i];
      const progressPercent = Math.round(15 + ((i + 1) / total) * 60);

      if (onProgress) {
        onProgress({
          step: `Creating subfolder: ${def.subfolderName}...`,
          progress: progressPercent,
          rootFolder,
          subfoldersCreated: subfoldersResult,
          filesCreated: filesResult,
        });
      }

      // Create or find subfolder inside Google Agent Orchestrator
      const sub = await findOrCreateDriveFolder(def.subfolderName, rootFolder.id);
      if (sub) {
        subfoldersResult.push({
          name: def.subfolderName,
          id: sub.id,
          webViewLink: sub.webViewLink || `https://drive.google.com/drive/folders/${sub.id}`,
        });

        // Create initial artifact files inside this subfolder
        for (const fileDef of def.defaultFiles) {
          const createdFile = await createDriveFileInFolder(
            fileDef.name,
            fileDef.mimeType,
            fileDef.content,
            sub.id
          );
          if (createdFile) {
            filesResult.push({
              name: fileDef.name,
              folder: def.subfolderName,
              id: createdFile.id,
            });
          }
        }
      }
    }

    if (onProgress) {
      onProgress({
        step: 'All workspace folders and artifact items created successfully!',
        progress: 100,
        rootFolder,
        subfoldersCreated: subfoldersResult,
        filesCreated: filesResult,
      });
    }

    return {
      success: true,
      rootFolder,
      subfolders: subfoldersResult,
      files: filesResult,
    };
  } catch (err: any) {
    console.error('Provisioning Google Agent Orchestrator Drive hierarchy error:', err);
    return {
      success: false,
      rootFolder: null,
      subfolders: subfoldersResult,
      files: filesResult,
      error: err.message,
    };
  }
}

