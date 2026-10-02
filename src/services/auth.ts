import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

export type WorkspaceServiceId =
  | 'drive'
  | 'gmail'
  | 'calendar'
  | 'tasks'
  | 'sheets'
  | 'docs'
  | 'slides'
  | 'forms'
  | 'youtube';

export interface ServiceAuthConfig {
  id: WorkspaceServiceId;
  name: string;
  shortName: string;
  scope: string;
  scopeLabel: string;
  description: string;
  color: string;
}

export const WORKSPACE_SERVICES_CONFIG: Record<WorkspaceServiceId, ServiceAuthConfig> = {
  drive: {
    id: 'drive',
    name: 'Google Drive Account',
    shortName: 'Google Drive',
    scope: 'https://www.googleapis.com/auth/drive.file',
    scopeLabel: 'drive.file',
    description: 'Allows creating "/Google Agent Orchestrator/" folders and storing agent deliverables',
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  },
  gmail: {
    id: 'gmail',
    name: 'Google Gmail Account',
    shortName: 'Gmail',
    scope: 'https://www.googleapis.com/auth/gmail.readonly',
    scopeLabel: 'gmail.readonly',
    description: 'Allows reading incoming inquiries & extracting consultation requirements',
    color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  },
  calendar: {
    id: 'calendar',
    name: 'Google Calendar Account',
    shortName: 'Google Calendar',
    scope: 'https://www.googleapis.com/auth/calendar.events',
    scopeLabel: 'calendar.events',
    description: 'Allows scheduling consultations and provisioning Google Meet sessions',
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  },
  tasks: {
    id: 'tasks',
    name: 'Google Tasks Account',
    shortName: 'Google Tasks',
    scope: 'https://www.googleapis.com/auth/tasks',
    scopeLabel: 'tasks',
    description: 'Allows creating and checking off task items & milestone checklists',
    color: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
  },
  sheets: {
    id: 'sheets',
    name: 'Google Sheets Account',
    shortName: 'Google Sheets',
    scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
    scopeLabel: 'spreadsheets.readonly',
    description: 'Allows reading and streaming data into editorial and intake matrices',
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  },
  docs: {
    id: 'docs',
    name: 'Google Docs Account',
    shortName: 'Google Docs',
    scope: 'https://www.googleapis.com/auth/documents.readonly',
    scopeLabel: 'documents.readonly',
    description: 'Allows reading generated technical whitepapers and research documents',
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  },
  slides: {
    id: 'slides',
    name: 'Google Slides Account',
    shortName: 'Google Slides',
    scope: 'https://www.googleapis.com/auth/presentations.readonly',
    scopeLabel: 'presentations.readonly',
    description: 'Allows reading executive presentation decks and pitch blueprints',
    color: 'text-violet-400 bg-violet-500/10 border-violet-500/30',
  },
  forms: {
    id: 'forms',
    name: 'Google Forms Account',
    shortName: 'Google Forms',
    scope: 'https://www.googleapis.com/auth/forms.body.readonly',
    scopeLabel: 'forms.body.readonly',
    description: 'Allows accessing client intake questionnaires and survey schemas',
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube Account',
    shortName: 'YouTube',
    scope: 'https://www.googleapis.com/auth/youtube.readonly',
    scopeLabel: 'youtube.readonly',
    description: 'Allows reading channel analytics, subscriber stats, and retention curves',
    color: 'text-red-400 bg-red-500/10 border-red-500/30',
  },
};

export const SCOPES = Object.values(WORKSPACE_SERVICES_CONFIG).map((c) => c.scope);

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// In-memory cache for access tokens (per service and global)
// As required by the security skill: tokens are strictly kept in memory, NEVER in localStorage/sessionStorage.
let cachedAccessToken: string | null = null;
const cachedServiceTokens: Record<string, string> = {};
let isSigningIn = false;

// Track connected status metadata (names/timestamps only, no secrets or tokens)
const CONNECTED_METADATA_KEY = 'agent_orchestrator_connected_services_meta';

