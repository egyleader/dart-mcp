import { format } from '../../src/tools/format.js';
import { toAbsolutePath, toAbsolutePaths } from '../../src/utils/path-utils.js';
import { executeDartCommand } from '../../src/utils/dart-executor.js';

// Mock dependencies
jest.mock('../../src/utils/path-utils.js', () => ({
  toAbsolutePath: jest.fn(),
  toAbsolutePaths: jest.fn()
}));

jest.mock('../../src/utils/dart-executor.js', () => ({
  executeDartCommand: jest.fn()
}));

describe('format tool', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.mocked(toAbsolutePath).mockReset();
    jest.mocked(toAbsolutePaths).mockReset();
    jest.mocked(executeDartCommand).mockReset();
    
    // Default mock implementations
    jest.mocked(toAbsolutePath).mockImplementation((path) => path ? `/resolved/${path}` : '');
    jest.mocked(toAbsolutePaths).mockImplementation((paths) => 
      paths.map(p => p.startsWith('/') ? p : `/resolved/${p}`)
    );
    jest.mocked(executeDartCommand).mockResolvedValue({ stdout: 'success', stderr: '' });
  });

  it('should handle required paths parameter with default setExitIfChanged', async () => {
    const paths = ['lib/main.dart', 'test/app_test.dart'];
    const absolutePaths = paths.map(p => `/resolved/${p}`);
    
    jest.mocked(toAbsolutePaths).mockReturnValue(absolutePaths);
    
    await format({ paths, setExitIfChanged: false });
    
    // Should call toAbsolutePaths with the paths
    expect(toAbsolutePaths).toHaveBeenCalledWith(paths);
    
    // Should execute command with all absolute paths
    expect(executeDartCommand).toHaveBeenCalledWith('format', absolutePaths);
  });

  it('should handle setExitIfChanged parameter when true', async () => {
    const paths = ['lib'];
    const absolutePaths = ['/resolved/lib'];
    
    jest.mocked(toAbsolutePaths).mockReturnValue(absolutePaths);
    
    await format({ paths, setExitIfChanged: true });
    
    // Should execute command with --set-exit-if-changed flag
    expect(executeDartCommand).toHaveBeenCalledWith('format', [...absolutePaths, '--set-exit-if-changed']);
  });

  it('should not set exit flag when setExitIfChanged is false', async () => {
    const paths = ['lib'];
    const absolutePaths = ['/resolved/lib'];
    
    jest.mocked(toAbsolutePaths).mockReturnValue(absolutePaths);
    
    await format({ paths, setExitIfChanged: false });
    
    // Should execute command without --set-exit-if-changed flag
    expect(executeDartCommand).toHaveBeenCalledWith('format', absolutePaths);
  });

  it('should pass through additional options', async () => {
    const paths = ['lib'];
    const absolutePaths = ['/resolved/lib'];
    const options = ['--line-length', '100'];
    
    jest.mocked(toAbsolutePaths).mockReturnValue(absolutePaths);
    
    await format({ paths, setExitIfChanged: false, options });
    
    // Should execute command with the options
    expect(executeDartCommand).toHaveBeenCalledWith('format', [...absolutePaths, ...options]);
  });

  it('should combine all parameters correctly', async () => {
    const paths = ['lib'];
    const absolutePaths = ['/resolved/lib'];
    const options = ['--line-length', '100'];
    
    jest.mocked(toAbsolutePaths).mockReturnValue(absolutePaths);
    
    await format({ paths, setExitIfChanged: true, options });
    
    // Should execute command with all parameters
    expect(executeDartCommand).toHaveBeenCalledWith(
      'format', 
      [...absolutePaths, '--set-exit-if-changed', ...options]
    );
  });

  it('should return successful command results', async () => {
    const expectedOutput = 'Formatted 10 files (0 changed)';
    jest.mocked(executeDartCommand).mockResolvedValue({ stdout: expectedOutput, stderr: '' });
    
    const result = await format({ paths: ['lib'], setExitIfChanged: false });
    
    expect(result).toEqual({
      content: [{ type: 'text', text: expectedOutput }],
      isError: false
    });
  });

  it('should return error command results', async () => {
    const expectedError = 'Error: Some files would change. Please fix formatting.';
    jest.mocked(executeDartCommand).mockResolvedValue({ stdout: '', stderr: expectedError });
    
    const result = await format({ paths: ['lib'], setExitIfChanged: false });
    
    expect(result).toEqual({
      content: [{ type: 'text', text: expectedError }],
      isError: true
    });
  });
});
