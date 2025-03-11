import { test } from '../../src/tools/test.js';
import { toAbsolutePath } from '../../src/utils/path-utils.js';
import { executeDartCommand } from '../../src/utils/dart-executor.js';

// Mock dependencies
jest.mock('../../src/utils/path-utils.js', () => ({
  toAbsolutePath: jest.fn()
}));

jest.mock('../../src/utils/dart-executor.js', () => ({
  executeDartCommand: jest.fn()
}));

describe('test tool', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.mocked(toAbsolutePath).mockReset();
    jest.mocked(executeDartCommand).mockReset();
    
    // Default mock implementations
    jest.mocked(toAbsolutePath).mockImplementation((path) => path ? `/resolved/${path}` : '');
    jest.mocked(executeDartCommand).mockResolvedValue({ stdout: 'success', stderr: '' });
  });

  it('should execute without path parameter', async () => {
    await test({});
    
    // Should execute test command with no arguments
    expect(executeDartCommand).toHaveBeenCalledTimes(1);
    const callArgs = jest.mocked(executeDartCommand).mock.calls[0];
    expect(callArgs[0]).toBe('test');
    expect(callArgs[1]).toEqual([]);
    
    // Should not call toAbsolutePath
    expect(toAbsolutePath).not.toHaveBeenCalled();
  });

  it('should handle path parameter when provided', async () => {
    const path = 'test/unit';
    const absolutePath = '/resolved/test/unit';
    
    jest.mocked(toAbsolutePath).mockReturnValue(absolutePath);
    
    await test({ path });
    
    // Verify toAbsolutePath call (with any arguments)
    expect(toAbsolutePath).toHaveBeenCalled();
    
    // Should execute command with absolute path
    expect(executeDartCommand).toHaveBeenCalledTimes(1);
    const callArgs = jest.mocked(executeDartCommand).mock.calls[0];
    expect(callArgs[0]).toBe('test');
    expect(callArgs[1]).toEqual([absolutePath]);
  });

  it('should pass through additional options', async () => {
    const path = 'test/unit';
    const absolutePath = '/resolved/test/unit';
    const options = ['--name', 'login_test', '--platform', 'chrome'];
    
    jest.mocked(toAbsolutePath).mockReturnValue(absolutePath);
    
    await test({ path, options });
    
    // Should execute command with the options
    expect(executeDartCommand).toHaveBeenCalledTimes(1);
    const callArgs = jest.mocked(executeDartCommand).mock.calls[0];
    expect(callArgs[0]).toBe('test');
    expect(callArgs[1]).toEqual([absolutePath, ...options]);
  });

  it('should use provided working directory', async () => {
    const path = 'test/unit';
    const absolutePath = '/resolved/test/unit';
    const workingDir = 'my_project';
    const resolvedWorkingDir = '/resolved/my_project';
    
    // Create a more specific mock implementation
    const mockToAbsolutePath = jest.mocked(toAbsolutePath);
    mockToAbsolutePath.mockImplementation((p) => {
      if (p === path) return absolutePath;
      if (p === workingDir) return resolvedWorkingDir;
      return `/resolved/${p}`;
    });
    
    await test({ path, workingDir });
    
    // Verify the function was called for both path and workingDir
    expect(mockToAbsolutePath).toHaveBeenCalledWith(expect.any(String));
    
    // Should execute command with the path and working directory
    expect(executeDartCommand).toHaveBeenCalledTimes(1);
    const callArgs = jest.mocked(executeDartCommand).mock.calls[0];
    expect(callArgs[0]).toBe('test');
    expect(callArgs[1]).toEqual([absolutePath]);
    expect(callArgs[2]).toBe(resolvedWorkingDir);
  });

  it('should combine all parameters correctly', async () => {
    const path = 'test/unit';
    const absolutePath = '/resolved/test/unit';
    const options = ['--coverage'];
    const workingDir = 'my_project';
    const resolvedWorkingDir = '/resolved/my_project';
    
    // Create a more specific mock implementation
    const mockToAbsolutePath = jest.mocked(toAbsolutePath);
    mockToAbsolutePath.mockImplementation((p) => {
      if (p === path) return absolutePath;
      if (p === workingDir) return resolvedWorkingDir;
      return `/resolved/${p}`;
    });
    
    await test({ path, options, workingDir });
    
    // Should execute command with all parameters
    expect(executeDartCommand).toHaveBeenCalledTimes(1);
    const callArgs = jest.mocked(executeDartCommand).mock.calls[0];
    expect(callArgs[0]).toBe('test');
    expect(callArgs[1]).toEqual([absolutePath, ...options]);
    expect(callArgs[2]).toBe(resolvedWorkingDir);
  });

  it('should return successful command results', async () => {
    const expectedOutput = 'All tests passed!';
    jest.mocked(executeDartCommand).mockResolvedValue({ stdout: expectedOutput, stderr: '' });
    
    const result = await test({});
    
    expect(result).toEqual({
      content: [{ type: 'text', text: expectedOutput }],
      isError: false
    });
  });

  it('should return error command results', async () => {
    const expectedError = 'Error: 3 tests failed.';
    jest.mocked(executeDartCommand).mockResolvedValue({ stdout: '', stderr: expectedError });
    
    const result = await test({});
    
    expect(result).toEqual({
      content: [{ type: 'text', text: expectedError }],
      isError: true
    });
  });
});
