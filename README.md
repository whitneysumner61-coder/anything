# PyBridge DevOS 2.0

🤖 **The Most Advanced AI-Powered Development Orchestration System of 2026**

Transform natural language into complete, production-ready applications. PyBridge DevOS 2.0 is an autonomous AI agent system that understands what you want to build and creates it for you—from a single sentence to a full-stack application.

## 🌟 What Makes It Revolutionary

- **Natural Language to Code**: Describe your app in plain English, get production-ready code
- **Stateful + Stateless**: Hybrid architecture for persistence and reproducibility
- **One-Shot Execution**: Single command installs, configures, and launches everything
- **MCP Orchestration**: Dynamic management of Model Context Protocol servers
- **Real-Time Generation**: Watch your application being created live
- **D:\ Drive Installation**: Organized, persistent state management on Windows
- **Full-Stack Capable**: Generate web apps, APIs, CLIs, or complete full-stack applications

## ⚡ Ultimate One-Shot Installation (Windows)

**Run this single command from anywhere:**

```powershell
powershell -ExecutionPolicy Bypass -File oneshot-install.ps1
```

That's it! The script will:
1. ✅ Auto-discover or download the project
2. ✅ Install to D:\PyBridge (customizable)
3. ✅ Install Node.js automatically if needed
4. ✅ Install all dependencies
5. ✅ Build MCP server, web app, and AI agent
6. ✅ Start the system
7. ✅ Open your browser to the AI interface

### Custom Installation Path

```powershell
powershell -ExecutionPolicy Bypass -File oneshot-install.ps1 -InstallPath "C:\MyProjects\PyBridge"
```

### Clean Reinstall

```powershell
powershell -ExecutionPolicy Bypass -File oneshot-install.ps1 -CleanInstall
```

## 🎯 Quick Examples

### Example 1: Create a Todo App

**You type:**
```
Create a todo list web app with a modern UI, dark mode toggle, and local storage persistence
```

**PyBridge generates:**
- Complete React/TypeScript application
- Dark mode with theme switching
- LocalStorage integration
- Modern responsive UI
- All necessary configuration files

### Example 2: Build an API

**You type:**
```
Build a REST API for managing users with authentication and role-based access control
```

**PyBridge generates:**
- Express.js API with TypeScript
- JWT authentication
- Role-based middleware
- User CRUD operations
- Complete documentation

### Example 3: CLI Tool

**You type:**
```
Create a CLI tool that analyzes log files and generates HTML reports with charts
```

**PyBridge generates:**
- Node.js CLI application
- Log parsing logic
- HTML report generation
- Chart visualization
- Command-line interface

## 🏗️ System Architecture

### AI Agent Core (`agent/src/agent-core.ts`)
- Orchestrates all operations
- HTTP API + WebSocket server
- Real-time communication
- Project and session management

### LLM Interface (`agent/src/llm-interface.ts`)
- Claude Sonnet 4.5 integration
- Intelligent code generation
- Conversation history management
- Template fallback for offline mode

### State Manager (`agent/src/state-manager.ts`)
- **Stateful**: Persistent project storage on D:\PyBridge
- **Stateless**: In-memory caching for performance
- Session tracking and history
- Snapshot/restore capabilities

### Project Generator (`agent/src/project-generator.ts`)
- Analyzes natural language requests
- Generates complete project structures
- Creates all necessary files
- Infers dependencies automatically
- Generates documentation

### MCP Orchestrator (`agent/src/mcp-orchestrator.ts`)
- Dynamic MCP server spawning
- Process lifecycle management
- Inter-process communication
- Server health monitoring

### MCP Server (`src/server.ts`)
- Model Context Protocol implementation
- Workspace management
- Resource handling (files, logs)
- Command execution with sandboxing
- Compatible with Claude Desktop

## 🚀 Usage

### Natural Language Interface

1. **Launch the system** (after one-shot install):
   ```powershell
   cd D:\PyBridge
   npm run agent
   ```

2. **Open the AI interface**:
   ```
   http://localhost:3000/agent.html
   ```

3. **Describe what you want to build**:
   - Type your request in plain English
   - Choose project type (or let AI auto-detect)
   - Click "Generate Application"
   - Watch it build in real-time!

4. **Your project is created**:
   - Location: `D:\PyBridge\projects\your-project-name_xxxxx`
   - All files generated and ready to use
   - Setup commands provided
   - Next steps outlined

### API Endpoints

```javascript
// Generate a project
POST /api/generate
{
  "prompt": "Create a weather dashboard with charts",
  "type": "web",  // optional: auto, web, api, cli, fullstack
  "technologies": ["react", "typescript"]  // optional
}

// List all projects
GET /api/projects

// Get project details
GET /api/projects/:id

// Read project file
GET /api/projects/:id/files/*

// Write project file
POST /api/projects/:id/files
{
  "path": "src/index.ts",
  "content": "..."
}

// Execute command (natural language)
POST /api/execute
{
  "command": "install dependencies and start dev server",
  "projectId": "project_id"
}

// MCP server management
GET /api/mcp/servers
POST /api/mcp/servers
{
  "name": "custom-server",
  "config": {}
}

// Session history
GET /api/history

// Create snapshot
POST /api/snapshot
{
  "name": "before-major-changes"
}
```

