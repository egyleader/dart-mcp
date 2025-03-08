import { z } from 'zod';
import { executeDartCommand } from '../utils/dart-executor.js';
import { toAbsolutePath } from '../utils/path-utils.js';

export const compileSchema = z.object({
  format: z.enum(['exe', 'aot-snapshot', 'jit-snapshot', 'kernel', 'js'])
    .describe('Output format for the compilation'),
  path: z.string().describe('Path to the Dart file to compile'),
  output: z.string().optional().describe('Output file path'),
  options: z.array(z.string()).optional().describe('Additional compilation options')
});

export async function compile(args: z.infer<typeof compileSchema>) {
  const { format, path, output, options = [] } = args;
  
  // Convert relative paths to absolute paths
  const absolutePath = toAbsolutePath(path);
  const absoluteOutput = output ? toAbsolutePath(output) : undefined;
  
  const cmdArgs = [
    format,
    absolutePath,
    ...(absoluteOutput ? ['-o', absoluteOutput] : []),
    ...options
  ];
  
  const { stdout, stderr } = await executeDartCommand('compile', cmdArgs);
  
  return {
    content: [
      { type: "text" as const, text: stdout || stderr }
    ],
    isError: !!stderr
  };
}
