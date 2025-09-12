'use server';

/**
 * @fileOverview A time-off calculator AI agent.
 *
 * - calculateEstimatedTimeOff - A function that handles the time off calculation process.
 * - CalculateEstimatedTimeOffInput - The input type for the calculateEstimatedTimeOff function.
 * - CalculateEstimatedTimeOffOutput - The return type for the calculateEstimatedTimeOff function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CalculateEstimatedTimeOffInputSchema = z.object({
  monthsWorked: z
    .number()
    .describe('The number of months the employee has worked.'),
  accrualRate: z
    .number()
    .default(1.75)
    .describe('The accrual rate of paid time off per month, in days.'),
});
export type CalculateEstimatedTimeOffInput = z.infer<typeof CalculateEstimatedTimeOffInputSchema>;

const CalculateEstimatedTimeOffOutputSchema = z.object({
  estimatedTimeOff: z
    .number()
    .describe('The estimated amount of paid time off the employee has accumulated, in days.'),
});
export type CalculateEstimatedTimeOffOutput = z.infer<typeof CalculateEstimatedTimeOffOutputSchema>;

export async function calculateEstimatedTimeOff(
  input: CalculateEstimatedTimeOffInput
): Promise<CalculateEstimatedTimeOffOutput> {
  return calculateEstimatedTimeOffFlow(input);
}

const calculateEstimatedTimeOffPrompt = ai.definePrompt({
  name: 'calculateEstimatedTimeOffPrompt',
  input: {schema: CalculateEstimatedTimeOffInputSchema},
  output: {schema: CalculateEstimatedTimeOffOutputSchema},
  prompt: `You are a helpful HR assistant. Calculate the estimated amount of paid time off an employee has accumulated based on the number of months worked and the accrual rate. Accrual rate is in days per month. Here is the information:

Months Worked: {{{monthsWorked}}}
Accrual Rate: {{{accrualRate}}}

Calculate the total time off and set the estimatedTimeOff output field.`,
});

const calculateEstimatedTimeOffFlow = ai.defineFlow(
  {
    name: 'calculateEstimatedTimeOffFlow',
    inputSchema: CalculateEstimatedTimeOffInputSchema,
    outputSchema: CalculateEstimatedTimeOffOutputSchema,
  },
  async input => {
    const {output} = await calculateEstimatedTimeOffPrompt(input);
    return output!;
  }
);
