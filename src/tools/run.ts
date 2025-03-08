import { z } from 'zod';
import { executeDartCommand } from '../utils/dart-executor.js';
import { toAbsolutePath } from '../utils/path-utils.js';

export const runSchema = z.object({
  script: z.string().describe('Path to the Dart script to run'),
  args: z.array(z.string()).optional().describe('Arguments to pass to the script'),
  workingDir: z.string().optional().describe('Working directory for the command')
});

export async function run({ 
  script, 
  args = [], 
  workingDir 
}: z.infer<typeof runSchema>) {
  // Convert relative script path to absolute path
  const absoluteScript = toAbsolutePath(script, workingDir);
  
  // If workingDir is provided, ensure it's absolute
  const absoluteWorkingDir = workingDir ? toAbsolutePath(workingDir) : workingDir;
  
  const { stdout, stderr } = await executeDartCommand('run', [absoluteScript, ...args], absoluteWorkingDir);
  
  return {
    content: [
      { type: "text" as const, text: stdout || stderr }
    ],
    isError: !!stderr
  };
}