### WebSocket (Real-Time)

```javascript
const ws = new WebSocket('ws://localhost:3001');

// Generate project with live updates
ws.send(JSON.stringify({
  type: 'generate',
  prompt: 'Create a blog with markdown support',
  type: 'fullstack'
}));

// Chat with AI
ws.send(JSON.stringify({
  type: 'chat',
  content: 'How do I add authentication?'
}));

// Execute command
ws.send(JSON.stringify({
  type: 'execute',
  command: 'npm install express'
}));
```

## 📚 Project Structure

```
D:\PyBridge\                    # Installation root
├── projects\                   # Generated projects
│   ├── todo-app_abc123\
│   ├── api-users_def456\
│   └── cli-tool_ghi789\
├── sessions\                   # Session history
├── snapshots\                  # State snapshots
├── src\                        # MCP server source
│   ├── server.ts
│   └── core\
│       ├── resources.ts
│       ├── sessions.ts
│       └── sandbox.ts
├── app\                        # Web interface
│   ├── public\
│   │   ├── agent.html          # AI interface
│   │   ├── agent.js
│   │   └── agent-styles.css
│   └── src\
│       └── app-server.ts
└── agent\                      # AI Agent system
    ├── src\
    │   ├── agent-core.ts       # Main orchestrator
    │   ├── llm-interface.ts    # AI integration
    │   ├── state-manager.ts    # Hybrid state
    │   ├── project-generator.ts # Code generation
    │   └── mcp-orchestrator.ts  # Server management
    └── dist\                   # Built output
```

## 🔧 Configuration

### API Key (Optional but Recommended)

For full AI capabilities, set your Anthropic API key:

```powershell
# PowerShell
$env:ANTHROPIC_API_KEY = "sk-ant-..."

# Or add to system environment variables permanently
```

Without an API key, the system runs in template mode with basic code generation.

### Custom Port

```powershell
$env:PORT = 3000
$env:WS_PORT = 3001
```

### State Root

```powershell
$env:STATE_ROOT = "D:\PyBridge"
```

## 🎨 Web Interface Features

- **Natural Language Input**: Describe your app in plain English
- **Project Type Selection**: Auto-detect or manual selection
- **Technology Preferences**: Specify frameworks/libraries
- **Quick Prompts**: Pre-configured examples to get started
- **Real-Time Progress**: Watch each generation step
- **File Preview**: See all generated files
- **Command Copying**: One-click copy setup commands
- **Project History**: Browse previously generated projects
- **AI Chat**: Ask questions and get help
- **WebSocket Updates**: Live progress streaming

## 🔐 Security & Sandboxing

Three sandbox profiles for command execution:

- **dev**: Full access, recommended for local development
- **ci**: Suitable for CI/CD environments
- **strict**: Blocks shell interpreters, enhanced security

## 🌐 Claude Desktop Integration

PyBridge DevOS 2.0 is fully compatible with Claude Desktop. Add to your config:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "pybridge-devos": {
      "command": "node",
      "args": ["D:\\PyBridge\\dist\\server.js"]
    }
  }
}
```

## 💡 Advanced Features

### Stateful Persistence

All projects are saved to D:\PyBridge\projects with complete metadata:
- Creation timestamp
- Modification tracking
- File inventory
- Dependencies
- Custom metadata

### Stateless Snapshots

Create snapshots for reproducibility:

```javascript
POST /api/snapshot
{
  "name": "production-ready"
}
```

Restore to any previous state instantly.

### Hybrid Architecture Benefits

- **Performance**: In-memory caching for fast access
- **Reliability**: Disk persistence prevents data loss
- **Scalability**: Efficient resource management
- **Flexibility**: Switch between modes as needed

## 🐛 Troubleshooting

### Port Already in Use

```powershell
# Kill process on port 3000
Get-NetTCPConnection -LocalPort 3000 | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }
```

### API Key Not Detected

```powershell
# Verify it's set
$env:ANTHROPIC_API_KEY
```

### Projects Not Saving

Check that D:\PyBridge exists and is writable.

### Build Errors

```powershell
npm run build:all
```

## 📖 Documentation

- **QUICKSTART.md** - Step-by-step examples
- **WINDOWS-SETUP.md** - Windows-specific guide
- **oneshot-install.ps1** - Ultimate one-command installer

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Check console logs
4. GitHub Issues: https://github.com/whitneysumner61-coder/anything/issues

## 🎉 Get Started Now!

```powershell
# One command to rule them all
powershell -ExecutionPolicy Bypass -File oneshot-install.ps1
```

In less than 2 minutes, you'll have a fully functional AI-powered development system creating applications from natural language!

---

**PyBridge DevOS 2.0** - Where imagination becomes code. 🚀
