import React, { useState, useEffect } from 'react';
import { DashboardCardConfig } from '../../types/dashboardLayout';
import { DEFAULT_DASHBOARD_CARDS } from '../../data/defaultDashboardLayout';
import {
  AgentDefinition,
  AgentId,
  EmailArtifact,
  CalendarArtifact,
  TaskItemArtifact,
  SheetRowArtifact,
  FormArtifact,
  DriveItemArtifact,
  YouTubeAnalyticsArtifact,
} from '../../types/orchestrator';
import { DraggableCard } from './DraggableCard';
import {
  LayoutGrid,
  SlidersHorizontal,
  RotateCcw,
  Plus,
  Lock,
  Unlock,
  Eye,
  CheckCircle2,
  Sparkles,
  Search,
  Move,
  X,
} from 'lucide-react';

interface DraggableDashboardGridProps {
  agents: AgentDefinition[];
  emails: EmailArtifact[];
  calendarEvents: CalendarArtifact[];
  tasks: TaskItemArtifact[];
  sheetRows: SheetRowArtifact[];
  forms: FormArtifact[];
  driveFiles: DriveItemArtifact[];
  youtubeAnalytics: YouTubeAnalyticsArtifact;
  onSelectAgent: (agent: AgentDefinition) => void;
  onTriggerAgent: (agentId: AgentId) => void;
  onOpenWorkspace: (agentId: AgentId) => void;
  onToggleTask?: (taskId: string) => void;
}

const STORAGE_KEY = 'google_orchestrator_dashboard_layout_v1';

