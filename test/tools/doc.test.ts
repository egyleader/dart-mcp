import { doc } from '../../src/tools/doc.js';
import { toAbsolutePath } from '../../src/utils/path-utils.js';
import { executeDartCommand } from '../../src/utils/dart-executor.js';

// Mock dependencies
jest.mock('../../src/utils/path-utils.js', () => ({
  toAbsolutePath: jest.fn()
}));

jest.mock('../../src/utils/dart-executor.js', () => ({
  executeDartCommand: jest.fn()
}));

describe('doc tool', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.mocked(toAbsolutePath).mockReset();
    jest.mocked(executeDartCommand).mockReset();
    
    // Default mock implementations
    jest.mocked(toAbsolutePath).mockImplementation((path) => path ? `/resolved/${path}` : '');
    jest.mocked(executeDartCommand).mockResolvedValue({ stdout: 'success', stderr: '' });
  });

  it('should handle path parameter when provided', async () => {
    const path = 'lib';
    const absolutePath = '/resolved/lib';
    
    jest.mocked(toAbsolutePath).mockReturnValue(absolutePath);
    
    await doc({ path });
    
    // Should call toAbsolutePath with the provided path
    expect(toAbsolutePath).toHaveBeenCalledWith(path);
    
    // Should execute command with absolute path
    expect(executeDartCommand).toHaveBeenCalledWith('doc', [absolutePath]);
  });

  it('should handle output directory parameter', async () => {
    const path = 'lib';
    const output = 'doc/api';
    const absolutePath = '/resolved/lib';
    const absoluteOutput = '/resolved/doc/api';
    
    jest.mocked(toAbsolutePath).mockImplementationOnce((p) => p === path ? absolutePath : '');
    jest.mocked(toAbsolutePath).mockImplementationOnce((p) => p === output ? absoluteOutput : '');
    
    await doc({ path, output });
    
    // Should call toAbsolutePath with both paths
    expect(toAbsolutePath).toHaveBeenCalledWith(path);
    expect(toAbsolutePath).toHaveBeenCalledWith(output);
    
    // Should execute command with output option
    expect(executeDartCommand).toHaveBeenCalledWith(
      'doc', 
      [absolutePath, '--output', absoluteOutput]
    );
  });

  it('should pass through additional options', async () => {
    const path = 'lib';
    const absolutePath = '/resolved/lib';
    const options = ['--help', '--verbose'];
    
    jest.mocked(toAbsolutePath).mockReturnValue(absolutePath);
    
    await doc({ path, options });
    
    // Should execute command with the options
    expect(executeDartCommand).toHaveBeenCalledWith(
      'doc', 
      [absolutePath, ...options]
    );
  });

  it('should combine all parameters correctly', async () => {
    const path = 'lib';
    const output = 'doc/api';
    const absolutePath = '/resolved/lib';
    const absoluteOutput = '/resolved/doc/api';
    const options = ['--verbose'];
    
    jest.mocked(toAbsolutePath).mockImplementationOnce((p) => p === path ? absolutePath : '');
    jest.mocked(toAbsolutePath).mockImplementationOnce((p) => p === output ? absoluteOutput : '');
    
    await doc({ path, output, options });
    
    // Should execute command with all parameters in correct order
    expect(executeDartCommand).toHaveBeenCalledWith(
      'doc', 
      [absolutePath, '--output', absoluteOutput, ...options]
    );
  });

  it('should execute command with no path', async () => {
    // No parameters provided
    await doc({});
    
    // Should execute command with no arguments
    expect(executeDartCommand).toHaveBeenCalledWith('doc', []);
  });

  it('should return successful command results', async () => {
    const expectedOutput = 'Documentation generated';
    jest.mocked(executeDartCommand).mockResolvedValue({ stdout: expectedOutput, stderr: '' });
    
    const result = await doc({});
    
    expect(result).toEqual({
      content: [{ type: 'text', text: expectedOutput }],
      isError: false
    });
  });

  it('should return error command results', async () => {
    const expectedError = 'Error: Documentation generation failed';
    jest.mocked(executeDartCommand).mockResolvedValue({ stdout: '', stderr: expectedError });
    
    const result = await doc({});
    
    expect(result).toEqual({
      content: [{ type: 'text', text: expectedError }],
      isError: true
    });
  });
});
