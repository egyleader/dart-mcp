import { pub } from '../../src/tools/pub.js';
import { toAbsolutePath } from '../../src/utils/path-utils.js';
import { executeDartCommand } from '../../src/utils/dart-executor.js';

// Mock dependencies
jest.mock('../../src/utils/path-utils.js', () => ({
  toAbsolutePath: jest.fn()
}));

jest.mock('../../src/utils/dart-executor.js', () => ({
  executeDartCommand: jest.fn()
}));

describe('pub tool', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.mocked(toAbsolutePath).mockReset();
    jest.mocked(executeDartCommand).mockReset();
    
    // Default mock implementations
    jest.mocked(toAbsolutePath).mockImplementation((path) => path ? `/resolved/${path}` : '');
    jest.mocked(executeDartCommand).mockResolvedValue({ stdout: 'success', stderr: '' });
  });

  it('should handle required command parameter', async () => {
    const command = 'get';
    
    await pub({ command });
    
    // Check that executeDartCommand was called with correct parameters
    expect(executeDartCommand).toHaveBeenCalledTimes(1);
    const callArgs = jest.mocked(executeDartCommand).mock.calls[0];
    expect(callArgs[0]).toBe('pub');
    expect(callArgs[1]).toEqual([command]);
    // Third parameter might be undefined, which is fine
  });

  it('should pass through arguments array', async () => {
    const command = 'add';
    const args = ['http', '--dev'];
    
    await pub({ command, args });
    
    // Check that executeDartCommand was called with correct parameters
    expect(executeDartCommand).toHaveBeenCalledTimes(1);
    const callArgs = jest.mocked(executeDartCommand).mock.calls[0];
    expect(callArgs[0]).toBe('pub');
    expect(callArgs[1]).toEqual([command, ...args]);
  });

  it('should use resolved working directory when provided', async () => {
    const command = 'get';
    const workingDir = 'my_project';
    const resolvedDir = '/resolved/my_project';
    
    jest.mocked(toAbsolutePath).mockReturnValue(resolvedDir);
    
    await pub({ command, workingDir });
    
    // Should call toAbsolutePath with the working directory
    expect(toAbsolutePath).toHaveBeenCalledWith(workingDir);
    
    // Should execute command with the resolved working directory
    expect(executeDartCommand).toHaveBeenCalledTimes(1);
    const callArgs = jest.mocked(executeDartCommand).mock.calls[0];
    expect(callArgs[0]).toBe('pub');
    expect(callArgs[1]).toEqual([command]);
    expect(callArgs[2]).toBe(resolvedDir);
  });

  it('should combine all parameters correctly', async () => {
    const command = 'run';
    const args = ['build_runner', 'build'];
    const workingDir = 'my_project';
    const resolvedDir = '/resolved/my_project';
    
    jest.mocked(toAbsolutePath).mockReturnValue(resolvedDir);
    
    await pub({ command, args, workingDir });
    
    // Should execute command with all parameters
    expect(executeDartCommand).toHaveBeenCalledTimes(1);
    const callArgs = jest.mocked(executeDartCommand).mock.calls[0];
    expect(callArgs[0]).toBe('pub');
    expect(callArgs[1]).toEqual([command, ...args]);
    expect(callArgs[2]).toBe(resolvedDir);
  });

  it('should handle global command correctly', async () => {
    const command = 'global';
    const args = ['activate', 'flutter_gen'];
    
    await pub({ command, args });
    
    // Should execute global pub command
    expect(executeDartCommand).toHaveBeenCalledTimes(1);
    const callArgs = jest.mocked(executeDartCommand).mock.calls[0];
    expect(callArgs[0]).toBe('pub');
    expect(callArgs[1]).toEqual([command, ...args]);
  });

  it('should return successful command results', async () => {
    const expectedOutput = 'Resolving dependencies... Got dependencies!';
    jest.mocked(executeDartCommand).mockResolvedValue({ stdout: expectedOutput, stderr: '' });
    
    const result = await pub({ command: 'get' });
    
    expect(result).toEqual({
      content: [{ type: 'text', text: expectedOutput }],
      isError: false
    });
  });

  it('should return error command results', async () => {
    const expectedError = 'Error: No valid pubspec.yaml found';
    jest.mocked(executeDartCommand).mockResolvedValue({ stdout: '', stderr: expectedError });
    
    const result = await pub({ command: 'get' });
    
    expect(result).toEqual({
      content: [{ type: 'text', text: expectedError }],
      isError: true
    });
  });
});
