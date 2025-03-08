# Model Context Protocol (MCP) Server for Dart SDK

A distributable MCP server that exposes Dart SDK commands for AI-powered development. This server bridges the gap between AI coding assistants and Dart/Flutter development workflows by implementing the Model Context Protocol (MCP).

## Features

This MCP server provides access to the following Dart SDK commands:

- `dart-analyze` - Analyze Dart code for errors, warnings, and lints
- `dart-compile` - Compile Dart to various formats (exe, AOT/JIT snapshots, JavaScript)
- `dart-create` - Create new Dart projects from templates
- `dart-doc` - Generate API documentation for Dart projects
- `dart-fix` - Apply automated fixes to Dart source code
- `dart-format` - Format Dart source code according to style guidelines
- `dart-info` - Show diagnostic information about the installed Dart tooling
- `dart-package` - Work with packages (get, add, upgrade, outdated, etc.)
- `dart-run` - Run Dart programs with support for passing arguments
- `dart-test` - Run tests with support for filtering and reporting options

### Key Benefits

- **Intelligent Path Handling**: Automatically resolves relative paths to absolute paths
- **Project Auto-Detection**: Identifies Dart/Flutter projects in common locations
- **Cross-Platform Support**: Works on macOS, Linux, and Windows
- **MCP Integration**: Compatible with any MCP client, including Windsurf and Cline

## Prerequisites

- Node.js 18.x or higher
- Dart SDK (3.0 or higher) installed and available in your PATH

## Installation

### Using npx (recommended)

The server can be run directly without installation using npx:

```bash
npx @modelcontextprotocol/server-dart
```

### Global Installation

For easier access, you can install the server globally:

```bash
npm install -g @modelcontextprotocol/server-dart
```

Then run it using:

```bash
dart-mcp-server
```

### From Source

```bash
# Clone the repository
git clone https://github.com/modelcontextprotocol/dart-mcp.git
cd dart-mcp

# Install dependencies
npm install

# Build the project
npm run build

# Run the server
node dist/index.js
```
cd dart_mcp

# Install dependencies using pnpm
pnpm install

# Build the project
pnpm run build
```

## Usage

### Standalone

Run the MCP server directly:

```bash
pnpm start
```

This starts the server in stdio mode, which can be used with MCP clients that support stdio transport.

### Configuration

### Configuration for MCP Clients

#### Using the Published Package

Add the following to your `mcp_config.json` to use the published npm package:

```json
{
  "mcpServers": {
    "dart": {
      "command": "npx",
      "args": [
        "dart_mcp"
      ]
    }
  }
}
```

#### Using Package Installed in Project

If you've installed the package in your project:

```json
{
  "mcpServers": {
    "dart": {
      "command": "npx",
      "args": [
        "dart_mcp"
      ]
    }
  }
}
```

#### Using Specific Version

To use a specific version of the package:

```json
{
  "mcpServers": {
    "dart": {
      "command": "npx",
      "args": [
        "dart_mcp@1.0.0"
      ]
    }
  }
}
```

#### Local Development Setup

For developers working on the MCP server:

```json
{
  "mcpServers": {
    "dart": {
      "command": "node",
      "args": [
        "${workspaceFolder}/dist/index.js"
      ]
    }
  }
}
```

## Tool API Reference

### dart-analyze

Analyze Dart code in a directory or file.

```typescript
{
  path?: string;       // Directory or file to analyze
  options?: string[];  // Additional options for the dart analyze command
}
```

**Example:**
```typescript
{
  path: "lib",
  options: ["--fatal-infos", "--fatal-warnings"]
}
```

### dart-compile

Compile Dart to various formats.

```typescript
{
  format: 'exe' | 'aot-snapshot' | 'jit-snapshot' | 'kernel' | 'js'; // Output format
  path: string;        // Path to the Dart file to compile
  output?: string;     // Output file path
  options?: string[];  // Additional compilation options
}
```

**Example:**
```typescript
{
  format: "exe",
  path: "bin/main.dart",
  output: "bin/app"
}
```

### dart-create

Create a new Dart project.

```typescript
{
  template: 'console' | 'package' | 'server-shelf' | 'web'; // Project template
  projectName: string; // Name of the project to create
  output?: string;     // Directory where to create the project
  options?: string[];  // Additional project creation options
}
```

**Example:**
```typescript
{
  template: "package",
  projectName: "my_dart_library",
  output: "projects"
}
```

### dart-doc

Generate API documentation for Dart projects.

```typescript
{
  path?: string;       // Directory containing the Dart package to document
  output?: string;     // Output directory for the generated documentation
  options?: string[];  // Additional documentation options
}
```

**Example:**
```typescript
{
  path: ".",
  output: "doc/api"
}
```

### dart-fix

Apply automated fixes to Dart source code.

```typescript
{
  path?: string;       // Directory or file to apply fixes to
  apply?: boolean;     // Whether to apply the suggested fixes (default: true)
  options?: string[];  // Additional fix options
}
```

**Example:**
```typescript
{
  path: "lib",
  apply: true,
  options: ["--pedantic"]
}
```

### dart-format

Idiomatically format Dart source code.

```typescript
{
  paths: string[];     // Files or directories to format
  setExitIfChanged?: boolean; // Return exit code 1 if there are formatting changes (default: false)
  options?: string[];  // Additional format options
}
```

**Example:**
```typescript
{
  paths: ["lib", "test"],
  setExitIfChanged: true,
  options: ["--line-length=80"]
}
```

### dart-info

Show diagnostic information about the installed tooling.

```typescript
{
  options?: string[];  // Additional info options
}
```

**Example:**
```typescript
{
  options: ["--verbose"]
}
```

### dart-package

Work with packages (pub commands).

```typescript
{
  command: 'get' | 'upgrade' | 'outdated' | 'add' | 'remove' | 'publish' | 'deps' | 'downgrade' | 'cache' | 'run' | 'global'; // Pub subcommand
  args?: string[];     // Arguments for the pub subcommand
  workingDir?: string; // Working directory for the command
}
```

**Examples:**
```typescript
// Add a package
{
  command: "add",
  args: ["rxdart"],
  workingDir: "my_project"
}

// Get dependencies
{
  command: "get",
  workingDir: "my_project"
}
```

### dart-run

Run a Dart program.

```typescript
{
  script: string;      // Path to the Dart script to run
  args?: string[];     // Arguments to pass to the script
  workingDir?: string; // Working directory for the command
}
```

**Example:**
```typescript
{
  script: "bin/main.dart",
  args: ["--verbose"],
  workingDir: "my_project"
}
```

### dart-test

Run tests for a project.

```typescript
{
  path?: string;       // Path to the test file or directory
  options?: string[];  // Additional test options
  workingDir?: string; // Working directory for the command
}
```

**Example:**
```typescript
{
  path: "test",
  options: ["--coverage", "--name=auth"],
  workingDir: "my_project"
}
```

## Development

```bash
# Watch mode for development
pnpm run dev

# Build for production
pnpm run build
```

## Error Handling

The server implements comprehensive error handling:

- Command execution errors are captured and formatted appropriately
- Path resolution issues are reported with detailed diagnostics
- Timeout handling for long-running operations
- Proper exit code propagation from Dart commands

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for detailed contribution guidelines.

Our commit format follows:
```
<type>[optional scope]: [JIRA-123(optional)] <description>
```

Example:
```
feat(tools): [DART-456] add support for dart test tags
```

## License

MIT
