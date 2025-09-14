
'use server';
/**
 * @fileOverview An AI agent for fetching nationwide public holidays for Tunisia.
 *
 * - syncHolidays - A function that fetches public holidays for a given year.
 * - SyncHolidaysInput - The input type for the syncHolidays function.
 * - SyncHolidaysOutput - The return type for the syncHolidays function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SyncHolidaysInputSchema = z.object({
  year: z.number().describe('The year to fetch public holidays for.'),
});
export type SyncHolidaysInput = z.infer<typeof SyncHolidaysInputSchema>;

const HolidaySchema = z.object({
    name: z.string().describe("The official name of the holiday."),
    date: z.string().describe("The date of the holiday in 'YYYY-MM-DD' format."),
});

const SyncHolidaysOutputSchema = z.object({
  holidays: z.array(HolidaySchema).describe('A list of nationwide public holidays.'),
});
export type SyncHolidaysOutput = z.infer<typeof SyncHolidaysOutputSchema>;

export async function syncHolidays(input: SyncHolidaysInput): Promise<SyncHolidaysOutput> {
  return syncHolidaysFlow(input);
}

const prompt = ai.definePrompt({
  name: 'syncHolidaysPrompt',
  input: { schema: SyncHolidaysInputSchema },
  output: { schema: SyncHolidaysOutputSchema },
  prompt: `You are an expert HR assistant. Your task is to generate a list of all official, nationwide public holidays in Tunisia for the specified year.

Provide the response as a structured list of holiday objects, where each object contains the holiday's name and its date in "YYYY-MM-DD" format.

Year: {{{year}}}
`,
});

const syncHolidaysFlow = ai.defineFlow(
  {
    name: 'syncHolidaysFlow',
    inputSchema: SyncHolidaysInputSchema,
    outputSchema: SyncHolidaysOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
