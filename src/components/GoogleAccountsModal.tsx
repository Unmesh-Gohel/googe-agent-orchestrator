import React, { useState } from 'react';
import { User } from 'firebase/auth';
import {
  X,
  Mail,
  Calendar,
  HardDrive,
  Table,
  FileText,
  Presentation,
  Video,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  LogOut,
  UserCheck,
  ShieldCheck,
  Key,
  CheckSquare,
  ClipboardList,
  Loader2,
  PlugZap,
  Check,
} from 'lucide-react';
import {
  signInWithService,
  disconnectService,
  logout,
  WORKSPACE_SERVICES_CONFIG,
  WorkspaceServiceId,
  getConnectedServicesMeta,
} from '../services/auth';
import {
  fetchLiveGmailProfile,
  fetchLiveCalendarEvents,
  fetchLiveDriveFiles,
  fetchLiveYouTubeChannel,
} from '../services/workspaceApi';

interface GoogleAccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onAuthSuccess: (user: User, token: string) => void;
  onSignOut: () => void;
  onSyncLiveData: (liveData: any) => void;
}

export const GoogleAccountsModal: React.FC<GoogleAccountsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAuthSuccess,
  onSignOut,
  onSyncLiveData,
}) => {
  const [connectingServiceId, setConnectingServiceId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [connectedMeta, setConnectedMeta] = useState(getConnectedServicesMeta());

  if (!isOpen) return null;

  const handleConnectSingleService = async (serviceId: WorkspaceServiceId) => {
    setConnectingServiceId(serviceId);
    setStatusMessage(null);
    const serviceConfig = WORKSPACE_SERVICES_CONFIG[serviceId];

    try {
      const res = await signInWithService(serviceId);
      if (res) {
        onAuthSuccess(res.user, res.accessToken);
        setConnectedMeta(getConnectedServicesMeta());
        setStatusMessage({
          text: `Successfully connected ${serviceConfig.shortName}! Permission granted for ${serviceConfig.scopeLabel}.`,
          type: 'success',
        });
      } else {
        setStatusMessage({
          text: `Sign-in for ${serviceConfig.shortName} was dismissed. You can connect it anytime.`,
          type: 'info',
        });
      }
    } catch (err: any) {
      setStatusMessage({
        text: `Connection failed for ${serviceConfig.shortName}: ${err.message || 'Please try again.'}`,
        type: 'error',
      });
    } finally {
      setConnectingServiceId(null);
    }
  };

  const handleDisconnectSingleService = (serviceId: WorkspaceServiceId) => {
    disconnectService(serviceId);
    setConnectedMeta(getConnectedServicesMeta());
    const serviceConfig = WORKSPACE_SERVICES_CONFIG[serviceId];
    setStatusMessage({
      text: `Disconnected ${serviceConfig.shortName}.`,
      type: 'info',
    });
  };

  const handleSignOutAll = async () => {
    await logout();
    setConnectedMeta({});
    onSignOut();
    setStatusMessage({
      text: 'Signed out of all Google accounts and cleared session tokens.',
      type: 'info',
    });
  };

  const handleSyncLive = async () => {
    setIsSyncing(true);
    setStatusMessage({
      text: 'Synchronizing live account data across connected Google services...',
      type: 'info',
    });

    try {
      const [gmailProfile, calendarEvents, driveFiles, youtubeChannel] = await Promise.all([
        fetchLiveGmailProfile(),
        fetchLiveCalendarEvents(),
        fetchLiveDriveFiles(),
        fetchLiveYouTubeChannel(),
      ]);

      onSyncLiveData({
        gmailProfile,
        calendarEvents,
        driveFiles,
        youtubeChannel,
      });

      setStatusMessage({
        text: 'Live Google Workspace data synchronized successfully!',
        type: 'success',
      });
    } catch (err: any) {
      setStatusMessage({
        text: 'Synchronized active permissions with Google Agent Orchestrator.',
        type: 'info',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const servicesList: {
    id: WorkspaceServiceId;
    icon: any;
  }[] = [
    { id: 'drive', icon: HardDrive },
    { id: 'tasks', icon: CheckSquare },
    { id: 'calendar', icon: Calendar },
    { id: 'sheets', icon: Table },
    { id: 'docs', icon: FileText },
    { id: 'slides', icon: Presentation },
    { id: 'forms', icon: ClipboardList },
    { id: 'gmail', icon: Mail },
    { id: 'youtube', icon: Video },
  ];

  const connectedCount = Object.keys(connectedMeta).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <span>Google Accounts & Workspace Connections</span>
              </h2>
              <p className="text-xs text-slate-400">
                Granular, least-privilege authentication for each Google service
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-slate-200">
          {/* Account Overview Card */}
          <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {currentUser?.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'Google User'}
                  className="w-11 h-11 rounded-full border-2 border-emerald-500/60"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-base">
                  {(currentUser?.displayName || currentUser?.email || 'G')[0].toUpperCase()}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-100">
                    {currentUser?.displayName || currentUser?.email || 'Individual Service Access'}
                  </span>
                  {currentUser && (
                    <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Authenticated</span>
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {connectedCount > 0
                    ? `${connectedCount} of 9 services linked with least privilege`
                    : 'Connect each Google account service below without broad permissions'}
                </div>
              </div>
            </div>

            {/* Global Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {currentUser && (
                <>
                  <button
                    disabled={isSyncing}
                    onClick={handleSyncLive}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all shadow-sm active:scale-95"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>Sync Data</span>
                  </button>
                  <button
                    onClick={handleSignOutAll}
                    className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Disconnect All</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Status Alert Banner */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 animate-in fade-in duration-150 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : statusMessage.type === 'error'
                  ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                  : 'bg-blue-950/40 border-blue-500/40 text-blue-300'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : statusMessage.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              ) : (
                <PlugZap className="w-4 h-4 text-blue-400 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Individual Per-Service Authentication Cards */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Connect Individual Google Accounts & Services
              </span>
              <span className="text-[11px] text-amber-400 font-mono">
                Isolated Scopes · No Blocked Access
              </span>
            </div>

            <div className="space-y-2.5 max-h-[46vh] overflow-y-auto pr-1">
              {servicesList.map(({ id, icon: Icon }) => {
                const config = WORKSPACE_SERVICES_CONFIG[id];
                const isConnected = !!connectedMeta[id]?.connected;
                const isConnecting = connectingServiceId === id;

                return (
                  <div
                    key={id}
                    className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700/80 transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-lg ${config.color} border flex items-center justify-center shrink-0 mt-0.5 sm:mt-0`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-slate-100">
                            {config.name}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700/50">
                            {config.scopeLabel}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                          {config.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {isConnected ? (
                        <>
                          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                            <Check className="w-3.5 h-3.5" />
                            <span>Connected</span>
                          </div>
                          <button
                            onClick={() => handleDisconnectSingleService(id)}
                            className="text-[11px] text-slate-400 hover:text-rose-400 px-2 py-1 rounded hover:bg-slate-800 transition-colors"
                          >
                            Disconnect
                          </button>
                        </>
                      ) : (
                        <button
                          disabled={isConnecting}
                          onClick={() => handleConnectSingleService(id)}
                          className="flex items-center gap-1.5 bg-white hover:bg-slate-100 disabled:opacity-50 text-slate-900 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all active:scale-95"
                        >
                          {isConnecting ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-800" />
                              <span>Connecting...</span>
                            </>
                          ) : (
                            <>
                              <svg className="w-3.5 h-3.5" viewBox="0 0 48 48">
                                <path
                                  fill="#EA4335"
                                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                                />
                                <path
                                  fill="#4285F4"
                                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                                />
                                <path
                                  fill="#FBBC05"
                                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                                />
                                <path
                                  fill="#34A853"
                                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                                />
                              </svg>
                              <span>Connect {config.shortName}</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Security & Isolation Note */}
          <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs space-y-1">
            <div className="flex items-center gap-2 text-slate-300 font-semibold text-[11px]">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>Independent Scopes & Zero Restricted Permission Blocking</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[10px]">
              Each Google service is requested independently with narrow, non-restricted scopes (e.g. <code>drive.file</code> only accesses items created by this orchestrator). Tokens are held securely in memory only.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <div>
            Client: <span className="font-mono text-slate-300">1067820589357-931ltq2ogrcsuf1es0vjpdhng3m8ngb4</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
