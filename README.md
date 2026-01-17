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

### 🌐 Web Application (Recommended for Interactive Use)

PyBridge DevOS includes a user-friendly web interface for managing workspaces, executing commands, and viewing logs in real-time.

#### Quick Start

**Linux/macOS:**
```bash
./launch-app.sh
```

**Windows:**
```bash
launch-app.bat
```

The application will automatically:
1. Build the MCP server and web app
2. Start the server on http://localhost:3000
3. Open your browser

#### Desktop Launcher Installation (Linux)

Create a desktop shortcut and application menu entry:

```bash
./install-launcher.sh
```

After installation, you can:
- Launch from your application menu (search for "PyBridge DevOS")
- Double-click the desktop shortcut
- Run `./launch-app.sh` from the terminal

#### Web Interface Features

- **Workspace Management**: Open and manage local workspaces
- **Command Execution**: Run commands with different sandbox profiles (dev/ci/strict)
- **Real-time Logs**: Stream stdout/stderr output with auto-refresh
- **File Operations**: Read and write files in your workspace
- **Quick Actions**: Pre-configured buttons for common tasks

### Standalone MCP Server

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
├── package.json                # Project dependencies and scripts
├── tsconfig.json               # TypeScript config for MCP server
├── tsconfig.app.json           # TypeScript config for web app
├── launch-app.sh               # Linux/macOS launcher
├── launch-app.bat              # Windows launcher
├── install-launcher.sh         # Desktop shortcut installer
├── src/                        # MCP Server source
│   ├── server.ts               # Main MCP server implementation
│   └── core/
│       ├── resources.ts        # Resource management (files, logs)
│       ├── sessions.ts         # Process session tracking
│       └── sandbox.ts          # Security policy enforcement
├── app/                        # Web Application
│   ├── src/
│   │   └── app-server.ts       # Express server bridging web UI to MCP
│   └── public/
│       ├── index.html          # Web interface
│       ├── styles.css          # Styling
│       └── app.js              # Frontend JavaScript
└── dist/                       # Built output (generated)
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