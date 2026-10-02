import React from 'react';
import { VideoSceneArtifact } from '../../types/orchestrator';
import {
  Clapperboard,
  Video,
  Clock,
  Volume2,
  Eye,
  Sparkles,
  ArrowRight,
  HardDrive,
} from 'lucide-react';

interface VidsWorkspaceProps {
  scenes: VideoSceneArtifact[];
  onTriggerPublish: () => void;
}

export const VidsWorkspace: React.FC<VidsWorkspaceProps> = ({
  scenes,
  onTriggerPublish,
}) => {
  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 flex flex-col gap-6 shadow-xl">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
            <Clapperboard className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-100 tracking-tight">
                Google Vids Agent Studio
              </h2>
              <span className="text-xs text-slate-400">· Google Vids & AI Studio</span>
            </div>
            <p className="text-xs text-slate-400">
              Automated video storyboarding, scene visual prompts, and voiceover composition
            </p>
          </div>
        </div>

        <button
          onClick={onTriggerPublish}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-md active:scale-95"
        >
          <Video className="w-4 h-4" />
          <span>Pass to Google Videos Agent (YouTube)</span>
        </button>
      </div>

      {/* Storyboard Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold uppercase tracking-wider">
            Storyboard Scenes ({scenes.length} Scenes · 90s Total Duration)
          </span>
          <span className="font-mono text-[11px] text-blue-400">
            Aspect Ratio: 16:9 Landscape
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scenes.map((scene) => (
            <div
              key={scene.sceneNumber}
              className="p-5 bg-slate-950/60 rounded-xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                {/* Scene Header */}
                <div className="flex items-center justify-between text-xs border-b border-slate-800/80 pb-2">
                  <span className="font-semibold text-violet-400">
                    Scene 0{scene.sceneNumber}
                  </span>
                  <div className="flex items-center gap-1.5 text-slate-400 font-mono tabular-nums text-[11px]">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{scene.duration}</span>
                  </div>
                </div>

                {/* Visual Description */}
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium mb-1">
                    <Eye className="w-3.5 h-3.5 text-blue-400" />
                    <span>Visual Concept & Studio Prompt</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    {scene.visual}
                  </p>
                </div>

                {/* Narration Script */}
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium mb-1">
                    <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Audio Narration Voiceover</span>
                  </div>
                  <p className="text-xs text-slate-300 italic leading-relaxed bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/60">
                    "{scene.audioNarration}"
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
