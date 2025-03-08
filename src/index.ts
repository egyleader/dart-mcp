import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { addProjectRoot } from './utils/path-utils.js';

// Import configuration
import { MCP_SERVER_CONFIG } from './config/mcp-config.js';

// Import tools
import { analyze, analyzeSchema } from './tools/analyze.js';
import { compile, compileSchema } from './tools/compile.js';
import { create, createSchema } from './tools/create.js';
import { doc, docSchema } from './tools/doc.js';
import { fix, fixSchema } from './tools/fix.js';
import { format, formatSchema } from './tools/format.js';
import { info, infoSchema } from './tools/info.js';
import { pub, pubSchema } from './tools/pub.js';
import { run, runSchema } from './tools/run.js';
import { test, testSchema } from './tools/test.js';

// Create MCP server
const server = new McpServer({
  name: MCP_SERVER_CONFIG.name,
  version: MCP_SERVER_CONFIG.version
});

// Register tools
server.tool('dart-analyze', analyzeSchema.shape, analyze);
server.tool('dart-compile', compileSchema.shape, compile);
server.tool('dart-create', createSchema.shape, create);
server.tool('dart-doc', docSchema.shape, doc);
server.tool('dart-fix', fixSchema.shape, fix);
server.tool('dart-format', formatSchema.shape, format);
server.tool('dart-info', infoSchema.shape, info);
server.tool('dart-package', pubSchema.shape, pub);
server.tool('dart-run', runSchema.shape, run);
server.tool('dart-test', testSchema.shape, test);

// Function to detect common project roots
function detectProjectRoots() {
  try {
    // Common directories to check for projects
    const commonDirs = [
      path.join(os.homedir(), 'dev'),
      path.join(os.homedir(), 'projects'),
      path.join(os.homedir(), 'workspace'),
      path.join(os.homedir(), 'Documents'),
      path.join(os.homedir(), 'src')
    ];
    
    console.error('Detecting project roots...');
    
    // Check each common directory
    for (const dir of commonDirs) {
      if (fs.existsSync(dir)) {
        try {
          // Get all subdirectories in the common directory
          const subdirs = fs.readdirSync(dir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => path.join(dir, dirent.name));
          
          // Add each subdirectory as a potential project root
          for (const subdir of subdirs) {
            addProjectRoot(subdir);
            
            // Check for nested projects (e.g., monorepos)
            try {
              const nestedDirs = fs.readdirSync(subdir, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory())
                .map(dirent => path.join(subdir, dirent.name));
              
              for (const nestedDir of nestedDirs) {
                // Check if this looks like a project directory (has pubspec.yaml, package.json, etc.)
                const hasPubspec = fs.existsSync(path.join(nestedDir, 'pubspec.yaml'));
                const hasPackageJson = fs.existsSync(path.join(nestedDir, 'package.json'));
                
                if (hasPubspec || hasPackageJson) {
                  addProjectRoot(nestedDir);
                }
              }
            } catch (err) {
              // Ignore errors when reading nested directories
            }
          }
        } catch (err) {
          console.error(`Error reading directory ${dir}:`, err);
        }
      }
    }
  } catch (err) {
    console.error('Error detecting project roots:', err);
  }
}

// Start server with stdio transport
async function startServer() {
  try {
    console.error('Starting Dart MCP Server...');
    
    // Detect project roots
    detectProjectRoots();
    
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Dart MCP Server started and connected to stdio transport');
  } catch (error) {
    console.error('Failed to start Dart MCP Server:', error);
    process.exit(1);
  }
}

startServer();
