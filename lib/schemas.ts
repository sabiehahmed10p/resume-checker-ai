import { z } from "zod";

export const keywordAnalysisSchema = z.object({
  matchingKeywords: z.array(z.string()).describe("Keywords found in both resume and job description"),
  missingKeywords: z.array(z.string()).describe("Keywords from job description missing in resume"),
  resumeKeywords: z.array(z.string()).describe("All keywords extracted from resume")
});

export type KeywordAnalysis = z.infer<typeof keywordAnalysisSchema>;

export const questionSchema = z.object({
  question: z.string(),
  options: z
    .array(z.string())
    .length(4)
    .describe(
      "Four possible answers to the question. Only one should be correct. They should all be of equal lengths.",
    ),
  answer: z
    .enum(["A", "B", "C", "D"])
    .describe(
      "The correct answer, where A is the first option, B is the second, and so on.",
    ),
});

export type Question = z.infer<typeof questionSchema>;

export const questionsSchema = z.array(questionSchema).length(4);

export const resumeAnalysisRequestSchema = z.object({
  files: z.array(z.object({
    name: z.string(),
    type: z.string(),
    data: z.string()
  })),
  jobDescription: z.string().describe("Job description text to compare against resume")
});

export type ResumeAnalysisRequest = z.infer<typeof resumeAnalysisRequestSchema>;
