import { run } from '../../src/tools/run.js';
import { toAbsolutePath } from '../../src/utils/path-utils.js';
import { executeDartCommand } from '../../src/utils/dart-executor.js';

// Mock dependencies
jest.mock('../../src/utils/path-utils.js', () => ({
  toAbsolutePath: jest.fn()
}));

jest.mock('../../src/utils/dart-executor.js', () => ({
  executeDartCommand: jest.fn()
}));

describe('run tool', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.mocked(toAbsolutePath).mockReset();
    jest.mocked(executeDartCommand).mockReset();
    
    // Default mock implementations
    jest.mocked(toAbsolutePath).mockImplementation((path) => path ? `/resolved/${path}` : '');
    jest.mocked(executeDartCommand).mockResolvedValue({ stdout: 'success', stderr: '' });
  });

  it('should handle required script parameter', async () => {
    const script = 'lib/main.dart';
    const resolvedScript = '/resolved/lib/main.dart';
    
    jest.mocked(toAbsolutePath).mockReturnValue(resolvedScript);
    
    await run({ script });
    
    // Verify toAbsolutePath call (with any arguments)
    expect(toAbsolutePath).toHaveBeenCalled();
    
    // Should execute command with the resolved script path
    expect(executeDartCommand).toHaveBeenCalledTimes(1);
    const callArgs = jest.mocked(executeDartCommand).mock.calls[0];
    expect(callArgs[0]).toBe('run');
    expect(callArgs[1]).toEqual([resolvedScript]);
  });

  it('should pass through arguments array', async () => {
    const script = 'lib/main.dart';
    const resolvedScript = '/resolved/lib/main.dart';
    const args = ['--verbose', '--profile'];
    
    jest.mocked(toAbsolutePath).mockReturnValue(resolvedScript);
    
    await run({ script, args });
    
    // Should execute command with script and args
    expect(executeDartCommand).toHaveBeenCalledTimes(1);
    const callArgs = jest.mocked(executeDartCommand).mock.calls[0];
    expect(callArgs[0]).toBe('run');
    expect(callArgs[1]).toEqual([resolvedScript, ...args]);
  });

  it('should use resolved working directory when provided', async () => {
    const script = 'lib/main.dart';
    const resolvedScript = '/resolved/lib/main.dart';
    const workingDir = 'my_project';
    const resolvedDir = '/resolved/my_project';
    
    // Create a more specific mock implementation
    const mockToAbsolutePath = jest.mocked(toAbsolutePath);
    mockToAbsolutePath.mockImplementation((p) => {
      if (p === script) return resolvedScript;
      if (p === workingDir) return resolvedDir;
      return `/resolved/${p}`;
    });
    
    await run({ script, workingDir });
    
    // Verify the function was called
    expect(mockToAbsolutePath).toHaveBeenCalledWith(expect.any(String));
    
    // Should execute command with the resolved directory
    expect(executeDartCommand).toHaveBeenCalledTimes(1);
    const callArgs = jest.mocked(executeDartCommand).mock.calls[0];
    expect(callArgs[0]).toBe('run');
    expect(callArgs[1]).toEqual([resolvedScript]);
    expect(callArgs[2]).toBe(resolvedDir);
  });

  it('should combine all parameters correctly', async () => {
    const script = 'lib/main.dart';
    const resolvedScript = '/resolved/lib/main.dart';
    const args = ['--verbose'];
    const workingDir = 'my_project';
    const resolvedDir = '/resolved/my_project';
    
    // Create a more specific mock implementation
    const mockToAbsolutePath = jest.mocked(toAbsolutePath);
    mockToAbsolutePath.mockImplementation((p) => {
      if (p === script) return resolvedScript;
      if (p === workingDir) return resolvedDir;
      return `/resolved/${p}`;
    });
    
    await run({ script, args, workingDir });
    
    // Should execute command with all parameters
    expect(executeDartCommand).toHaveBeenCalledTimes(1);
    const callArgs = jest.mocked(executeDartCommand).mock.calls[0];
    expect(callArgs[0]).toBe('run');
    expect(callArgs[1]).toEqual([resolvedScript, ...args]);
    expect(callArgs[2]).toBe(resolvedDir);
  });

  it('should return successful command results', async () => {
    const expectedOutput = 'Hello, World!';
    jest.mocked(executeDartCommand).mockResolvedValue({ stdout: expectedOutput, stderr: '' });
    
    const result = await run({ script: 'lib/main.dart' });
    
    expect(result).toEqual({
      content: [{ type: 'text', text: expectedOutput }],
      isError: false
    });
  });

  it('should return error command results', async () => {
    const expectedError = 'Error: Could not find file lib/main.dart';
    jest.mocked(executeDartCommand).mockResolvedValue({ stdout: '', stderr: expectedError });
    
    const result = await run({ script: 'lib/main.dart' });
    
    expect(result).toEqual({
      content: [{ type: 'text', text: expectedError }],
      isError: true
    });
  });
});
