#!/usr/bin/env node

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
    // Always add the current working directory as a project root
    const cwd = process.cwd();
    addProjectRoot(cwd);
    
    // Common directories to check for projects
    const commonDirs = [
      cwd,
      path.join(os.homedir(), 'dev'),
      path.join(os.homedir(), 'projects'),
      path.join(os.homedir(), 'workspace'),
      path.join(os.homedir(), 'Documents'),
      path.join(os.homedir(), 'src')
    ];
    
    if (process.env.DART_MCP_VERBOSE) {
      console.error('[dart-mcp] Detecting project roots...');
    }
    
    // Try to detect Flutter/Dart projects by looking for pubspec.yaml files
    for (const dir of commonDirs) {
      if (fs.existsSync(dir)) {
        try {
          // Check if the directory itself is a Dart project
          if (fs.existsSync(path.join(dir, 'pubspec.yaml'))) {
            addProjectRoot(dir);
          }
          
          // Get immediate subdirectories
          const subdirs = fs.readdirSync(dir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => path.join(dir, dirent.name));
          
          // Check each subdirectory for Dart/Flutter project indicators
          for (const subdir of subdirs) {
            if (fs.existsSync(path.join(subdir, 'pubspec.yaml'))) {
              addProjectRoot(subdir);
            }
          }
        } catch (err) {
          // Silently ignore errors when reading directories
          // This is important for a distributable package to avoid stderr output
        }
      }
    }
  } catch (err) {
    // Only log in verbose mode
    if (process.env.DART_MCP_VERBOSE) {
      console.error('[dart-mcp] Error detecting project roots:', err);
    }
  }
}

// Start server with stdio transport
async function startServer() {
  try {
    // Only log in verbose mode to avoid cluttering stderr
    // which is used for MCP communication
    if (process.env.DART_MCP_VERBOSE) {
      console.error('[dart-mcp] Starting server...');
    }
    
    // Detect project roots
    detectProjectRoots();
    
    // Connect to stdio transport
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    if (process.env.DART_MCP_VERBOSE) {
      console.error('[dart-mcp] Server started and connected to stdio transport');
    }
  } catch (error) {
    // Always log critical errors
    console.error('[dart-mcp] Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
