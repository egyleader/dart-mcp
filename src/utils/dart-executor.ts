import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

/**
 * Executes a Dart command with the provided arguments
 * @param command The dart subcommand to execute (e.g., 'analyze', 'format')
 * @param args Arguments to pass to the dart command
 * @param cwd Optional working directory for the command
 * @returns Promise with the result of the command execution
 */
export async function executeDartCommand(
  command: string,
  args: string[] = [],
  cwd?: string
): Promise<{ stdout: string; stderr: string }> {
  const dartCommand = `dart ${command} ${args.join(' ')}`;
  
  // Log command execution details for debugging
  console.log(`Executing command: ${dartCommand}`);
  console.log(`Working directory: ${cwd || process.cwd()}`);
  console.log(`Arguments: ${JSON.stringify(args)}`);
  
  try {
    const { stdout, stderr } = await execPromise(dartCommand, { cwd });
    return { stdout, stderr };
  } catch (error) {
    // If the command fails, we still want to return the output
    if (error instanceof Error && 'stdout' in error && 'stderr' in error) {
      const execError = error as unknown as { stdout: string; stderr: string };
      return {
        stdout: execError.stdout || '',
        stderr: execError.stderr || error.message
      };
    }
    
    // For any other errors, just return the error message
    return {
      stdout: '',
      stderr: error instanceof Error ? error.message : String(error)
    };
  }
}
