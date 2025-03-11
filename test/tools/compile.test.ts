import { compile } from '../../src/tools/compile.js';
import { toAbsolutePath } from '../../src/utils/path-utils.js';
import { executeDartCommand } from '../../src/utils/dart-executor.js';

// Mock dependencies
jest.mock('../../src/utils/path-utils.js', () => ({
  toAbsolutePath: jest.fn()
}));

jest.mock('../../src/utils/dart-executor.js', () => ({
  executeDartCommand: jest.fn()
}));

describe('compile tool', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.mocked(toAbsolutePath).mockReset();
    jest.mocked(executeDartCommand).mockReset();
    
    // Default mock implementations
    jest.mocked(toAbsolutePath).mockImplementation((path) => path ? `/resolved/${path}` : '');
    jest.mocked(executeDartCommand).mockResolvedValue({ stdout: 'success', stderr: '' });
  });

  it('should handle required format and path parameters', async () => {
    const format = 'exe';
    const path = 'lib/main.dart';
    const absolutePath = '/resolved/lib/main.dart';
    
    jest.mocked(toAbsolutePath).mockReturnValue(absolutePath);
    
    await compile({ format, path });
    
    // Should call toAbsolutePath with the path
    expect(toAbsolutePath).toHaveBeenCalledWith(path);
    
    // Should execute command with format and absolute path
    expect(executeDartCommand).toHaveBeenCalledWith('compile', [format, absolutePath]);
  });

  it('should include output parameter when provided', async () => {
    const format = 'exe';
    const path = 'lib/main.dart';
    const output = 'build/app.exe';
    const absolutePath = '/resolved/lib/main.dart';
    const absoluteOutput = '/resolved/build/app.exe';
    
    // Setup specific mock return values for each call
    const mockToAbsolutePath = jest.mocked(toAbsolutePath);
    mockToAbsolutePath.mockReturnValueOnce(absolutePath);  // First call is for path
    mockToAbsolutePath.mockReturnValueOnce(absoluteOutput);  // Second call is for output
    
    await compile({ format, path, output });
    
    // Should have called toAbsolutePath twice
    expect(mockToAbsolutePath).toHaveBeenCalledTimes(2);
    expect(mockToAbsolutePath.mock.calls[0][0]).toBe(path);
    expect(mockToAbsolutePath.mock.calls[1][0]).toBe(output);
    
    // Should execute command with format, path and output option
    expect(executeDartCommand).toHaveBeenCalledWith(
      'compile', 
      [format, absolutePath, '-o', absoluteOutput]
    );
  });

  it('should pass through additional options', async () => {
    const format = 'js';
    const path = 'lib/main.dart';
    const absolutePath = '/resolved/lib/main.dart';
    const options = ['--no-minify', '--no-source-maps'];
    
    jest.mocked(toAbsolutePath).mockReturnValue(absolutePath);
    
    await compile({ format, path, options });
    
    // Should execute command with the options
    expect(executeDartCommand).toHaveBeenCalledWith(
      'compile', 
      [format, absolutePath, ...options]
    );
  });

  it('should combine all parameters correctly', async () => {
    const format = 'aot-snapshot';
    const path = 'lib/main.dart';
    const output = 'build/app.aot';
    const absolutePath = '/resolved/lib/main.dart';
    const absoluteOutput = '/resolved/build/app.aot';
    const options = ['--verbose'];
    
    // Setup specific mock return values for each call
    const mockToAbsolutePath = jest.mocked(toAbsolutePath);
    mockToAbsolutePath.mockReturnValueOnce(absolutePath);  // First call is for path
    mockToAbsolutePath.mockReturnValueOnce(absoluteOutput);  // Second call is for output
    
    await compile({ format, path, output, options });
    
    // Should have called toAbsolutePath twice
    expect(mockToAbsolutePath).toHaveBeenCalledTimes(2);
    expect(mockToAbsolutePath.mock.calls[0][0]).toBe(path);
    expect(mockToAbsolutePath.mock.calls[1][0]).toBe(output);
    
    // Should execute command with all parameters in correct order
    expect(executeDartCommand).toHaveBeenCalledWith(
      'compile', 
      [format, absolutePath, '-o', absoluteOutput, ...options]
    );
  });

  it('should return successful command results', async () => {
    const expectedOutput = 'Compiled successfully';
    jest.mocked(executeDartCommand).mockResolvedValue({ stdout: expectedOutput, stderr: '' });
    
    const result = await compile({ format: 'exe', path: 'lib/main.dart' });
    
    expect(result).toEqual({
      content: [{ type: 'text', text: expectedOutput }],
      isError: false
    });
  });

  it('should return error command results', async () => {
    const expectedError = 'Error: Compilation failed';
    jest.mocked(executeDartCommand).mockResolvedValue({ stdout: '', stderr: expectedError });
    
    const result = await compile({ format: 'exe', path: 'lib/main.dart' });
    
    expect(result).toEqual({
      content: [{ type: 'text', text: expectedError }],
      isError: true
    });
  });
});
