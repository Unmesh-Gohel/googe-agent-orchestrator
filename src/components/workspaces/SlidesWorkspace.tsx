import React, { useState } from 'react';
import { SlideArtifact } from '../../types/orchestrator';
import {
  Presentation,
  ChevronLeft,
  ChevronRight,
  HardDrive,
  Sparkles,
  Maximize2,
  FileText,
  Lightbulb,
} from 'lucide-react';
import { executeAgentTask } from '../../services/api';

interface SlidesWorkspaceProps {
  slides: SlideArtifact[];
  onTriggerDriveSave: () => void;
}

export const SlidesWorkspace: React.FC<SlidesWorkspaceProps> = ({
  slides,
  onTriggerDriveSave,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const currentSlide = slides[currentSlideIndex] || slides[0];

  const handleNext = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 flex flex-col gap-6 shadow-xl">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
            <Presentation className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-100 tracking-tight">
                Google Slides Agent Workspace
              </h2>
              <span className="text-xs text-slate-400">· Executive_Briefing_Deck.gslides</span>
            </div>
            <p className="text-xs text-slate-400">
              Autonomous client presentation generation with speaker notes and visual concept direction
            </p>
          </div>
        </div>

        <button
          onClick={onTriggerDriveSave}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2 rounded-xl border border-slate-700 transition-colors"
        >
          <HardDrive className="w-4 h-4 text-emerald-400" />
          <span>Save Deck to Google Drive</span>
        </button>
      </div>

      {/* Slide Presenter Stage */}
      <div className="flex flex-col items-center">
        {/* Main 16:9 Slide Canvas */}
        <div className="w-full max-w-4xl aspect-[16/9] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 rounded-2xl border border-slate-700 p-8 sm:p-12 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          {/* Subtle geometric background watermark */}
          <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Slide Top Meta */}
          <div className="flex items-center justify-between text-xs text-slate-400 z-10">
            <span className="font-semibold text-blue-400">
              Google Agent Orchestrator Briefing
            </span>
            <span className="font-mono tabular-nums">
              Slide {currentSlideIndex + 1} of {slides.length}
            </span>
          </div>

          {/* Slide Content Area */}
          <div className="space-y-4 my-auto z-10">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
              {currentSlide?.title}
            </h1>

            {currentSlide?.subtitle && (
              <p className="text-sm sm:text-base text-blue-300 font-medium">
                {currentSlide.subtitle}
              </p>
            )}

            {currentSlide?.bullets && (
              <ul className="space-y-2.5 pt-2">
                {currentSlide.bullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Visual Concept Prompt Strip */}
          {currentSlide?.visualConcept && (
            <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-lg flex items-center gap-2 text-xs text-slate-300 z-10">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">
                <span className="text-slate-500">Visual Layout Concept: </span>
                {currentSlide.visualConcept}
              </span>
            </div>
          )}
        </div>

        {/* Carousel Navigation Bar */}
        <div className="flex items-center justify-between w-full max-w-4xl mt-4 px-2">
          <div className="flex items-center gap-2">
            <button
              disabled={currentSlideIndex === 0}
              onClick={handlePrev}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200 border border-slate-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-slate-400 font-mono tabular-nums">
              {currentSlideIndex + 1} / {slides.length}
            </span>
            <button
              disabled={currentSlideIndex === slides.length - 1}
              onClick={handleNext}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200 border border-slate-700 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Slide Selector Buttons */}
          <div className="hidden sm:flex items-center gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`w-7 h-7 rounded-lg text-xs font-mono font-medium transition-colors ${
                  currentSlideIndex === idx
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Speaker Notes Drawer */}
        <div className="w-full max-w-4xl mt-6 p-4 bg-slate-950/60 rounded-xl border border-slate-800 text-xs space-y-1.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Speaker Notes
          </div>
          <p className="text-slate-300 leading-relaxed">
            {currentSlide?.speakerNotes}
          </p>
        </div>
      </div>
    </div>
  );
};
