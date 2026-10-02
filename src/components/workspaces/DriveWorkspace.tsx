import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { DriveItemArtifact } from '../../types/orchestrator';
import {
  provisionGoogleAgentOrchestratorDrive,
  WORKSPACE_SUBFOLDERS,
  ProvisioningStatus,
  DriveFolderResult,
} from '../../services/workspaceApi';
import {
  googleSignIn,
  signInWithService,
  getAccessToken,
  hasCachedAccessToken,
} from '../../services/auth';
import {
  HardDrive,
  Folder,
  FileText,
  Table,
  Presentation,
  Video,
  FileCheck,
  Search,
  Download,
  Share2,
  Sparkles,
  ExternalLink,
  Cloud,
  CheckCircle2,
  AlertCircle,
  FolderPlus,
  Loader2,
  X,
  ClipboardList,
  ShieldCheck,
  LogIn,
} from 'lucide-react';

interface DriveWorkspaceProps {
  files: DriveItemArtifact[];
  currentUser?: User | null;
  onAuthSuccess?: (user: User, token: string) => void;
}

export const DriveWorkspace: React.FC<DriveWorkspaceProps> = ({
  files,
  currentUser,
  onAuthSuccess,
}) => {
  const [selectedFolder, setSelectedFolder] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [provisioningStatus, setProvisioningStatus] = useState<ProvisioningStatus | null>(null);
  const [provisionResult, setProvisionResult] = useState<{
    success: boolean;
    rootFolder: DriveFolderResult | null;
    subfolders: { name: string; id: string; webViewLink?: string }[];
    files: { name: string; folder: string; id: string }[];
    error?: string;
  } | null>(null);

  const folders = Array.from(new Set(files.map((f) => f.folder)));

  const filteredFiles = files.filter((f) => {
    const matchesFolder = selectedFolder === 'ALL' || f.folder === selectedFolder;
    const matchesSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.folder.toLowerCase().includes(search.toLowerCase()) ||
      f.originAgent.toLowerCase().includes(search.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'doc':
        return <FileText className="w-4 h-4 text-blue-400" />;
      case 'sheet':
        return <Table className="w-4 h-4 text-emerald-400" />;
      case 'slide':
        return <Presentation className="w-4 h-4 text-violet-400" />;
      case 'video':
        return <Video className="w-4 h-4 text-rose-400" />;
      case 'form':
        return <ClipboardList className="w-4 h-4 text-violet-400" />;
      default:
        return <FileCheck className="w-4 h-4 text-amber-400" />;
    }
  };

  const handleDirectSignIn = async () => {
    setIsSigningIn(true);
    setProvisionResult(null);
    try {
      const res = await signInWithService('drive');
      if (res) {
        if (onAuthSuccess) {
          onAuthSuccess(res.user, res.accessToken);
        }
      } else {
        setProvisionResult({
          success: false,
          rootFolder: null,
          subfolders: [],
          files: [],
          error: 'Google Drive authorization was dismissed. Click "Connect Google Drive" when you are ready to authenticate.',
        });
      }
    } catch (err: any) {
      setProvisionResult({
        success: false,
        rootFolder: null,
        subfolders: [],
        files: [],
        error: err.message || 'Google Drive authorization could not be completed.',
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleStartProvisioning = async () => {
    setIsProvisioning(true);
    setProvisionResult(null);

    // 1. Check or obtain Google OAuth token for Google Drive specifically
    let token = await getAccessToken('drive');
    if (!token) {
      setProvisioningStatus({
        step: 'Connecting Google Drive account (drive.file scope)...',
        progress: 5,
        subfoldersCreated: [],
        filesCreated: [],
      });

      try {
        const signinRes = await signInWithService('drive');
        if (signinRes) {
          token = signinRes.accessToken;
          if (onAuthSuccess) {
            onAuthSuccess(signinRes.user, signinRes.accessToken);
          }
        }
      } catch (authErr: any) {
        setIsProvisioning(false);
        setProvisionResult({
          success: false,
          rootFolder: null,
          subfolders: [],
          files: [],
          error:
            authErr.message ||
            'Google Drive authorization could not be completed.',
        });
        return;
      }
    }

    if (!token) {
      setIsProvisioning(false);
      setProvisionResult({
        success: false,
        rootFolder: null,
        subfolders: [],
        files: [],
        error:
          'Google Drive access was not authorized. Please click "Connect Drive & Create Folders" to authorize.',
      });
      return;
    }

    // 2. Perform live provisioning in Google Drive
    const result = await provisionGoogleAgentOrchestratorDrive((status) => {
      setProvisioningStatus(status);
    });

    setProvisionResult(result);
    setIsProvisioning(false);
  };

  const isUserAuthenticated = !!currentUser && hasCachedAccessToken();

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 flex flex-col gap-6 shadow-xl">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-600/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <HardDrive className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-100 tracking-tight">
                Google Drive Agent Workspace
              </h2>
              <span className="text-xs text-amber-400 font-mono">· /Google Agent Orchestrator/</span>
            </div>
            <p className="text-xs text-slate-400">
              Central asset catalog, hierarchical directory governance, and automated ecosystem archiving
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setIsConfirmModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-md transition-all active:scale-95"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Create Folders in Google Drive</span>
          </button>

          <div className="text-xs text-slate-400 flex items-center gap-2 border-l border-slate-800 pl-3">
            <span>
              Storage: <span className="text-slate-200 font-mono">274.4 MB used</span>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Total Assets: <span className="text-slate-200 font-mono">{files.length}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Live Provisioning Success Banner */}
      {provisionResult?.success && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="font-semibold text-emerald-300">
                "Google Agent Orchestrator" successfully created in Google Drive!
              </div>
              <div className="text-[11px] text-emerald-400/90 mt-0.5">
                Created 10 workspace subfolders and organized {provisionResult.files.length} artifact items.
              </div>
            </div>
          </div>
          {provisionResult.rootFolder?.id && (
            <a
              href={`https://drive.google.com/drive/folders/${provisionResult.rootFolder.id}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs transition-colors shrink-0 shadow-sm"
            >
              <span>Open in Google Drive</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}

      {/* Artifact Storage Hierarchy Breakdown */}
      <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <Folder className="w-4 h-4 text-amber-400" />
            <span>Google Workspace Storage Architecture & Location Guide</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-400">
            Root: /Google Agent Orchestrator/
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Completed deliverables generated by all 13 agents are cataloged by the <strong>Google Drive Agent</strong> and synchronized directly to your Google Cloud storage:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
          {WORKSPACE_SUBFOLDERS.map((sub, i) => (
            <div key={i} className="p-3 bg-slate-900/80 rounded-lg border border-slate-800/80 space-y-1">
              <div className="font-semibold text-blue-400 flex items-center justify-between font-mono text-[11px]">
                <span className="flex items-center gap-1.5">
                  <Folder className="w-3.5 h-3.5 text-amber-400" />
                  <span>{sub.subfolderName}</span>
                </span>
                <span className="text-[10px] text-slate-500 uppercase">{sub.workspaceKey}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                {sub.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Filter and Folder Breadcrumbs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedFolder('ALL')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${
              selectedFolder === 'ALL'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            <Folder className="w-3.5 h-3.5" />
            <span>All Workspace Folders ({files.length})</span>
          </button>

          {folders.map((folder) => {
            const shortName = folder.replace('Google Agent Orchestrator/', '').replace(/^[0-9]+_/, '');
            return (
              <button
                key={folder}
                onClick={() => setSelectedFolder(folder)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${
                  selectedFolder === folder
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                }`}
              >
                <Folder className="w-3.5 h-3.5" />
                <span>{shortName}</span>
              </button>
            );
          })}
        </div>

        <div className="relative min-w-[200px]">
          <input
            type="text"
            placeholder="Search drive files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Files Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/70">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 font-medium">
              <th className="p-3.5">Name</th>
              <th className="p-3.5">Folder</th>
              <th className="p-3.5">Size</th>
              <th className="p-3.5">Created by Agent</th>
              <th className="p-3.5">Last Modified</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {filteredFiles.map((file) => (
              <tr key={file.id} className="hover:bg-slate-900/50 transition-colors">
                <td className="p-3.5 font-medium text-slate-100 flex items-center gap-2.5">
                  {getFileIcon(file.type)}
                  <span>{file.name}</span>
                </td>
                <td className="p-3.5 font-mono text-[11px] text-slate-400">
                  {file.folder}
                </td>
                <td className="p-3.5 font-mono tabular-nums text-slate-400">
                  {file.size}
                </td>
                <td className="p-3.5 font-mono text-[11px] text-blue-300 uppercase">
                  {file.originAgent} Agent
                </td>
                <td className="p-3.5 font-mono tabular-nums text-slate-400">
                  {file.lastModified}
                </td>
                <td className="p-3.5 text-right">
                  <button className="text-xs text-slate-400 hover:text-slate-200 p-1 rounded transition-colors inline-flex items-center gap-1">
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Explicit User Confirmation Modal for Google Drive Creation */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl p-6 space-y-5 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Cloud className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">
                    Provision Google Drive Folder Hierarchy
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Confirmation required for Google Drive API operations
                  </span>
                </div>
              </div>
              <button
                disabled={isProvisioning || isSigningIn}
                onClick={() => setIsConfirmModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Authentication Status Banner */}
            <div className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    {currentUser ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                        <span>Connected: {currentUser.email}</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                        <span>Google Account Authentication Required</span>
                      </>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {currentUser
                      ? 'Authorized to create folders and save files in Google Drive'
                      : 'Permission is needed to create folders and store files in Google Drive'}
                  </div>
                </div>
              </div>

              {!currentUser ? (
                <button
                  disabled={isSigningIn || isProvisioning}
                  onClick={handleDirectSignIn}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-100 disabled:opacity-50 text-slate-900 rounded-lg text-xs font-semibold transition-colors shadow-sm shrink-0"
                >
                  {isSigningIn ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-800" />
                      <span>Authorizing...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" viewBox="0 0 48 48">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                      </svg>
                      <span>Connect Google Drive</span>
                    </>
                  )}
                </button>
              ) : null}
            </div>

            {/* Description & Folder Manifest */}
            <div className="space-y-3 text-xs text-slate-300">
              <p>
                You are about to create the root folder <strong>"Google Agent Orchestrator"</strong> in your Google Drive and set up 10 workspace subfolders:
              </p>

              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-1.5 max-h-52 overflow-y-auto font-mono text-[11px]">
                <div className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Folder className="w-3.5 h-3.5" />
                  <span>/Google Agent Orchestrator/</span>
                </div>
                {WORKSPACE_SUBFOLDERS.map((sub, i) => (
                  <div key={i} className="pl-4 text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <span className="text-slate-600">└──</span>
                      <span>{sub.subfolderName}/</span>
                    </span>
                    <span className="text-slate-500 text-[10px]">
                      {sub.defaultFiles.length} file(s)
                    </span>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                All completed deliverables (Docs whitepapers, Slides decks, Tasks checklists, Sheets trackers, Forms intake surveys, and Ads reports) will be stored in their appropriate folders with permissions managed by Google Drive.
              </p>
            </div>

            {/* Live Provisioning Progress */}
            {isProvisioning && (
              <div className="p-3 bg-slate-950 rounded-xl border border-amber-500/30 space-y-2 text-xs">
                <div className="flex items-center justify-between text-amber-400 font-semibold">
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{provisioningStatus?.step || 'Processing...'}</span>
                  </span>
                  <span>{provisioningStatus?.progress || 0}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full transition-all duration-300"
                    style={{ width: `${provisioningStatus?.progress || 10}%` }}
                  />
                </div>
              </div>
            )}

            {/* Error Display */}
            {provisionResult?.error && (
              <div className="p-3 bg-rose-950/50 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-semibold block">Action Needed:</span>
                  <span>{provisionResult.error}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                disabled={isProvisioning || isSigningIn}
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
              >
                Cancel
              </button>

              <button
                disabled={isProvisioning || isSigningIn}
                onClick={handleStartProvisioning}
                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-md transition-all active:scale-95"
              >
                {isProvisioning ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Creating in Google Drive...</span>
                  </>
                ) : !currentUser ? (
                  <>
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign in & Create in Drive</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm & Create in Drive</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
