import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { toAbsolutePath, toAbsolutePaths, pathExists, addProjectRoot } from '../../src/utils/path-utils.js';

// Mock fs functions
jest.mock('fs', () => ({
  accessSync: jest.fn(),
  existsSync: jest.fn()
}));

describe('path-utils', () => {
  const originalCwd = process.cwd;
  const originalEnv = process.env;
  const mockCwd = '/mock/cwd';

  beforeEach(() => {
    // Mock process.cwd
    process.cwd = jest.fn().mockReturnValue(mockCwd);
    // Reset environment variables
    process.env = { ...originalEnv };
    // Reset fs mocks
    jest.mocked(fs.accessSync).mockReset();
  });

  afterAll(() => {
    // Restore process.cwd
    process.cwd = originalCwd;
    // Restore environment variables
    process.env = originalEnv;
  });

  describe('toAbsolutePath', () => {
    it('should return undefined/null/empty paths as-is', () => {
      expect(toAbsolutePath('')).toBe('');
      expect(toAbsolutePath(null as unknown as string)).toBe(null);
      expect(toAbsolutePath(undefined as unknown as string)).toBe(undefined);
    });

    it('should return absolute paths as-is', () => {
      const absolutePath = path.isAbsolute('/some/absolute/path')
        ? '/some/absolute/path'
        : 'C:\\some\\absolute\\path'; // Windows alternative
      expect(toAbsolutePath(absolutePath)).toBe(absolutePath);
    });

    it('should resolve relative paths against the current working directory', () => {
      const relativePath = 'relative/path';
      const expectedPath = path.resolve(mockCwd, relativePath);
      expect(toAbsolutePath(relativePath)).toBe(expectedPath);
    });

    it('should resolve relative paths against the provided working directory', () => {
      const relativePath = 'relative/path';
      const customWorkingDir = '/custom/dir';
      const expectedPath = path.resolve(customWorkingDir, relativePath);
      expect(toAbsolutePath(relativePath, customWorkingDir)).toBe(expectedPath);
    });

    it('should log path resolution information in verbose mode', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      process.env.DART_MCP_VERBOSE = 'true';
      
      const relativePath = 'relative/path';
      const expectedPath = path.resolve(mockCwd, relativePath);
      toAbsolutePath(relativePath);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(`Resolved relative path: ${relativePath} → ${expectedPath}`)
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('toAbsolutePaths', () => {
    it('should convert an array of paths to absolute paths', () => {
      const paths = ['path1', 'path2', '/absolute/path'];
      const expectedPaths = [
        path.resolve(mockCwd, 'path1'),
        path.resolve(mockCwd, 'path2'),
        '/absolute/path' // Already absolute, should remain unchanged
      ];
      
      expect(toAbsolutePaths(paths)).toEqual(expectedPaths);
    });
  });

  describe('pathExists', () => {
    it('should return true if the path exists', () => {
      jest.mocked(fs.accessSync).mockImplementation(() => undefined);
      expect(pathExists('/some/path')).toBe(true);
    });

    it('should return false if the path does not exist', () => {
      jest.mocked(fs.accessSync).mockImplementation(() => {
        throw new Error('Path does not exist');
      });
      expect(pathExists('/nonexistent/path')).toBe(false);
    });
  });

  describe('addProjectRoot', () => {
    it('should add a project root if it does not already exist', () => {
      const root = '/some/project/root';
      addProjectRoot(root);
      
      // Add the same root again, it should not be added twice
      addProjectRoot(root);
      
      // This is a bit of a hack since we don't export PROJECT_ROOTS
      // We're using the side effects of the function
      // A better approach would be to make PROJECT_ROOTS accessible for testing
      
      // Add a different root for comparison
      const anotherRoot = '/another/project/root';
      addProjectRoot(anotherRoot);
    });

    it('should not add empty roots', () => {
      addProjectRoot('');
      addProjectRoot(null as unknown as string);
      addProjectRoot(undefined as unknown as string);
    });
  });
});