export const getConnectedServicesMeta = (): Record<string, { connected: boolean; email?: string; connectedAt?: string }> => {
  try {
    const raw = localStorage.getItem(CONNECTED_METADATA_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveConnectedServiceMeta = (serviceId: string, email?: string) => {
  try {
    const meta = getConnectedServicesMeta();
    meta[serviceId] = {
      connected: true,
      email: email || 'Connected',
      connectedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    localStorage.setItem(CONNECTED_METADATA_KEY, JSON.stringify(meta));
  } catch (err) {
    console.warn('Could not save service connection metadata:', err);
  }
};

const removeConnectedServiceMeta = (serviceId: string) => {
  try {
    const meta = getConnectedServicesMeta();
    delete meta[serviceId];
    localStorage.setItem(CONNECTED_METADATA_KEY, JSON.stringify(meta));
  } catch (err) {
    console.warn('Could not remove service connection metadata:', err);
  }
};

// Initialize auth state listener. Call this on app load.
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Connect a specific Google Workspace Service separately with its own least-privilege scope!
export const signInWithService = async (
  serviceId: WorkspaceServiceId
): Promise<{ user: User; accessToken: string; serviceId: WorkspaceServiceId } | null> => {
  const serviceConfig = WORKSPACE_SERVICES_CONFIG[serviceId];
  if (!serviceConfig) {
    throw new Error(`Unknown service: ${serviceId}`);
  }

  try {
    isSigningIn = true;
    const provider = new GoogleAuthProvider();
    // Only request the specific scope for this service!
    provider.addScope(serviceConfig.scope);
    provider.setCustomParameters({
      prompt: 'select_account',
    });

    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error(`Failed to get access token for ${serviceConfig.shortName}`);
    }

    // Cache the token in memory
    cachedAccessToken = credential.accessToken;
    cachedServiceTokens[serviceId] = credential.accessToken;

    // Save metadata
    saveConnectedServiceMeta(serviceId, result.user.email || undefined);

    return {
      user: result.user,
      accessToken: credential.accessToken,
      serviceId,
    };
  } catch (error: any) {
    const errorCode = error?.code || '';
    const errorMsg = error?.message || '';

    if (
      errorCode === 'auth/popup-closed-by-user' ||
      errorCode === 'auth/cancelled-popup-request' ||
      errorMsg.includes('popup-closed-by-user') ||
      errorMsg.includes('cancelled-popup-request')
    ) {
      console.info(`Sign-in for ${serviceConfig.shortName} was closed by user.`);
      return null;
    }

    if (errorCode === 'auth/popup-blocked') {
      throw new Error('Pop-up window was blocked by your browser. Please allow pop-ups for this site and try again.');
    }

    console.warn(`Sign in notice for ${serviceConfig.shortName}:`, errorMsg || errorCode);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

// Disconnect a specific service
export const disconnectService = (serviceId: WorkspaceServiceId) => {
  delete cachedServiceTokens[serviceId];
  removeConnectedServiceMeta(serviceId);
};

// General Google Sign-In (defaulting to Drive scope for orchestrator storage)
export const googleSignIn = async (
  serviceId?: WorkspaceServiceId
): Promise<{ user: User; accessToken: string } | null> => {
  const targetService = serviceId || 'drive';
  const result = await signInWithService(targetService);
  if (!result) return null;
  return { user: result.user, accessToken: result.accessToken };
};

export const getAccessToken = async (serviceId?: WorkspaceServiceId): Promise<string | null> => {
  if (serviceId && cachedServiceTokens[serviceId]) {
    return cachedServiceTokens[serviceId];
  }
  return cachedAccessToken;
};

export const hasCachedAccessToken = (serviceId?: WorkspaceServiceId): boolean => {
  if (serviceId) {
    return !!cachedServiceTokens[serviceId] || !!cachedAccessToken;
  }
  return !!cachedAccessToken;
};

export const ensureAccessToken = async (serviceId?: WorkspaceServiceId): Promise<string | null> => {
  const target = serviceId || 'drive';
  if (cachedServiceTokens[target]) return cachedServiceTokens[target];
  if (cachedAccessToken) return cachedAccessToken;

  try {
    const res = await signInWithService(target);
    return res?.accessToken || null;
  } catch (err) {
    console.warn(`ensureAccessToken failed for ${target}:`, err);
    return null;
  }
};

export const logout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
  Object.keys(cachedServiceTokens).forEach((k) => delete cachedServiceTokens[k]);
  try {
    localStorage.removeItem(CONNECTED_METADATA_KEY);
  } catch {
    // ignore
  }
};