export const DraggableDashboardGrid: React.FC<DraggableDashboardGridProps> = ({
  agents,
  emails,
  calendarEvents,
  tasks,
  sheetRows,
  forms,
  driveFiles,
  youtubeAnalytics,
  onSelectAgent,
  onTriggerAgent,
  onOpenWorkspace,
  onToggleTask,
}) => {
  // Load layout from localStorage or fall back to DEFAULT_DASHBOARD_CARDS
  const [cards, setCards] = useState<DashboardCardConfig[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read saved dashboard layout:', e);
    }
    return DEFAULT_DASHBOARD_CARDS;
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'agents' | 'summaries'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Save to localStorage when layout changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    } catch (e) {
      console.warn('Could not save dashboard layout:', e);
    }
  }, [cards]);

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, cardId: string) => {
    setDraggedCardId(cardId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', cardId);
  };

  const handleDragOver = (e: React.DragEvent, _cardId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetCardId: string) => {
    e.preventDefault();
    if (!draggedCardId || draggedCardId === targetCardId) {
      setDraggedCardId(null);
      return;
    }

    setCards((prevCards) => {
      const fromIndex = prevCards.findIndex((c) => c.id === draggedCardId);
      const toIndex = prevCards.findIndex((c) => c.id === targetCardId);
      if (fromIndex === -1 || toIndex === -1) return prevCards;

      const updated = [...prevCards];
      const [movedCard] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, movedCard);

      // Re-assign orders
      return updated.map((card, idx) => ({ ...card, order: idx }));
    });

    setDraggedCardId(null);
  };

  const handleDragEnd = () => {
    setDraggedCardId(null);
  };

  // Resize column span handler
  const handleResizeColSpan = (cardId: string, colSpan: 1 | 2 | 3) => {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, colSpan } : c))
    );
  };

  // Toggle height handler
  const handleToggleHeight = (cardId: string) => {
    setCards((prev) =>
      prev.map((c) =>
        c.id === cardId ? { ...c, isExpandedHeight: !c.isExpandedHeight } : c
      )
    );
  };

  // Hide card
  const handleHideCard = (cardId: string) => {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, isVisible: false } : c))
    );
  };

  // Restore card
  const handleRestoreCard = (cardId: string) => {
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, isVisible: true } : c))
    );
  };

  // Move card earlier/later
  const handleMoveCard = (cardId: string, direction: 'prev' | 'next') => {
    setCards((prevCards) => {
      const index = prevCards.findIndex((c) => c.id === cardId);
      if (index === -1) return prevCards;

      const targetIndex = direction === 'prev' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prevCards.length) return prevCards;

      const updated = [...prevCards];
      const [item] = updated.splice(index, 1);
      updated.splice(targetIndex, 0, item);

      return updated.map((c, i) => ({ ...c, order: i }));
    });
  };

  // Reset to default
  const handleResetLayout = () => {
    setCards(DEFAULT_DASHBOARD_CARDS);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Filtered Cards to display
  const visibleCards = cards
    .filter((c) => c.isVisible)
    .filter((c) => {
      if (filterType === 'agents') return c.type === 'agent';
      if (filterType === 'summaries') return c.type === 'workspace_summary';
      return true;
    })
    .filter((c) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      if (c.title.toLowerCase().includes(q)) return true;
      if (c.agentId && c.agentId.toLowerCase().includes(q)) return true;
      return false;
    });

  const hiddenCards = cards.filter((c) => !c.isVisible);

  // Map agent ID to definition
  const agentMap = new Map<AgentId, AgentDefinition>();
  agents.forEach((a) => agentMap.set(a.id, a));

  return (
    <div className="flex flex-col gap-6">
      {/* Grid Customization Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-md">
        {/* Left: Filter Buttons & Customization Status */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
          <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800/80">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                filterType === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              All Cards ({cards.filter((c) => c.isVisible).length})
            </button>
            <button
              onClick={() => setFilterType('agents')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                filterType === 'agents'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              Agent Cards Only
            </button>
            <button
              onClick={() => setFilterType('summaries')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                filterType === 'summaries'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              Workspace Summaries
            </button>
          </div>

          {/* Hidden cards indicator / restore button */}
          {hiddenCards.length > 0 && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl transition-colors shrink-0"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{hiddenCards.length} Hidden</span>
            </button>
          )}
        </div>

        {/* Right: Search & Grid Action Controls */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          {/* Search bar */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search cards & widgets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Reset Layout */}
          <button
            onClick={handleResetLayout}
            title="Reset to default arrangement"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-xl transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Grid</span>
          </button>

          {/* Customize Mode Toggle */}
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
              isEditMode
                ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700 hover:bg-slate-750'
            }`}
          >
            {isEditMode ? (
              <>
                <Unlock className="w-3.5 h-3.5 text-blue-200" />
                <span>Customizing Layout</span>
              </>
            ) : (
              <>
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Customize Grid</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Customize Mode Banner Helper */}
      {isEditMode && (
        <div className="p-3.5 bg-blue-950/40 border border-blue-500/40 rounded-xl text-xs text-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-150">
          <div className="flex items-center gap-2.5">
            <Move className="w-4 h-4 text-blue-400 shrink-0" />
            <span>
              <strong>Drag & Drop Active:</strong> Grab any card by the grip handle to move its position. Use the <strong>1x / 2x / 3x</strong> controls to resize width, or the expand icon to toggle card height.
            </span>
          </div>
          <button
            onClick={() => setIsEditMode(false)}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shrink-0 self-start sm:self-auto transition-colors"
          >
            Done Editing
          </button>
        </div>
      )}

      {/* Main Drag-and-Drop Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 transition-all">
        {visibleCards.map((card) => {
          const agentDef = card.agentId ? agentMap.get(card.agentId) : undefined;
          return (
            <DraggableCard
              key={card.id}
              card={card}
              isEditMode={isEditMode}
              agent={agentDef}
              emails={emails}
              calendarEvents={calendarEvents}
              tasks={tasks}
              sheetRows={sheetRows}
              forms={forms}
              driveFiles={driveFiles}
              youtubeAnalytics={youtubeAnalytics}
              onSelectAgent={onSelectAgent}
              onTriggerAgent={onTriggerAgent}
              onOpenWorkspace={onOpenWorkspace}
              onToggleTask={onToggleTask}
              onResizeColSpan={handleResizeColSpan}
              onToggleHeight={handleToggleHeight}
              onHideCard={handleHideCard}
              onMoveCard={handleMoveCard}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
              isDragging={draggedCardId === card.id}
            />
          );
        })}
      </div>

      {/* Hidden Cards Restore Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
                <Plus className="w-4 h-4 text-blue-400" />
                <span>Restore Hidden Cards to Dashboard</span>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {hiddenCards.length === 0 ? (
                <div className="text-xs text-slate-400 text-center py-6">
                  All cards are currently visible on your dashboard!
                </div>
              ) : (
                hiddenCards.map((card) => (
                  <div
                    key={card.id}
                    className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-200">{card.title}</div>
                      <div className="text-[10px] text-slate-400 uppercase font-mono">
                        {card.type === 'agent' ? `${card.agentId} Agent Card` : 'Workspace Summary'}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRestoreCard(card.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors text-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Back</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
