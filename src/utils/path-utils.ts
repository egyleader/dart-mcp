import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

// Dynamic collection of project roots to check when resolving paths
const PROJECT_ROOTS: string[] = [];

/**
 * Add a project root to the list of known project roots
 * @param root The project root to add
 */
export function addProjectRoot(root: string): void {
  if (root && !PROJECT_ROOTS.includes(root)) {
    // Only log in verbose mode to avoid cluttering stdout/stderr
    // which is used for MCP communication
    if (process.env.DART_MCP_VERBOSE) {
      console.error(`[dart-mcp] Adding project root: ${root}`);
    }
    PROJECT_ROOTS.push(root);
  }
}

/**
 * Converts a relative path to an absolute path
 * If the path is already absolute, it is returned as is
 * If the path is relative, it is resolved against the working directory
 * 
 * @param filePath The path to convert
 * @param workingDir The working directory to resolve against (defaults to process.cwd())
 * @returns The absolute path
 */
export function toAbsolutePath(filePath: string, workingDir?: string): string {
  if (!filePath) return filePath;
  
  const isVerbose = process.env.DART_MCP_VERBOSE === 'true';
  const cwd = workingDir || process.cwd();
  
  // If the path is already absolute, return it regardless of existence
  if (path.isAbsolute(filePath)) {
    if (isVerbose) console.error(`[dart-mcp] Using absolute path: ${filePath}`);
    return filePath;
  }
  
  // For relative paths, always resolve against cwd
  const resolvedPath = path.resolve(cwd, filePath);
  if (isVerbose) console.error(`[dart-mcp] Resolved relative path: ${filePath} → ${resolvedPath}`);
  return resolvedPath;
}

/**
 * Converts all paths in an array to absolute paths
 * 
 * @param paths Array of paths to convert
 * @param workingDir The working directory to resolve against
 * @returns Array of absolute paths
 */
export function toAbsolutePaths(paths: string[], workingDir?: string): string[] {
  return paths.map(p => toAbsolutePath(p, workingDir));
}

/**
 * Checks if a path exists
 * 
 * @param filePath The path to check
 * @returns True if the path exists, false otherwise
 */
export function pathExists(filePath: string): boolean {
  try {
    fs.accessSync(filePath);
    return true;
  } catch {
    return false;
  }
}
