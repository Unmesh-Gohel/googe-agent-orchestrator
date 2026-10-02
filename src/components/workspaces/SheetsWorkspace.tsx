import React, { useState } from 'react';
import { SheetRowArtifact } from '../../types/orchestrator';
import {
  Table,
  Plus,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Filter,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { executeAgentTask } from '../../services/api';

interface SheetsWorkspaceProps {
  rows: SheetRowArtifact[];
  onTriggerDocsArticle: (row: SheetRowArtifact) => void;
  onAddRow: (row: SheetRowArtifact) => void;
}

export const SheetsWorkspace: React.FC<SheetsWorkspaceProps> = ({
  rows,
  onTriggerDocsArticle,
  onAddRow,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const filteredRows = rows.filter((r) => {
    const matchesStatus = filterStatus === 'ALL' || r.status === filterStatus;
    const matchesSearch =
      r.topic.toLowerCase().includes(search.toLowerCase()) ||
      r.source.toLowerCase().includes(search.toLowerCase()) ||
      r.assignedAgent.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleScanNews = async () => {
    setIsScanning(true);
    const newTopic: SheetRowArtifact = {
      id: `row-${Date.now()}`,
      topic: 'Context-Aware Multimodal Reasoning in Google Workspace Swarms',
      source: 'Google DeepMind Tech Bulletin',
      viralScore: 98,
      assignedAgent: 'Google Docs Agent',
      status: 'In Production',
      format: 'Comprehensive Whitepaper',
      updatedAt: 'Just now',
    };
    onAddRow(newTopic);

    await executeAgentTask(
      'news',
      'Scan latest AI developments and append new candidate topic to Google Sheets',
      { topic: newTopic }
    );
    setIsScanning(false);
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 flex flex-col gap-6 shadow-xl">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Table className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-100 tracking-tight">
                Google Sheets Agent Tracker
              </h2>
              <span className="text-xs text-slate-400">· Q4_Content_Automation_Matrix.gsheet</span>
            </div>
            <p className="text-xs text-slate-400">
              Autonomous editorial matrix, viral score ranking, and downstream drafting agent dispatches
            </p>
          </div>
        </div>

        <button
          disabled={isScanning}
          onClick={handleScanNews}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-md active:scale-95"
        >
          {isScanning ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>Scouting News...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Scout Trends & Append Row</span>
            </>
          )}
        </button>
      </div>

      {/* Spreadsheet Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
        <div className="flex items-center gap-1 text-xs">
          {['ALL', 'Discovered', 'In Production', 'Published'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                filterStatus === status
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="relative min-w-[200px]">
          <input
            type="text"
            placeholder="Search spreadsheet rows..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Interactive Spreadsheet Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/70">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 font-medium">
              <th className="p-3.5 font-mono text-[11px] text-slate-500 w-12 text-center">#</th>
              <th className="p-3.5">Topic & Research Title</th>
              <th className="p-3.5">Discovery Source</th>
              <th className="p-3.5 text-center">Viral Score</th>
              <th className="p-3.5">Assigned Agent</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5">Target Format</th>
              <th className="p-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-200">
            {filteredRows.map((row, idx) => (
              <tr key={row.id} className="hover:bg-slate-900/50 transition-colors">
                <td className="p-3.5 font-mono tabular-nums text-slate-500 text-center">
                  {idx + 1}
                </td>
                <td className="p-3.5 font-medium text-slate-100 max-w-sm">
                  {row.topic}
                </td>
                <td className="p-3.5 text-slate-400">
                  {row.source}
                </td>
                <td className="p-3.5 text-center">
                  <span className="font-mono tabular-nums font-semibold text-emerald-400">
                    {row.viralScore}/100
                  </span>
                </td>
                <td className="p-3.5 font-mono text-[11px] text-blue-300">
                  {row.assignedAgent}
                </td>
                <td className="p-3.5 font-mono text-[11px]">
                  <span
                    className={
                      row.status === 'Published'
                        ? 'text-emerald-400'
                        : row.status === 'In Production'
                        ? 'text-amber-400'
                        : 'text-slate-400'
                    }
                  >
                    {row.status}
                  </span>
                </td>
                <td className="p-3.5 text-slate-400 text-[11px]">
                  {row.format}
                </td>
                <td className="p-3.5 text-right">
                  <button
                    onClick={() => onTriggerDocsArticle(row)}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 ml-auto font-medium"
                  >
                    <span>Draft Doc</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
