// Mock the exec function before importing the module
const mockExecPromise = jest.fn();

// Mock the util module properly
jest.mock('util', () => ({
  promisify: jest.fn(() => mockExecPromise)
}));

// Import module under test after mocking
import { executeDartCommand } from '../../src/utils/dart-executor.js';

// Define interface for exec error with stdout and stderr
interface ExecError extends Error {
  stdout?: string;
  stderr?: string;
}

describe('dart-executor', () => {
  beforeEach(() => {
    // Reset mocks
    mockExecPromise.mockReset();
    // Reset console.log mock
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.log
    jest.restoreAllMocks();
  });

  it('should execute dart commands with proper arguments', async () => {
    const mockStdout = 'command executed successfully';
    const mockStderr = '';
    
    // Setup the mock to resolve with stdout and stderr
    mockExecPromise.mockResolvedValue({ stdout: mockStdout, stderr: mockStderr });
    
    const command = 'analyze';
    const args = ['lib/main.dart', '--fatal-infos'];
    const cwd = '/project/root';
    
    const result = await executeDartCommand(command, args, cwd);
    
    // Verify command was executed correctly
    expect(mockExecPromise).toHaveBeenCalledWith(
      'dart analyze lib/main.dart --fatal-infos',
      { cwd }
    );
    
    // Verify returned values
    expect(result).toEqual({ stdout: mockStdout, stderr: mockStderr });
  });

  it('should handle commands with no arguments', async () => {
    const mockStdout = 'info output';
    
    mockExecPromise.mockResolvedValue({ stdout: mockStdout, stderr: '' });
    
    await executeDartCommand('info');
    
    // Verify command was called with just the base command
    expect(mockExecPromise).toHaveBeenCalledWith('dart info ', expect.anything());
  });

  it('should handle command execution errors', async () => {
    const mockError: ExecError = new Error('Command failed');
    mockError.stdout = 'Some stdout output';
    mockError.stderr = 'Error: File not found';
    
    mockExecPromise.mockRejectedValue(mockError);
    
    const result = await executeDartCommand('analyze', ['nonexistent.dart']);
    
    // Should return stdout and stderr from the error object
    expect(result).toEqual({
      stdout: mockError.stdout,
      stderr: mockError.stderr
    });
  });

  it('should handle generic errors without stdout/stderr', async () => {
    const mockError = new Error('Generic error');
    
    mockExecPromise.mockRejectedValue(mockError);
    
    const result = await executeDartCommand('analyze');
    
    expect(result).toEqual({
      stdout: '',
      stderr: mockError.message
    });
  });

  it('should handle non-Error objects thrown', async () => {
    const mockError = 'String error message';
    
    mockExecPromise.mockRejectedValue(mockError);
    
    const result = await executeDartCommand('analyze');
    
    expect(result).toEqual({
      stdout: '',
      stderr: String(mockError)
    });
  });

  it('should log command execution details', async () => {
    const consoleSpy = jest.spyOn(console, 'log');
    
    mockExecPromise.mockResolvedValue({ stdout: '', stderr: '' });
    
    const command = 'format';
    const args = ['lib'];
    const cwd = '/custom/dir';
    
    await executeDartCommand(command, args, cwd);
    
    // Should log command details
    expect(consoleSpy).toHaveBeenCalledWith('Executing command: dart format lib');
    expect(consoleSpy).toHaveBeenCalledWith(`Working directory: ${cwd}`);
    expect(consoleSpy).toHaveBeenCalledWith(`Arguments: ${JSON.stringify(args)}`);
  });
});
