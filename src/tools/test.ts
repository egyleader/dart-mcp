import { z } from 'zod';
import { executeDartCommand } from '../utils/dart-executor.js';
import { toAbsolutePath } from '../utils/path-utils.js';

export const testSchema = z.object({
  path: z.string().optional().describe('Path to the test file or directory'),
  options: z.array(z.string()).optional().describe('Additional test options'),
  workingDir: z.string().optional().describe('Working directory for the command')
});

export async function test({ 
  path, 
  options = [], 
  workingDir 
}: z.infer<typeof testSchema>) {
  // Convert relative path to absolute path if provided
  const absolutePath = path ? toAbsolutePath(path, workingDir) : undefined;
  
  // If workingDir is provided, ensure it's absolute
  const absoluteWorkingDir = workingDir ? toAbsolutePath(workingDir) : workingDir;
  
  const args = [
    ...(absolutePath ? [absolutePath] : []),
    ...options
  ];
  
  const { stdout, stderr } = await executeDartCommand('test', args, absoluteWorkingDir);
  
  return {
    content: [
      { type: "text" as const, text: stdout || stderr }
    ],
    isError: !!stderr
  };
}
