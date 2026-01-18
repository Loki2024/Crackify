
import React, { useState } from 'react';
import { AnalysisResult, ExtractionSegment, BulletFeedback } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface AnalysisViewProps {
  result: AnalysisResult;
  onResetAll: () => void;
  onAnotherJob: () => void;
}

const ExtractionPanel: React.FC<{ title: string; data?: ExtractionSegment; icon: React.ReactNode }> = ({ title, data, icon }) => {
  if (!data) return null;
  return (
    <div className="bg-slate-900 rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
      <div className="bg-white/5 px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <h4 className="font-black text-slate-300 flex items-center text-[10px] uppercase tracking-wider">
          <span className="mr-2 text-gold">{icon}</span>
          {title}
        </h4>
      </div>
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <p className="text-[7px] font-black text-gold/60 uppercase tracking-widest">Candidate</p>
          <div className="flex flex-wrap gap-1.5">
            {data.resume?.slice(0, 10).map((item, i) => (
              <span key={i} className={`px-2 py-0.5 rounded text-[10px] font-bold border ${data.overlap?.includes(item) ? 'bg-gold text-black border-gold' : 'bg-white/5 text-slate-400 border-white/10'}`}>
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Requirements</p>
          <div className="flex flex-wrap gap-1.5">
            {data.job?.slice(0, 10).map((item, i) => (
              <span key={i} className={`px-2 py-0.5 rounded text-[10px] font-bold border ${data.overlap?.includes(item) ? 'bg-gold/20 text-gold border-gold/40' : 'bg-slate-950 text-slate-600 border-white/5 opacity-60'}`}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const AnalysisView: React.FC<AnalysisViewProps> = ({ result, onResetAll, onAnotherJob }) => {
  const prob = result.realisticAdmissionProbability ?? 0;
  const chartData = [{ value: prob }, { value: 100 - prob }];
  const [activeBullet, setActiveBullet] = useState<BulletFeedback | null>(null);

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-fadeIn pb-24 px-4 sm:px-6">
      {/* Top Header: Admissions Odds */}
      <section className="bg-slate-900 p-6 md:p-8 rounded-[2.5rem] shadow-2xl border border-white/10">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="flex flex-col items-center">
            <h2 className="text-[9px] font-black text-gold tracking-[0.3em] mb-4 uppercase">Acceptance Odds</h2>
            <div className="relative w-32 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={38} outerRadius={54} dataKey="value" startAngle={90} endAngle={450} stroke="none" cornerRadius={6}>
                    <Cell fill="#D4AF37" />
                    <Cell fill="rgba(255,255,255,0.05)" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-white tracking-tighter">{prob}%</span>
              </div>
            </div>
          </div>

          <div className="flex-grow text-center md:text-left">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Executive Summary</p>
            <p className="text-sm md:text-base leading-relaxed text-slate-200 font-semibold italic">
              "{result.executiveSummary}"
            </p>
          </div>

          <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto">
            <button onClick={onAnotherJob} className="flex-1 py-3 px-8 bg-gold text-black text-[11px] font-black rounded-2xl shadow-lg active:scale-95 transition-all whitespace-nowrap">New Discovery</button>
            <button onClick={onResetAll} className="flex-1 py-3 px-8 bg-white/5 text-slate-300 text-[10px] font-black rounded-2xl hover:bg-white/10 transition-all border border-white/5 whitespace-nowrap">Reset Profile</button>
          </div>
        </div>
      </section>

      {/* Compatibility Matrix */}
      <section className="space-y-6">
        <h3 className="text-[10px] font-black text-gold uppercase tracking-[0.4em] flex items-center">
          Your Compatibility
          <div className="h-[1px] bg-gold/20 flex-grow ml-6"></div>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ExtractionPanel title="Skill Alignment" data={result.extractedSkills} icon={<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>} />
          <ExtractionPanel title="Experience Overlap" data={result.extractedExperience} icon={<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>} />
        </div>
      </section>

      {/* Targeted Improvements */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-black text-gold uppercase tracking-[0.4em] flex items-center">
            Target Improvements
            <div className="h-[1px] bg-gold/20 w-32 ml-6"></div>
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {result.recommendations?.slice(0, 3).map((rec, i) => (
            <div key={i} className="bg-slate-900 p-6 rounded-[2rem] border border-white/5 shadow-xl flex flex-col h-full hover:border-gold/30 transition-all group relative overflow-hidden">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>
                <h5 className="text-[11px] font-black text-white uppercase tracking-tight">{rec.title}</h5>
              </div>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed mb-4 flex-grow">{rec.description}</p>
              <div className="space-y-1.5">
                {rec.masterySteps?.slice(0, 3).map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-[10px] font-bold text-slate-300 bg-white/5 p-2.5 rounded-xl border border-white/5">
                    <span className="text-gold">0{idx + 1}</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Resume Signal Refinement */}
      <section className="space-y-6">
        <h3 className="text-[10px] font-black text-gold uppercase tracking-[0.4em] flex items-center">
          Resume Refinement
          <div className="h-[1px] bg-gold/20 flex-grow ml-6"></div>
        </h3>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3 space-y-2">
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-4">Click highlighted lines for deep suggestions</p>
            <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/10 shadow-inner font-mono text-[11px] leading-relaxed text-slate-400 overflow-y-auto max-h-[500px]">
              {result.bulletFeedback
                .filter(bullet => bullet.needsImprovement)
                .map((bullet, i) => (
                <div 
                  key={i} 
                  onClick={() => setActiveBullet(bullet)}
                  className={`py-1 px-2 rounded-lg transition-all mb-1 cursor-pointer hover:bg-gold/10 border border-transparent hover:border-gold/30 text-slate-200 decoration-gold/30 underline decoration-dashed underline-offset-4 ${activeBullet?.originalText === bullet.originalText ? 'bg-gold/20 border-gold/50 text-gold' : ''}`}
                >
                  {bullet.originalText}
                </div>
              ))}
              {result.bulletFeedback.filter(bullet => bullet.needsImprovement).length === 0 && (
                <div className="text-center py-8 text-slate-500 font-bold uppercase text-[9px] tracking-widest italic">
                  Strong signals detected. No lines require immediate refinement.
                </div>
              )}
            </div>
          </div>
          <div className="lg:w-1/3 flex flex-col">
            <div className="sticky top-24 bg-slate-900/50 p-6 rounded-[2.5rem] border border-white/5 flex flex-col h-full min-h-[300px]">
              <div className="mb-6">
                <p className="text-[8px] font-black text-gold uppercase tracking-widest mb-1">Impact Analysis</p>
                <div className="h-0.5 bg-gold/20 w-12"></div>
              </div>
              
              {activeBullet ? (
                <div className="animate-fadeIn space-y-6 flex-grow flex flex-col">
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Original Context</p>
                    <p className="text-[11px] text-slate-400 italic bg-white/5 p-3 rounded-xl border border-white/5">"{activeBullet.originalText}"</p>
                  </div>
                  
                  <div>
                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2">The Problem</p>
                    <p className="text-[11px] text-slate-300 font-semibold leading-relaxed">{activeBullet.feedback}</p>
                  </div>

                  <div className="mt-auto">
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">High-Impact Alternative</p>
                    <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 text-emerald-100 text-[11px] font-bold leading-relaxed shadow-lg">
                      {activeBullet.suggestedUpdate}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-grow flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-white/5 rounded-3xl">
                  <svg className="w-8 h-8 text-slate-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Select a line to refine</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Interview Intelligence */}
      <section className="space-y-6">
        <h3 className="text-[10px] font-black text-gold uppercase tracking-[0.4em] flex items-center">
          Interview Tips
          <div className="h-[1px] bg-gold/20 flex-grow ml-6"></div>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 p-6 rounded-[2rem] border border-white/5 shadow-xl flex flex-col h-full hover:border-gold/30 transition-all group">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>
              <h5 className="text-[11px] font-black text-white uppercase tracking-tight">Technical Drill-Down</h5>
            </div>
            <div className="space-y-2">
              {result.interviewPrep.technicalTopics.map((topic, i) => (
                <div key={i} className="flex items-start gap-2 text-[10px] font-bold text-slate-300 bg-white/5 p-2.5 rounded-xl border border-white/5">
                  <span className="text-gold">0{i + 1}</span>
                  <span>{topic}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-slate-900 p-6 rounded-[2rem] border border-white/5 shadow-xl flex flex-col h-full hover:border-gold/30 transition-all group">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>
              <h5 className="text-[11px] font-black text-white uppercase tracking-tight">Behavioral Scenarios</h5>
            </div>
            <div className="space-y-2">
              {result.interviewPrep.behavioralPrompts.map((prompt, i) => (
                <div key={i} className="flex items-start gap-2 text-[10px] font-bold text-slate-300 bg-white/5 p-2.5 rounded-xl border border-white/5">
                  <span className="text-gold">?</span>
                  <span>{prompt}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-[2rem] border border-gold/10 shadow-xl flex flex-col h-full hover:border-gold/30 transition-all group relative overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>
              <h5 className="text-[11px] font-black text-white uppercase tracking-tight">Insider Tips</h5>
            </div>
            <div className="space-y-2 relative z-10">
              {result.interviewPrep.insiderTips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2 text-[10px] font-bold text-slate-300 bg-white/5 p-2.5 rounded-xl border border-white/5">
                  <span className="text-gold">#</span>
                  {tip}
                </div>
              ))}
            </div>
            <div className="absolute bottom-[-10px] right-[-10px] opacity-10 pointer-events-none group-hover:scale-110 transition-transform">
              <svg className="w-24 h-24 text-gold" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2v-2zm0-7h2v5h-2V9z"/></svg>
            </div>
          </div>
        </div>
      </section>

      {/* Admission Strategy */}
      {result.coverLetterTips && (
        <section className="bg-gold p-10 rounded-[3rem] shadow-2xl text-black relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-black/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <h3 className="text-[14px] font-black mb-10 uppercase tracking-widest flex items-center">
            <span className="bg-black text-gold p-1.5 rounded-lg mr-3 shadow-xl">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
            </span>
            Cover Letter Strategy
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
            <div className="space-y-6">
              <p className="text-[8px] font-black text-black/40 uppercase tracking-widest">Master Narrative</p>
              <p className="text-black font-black text-[18px] leading-tight tracking-tight italic">"{result.coverLetterTips.tone}"</p>
              <div className="h-[2px] bg-black/10 w-24"></div>
              <ul className="space-y-3">
                {result.coverLetterTips.keyNarratives?.slice(0, 3).map((narr, i) => (
                  <li key={i} className="text-black/80 text-[11px] font-bold flex items-start leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-black mr-3 mt-1.5 flex-shrink-0"></span> {narr}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-6">
              <p className="text-[8px] font-black text-black/40 uppercase tracking-widest">High-Probability Keywords</p>
              <div className="flex flex-wrap gap-2">
                {result.coverLetterTips.mustMentionSkills?.slice(0, 8).map((s, i) => (
                  <span key={i} className="px-3 py-1.5 bg-black text-gold rounded-xl text-[10px] font-black border border-black/10">{s}</span>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default AnalysisView;
