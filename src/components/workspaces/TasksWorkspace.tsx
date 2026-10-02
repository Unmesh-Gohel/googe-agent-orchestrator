import React, { useState } from 'react';
import { TaskItemArtifact, AgentId } from '../../types/orchestrator';
import {
  CheckSquare,
  Square,
  Plus,
  RefreshCw,
  Sparkles,
  Calendar,
  AlertCircle,
  Clock,
  ArrowRight,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { fetchLiveTasks, createLiveGoogleTask } from '../../services/workspaceApi';
import { executeAgentTask } from '../../services/api';

interface TasksWorkspaceProps {
  tasks: TaskItemArtifact[];
  onToggleTask: (taskId: string) => void;
  onAddTask: (task: TaskItemArtifact) => void;
}

export const TasksWorkspace: React.FC<TasksWorkspaceProps> = ({
  tasks,
  onToggleTask,
  onAddTask,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newPriority, setNewPriority] = useState<'High' | 'Medium' | 'Low'>('High');

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const handleSyncLive = async () => {
    setIsSyncing(true);
    try {
      const liveItems = await fetchLiveTasks();
      if (liveItems && liveItems.length > 0) {
        liveItems.forEach((item, idx) => {
          onAddTask({
            id: item.id || `live-task-${idx}`,
            title: item.title,
            notes: item.notes || 'Fetched from live Google Tasks API',
            due: item.due ? new Date(item.due).toLocaleDateString() : 'Upcoming',
            completed: item.status === 'completed',
            assignedAgent: 'tasks',
            priority: 'Medium',
            originSource: 'Google Tasks API (@me/tasks)',
          });
        });
      }
    } catch (err) {
      console.warn(err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleConfirmCreateTask = async () => {
    if (!newTitle.trim()) return;
    setIsCreating(true);

    const newTask: TaskItemArtifact = {
      id: `task-${Date.now()}`,
      title: newTitle,
      notes: newNotes,
      due: 'In 2 days',
      completed: false,
      assignedAgent: 'tasks',
      priority: newPriority,
      originSource: 'Google Tasks Agent UI',
    };

    onAddTask(newTask);

    // Call live Google Tasks API if authenticated
    await createLiveGoogleTask(newTitle, newNotes);

    // Dispatch Tasks Agent
    await executeAgentTask(
      'tasks',
      `Add action item "${newTitle}" to Google Tasks and prioritize for agent pipeline`,
      { task: newTask }
    );

    setIsCreating(false);
    setShowConfirmModal(false);
    setNewTitle('');
    setNewNotes('');
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 flex flex-col gap-6 shadow-xl">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <CheckSquare className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-100 tracking-tight">
                Google Tasks Agent Workspace
              </h2>
              <span className="text-xs text-slate-400">· Google Tasks API</span>
            </div>
            <p className="text-xs text-slate-400">
              Autonomous action item tracking, email follow-up checklists, and cross-agent task dispatch
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={isSyncing}
            onClick={handleSyncLive}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium px-3.5 py-2 rounded-xl border border-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync Live Tasks</span>
          </button>

          <button
            onClick={() => setShowConfirmModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-md active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Filter and Overview Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            All Tasks ({tasks.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              filter === 'pending'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            Pending ({tasks.filter((t) => !t.completed).length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              filter === 'completed'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
            }`}
          >
            Completed ({tasks.filter((t) => t.completed).length})
          </button>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Tasks synchronized with Google Tasks
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No tasks in this view.
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                task.completed
                  ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => onToggleTask(task.id)}
                  className="mt-0.5 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {task.completed ? (
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-500 hover:text-slate-300" />
                  )}
                </button>

                <div className="space-y-1">
                  <div
                    className={`text-xs font-semibold ${
                      task.completed ? 'line-through text-slate-500' : 'text-slate-100'
                    }`}
                  >
                    {task.title}
                  </div>

                  {task.notes && (
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {task.notes}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 pt-1">
                    {task.due && (
                      <span className="flex items-center gap-1 font-mono text-slate-300">
                        <Clock className="w-3 h-3 text-blue-400" />
                        <span>Due: {task.due}</span>
                      </span>
                    )}
                    <span aria-hidden="true" className="text-slate-700">·</span>
                    <span className="text-blue-300 font-mono uppercase">
                      {task.assignedAgent} Agent
                    </span>
                    {task.originSource && (
                      <>
                        <span aria-hidden="true" className="text-slate-700">·</span>
                        <span className="text-slate-500">{task.originSource}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Priority Label */}
              <div className="shrink-0">
                <span
                  className={`text-[10px] font-mono font-semibold ${
                    task.priority === 'High'
                      ? 'text-rose-400'
                      : task.priority === 'Medium'
                      ? 'text-amber-400'
                      : 'text-slate-400'
                  }`}
                >
                  {task.priority} Priority
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* User Confirmation Dialog for Creating Task */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-slate-100 font-semibold text-sm">
              <CheckSquare className="w-5 h-5 text-blue-400" />
              <span>Create Task in Google Tasks</span>
            </div>

            <p className="text-xs text-slate-300">
              The Google Tasks Agent will record this action item in your Google account's primary task list.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-slate-400 font-medium block mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Schedule all-hands demo with logistics team..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-slate-400 font-medium block mb-1">
                  Notes & Details
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional context or instructions..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-slate-400 font-medium block mb-1">
                  Priority
                </label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={!newTitle.trim() || isCreating}
                onClick={handleConfirmCreateTask}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-md transition-all active:scale-95"
              >
                {isCreating ? 'Creating Task...' : 'Confirm & Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
