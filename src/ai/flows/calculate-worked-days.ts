'use server';

/**
 * @fileOverview A worked days calculator AI agent.
 *
 * - calculateWorkedDays - A function that handles the worked days calculation process.
 * - CalculateWorkedDaysInput - The input type for the calculateWorkedDays function.
 * - CalculateWorkedDaysOutput - The return type for the calculateWorkedDays function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CalculateWorkedDaysInputSchema = z.object({
  year: z.number().describe('The year for the calculation.'),
  month: z.number().describe('The month for the calculation (1-12).'),
  holidays: z.number().default(0).describe('The number of holidays in the month.'),
  vacationDays: z.number().default(0).describe('The number of vacation days taken.'),
  sickDays: z.number().default(0).describe('The number of sick days taken.'),
});
export type CalculateWorkedDaysInput = z.infer<typeof CalculateWorkedDaysInputSchema>;

const CalculateWorkedDaysOutputSchema = z.object({
  workedDays: z
    .number()
    .describe('The calculated number of days worked in the month.'),
});
export type CalculateWorkedDaysOutput = z.infer<typeof CalculateWorkedDaysOutputSchema>;

export async function calculateWorkedDays(
  input: CalculateWorkedDaysInput
): Promise<CalculateWorkedDaysOutput> {
  return calculateWorkedDaysFlow(input);
}

const prompt = ai.definePrompt({
  name: 'calculateWorkedDaysPrompt',
  input: {schema: CalculateWorkedDaysInputSchema},
  output: {schema: CalculateWorkedDaysOutputSchema},
  prompt: `You are a helpful HR assistant. Calculate the number of working days in a given month.

Here is the information:
- Year: {{{year}}}
- Month: {{{month}}}
- Public Holidays: {{{holidays}}}
- Vacation Days Taken: {{{vacationDays}}}
- Sick Days Taken: {{{sickDays}}}

To calculate the worked days:
1. Determine the total number of days in the specified month and year.
2. Determine the number of weekend days (Saturdays and Sundays) in that month.
3. Subtract the weekend days from the total days in the month to get the initial business days.
4. Subtract the public holidays, vacation days, and sick days from the business days.
5. The result is the total number of days worked.

Set the final calculated value in the 'workedDays' output field.
`,
});

const calculateWorkedDaysFlow = ai.defineFlow(
  {
    name: 'calculateWorkedDaysFlow',
    inputSchema: CalculateWorkedDaysInputSchema,
    outputSchema: CalculateWorkedDaysOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
