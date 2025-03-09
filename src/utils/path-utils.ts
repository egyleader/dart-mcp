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
  
  // If the path is already absolute and exists, return it
  if (path.isAbsolute(filePath) && pathExists(filePath)) {
    if (isVerbose) console.error(`[dart-mcp] Using absolute path: ${filePath}`);
    return filePath;
  }
  
  // Try to resolve against the current working directory first
  const cwdPath = path.resolve(cwd, filePath);
  if (pathExists(cwdPath)) {
    if (isVerbose) console.error(`[dart-mcp] Resolved path against CWD: ${cwdPath}`);
    return cwdPath;
  }
  
  // Try to find the path in known project roots
  for (const projectRoot of PROJECT_ROOTS) {
    const projectPath = path.resolve(projectRoot, filePath);
    if (pathExists(projectPath)) {
      if (isVerbose) console.error(`[dart-mcp] Resolved path against project root: ${projectPath}`);
      return projectPath;
    }
  }
  
  // If we still haven't found a valid path, return the resolved path against CWD
  // This might not exist, but it's the best we can do
  if (isVerbose) console.error(`[dart-mcp] No existing path found, using: ${cwdPath}`);
  return cwdPath;
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
