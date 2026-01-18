
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, FileData, JobSearchResult } from "../types";

const API_KEY = process.env.API_KEY || '';

/**
 * High-speed job discovery.
 */
export const searchJobsOnline = async (query: string): Promise<JobSearchResult[]> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Today is January 18th, 2026. Find 5 RECENT internship postings for: "${query}". Return strictly as JSON array: [{title, company, location, snippet, url}].`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            company: { type: Type.STRING },
            location: { type: Type.STRING },
            snippet: { type: Type.STRING },
            url: { type: Type.STRING }
          },
          required: ["title", "company", "location", "snippet", "url"]
        }
      }
    }
  });
  try { return JSON.parse(response.text || '[]'); } catch { return []; }
};

/**
 * Comprehensive but fast extraction of the job description.
 */
export const fetchFullJobDescription = async (jobUrl: string, company: string, title: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Today is January 18th, 2026. Navigate to ${jobUrl}. Provide a comprehensive summary for "${title}" at "${company}". 
    Focus on:
    1. ROLE OVERVIEW: The primary purpose of the position.
    2. KEY RESPONSIBILITIES: Bullet points of day-to-day tasks.
    3. TECHNICAL SKILLS: Required tools, languages, or platforms.
    4. QUALIFICATIONS: Degree or experience requirements.
    
    Exclude company history or generic "equal opportunity" text.`,
    config: { tools: [{ googleSearch: {} }] }
  });
  return response.text || "Comprehensive details could not be retrieved.";
};

/**
 * ULTRA-DEEP Analysis with Line-by-Line Resume Refinement and Interview Intelligence.
 */
export const analyzeInternshipFit = async (
  resumeFile: FileData | null,
  resumeText: string,
  jobDescription: string
): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const systemInstruction = `
    Today's date is January 18th, 2026. 
    You are a very Honest High-Stakes Recruiter for top-tier tech firms (FAANG, OpenAI, NVIDIA, HFT). 
    Your goal is to provide a REALISTIC, ruthlessly accurate percentage of admission.
    
    CRITICAL LOGIC:
    1. PRESTIGE PENALTY: For prestigous firms, 1-3% chance for standard resumes.
    2. BRUTAL FEEDBACK: Do not sugarcoat skill gaps.
    3. TARGETED IMPROVEMENTS: Provide exactly 3 skills to improve with mastery paths.
    4. RESUME REFINEMENT: Analyze resume text and identify high-impact gaps.
    5. INTERVIEW PREP: Identify likely technical drill-down topics and specific behavioral scenarios based on the company's known culture.
  `;

  const contents: any[] = [];
  if (resumeFile) {
    contents.push({ inlineData: { data: resumeFile.base64, mimeType: resumeFile.mimeType } });
  }

  const prompt = `
    JOB CONTEXT: ${jobDescription}
    CANDIDATE DATA: ${resumeText || "See Attached Resume File"}

    Perform a ruthless correlation analysis. Return JSON matching the schema.
    Ensure 'interviewPrep' is highly tailored to the specific role and company provided.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview", 
    contents: { parts: [...contents, { text: prompt }] },
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          matchScore: { type: Type.NUMBER },
          selectivityScore: { type: Type.NUMBER },
          realisticAdmissionProbability: { type: Type.NUMBER },
          executiveSummary: { type: Type.STRING },
          extractedSkills: {
            type: Type.OBJECT,
            properties: {
              resume: { type: Type.ARRAY, items: { type: Type.STRING } },
              job: { type: Type.ARRAY, items: { type: Type.STRING } },
              overlap: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          },
          extractedExperience: {
            type: Type.OBJECT,
            properties: {
              resume: { type: Type.ARRAY, items: { type: Type.STRING } },
              job: { type: Type.ARRAY, items: { type: Type.STRING } },
              overlap: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          },
          recommendations: {
            type: Type.ARRAY,
            minItems: 3,
            maxItems: 3,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
                difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] },
                masterySteps: { type: Type.ARRAY, minItems: 3, maxItems: 3, items: { type: Type.STRING } }
              },
              required: ["title", "description", "priority", "difficulty", "masterySteps"]
            }
          },
          bulletFeedback: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                originalText: { type: Type.STRING },
                feedback: { type: Type.STRING },
                suggestedUpdate: { type: Type.STRING },
                needsImprovement: { type: Type.BOOLEAN }
              },
              required: ["originalText", "needsImprovement"]
            }
          },
          interviewPrep: {
            type: Type.OBJECT,
            properties: {
              technicalTopics: { type: Type.ARRAY, items: { type: Type.STRING } },
              behavioralPrompts: { type: Type.ARRAY, items: { type: Type.STRING } },
              insiderTips: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["technicalTopics", "behavioralPrompts", "insiderTips"]
          },
          coverLetterTips: {
            type: Type.OBJECT,
            properties: {
              keyNarratives: { type: Type.ARRAY, items: { type: Type.STRING } },
              tone: { type: Type.STRING },
              mustMentionSkills: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          }
        },
        required: ["matchScore", "selectivityScore", "realisticAdmissionProbability", "executiveSummary", "recommendations", "coverLetterTips", "bulletFeedback", "interviewPrep"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};
