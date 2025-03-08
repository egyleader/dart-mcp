import { z } from 'zod';
import { executeDartCommand } from '../utils/dart-executor.js';
import { toAbsolutePath } from '../utils/path-utils.js';

export const createSchema = z.object({
  template: z.enum(['console', 'package', 'server-shelf', 'web']).default('package')
    .describe('Template to use for project generation'),
  projectName: z.string().describe('Name of the project to create'),
  output: z.string().optional().describe('Directory where to create the project'),
  options: z.array(z.string()).optional().describe('Additional project creation options')
});

export async function create(args: z.infer<typeof createSchema>) {
  const { template, projectName, output, options = [] } = args;
  
  // Convert relative output path to absolute path if provided
  const absoluteOutput = output ? toAbsolutePath(output) : undefined;
  
  const cmdArgs = [
    template,
    projectName,
    ...(absoluteOutput ? ['--output', absoluteOutput] : []),
    ...options
  ];
  
  const { stdout, stderr } = await executeDartCommand('create', cmdArgs);
  
  return {
    content: [
      { type: "text" as const, text: stdout || stderr }
    ],
    isError: !!stderr
  };
}
