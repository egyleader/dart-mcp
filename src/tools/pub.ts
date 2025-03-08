import { z } from 'zod';
import { executeDartCommand } from '../utils/dart-executor.js';
import { toAbsolutePath } from '../utils/path-utils.js';

export const pubSchema = z.object({
  command: z.enum(['get', 'upgrade', 'outdated', 'add', 'remove', 'publish', 'deps', 'downgrade', 'cache', 'run', 'global'])
    .describe('Pub subcommand to execute'),
  args: z.array(z.string()).optional().describe('Arguments for the pub subcommand'),
  workingDir: z.string().optional().describe('Working directory for the command')
});

export async function pub({ 
  command, 
  args = [], 
  workingDir 
}: z.infer<typeof pubSchema>) {
  // If workingDir is provided, ensure it's absolute
  const absoluteWorkingDir = workingDir ? toAbsolutePath(workingDir) : workingDir;
  
  const { stdout, stderr } = await executeDartCommand('pub', [command, ...args], absoluteWorkingDir);
  
  return {
    content: [
      { type: "text" as const, text: stdout || stderr }
    ],
    isError: !!stderr
  };
}
