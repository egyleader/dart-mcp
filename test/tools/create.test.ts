import { create } from '../../src/tools/create.js';
import { toAbsolutePath } from '../../src/utils/path-utils.js';
import { executeDartCommand } from '../../src/utils/dart-executor.js';

// Mock dependencies
jest.mock('../../src/utils/path-utils.js', () => ({
  toAbsolutePath: jest.fn()
}));

jest.mock('../../src/utils/dart-executor.js', () => ({
  executeDartCommand: jest.fn()
}));

describe('create tool', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.mocked(toAbsolutePath).mockReset();
    jest.mocked(executeDartCommand).mockReset();
    
    // Default mock implementations
    jest.mocked(toAbsolutePath).mockImplementation((path) => path ? `/resolved/${path}` : '');
    jest.mocked(executeDartCommand).mockResolvedValue({ stdout: 'success', stderr: '' });
  });

  it('should handle required projectName parameter with default template', async () => {
    const projectName = 'my_dart_app';
    const resolvedPath = `/resolved/${projectName}`;
    
    jest.mocked(toAbsolutePath).mockReturnValue(resolvedPath);
    
    await create({ projectName, template: 'package' });
    
    // Should execute command with the default template and project name
    expect(executeDartCommand).toHaveBeenCalledWith('create', [
      '-t', 'package',
      resolvedPath
    ]);
  });

  it('should include specified template parameter', async () => {
    const projectName = 'my_dart_app';
    const template = 'console';
    const resolvedPath = `/resolved/${projectName}`;
    
    jest.mocked(toAbsolutePath).mockReturnValue(resolvedPath);
    
    await create({ projectName, template });
    
    // Should execute command with template option and project name
    expect(executeDartCommand).toHaveBeenCalledWith(
      'create', 
      ['-t', template, resolvedPath]
    );
  });

  it('should handle output directory parameter', async () => {
    const projectName = 'my_dart_app';
    const output = 'custom/output/dir';
    const absoluteOutput = '/resolved/custom/output/dir';
    
    jest.mocked(toAbsolutePath).mockReturnValue(absoluteOutput);
    
    await create({ projectName, template: 'package', output });
    
    // Should call toAbsolutePath with the output directory
    expect(toAbsolutePath).toHaveBeenCalledWith(output);
    
    // Should execute command with output directory as target
    expect(executeDartCommand).toHaveBeenCalledWith(
      'create',
      ['-t', 'package', absoluteOutput]
    );
  });

  it('should pass through additional options', async () => {
    const projectName = 'my_dart_app';
    const resolvedPath = `/resolved/${projectName}`;
    const options = ['--force', '--pub'];
    
    jest.mocked(toAbsolutePath).mockReturnValue(resolvedPath);
    
    await create({ projectName, template: 'package', options });
    
    // Should execute command with the options
    expect(executeDartCommand).toHaveBeenCalledWith(
      'create', 
      ['-t', 'package', ...options, resolvedPath]
    );
  });

  it('should combine all parameters correctly', async () => {
    const projectName = 'my_dart_app';
    const template = 'web';
    const output = 'custom/dir';
    const absoluteOutput = '/resolved/custom/dir';
    const options = ['--pub'];
    
    jest.mocked(toAbsolutePath).mockReturnValue(absoluteOutput);
    
    await create({ projectName, template, output, options });
    
    // Should execute command with all parameters in correct order
    expect(executeDartCommand).toHaveBeenCalledWith(
      'create', 
      ['-t', template, ...options, absoluteOutput]
    );
  });

  it('should return successful command results', async () => {
    const expectedOutput = 'Created project my_dart_app';
    jest.mocked(executeDartCommand).mockResolvedValue({ stdout: expectedOutput, stderr: '' });
    
    const result = await create({ projectName: 'my_dart_app', template: 'package' });
    
    expect(result).toEqual({
      content: [{ type: 'text', text: expectedOutput }],
      isError: false
    });
  });

  it('should return error command results', async () => {
    const expectedError = 'Error: Project already exists';
    jest.mocked(executeDartCommand).mockResolvedValue({ stdout: '', stderr: expectedError });
    
    const result = await create({ projectName: 'my_dart_app', template: 'package' });
    
    expect(result).toEqual({
      content: [{ type: 'text', text: expectedError }],
      isError: true
    });
  });
});
