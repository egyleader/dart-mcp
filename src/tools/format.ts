import { z } from 'zod';
import { executeDartCommand } from '../utils/dart-executor.js';
import { toAbsolutePaths } from '../utils/path-utils.js';

export const formatSchema = z.object({
  paths: z.array(z.string()).describe('Files or directories to format'),
  setExitIfChanged: z.boolean().default(false).describe('Return exit code 1 if there are any formatting changes'),
  options: z.array(z.string()).optional().describe('Additional format options')
});

export async function format(args: z.infer<typeof formatSchema>) {
  const { paths, setExitIfChanged, options = [] } = args;
  
  // Convert all relative paths to absolute paths
  const absolutePaths = toAbsolutePaths(paths);
  
  const cmdArgs = [
    ...absolutePaths,
    ...(setExitIfChanged ? ['--set-exit-if-changed'] : []),
    ...options
  ];
  
  const { stdout, stderr } = await executeDartCommand('format', cmdArgs);
  
  return {
    content: [
      { type: "text" as const, text: stdout || stderr }
    ],
    isError: !!stderr
  };
}
