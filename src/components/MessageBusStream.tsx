import React, { useState } from 'react';
import { InterAgentMessage, AgentId } from '../types/orchestrator';
import {
  Radio,
  ArrowRight,
  Filter,
  CheckCircle2,
  Zap,
  RefreshCw,
  Search,
} from 'lucide-react';

interface MessageBusStreamProps {
  messages: InterAgentMessage[];
  onTriggerSampleHandoff: () => void;
}

export const MessageBusStream: React.FC<MessageBusStreamProps> = ({
  messages,
  onTriggerSampleHandoff,
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMessages = messages.filter((msg) => {
    const matchesType = filterType === 'ALL' || msg.messageType === filterType;
    const matchesQuery =
      msg.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (msg.details && msg.details.toLowerCase().includes(searchQuery.toLowerCase())) ||
      msg.sourceAgent.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (msg.targetAgent && msg.targetAgent.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesQuery;
  });

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 flex flex-col gap-5 shadow-xl">
      {/* Stream Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-blue-400 animate-pulse" />
            <h2 className="text-lg font-semibold text-slate-100 tracking-tight">
              Live Inter-Agent Message Bus
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time telemetry of cross-agent task handoffs, data synchronizations, and triggers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onTriggerSampleHandoff}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Emit Test Handoff</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
        {/* Type Filter Buttons */}
        <div className="flex items-center gap-1 text-xs">
          {['ALL', 'HANDOFF', 'TRIGGER', 'DATA_SYNC', 'EXECUTION'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                filterType === type
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[200px]">
          <input
            type="text"
            placeholder="Search event logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Messages Feed */}
      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
        {filteredMessages.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No events match the current filter.
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isHandoff = msg.messageType === 'HANDOFF';
            const isTrigger = msg.messageType === 'TRIGGER';
            const isDataSync = msg.messageType === 'DATA_SYNC';

            return (
              <div
                key={msg.id}
                className="p-4 bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 rounded-xl transition-all duration-150 flex flex-col gap-2 group"
              >
                {/* Event Meta Line */}
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="font-mono tabular-nums text-slate-400 text-[11px]">
                      {msg.timestamp}
                    </span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span
                      className={`font-semibold text-[11px] ${
                        isHandoff
                          ? 'text-blue-400'
                          : isTrigger
                          ? 'text-amber-400'
                          : isDataSync
                          ? 'text-emerald-400'
                          : 'text-violet-400'
                      }`}
                    >
                      {msg.messageType}
                    </span>
                  </div>

                  {/* Agents Flow Tag */}
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className="font-semibold text-slate-200 uppercase">
                      {msg.sourceAgent} Agent
                    </span>
                    {msg.targetAgent && (
                      <>
                        <ArrowRight className="w-3 h-3 text-slate-500" />
                        <span className="font-semibold text-blue-400 uppercase">
                          {msg.targetAgent} Agent
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Event Summary */}
                <div className="text-xs font-medium text-slate-100 leading-snug">
                  {msg.summary}
                </div>

                {/* Event Payload Details if present */}
                {msg.details && (
                  <div className="text-[11px] font-mono text-slate-400 bg-slate-900/80 p-2 rounded-lg border border-slate-800/60 leading-relaxed">
                    {msg.details}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
