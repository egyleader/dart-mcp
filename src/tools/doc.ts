import { z } from 'zod';
import { executeDartCommand } from '../utils/dart-executor.js';
import { toAbsolutePath } from '../utils/path-utils.js';

export const docSchema = z.object({
  path: z.string().optional().describe('Directory containing the Dart package to document'),
  output: z.string().optional().describe('Output directory for the generated documentation'),
  options: z.array(z.string()).optional().describe('Additional documentation options')
});

export async function doc(args: z.infer<typeof docSchema>) {
  const { path, output, options = [] } = args;
  
  // Convert relative paths to absolute paths
  const absolutePath = path ? toAbsolutePath(path) : undefined;
  const absoluteOutput = output ? toAbsolutePath(output) : undefined;
  
  const cmdArgs = [
    ...(absolutePath ? [absolutePath] : []),
    ...(absoluteOutput ? ['--output', absoluteOutput] : []),
    ...options
  ];
  
  const { stdout, stderr } = await executeDartCommand('doc', cmdArgs);
  
  return {
    content: [
      { type: "text" as const, text: stdout || stderr }
    ],
    isError: !!stderr
  };
}
