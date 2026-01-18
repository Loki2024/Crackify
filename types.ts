
export interface Recommendation {
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  masterySteps: string[];
}

export interface BulletFeedback {
  originalText: string;
  feedback?: string;
  suggestedUpdate?: string;
  needsImprovement: boolean;
}

export interface InterviewPrep {
  technicalTopics: string[];
  behavioralPrompts: string[];
  insiderTips: string[];
}

export interface CoverLetterTips {
  keyNarratives: string[];
  tone: string;
  mustMentionSkills: string[];
}

export interface ExtractionSegment {
  resume: string[];
  job: string[];
  overlap: string[];
}

export interface JobSearchResult {
  title: string;
  company: string;
  location: string;
  snippet: string;
  url: string;
}

export interface AnalysisResult {
  matchScore: number;
  selectivityScore: number;
  realisticAdmissionProbability: number;
  executiveSummary: string;
  extractedSkills: ExtractionSegment;
  extractedExperience: ExtractionSegment;
  recommendations: Recommendation[];
  coverLetterTips: CoverLetterTips;
  bulletFeedback: BulletFeedback[];
  interviewPrep: InterviewPrep;
}

export interface FileData {
  base64: string;
  mimeType: string;
  name: string;
}

export enum AnalysisStep {
  INPUT = 'INPUT',
  SEARCH = 'SEARCH',
  ANALYZING = 'ANALYZING',
  RESULT = 'RESULT'
}
