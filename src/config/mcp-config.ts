export const MCP_SERVER_CONFIG = {
  name: "Dart MCP Server",
  version: "1.0.0",
  capabilities: {
    'dart-analyze': "Analyze Dart code in a directory",
    'dart-compile': "Compile Dart to various formats",
    'dart-create': "Create a new Dart project",
    'dart-doc': "Generate API documentation for Dart projects",
    'dart-fix': "Apply automated fixes to Dart source code",
    'dart-format': "Idiomatically format Dart source code",
    'dart-info': "Show diagnostic information about the installed tooling",
    'dart-package': "Work with packages (pub commands)",
    'dart-run': "Run a Dart program",
    'dart-test': "Run tests for a project"
  },
  timeouts: {
    global: 300000, // 5 minutes default timeout
    tools: {
      'dart-run': 300000,
      'dart-test': 300000,
      'dart-compile': 300000,
      'dart-analyze': 300000
    }
  }
};
