import { z } from 'zod';
import { executeDartCommand } from '../utils/dart-executor.js';

export const infoSchema = z.object({
  options: z.array(z.string()).optional().describe('Additional info options')
});

export async function info({ 
  options = [] 
}: z.infer<typeof infoSchema>) {
  const { stdout, stderr } = await executeDartCommand('info', options);
  
  return {
    content: [
      { type: "text" as const, text: stdout || stderr }
    ],
    isError: !!stderr
  };
}
