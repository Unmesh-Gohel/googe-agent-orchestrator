import React, { useState } from 'react';
import { PipelineDefinition, PipelineStage, AgentId } from '../types/orchestrator';
import {
  Workflow,
  Play,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Layers,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { executePipeline } from '../services/api';

interface PipelineExecutorProps {
  pipelines: PipelineDefinition[];
  onOpenWorkspace: (agentId: AgentId) => void;
  onPipelineSuccess: (pipelineId: string, result: any) => void;
}

export const PipelineExecutor: React.FC<PipelineExecutorProps> = ({
  pipelines,
  onOpenWorkspace,
  onPipelineSuccess,
}) => {
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>(pipelines[0]?.id || 'content_engine');
  const [runningPipelineId, setRunningPipelineId] = useState<string | null>(null);
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(-1);
  const [executionStages, setExecutionStages] = useState<PipelineStage[]>(
    pipelines[0]?.stages || []
  );

  const activePipeline = pipelines.find((p) => p.id === selectedPipelineId) || pipelines[0];

  const handleSelectPipeline = (pipeline: PipelineDefinition) => {
    setSelectedPipelineId(pipeline.id);
    setExecutionStages(pipeline.stages);
    setCurrentStageIndex(-1);
  };

  const handleRunPipeline = async () => {
    if (!activePipeline) return;
    setRunningPipelineId(activePipeline.id);

    // Animate stage-by-stage execution
    const totalStages = activePipeline.stages.length;
    for (let i = 0; i < totalStages; i++) {
      setCurrentStageIndex(i);
      setExecutionStages((prev) =>
        prev.map((stage, idx) => ({
          ...stage,
          status: idx === i ? 'RUNNING' : idx < i ? 'COMPLETED' : 'PENDING',
        }))
      );
      // Wait for realism
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    // Call backend API
    const result = await executePipeline(activePipeline.id);

    // Finalize all stages
    setCurrentStageIndex(totalStages);
    setExecutionStages((prev) =>
      prev.map((stage) => ({
        ...stage,
        status: 'COMPLETED',
      }))
    );
    setRunningPipelineId(null);
    onPipelineSuccess(activePipeline.id, result);
  };

  const handleResetStages = () => {
    setCurrentStageIndex(-1);
    setExecutionStages(activePipeline.stages.map((s) => ({ ...s, status: 'PENDING' })));
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 flex flex-col gap-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Workflow className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-slate-100 tracking-tight">
              Multi-Agent Autonomous Pipelines
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            End-to-end task pipelines coordinated across multiple specialized Google agents
          </p>
        </div>

        {/* Pipeline Selector Tabs */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          {pipelines.map((pipeline) => (
            <button
              key={pipeline.id}
              onClick={() => handleSelectPipeline(pipeline)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                selectedPipelineId === pipeline.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              {pipeline.name.split(':')[0].slice(0, 20)}...
            </button>
          ))}
        </div>
      </div>

      {/* Active Pipeline Card */}
      {activePipeline && (
        <div className="flex flex-col gap-6">
          {/* Overview Info */}
          <div className="bg-slate-950/60 p-5 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono text-blue-400 font-semibold block mb-1">
                {activePipeline.tagline}
              </span>
              <h3 className="text-base font-semibold text-slate-100 mb-1">
                {activePipeline.name}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                {activePipeline.description}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {currentStageIndex >= 0 && (
                <button
                  onClick={handleResetStages}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
                  title="Reset Pipeline Stages"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}

              <button
                disabled={runningPipelineId !== null}
                onClick={handleRunPipeline}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/10 transition-all active:scale-95"
              >
                {runningPipelineId ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Executing Pipeline...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Run Entire Pipeline</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Sequential Stage Diagram */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Pipeline Stages & Agent Handoffs
              </span>
              <span className="text-xs text-slate-400">
                {executionStages.filter((s) => s.status === 'COMPLETED').length} of{' '}
                {executionStages.length} Stages Completed
              </span>
            </div>

            <div className="space-y-3">
              {executionStages.map((stage, idx) => {
                const isRunning = stage.status === 'RUNNING';
                const isCompleted = stage.status === 'COMPLETED';

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isRunning
                        ? 'bg-blue-950/30 border-blue-500/60 shadow-lg shadow-blue-500/10'
                        : isCompleted
                        ? 'bg-slate-950/80 border-slate-700/80'
                        : 'bg-slate-950/40 border-slate-800/80 opacity-70'
                    }`}
                  >
                    <div className="flex items-start md:items-center gap-3.5">
                      {/* Step Number / Status Icon */}
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-semibold shrink-0 border ${
                          isRunning
                            ? 'bg-blue-500/20 text-blue-400 border-blue-500/40 animate-pulse'
                            : isCompleted
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : isRunning ? (
                          <span className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <span>{idx + 1}</span>
                        )}
                      </div>

                      {/* Stage Description */}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-semibold text-slate-100">
                            {stage.stepName}
                          </h4>
                          <span className="text-[11px] font-mono text-blue-400 uppercase">
                            · {stage.agentId} Agent
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {stage.description}
                        </p>
                      </div>
                    </div>

                    {/* Stage Action / Status */}
                    <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
                      <span
                        className={`text-xs font-mono font-medium ${
                          isRunning
                            ? 'text-blue-400 animate-pulse'
                            : isCompleted
                            ? 'text-emerald-400'
                            : 'text-slate-500'
                        }`}
                      >
                        {stage.status}
                      </span>

                      <button
                        onClick={() => onOpenWorkspace(stage.agentId)}
                        className="text-xs text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 px-3 py-1 rounded-lg border border-slate-800 transition-colors flex items-center gap-1"
                      >
                        <span>View Workspace</span>
                        <ChevronRight className="w-3 h-3 text-slate-500" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
