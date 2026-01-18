
import React, { useState, useCallback, useEffect } from 'react';
import { analyzeInternshipFit, searchJobsOnline, fetchFullJobDescription } from './services/geminiService';
import { AnalysisResult, AnalysisStep, FileData, JobSearchResult } from './types';
import AnalysisView from './components/AnalysisView';

const App: React.FC = () => {
  const [step, setStep] = useState<AnalysisStep>(AnalysisStep.INPUT);
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState<FileData | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<JobSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isFetchingFull, setIsFetchingFull] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [loadingPhase, setLoadingPhase] = useState(0);

  // Loading phases to explain latency
  const phases = [
    "Initializing Reasoning Engine...",
    "Crawling job requirements & context...",
    "Factoring in company reputation & selectivity...",
    "Correlating candidate skills to market data...",
    "Calculating realistic admission odds...",
    "Finalizing strategy recommendations..."
  ];

  useEffect(() => {
    let interval: any;
    if (step === AnalysisStep.ANALYZING) {
      interval = setInterval(() => {
        setLoadingPhase((p) => (p < phases.length - 1 ? p + 1 : p));
      }, 6000);
    } else {
      setLoadingPhase(0);
    }
    return () => clearInterval(interval);
  }, [step]);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      setResumeFile({ base64, mimeType: file.type, name: file.name });
      setResumeText('');
    };
    reader.readAsDataURL(file);
  }, []);

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchResults([]);
    setErrorMessage('');
    try {
      const jobs = await searchJobsOnline(searchQuery);
      setSearchResults(jobs);
    } catch (err) {
      setErrorMessage("Discovery failed. Try a more general search.");
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  const selectJob = useCallback(async (job: JobSearchResult) => {
    setIsFetchingFull(true);
    setStep(AnalysisStep.INPUT);
    setJobDescription('');
    try {
      const coreDetails = await fetchFullJobDescription(job.url, job.company, job.title);
      setJobDescription(coreDetails);
    } catch (e) {
      setJobDescription(`${job.title} at ${job.company}\n\n${job.snippet}`);
    } finally {
      setIsFetchingFull(false);
    }
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!jobDescription || (!resumeText && !resumeFile)) return;
    setStep(AnalysisStep.ANALYZING);
    setErrorMessage('');

    try {
      // Removed 30s timeout to allow deep reasoning model to finish its work
      const analysisResult = await analyzeInternshipFit(resumeFile, resumeText, jobDescription);
      
      if (!analysisResult || !analysisResult.executiveSummary) {
        throw new Error("Deep analysis failed to return data.");
      }
      setResult(analysisResult);
      setStep(AnalysisStep.RESULT);
    } catch (error: any) {
      setErrorMessage(error.message || "Deep matching failed. Please review inputs.");
      setStep(AnalysisStep.INPUT);
    }
  }, [resumeFile, resumeText, jobDescription]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-20 selection:bg-gold selection:text-black">
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => setStep(AnalysisStep.INPUT)}>
            <div className="bg-gradient-to-br from-gold to-gold-dark p-2 rounded-xl shadow-[0_0_15px_rgba(212,175,55,0.3)] group-hover:scale-110 transition-transform duration-200">
              <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h1 className="text-xl font-black tracking-tight text-gold">Crack<span className="text-white opacity-80">ify</span></h1>
          </div>
          <button 
            onClick={() => setStep(AnalysisStep.SEARCH)}
            className="text-xs font-bold text-gold bg-gold/10 px-5 py-2.5 rounded-xl hover:bg-gold hover:text-black transition-all flex items-center border border-gold/20 shadow-inner active:scale-95"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            DISCOVER
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        {step === AnalysisStep.SEARCH && (
          <div className="max-w-4xl mx-auto animate-fadeIn">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-black text-white tracking-tight mb-3">Discovery Engine</h2>
              <p className="text-slate-400 font-medium">Sourcing elite internship opportunities</p>
            </div>
            
            <form onSubmit={handleSearch} className="mb-12 flex gap-3 p-2 bg-slate-900 rounded-3xl shadow-2xl border border-white/5 focus-within:ring-2 focus-within:ring-gold/30 transition-all">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Job title, company, or location..."
                className="flex-grow px-6 py-4 bg-transparent text-white border-none outline-none text-lg font-bold placeholder:text-slate-600"
              />
              <button 
                disabled={isSearching} 
                className="bg-gold text-black px-8 rounded-2xl font-black hover:bg-gold-light disabled:opacity-50 transition-all shadow-[0_4px_20px_rgba(212,175,55,0.2)] active:scale-95 flex items-center justify-center min-w-[120px]"
              >
                {isSearching ? <svg className="animate-spin h-5 w-5 text-black" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : "Search"}
              </button>
            </form>

            <div className="space-y-4">
              {searchResults.map((job, idx) => (
                <div key={idx} className="bg-slate-900/50 p-6 rounded-3xl border border-white/5 hover:border-gold/30 transition-all group animate-fadeInUp" style={{animationDelay: `${idx * 0.05}s`}}>
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-white leading-tight group-hover:text-gold transition-colors">{job.title}</h3>
                      <div className="flex items-center text-slate-400 text-sm mt-1">
                        <span className="text-gold font-bold">{job.company}</span>
                        <span className="mx-2 opacity-30">•</span>
                        <span>{job.location}</span>
                      </div>
                    </div>
                    <button onClick={() => selectJob(job)} className="bg-white/5 text-gold px-5 py-2.5 rounded-xl text-xs font-black hover:bg-gold hover:text-black transition-all border border-gold/10 active:scale-95">Select</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === AnalysisStep.INPUT && (
          <div className="max-w-5xl mx-auto animate-fadeIn">
            <div className="text-center mb-10">
              <span className="bg-gold/10 text-gold text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-4 inline-block border border-gold/20">Analysis Mode</span>
              <h2 className="text-4xl font-black text-white tracking-tight">Let&apos;s Test Your Resume!</h2>
            </div>

            {errorMessage && (
              <div className="mb-6 p-6 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl flex items-start gap-4 animate-fadeIn">
                <div className="bg-rose-500 p-2 rounded-lg text-black mt-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                </div>
                <div>
                  <p className="font-black uppercase text-[10px] tracking-widest mb-1">System Error</p>
                  <p className="text-sm font-bold leading-relaxed">{errorMessage}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
              <div className="bg-slate-900 p-8 rounded-[2rem] border border-white/5 flex flex-col hover:border-gold/20 transition-all shadow-xl">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-5">Step 1: Your Resume</label>
                <div className="relative border-2 border-dashed border-slate-800 rounded-3xl p-10 hover:border-gold/40 bg-slate-950/50 cursor-pointer text-center group transition-all">
                  <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  <p className="text-sm font-black text-slate-300 group-hover:text-gold transition-colors">{resumeFile ? resumeFile.name : "Upload Resume"}</p>
                </div>
                {!resumeFile && <textarea value={resumeText} onChange={(e) => setResumeText(e.target.value)} placeholder="Or paste text..." className="mt-4 w-full flex-grow min-h-[160px] p-5 bg-slate-950 border border-slate-800 rounded-2xl text-sm outline-none text-slate-300 focus:border-gold/50 transition-all" />}
              </div>

              <div className="bg-slate-900 p-8 rounded-[2rem] border border-white/5 flex flex-col relative hover:border-gold/20 transition-all shadow-xl">
                {isFetchingFull && <div className="absolute inset-0 bg-slate-900/90 z-20 flex flex-col items-center justify-center rounded-[2rem]"><div className="w-10 h-10 border-4 border-gold/10 border-t-gold rounded-full animate-spin mb-3"></div><p className="text-gold font-bold text-xs uppercase tracking-widest">Sourcing Details...</p></div>}
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-5">Step 2: Job Description</label>
                <textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Full listing details go here..." className="w-full flex-grow min-h-[300px] p-5 bg-slate-950 border border-slate-800 rounded-2xl text-sm outline-none text-slate-300 focus:border-gold/50 transition-all" />
              </div>
            </div>

            <div className="mt-12 flex flex-col items-center">
              <button onClick={handleAnalyze} disabled={(!resumeText && !resumeFile) || !jobDescription || isFetchingFull} className="py-5 px-16 bg-gold text-black text-lg font-black rounded-[2rem] hover:bg-gold-light disabled:opacity-30 shadow-[0_10px_40_rgba(212,175,55,0.2)] transition-all transform hover:scale-105 active:scale-95">Analyze Odds</button>
            </div>
          </div>
        )}

        {step === AnalysisStep.ANALYZING && (
          <div className="flex flex-col items-center justify-center py-20 animate-fadeIn max-w-lg mx-auto text-center">
            <div className="relative mb-12">
               <div className="w-28 h-28 border-[10px] border-gold/5 border-t-gold rounded-full animate-spin shadow-[0_0_50px_rgba(212,175,55,0.1)]"></div>
               <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-gold font-black text-xs"></span>
               </div>
            </div>
            
            <h2 className="text-2xl font-black text-white tracking-tight mb-2">Cracking...</h2>
            <div className="h-6 overflow-hidden mb-8">
               <p className="text-gold text-sm font-bold uppercase tracking-widest animate-slideUp">
                 {phases[loadingPhase]}
               </p>
            </div>
          </div>
        )}

        {step === AnalysisStep.RESULT && result && (
          <AnalysisView result={result} onResetAll={() => setStep(AnalysisStep.INPUT)} onAnotherJob={() => setStep(AnalysisStep.SEARCH)} />
        )}
      </main>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { 
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        .animate-fadeInUp { animation: fadeInUp 0.3s ease-out forwards; }
        .animate-slideUp { animation: slideUp 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default App;
