import React from 'react';
import { User } from 'firebase/auth';
import {
  Layers,
  Network,
  Workflow,
  FolderKanban,
  Radio,
  Play,
  Activity,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Brain,
} from 'lucide-react';
import { ThemeSwitch } from './ThemeSwitch';

interface HeaderProps {
  currentView: 'dashboard' | 'ai-manager' | 'topology' | 'pipelines' | 'workspaces' | 'messages';
  onViewChange: (view: 'dashboard' | 'ai-manager' | 'topology' | 'pipelines' | 'workspaces' | 'messages') => void;
  onOpenMission: () => void;
  onOpenAccounts: () => void;
  currentUser: User | null;
  activeAgentsCount: number;
  totalAgentsCount: number;
  isPipelineRunning: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  onOpenMission,
  onOpenAccounts,
  currentUser,
  activeAgentsCount,
  totalAgentsCount,
  isPipelineRunning,
}) => {
  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & System Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
                  Google Agent Orchestrator
                </span>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-mono font-medium">· Gemini AI Core</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300">
                    {activeAgentsCount}/{totalAgentsCount}
                  </span>{' '}
                  Specialized Agents Active
                </span>
                <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
                <span>Autonomous Orchestration</span>
              </div>
            </div>
          </div>

          {/* Navigation View Switcher */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100 dark:bg-slate-950/60 p-1 rounded-xl border border-slate-200 dark:border-slate-800/80">
            <button
              onClick={() => onViewChange('dashboard')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                currentView === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-850'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Fleet Overview</span>
            </button>

            <button
              onClick={() => onViewChange('ai-manager')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                currentView === 'ai-manager'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                  : 'text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100 hover:bg-slate-200/70 dark:hover:bg-slate-850'
              }`}
            >
              <Brain className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Master AI Core</span>
            </button>

            <button
              onClick={() => onViewChange('topology')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                currentView === 'topology'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-850'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Topology</span>
            </button>

            <button
              onClick={() => onViewChange('pipelines')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                currentView === 'pipelines'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-850'
              }`}
            >
              <Workflow className="w-3.5 h-3.5" />
              <span>Pipelines</span>
              {isPipelineRunning && (
                <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400 animate-ping"></span>
              )}
            </button>

            <button
              onClick={() => onViewChange('workspaces')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                currentView === 'workspaces'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-850'
              }`}
            >
              <FolderKanban className="w-3.5 h-3.5" />
              <span>Workspaces</span>
            </button>

            <button
              onClick={() => onViewChange('messages')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                currentView === 'messages'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-850'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Handoffs</span>
            </button>
          </nav>

          {/* Action Zone: Theme Switch, Google Accounts & Mission Buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Light / Dark Mode Switch */}
            <ThemeSwitch />

            {/* Google Accounts Auth Button */}
            <button
              onClick={onOpenAccounts}
              className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all ${
                currentUser
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
              }`}
            >
              {currentUser?.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'Google'}
                  className="w-4 h-4 rounded-full"
                />
              ) : (
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 48 48">
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
              )}
              <span className="truncate max-w-[120px]">
                {currentUser
                  ? currentUser.displayName?.split(' ')[0] || currentUser.email?.split('@')[0]
                  : 'Google Accounts'}
              </span>
              {currentUser && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400"></span>
              )}
            </button>

            {/* Dispatch Mission */}
            <button
              onClick={onOpenMission}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold px-3.5 sm:px-4 py-2 rounded-lg shadow-md hover:shadow-blue-500/20 transition-all border border-blue-400/20 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-200" />
              <span className="hidden sm:inline">Dispatch Mission</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

