import { fix } from '../../src/tools/fix.js';
import { toAbsolutePath } from '../../src/utils/path-utils.js';
import { executeDartCommand } from '../../src/utils/dart-executor.js';

// Mock dependencies
jest.mock('../../src/utils/path-utils.js', () => ({
  toAbsolutePath: jest.fn()
}));

jest.mock('../../src/utils/dart-executor.js', () => ({
  executeDartCommand: jest.fn()
}));

describe('fix tool', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.mocked(toAbsolutePath).mockReset();
    jest.mocked(executeDartCommand).mockReset();
    
    // Default mock implementations
    jest.mocked(toAbsolutePath).mockImplementation((path) => path ? `/resolved/${path}` : '');
    jest.mocked(executeDartCommand).mockResolvedValue({ stdout: 'success', stderr: '' });
  });

  it('should handle path parameter when provided with default apply', async () => {
    const path = 'lib/main.dart';
    const absolutePath = '/resolved/lib/main.dart';
    
    jest.mocked(toAbsolutePath).mockReturnValue(absolutePath);
    
    await fix({ path, apply: true });
    
    // Should call toAbsolutePath with the provided path
    expect(toAbsolutePath).toHaveBeenCalledWith(path);
    
    // Should execute command with absolute path and --apply flag (default)
    expect(executeDartCommand).toHaveBeenCalledWith('fix', [absolutePath, '--apply']);
  });

  it('should set --apply flag when apply is true', async () => {
    const path = 'lib';
    const absolutePath = '/resolved/lib';
    
    jest.mocked(toAbsolutePath).mockReturnValue(absolutePath);
    
    await fix({ path, apply: true });
    
    // Should execute command with --apply flag
    expect(executeDartCommand).toHaveBeenCalledWith('fix', [absolutePath, '--apply']);
  });

  it('should set --dry-run flag when apply is false', async () => {
    const path = 'lib';
    const absolutePath = '/resolved/lib';
    
    jest.mocked(toAbsolutePath).mockReturnValue(absolutePath);
    
    await fix({ path, apply: false });
    
    // Should execute command with --dry-run flag
    expect(executeDartCommand).toHaveBeenCalledWith('fix', [absolutePath, '--dry-run']);
  });

  it('should pass through additional options', async () => {
    const path = 'lib';
    const absolutePath = '/resolved/lib';
    const options = ['--pedantic', '--verbose'];
    
    jest.mocked(toAbsolutePath).mockReturnValue(absolutePath);
    
    await fix({ path, apply: true, options });
    
    // Should execute command with the options
    expect(executeDartCommand).toHaveBeenCalledWith('fix', [absolutePath, '--apply', ...options]);
  });

  it('should combine all parameters correctly', async () => {
    const path = 'lib';
    const absolutePath = '/resolved/lib';
    const options = ['--verbose'];
    
    jest.mocked(toAbsolutePath).mockReturnValue(absolutePath);
    
    await fix({ path, apply: true, options });
    
    // Should execute command with all parameters in correct order
    expect(executeDartCommand).toHaveBeenCalledWith('fix', [absolutePath, '--apply', ...options]);
  });

  it('should execute command with no path but with default apply', async () => {
    // No path provided
    await fix({ apply: true });
    
    // Should execute command with just --apply flag
    expect(executeDartCommand).toHaveBeenCalledWith('fix', ['--apply']);
  });

  it('should return successful command results', async () => {
    const expectedOutput = 'Applied fixes to 3 files';
    jest.mocked(executeDartCommand).mockResolvedValue({ stdout: expectedOutput, stderr: '' });
    
    const result = await fix({ apply: true });
    
    expect(result).toEqual({
      content: [{ type: 'text', text: expectedOutput }],
      isError: false
    });
  });

  it('should return error command results', async () => {
    const expectedError = 'Error: No fixes available';
    jest.mocked(executeDartCommand).mockResolvedValue({ stdout: '', stderr: expectedError });
    
    const result = await fix({ apply: true });
    
    expect(result).toEqual({
      content: [{ type: 'text', text: expectedError }],
      isError: true
    });
  });
});
