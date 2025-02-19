import { google } from "@ai-sdk/google";
import { streamObject } from "ai";
import { keywordAnalysisSchema } from "@/lib/schemas";

export const runtime = "edge";

export async function POST(req: Request) {
    const { files, jobDescription } = await req.json();
    const firstFile = files[0].data;


    // Generate keyword analysis using AI
    const result = await streamObject({
      model: google("gemini-1.5-flash-latest"),
      schema: keywordAnalysisSchema,
      messages: [
        {
          role: "system",
          content: "You are helpful assistant. who can analyze Resume and output Missing keywords, and Matching Keywords. and Resume Keywords.",    
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze the following resume and job description to identify matching and missing keywords. Focus on technical skills, qualifications, and experience.
        <JobDescription>
            ${jobDescription}
        </JobDescription>
        Provide an analysis that includes:
        1. Keywords found in both the resume and job description
        2. Important keywords from the job description that are missing in the resume`,
            },
            {
              type: "file",
              data: firstFile,
              mimeType: "application/pdf",
            },
          ],
        },
      ],
      output: "object",
      onFinish: ({ object }) => {
        const res = keywordAnalysisSchema.safeParse(object);
        if (res.error) {
          throw new Error(res.error.errors.map((e) => e.message).join("\n"));
        }
      },
    });
    return result.toTextStreamResponse();
}