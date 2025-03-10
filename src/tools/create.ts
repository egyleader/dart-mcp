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
  
  // If output is provided, use it as the target directory
  // Otherwise, use projectName as both the target directory and the package name
  const targetDir = output || projectName;
  
  // Convert relative path to absolute path
  const absoluteTargetDir = toAbsolutePath(targetDir);
  
  // When output and projectName are both provided, we might want to use
  // projectName to name the package but create it in the output directory.
  // However, the Dart CLI doesn't have a separate flag for this.
  // The project name will be derived from the directory name.
  
  const cmdArgs = [
    '-t', template,
    ...options,
    // Use the target directory as the positional argument
    absoluteTargetDir
  ];
  
  console.log(`Creating Dart project with template '${template}' in directory: ${absoluteTargetDir}`);
  const { stdout, stderr } = await executeDartCommand('create', cmdArgs);
  
  return {
    content: [
      { type: "text" as const, text: stdout || stderr }
    ],
    isError: !!stderr
  };
}
