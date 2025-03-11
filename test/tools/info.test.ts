import { info } from '../../src/tools/info.js';
import { executeDartCommand } from '../../src/utils/dart-executor.js';

// Mock dependencies
jest.mock('../../src/utils/dart-executor.js', () => ({
  executeDartCommand: jest.fn()
}));

describe('info tool', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.mocked(executeDartCommand).mockReset();
    
    // Default mock implementation
    jest.mocked(executeDartCommand).mockResolvedValue({ stdout: 'success', stderr: '' });
  });

  it('should execute the info command with no arguments by default', async () => {
    await info({});
    
    // Should execute command with no additional args
    expect(executeDartCommand).toHaveBeenCalledWith('info', []);
  });

  it('should pass through additional options', async () => {
    const options = ['--verbose'];
    
    await info({ options });
    
    // Should execute command with the options
    expect(executeDartCommand).toHaveBeenCalledWith('info', options);
  });

  it('should return successful command results', async () => {
    const expectedOutput = 'Dart SDK version: 2.19.6 (stable)';
    jest.mocked(executeDartCommand).mockResolvedValue({ stdout: expectedOutput, stderr: '' });
    
    const result = await info({});
    
    expect(result).toEqual({
      content: [{ type: 'text', text: expectedOutput }],
      isError: false
    });
  });

  it('should return error command results', async () => {
    const expectedError = 'Error: Unable to obtain Dart SDK info';
    jest.mocked(executeDartCommand).mockResolvedValue({ stdout: '', stderr: expectedError });
    
    const result = await info({});
    
    expect(result).toEqual({
      content: [{ type: 'text', text: expectedError }],
      isError: true
    });
  });
});
