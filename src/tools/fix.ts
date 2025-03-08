import { z } from 'zod';
import { executeDartCommand } from '../utils/dart-executor.js';
import { toAbsolutePath } from '../utils/path-utils.js';

export const fixSchema = z.object({
  path: z.string().optional().describe('Directory or file to apply fixes to'),
  apply: z.boolean().default(true).describe('Whether to apply the suggested fixes'),
  options: z.array(z.string()).optional().describe('Additional fix options')
});

export async function fix(args: z.infer<typeof fixSchema>) {
  const { path, apply, options = [] } = args;
  
  // Convert relative path to absolute path if provided
  const absolutePath = path ? toAbsolutePath(path) : undefined;
  
  const cmdArgs = [
    ...(absolutePath ? [absolutePath] : []),
    ...(apply ? ['--apply'] : ['--dry-run']),
    ...options
  ];
  
  const { stdout, stderr } = await executeDartCommand('fix', cmdArgs);
  
  return {
    content: [
      { type: "text" as const, text: stdout || stderr }
    ],
    isError: !!stderr
  };
}
