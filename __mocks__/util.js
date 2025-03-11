// Mock of util module
'use strict';

const mockExecPromise = jest.fn();
const promisify = jest.fn(() => mockExecPromise);

module.exports = {
  promisify,
  mockExecPromise
};
