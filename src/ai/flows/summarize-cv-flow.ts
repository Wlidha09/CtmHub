
'use server';
/**
 * @fileOverview An AI agent for summarizing candidate CVs.
 *
 * - summarizeCv - A function that takes a CV and returns a summary.
 * - SummarizeCvInput - The input type for the summarizeCv function.
 * - SummarizeCvOutput - The return type for the summarizeCv function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const SummarizeCvInputSchema = z.object({
  cvDataUri: z
    .string()
    .describe(
      "A candidate's CV file, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SummarizeCvInput = z.infer<typeof SummarizeCvInputSchema>;

export const SummarizeCvOutputSchema = z.object({
  fullName: z.string().describe("The full name of the candidate."),
  summary: z.string().describe("A concise 2-3 sentence summary of the candidate's profile, highlighting their key experience and qualifications."),
});
export type SummarizeCvOutput = z.infer<typeof SummarizeCvOutputSchema>;

export async function summarizeCv(input: SummarizeCvInput): Promise<SummarizeCvOutput> {
  return summarizeCvFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeCvPrompt',
  input: { schema: SummarizeCvInputSchema },
  output: { schema: SummarizeCvOutputSchema },
  prompt: `You are an expert HR recruitment assistant. Your task is to analyze the provided CV and extract key information.

Analyze the following CV and provide the candidate's full name and a brief summary of their profile.

CV Content:
{{media url=cvDataUri}}
`,
});

const summarizeCvFlow = ai.defineFlow(
  {
    name: 'summarizeCvFlow',
    inputSchema: SummarizeCvInputSchema,
    outputSchema: SummarizeCvOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
