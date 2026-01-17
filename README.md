# pybridge-devos

A minimal, executable MCP (Model Context Protocol) server compatible with Claude Desktop.

## Features

This server implements the following MCP tools:

- **workspace_open**: Open a local workspace root and return a workspace_id
- **resource_read**: Read a resource URI (file/log) with optional range support
- **resource_write**: Write to a file resource URI
- **run_exec**: Execute a command in a workspace; returns a process session and log URIs with streaming support

### Core Architecture

- **ResourceStore** (`src/core/resources.ts`): Manages file and log resources with URI-based addressing and SHA-256 hashing
- **SessionStore** (`src/core/sessions.ts`): Tracks process sessions and lifecycle events
- **Sandbox** (`src/core/sandbox.ts`): Provides security policy enforcement with three profiles:
  - `strict`: Blocks shell interpreters for enhanced security
  - `dev`: Development mode with minimal restrictions
  - `ci`: Continuous integration profile

## Installation

```bash
npm install
npm run build
```

## Usage

### Standalone

```bash
npm run start
```

### Claude Desktop Integration

Add the following configuration to your Claude Desktop MCP settings file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

**Linux**: `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "pybridge-devos": {
      "command": "node",
      "args": ["/absolute/path/to/pybridge-devos/dist/server.js"]
    }
  }
}
```

Replace `/absolute/path/to/pybridge-devos` with the actual absolute path to this project directory.

## Project Structure

```
pybridge-devos/
├── package.json
├── tsconfig.json
├── src/
│   ├── server.ts           # Main MCP server implementation
│   └── core/
│       ├── resources.ts    # Resource management (files, logs)
│       ├── sessions.ts     # Process session tracking
│       └── sandbox.ts      # Security policy enforcement
└── dist/                   # Built output (generated)
```

## Development

The server uses TypeScript with strict mode enabled and is designed for extension. Future capabilities can include:

- File system watching for resource subscriptions
- Network egress controls
- Environment variable filtering
- Working directory restrictions
- LSP and debugger protocol support

## License

See LICENSE file for details.