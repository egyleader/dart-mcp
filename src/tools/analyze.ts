import { z } from 'zod';
import { executeDartCommand } from '../utils/dart-executor.js';
import { toAbsolutePath } from '../utils/path-utils.js';

export const analyzeSchema = z.object({
  path: z.string().optional().describe('Directory or file to analyze'),
  options: z.array(z.string()).optional().describe('Additional options for the dart analyze command')
});

export async function analyze(args: z.infer<typeof analyzeSchema>) {
  const { path, options = [] } = args;
  
  // Convert relative path to absolute path if provided
  const absolutePath = path ? toAbsolutePath(path) : undefined;
  const cmdArgs = [...(absolutePath ? [absolutePath] : []), ...options];
  
  const { stdout, stderr } = await executeDartCommand('analyze', cmdArgs);
  
  return {
    content: [
      { type: "text" as const, text: stdout || stderr }
    ],
    isError: !!stderr
  };
}
