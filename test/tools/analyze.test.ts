import { analyze } from '../../src/tools/analyze.js';
import { toAbsolutePath } from '../../src/utils/path-utils.js';
import { executeDartCommand } from '../../src/utils/dart-executor.js';

// Mock dependencies
jest.mock('../../src/utils/path-utils.js', () => ({
  toAbsolutePath: jest.fn()
}));

jest.mock('../../src/utils/dart-executor.js', () => ({
  executeDartCommand: jest.fn()
}));

describe('analyze tool', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.mocked(toAbsolutePath).mockReset();
    jest.mocked(executeDartCommand).mockReset();
    
    // Default mock implementations
    jest.mocked(toAbsolutePath).mockImplementation((path) => path ? `/resolved/${path}` : '');
    jest.mocked(executeDartCommand).mockResolvedValue({ stdout: 'success', stderr: '' });
  });

  it('should handle undefined path correctly', async () => {
    await analyze({});
    
    // Should not call toAbsolutePath with undefined
    expect(toAbsolutePath).not.toHaveBeenCalled();
    
    // Should execute command with empty args list
    expect(executeDartCommand).toHaveBeenCalledWith('analyze', []);
  });

  it('should convert relative path to absolute path', async () => {
    const relativePath = 'packages/multi_step_flow';
    const absolutePath = '/resolved/packages/multi_step_flow';
    
    jest.mocked(toAbsolutePath).mockReturnValue(absolutePath);
    
    await analyze({ path: relativePath });
    
    // Should call toAbsolutePath with the relative path
    expect(toAbsolutePath).toHaveBeenCalledWith(relativePath);
    
    // Should execute command with the absolute path
    expect(executeDartCommand).toHaveBeenCalledWith('analyze', [absolutePath]);
  });

  it('should pass through additional options', async () => {
    const options = ['--fatal-infos', '--fatal-warnings'];
    
    await analyze({ options });
    
    // Should execute command with options
    expect(executeDartCommand).toHaveBeenCalledWith('analyze', options);
  });

  it('should combine path and options correctly', async () => {
    const path = 'lib/main.dart';
    const absolutePath = '/resolved/lib/main.dart';
    const options = ['--fatal-infos'];
    
    jest.mocked(toAbsolutePath).mockReturnValue(absolutePath);
    
    await analyze({ path, options });
    
    // Should execute command with both absolute path and options
    expect(executeDartCommand).toHaveBeenCalledWith('analyze', [absolutePath, ...options]);
  });

  it('should return successful command results', async () => {
    const expectedOutput = 'No issues found!';
    jest.mocked(executeDartCommand).mockResolvedValue({ stdout: expectedOutput, stderr: '' });
    
    const result = await analyze({});
    
    expect(result).toEqual({
      content: [{ type: 'text', text: expectedOutput }],
      isError: false
    });
  });

  it('should return error command results', async () => {
    const expectedError = 'Error: Something went wrong';
    jest.mocked(executeDartCommand).mockResolvedValue({ stdout: '', stderr: expectedError });
    
    const result = await analyze({});
    
    expect(result).toEqual({
      content: [{ type: 'text', text: expectedError }],
      isError: true
    });
  });
});
