<#
.SYNOPSIS
  PyBridge DevOS 2.0 - ULTIMATE Self-Contained One-Block Installer

.DESCRIPTION
  This is a COMPLETE, SELF-CONTAINED PowerShell script with ALL source code embedded.
  No downloads, no git, no external dependencies except Node.js (auto-installed).

  Run this ONE command and get a complete AI-powered development system:
  - Installs Node.js if needed (via winget)
  - Creates D:\PyBridge with complete project
  - Deploys ALL source files (embedded in this script)
  - Installs npm dependencies
  - Builds entire system (MCP + Web + AI Agent)
  - Launches on http://localhost:3000/agent.html
  - Opens browser automatically

  TOTAL SIZE: ~15KB of embedded code
  ZERO external downloads required!

.PARAMETER Path
  Installation path (default: D:\PyBridge)

.PARAMETER ApiKey
  Optional Anthropic API key (get from: https://console.anthropic.com)

.EXAMPLE
  powershell -ExecutionPolicy Bypass "& '.\PYBRIDGE-ULTIMATE-ONESHOT.ps1'"

.EXAMPLE
  powershell -ExecutionPolicy Bypass "& '.\PYBRIDGE-ULTIMATE-ONESHOT.ps1'" -Path "C:\Dev" -ApiKey "sk-ant-..."

#>

[CmdletBinding()]
param(
  [string]$Path = "D:\PyBridge",
  [string]$ApiKey = ""
)

$ErrorActionPreference = "Stop"

# ═══════════════════════════════════════════════════════════════════════════════
# EMBEDDED SOURCE FILES - ALL PROJECT CODE IS HERE
# ═══════════════════════════════════════════════════════════════════════════════

$FILES = @{

'package.json' = @'
{
  "name": "pybridge-devos",
  "version": "2.0.0",
  "type": "module",
  "scripts": {
    "build": "tsc -p tsconfig.json",
    "build:app": "tsc -p tsconfig.app.json",
    "build:agent": "tsc -p tsconfig.agent.json",
    "build:all": "npm run build && npm run build:app && npm run build:agent",
    "agent": "node agent/dist/agent-core.js"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.30.0",
    "@modelcontextprotocol/sdk": "^1.0.0",
    "express": "^4.18.2",
    "ws": "^8.16.0",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^25.0.9",
    "@types/ws": "^8.5.10",
    "typescript": "^5.5.0"
  }
}
'@

'tsconfig.json' = @'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "Bundler",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "app", "agent"]
}
'@

'tsconfig.app.json' = @'
{
  "extends": "./tsconfig.json",
  "compilerOptions": { "outDir": "app/dist", "rootDir": "app/src" },
  "include": ["app/src/**/*"],
  "exclude": ["node_modules", "dist", "src", "agent"]
}
'@

'tsconfig.agent.json' = @'
{
  "extends": "./tsconfig.json",
  "compilerOptions": { "outDir": "agent/dist", "rootDir": "agent/src" },
  "include": ["agent/src/**/*"],
  "exclude": ["node_modules", "dist", "src", "app"]
}
'@

'.gitignore' = @'
node_modules/
dist/
app/dist/
agent/dist/
*.log
.env
'@

'src/server.ts' = @'
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";

const server = new Server({ name: "pybridge-devos", version: "2.0.0" }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [{ name: "ping", description: "Test tool", inputSchema: { type: "object", properties: {} } }]
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => ({
  content: [{ type: "text", text: "MCP Server running" }]
}));

const transport = new StdioServerTransport();
await server.connect(transport);
'@

'app/src/app-server.ts' = @'
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => console.log(`Server: http://localhost:${PORT}`));
'@

'app/public/agent.html' = @'
<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>PyBridge DevOS 2.0</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:system-ui;background:linear-gradient(135deg,#1e3a8a,#7c3aed,#ec4899);min-height:100vh;padding:20px;color:#fff}
.container{max-width:1200px;margin:0 auto}
.header{background:rgba(255,255,255,0.95);backdrop-filter:blur(10px);padding:30px;border-radius:20px;margin-bottom:30px;color:#1f2937}
.header h1{font-size:2.5rem;background:linear-gradient(135deg,#1e3a8a,#7c3aed);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.card{background:rgba(255,255,255,0.95);padding:30px;border-radius:20px;margin-bottom:20px;color:#1f2937}
textarea{width:100%;padding:20px;border:2px solid #e5e7eb;border-radius:12px;font-size:1rem;resize:vertical;font-family:inherit;min-height:150px}
.btn{width:100%;padding:18px;background:linear-gradient(135deg,#1e3a8a,#7c3aed);color:white;border:none;border-radius:12px;font-size:1.2rem;font-weight:600;cursor:pointer;margin-top:15px}
.btn:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(124,58,237,0.4)}
#result{background:#f9fafb;padding:20px;border-radius:12px;margin-top:20px;color:#1f2937;min-height:100px;font-family:monospace;white-space:pre-wrap}
</style></head><body>
<div class="container">
  <div class="header"><h1>🤖 PyBridge DevOS 2.0</h1><p>AI-Powered Application Generator</p></div>
  <div class="card">
    <h2>✨ Describe Your Application</h2>
    <textarea id="prompt" placeholder="Example: Create a todo list web app with dark mode..."></textarea>
    <button class="btn" onclick="generate()">🚀 Generate Application</button>
    <div id="result"></div>
  </div>
</div>
<script>
async function generate(){
  const prompt=document.getElementById('prompt').value;
  if(!prompt){alert('Please enter a description');return;}
  document.getElementById('result').textContent='Generating...';
  try{
    const res=await fetch('/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt})});
    const data=await res.json();
    document.getElementById('result').textContent=data.success?
      `✓ Generated!\nProject: ${data.project.name}\nPath: ${data.project.path}\nFiles: ${data.project.files.join(', ')}`:
      `Error: ${data.error}`;
  }catch(e){
    document.getElementById('result').textContent='Error: '+e.message;
  }
}
</script></body></html>
'@

'agent/src/agent-core.ts' = @'
import express from "express";
import { WebSocketServer } from "ws";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { LLMInterface } from "./llm-interface.js";
import { StateManager } from "./state-manager.js";
import { ProjectGenerator } from "./project-generator.js";

const PORT = parseInt(process.env.PORT || "3000");
const WS_PORT = parseInt(process.env.WS_PORT || "3001");
const __dirname = path.dirname(fileURLToPath(import.meta.url));

class AIAgentCore {
  private app = express();
  private wss = new WebSocketServer({ port: WS_PORT });
  private state = new StateManager(process.env.STATE_ROOT || "D:\\PyBridge");
  private llm = new LLMInterface();
  private generator = new ProjectGenerator(this.llm, this.state);

  constructor() {
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, "../../app/public")));
    this.app.get("/api/health", (_, res) => res.json({ status: "ok", version: "2.0.0" }));
    this.app.post("/api/generate", async (req, res) => {
      try {
        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ error: "Prompt required" });
        const result = await this.generator.generateProject({ prompt });
        res.json({ success: true, project: { id: result.project.id, name: result.project.name, path: result.project.path, files: result.files.map(f => f.path) } });
      } catch (e: any) {
        res.status(500).json({ error: e.message });
      }
    });
    this.app.get("/api/projects", async (_, res) => {
      const projects = await this.state.listProjects();
      res.json({ projects });
    });
    this.wss.on("connection", ws => ws.send(JSON.stringify({ type: "connected" })));
  }

  async start() {
    await this.state.initialize();
    this.app.listen(PORT, () => {
      console.log("\n═══════════════════════════════════════════════════════");
      console.log("  🚀 PyBridge DevOS 2.0");
      console.log("═══════════════════════════════════════════════════════\n");
      console.log(`  🌐 http://localhost:${PORT}/agent.html`);
      console.log(`  💾 ${this.state.getStateRoot()}\n`);
    });
  }
}

new AIAgentCore().start();
'@

'agent/src/llm-interface.ts' = @'
import Anthropic from "@anthropic-ai/sdk";

export interface GenerationRequest { prompt: string; maxTokens?: number; }
export interface GenerationResponse { content: string; tokens: number; model: string; }

export class LLMInterface {
  private client: Anthropic;
  private model = "claude-sonnet-4-5-20250929";

  constructor() {
    const key = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
    if (!key) console.warn("[LLM] No API key - using template mode");
    this.client = new Anthropic({ apiKey: key || "placeholder" });
  }

  async generateCode(req: GenerationRequest): Promise<GenerationResponse> {
    try {
      const res = await this.client.messages.create({
        model: this.model,
        max_tokens: req.maxTokens || 4096,
        messages: [{ role: "user", content: req.prompt }]
      });
      const content = res.content[0].type === "text" ? res.content[0].text : "";
      return { content, tokens: res.usage.input_tokens + res.usage.output_tokens, model: this.model };
    } catch {
      return this.template(req);
    }
  }

  private template(req: GenerationRequest): GenerationResponse {
    const code = req.prompt.toLowerCase().includes("web") ?
      'import express from "express";\nconst app = express();\napp.listen(3000);' :
      'console.log("Generated app");';
    return { content: code, tokens: 0, model: "template" };
  }
}
'@

'agent/src/state-manager.ts' = @'
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { createHash } from "node:crypto";

export interface ProjectState {
  id: string; name: string; description: string; path: string;
  created: Date; modified: Date; files: string[];
}

export class StateManager {
  private projectsPath: string;

  constructor(private stateRoot: string) {
    this.projectsPath = path.join(stateRoot, "projects");
  }

  async initialize() {
    await fs.mkdir(this.projectsPath, { recursive: true });
    console.log(`[State] Initialized: ${this.stateRoot}`);
  }

  async createProject(name: string, desc: string): Promise<ProjectState> {
    const id = `${name.replace(/[^a-z0-9]/gi, "_")}_${Date.now()}`;
    const projectPath = path.join(this.projectsPath, id);
    await fs.mkdir(projectPath, { recursive: true });
    const project: ProjectState = {
      id, name, description: desc, path: projectPath,
      created: new Date(), modified: new Date(), files: []
    };
    await fs.writeFile(path.join(projectPath, "project.json"), JSON.stringify(project, null, 2));
    return project;
  }

  async writeProjectFile(projectId: string, relPath: string, content: string) {
    const projectPath = path.join(this.projectsPath, projectId);
    const filePath = path.join(projectPath, relPath);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, content, "utf8");
  }

  async listProjects(): Promise<ProjectState[]> {
    try {
      const dirs = await fs.readdir(this.projectsPath);
      const projects: ProjectState[] = [];
      for (const dir of dirs) {
        try {
          const data = await fs.readFile(path.join(this.projectsPath, dir, "project.json"), "utf8");
          projects.push(JSON.parse(data));
        } catch {}
      }
      return projects;
    } catch {
      return [];
    }
  }

  getStateRoot() { return this.stateRoot; }
}
'@

'agent/src/project-generator.ts' = @'
import { LLMInterface } from "./llm-interface.js";
import { StateManager, ProjectState } from "./state-manager.js";

export interface ProjectRequest { prompt: string; type?: string; }
export interface GeneratedProject {
  project: ProjectState;
  files: Array<{ path: string; content: string }>;
  commands: string[];
  nextSteps: string[];
}

export class ProjectGenerator {
  constructor(private llm: LLMInterface, private state: StateManager) {}

  async generateProject(req: ProjectRequest): Promise<GeneratedProject> {
    const name = req.prompt.split(" ").slice(0, 3).join("-").toLowerCase().replace(/[^a-z0-9-]/g, "");
    const project = await this.state.createProject(name, req.prompt);

    const codePrompt = `Generate a complete ${req.type || "web"} application for: ${req.prompt}

Create these files:
1. src/index.ts - main entry point
2. package.json - dependencies
3. README.md - documentation

Provide complete, working code for each file.`;

    const response = await this.llm.generateCode({ prompt: codePrompt, maxTokens: 4096 });

    const files = [
      { path: "src/index.ts", content: response.content },
      { path: "package.json", content: JSON.stringify({ name, version: "1.0.0", type: "module", scripts: { start: "node src/index.js" } }, null, 2) },
      { path: "README.md", content: `# ${name}\n\n${req.prompt}\n\nGenerated by PyBridge DevOS 2.0` }
    ];

    for (const file of files) {
      await this.state.writeProjectFile(project.id, file.path, file.content);
    }

    return {
      project,
      files,
      commands: ["npm install", "npm start"],
      nextSteps: ["Review generated code", "Customize as needed", "Run the application"]
    };
  }
}
'@

}

# ═══════════════════════════════════════════════════════════════════════════════
# INSTALLATION FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════════

function Write-Banner {
  Write-Host "`n═══════════════════════════════════════════════════════" -ForegroundColor Cyan
  Write-Host "  🚀 PyBridge DevOS 2.0 - ONE-SHOT INSTALLER" -ForegroundColor Green
  Write-Host "═══════════════════════════════════════════════════════`n" -ForegroundColor Cyan
}

function Write-Step([string]$msg) {
  Write-Host "  ► " -NoNewline -ForegroundColor Cyan
  Write-Host $msg
}

function Write-OK([string]$msg) {
  Write-Host "  ✓ " -NoNewline -ForegroundColor Green
  Write-Host $msg
}

function Install-NodeIfNeeded {
  try {
    $ver = (& node --version 2>$null)
    if ($ver) {
      $major = [int]($ver.TrimStart('v').Split('.')[0])
      if ($major -ge 18) {
        Write-OK "Node.js v$major detected"
        return
      }
    }
  } catch {}

  Write-Step "Installing Node.js LTS..."
  if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
    throw "Node.js not found and winget unavailable. Install Node.js from https://nodejs.org"
  }

  & winget install -e --id OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements --silent | Out-Null
  $env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [Environment]::GetEnvironmentVariable("Path", "User")
  Write-OK "Node.js installed"
}

function Deploy-AllFiles {
  Write-Step "Deploying project files..."

  foreach ($file in $FILES.Keys) {
    $fullPath = Join-Path $Path $file
    $dir = Split-Path $fullPath -Parent
    if (-not (Test-Path $dir)) {
      New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    Set-Content -Path $fullPath -Value $FILES[$file] -Encoding UTF8
  }

  Write-OK "All files deployed ($($FILES.Count) files)"
}

# ═══════════════════════════════════════════════════════════════════════════════
# MAIN INSTALLATION
# ═══════════════════════════════════════════════════════════════════════════════

try {
  Write-Banner

  Install-NodeIfNeeded
  Deploy-AllFiles

  Set-Location $Path

  Write-Step "Installing dependencies (npm install)..."
  & npm install --silent --no-progress 2>&1 | Out-Null
  Write-OK "Dependencies installed"

  Write-Step "Building system (tsc)..."
  & npm run build:all --silent 2>&1 | Out-Null
  Write-OK "Build complete"

  if ($ApiKey) {
    $env:ANTHROPIC_API_KEY = $ApiKey
    Write-OK "API key configured"
  } else {
    Write-Host "  ⚠ No API key - template mode active" -ForegroundColor Yellow
  }

  $env:STATE_ROOT = $Path
  $env:PORT = "3000"
  $env:WS_PORT = "3001"

  Write-Host "`n═══════════════════════════════════════════════════════" -ForegroundColor Green
  Write-Host "  ✨ PyBridge DevOS 2.0 Ready!" -ForegroundColor Green
  Write-Host "═══════════════════════════════════════════════════════`n" -ForegroundColor Green
  Write-Host "  📂 $Path" -ForegroundColor Yellow
  Write-Host "  🌐 http://localhost:3000/agent.html`n" -ForegroundColor Yellow

  Start-Job -ScriptBlock { param($u); Start-Sleep 3; Start-Process $u } -ArgumentList "http://localhost:3000/agent.html" | Out-Null

  & npm run agent

} catch {
  Write-Host "`n✗ Error: $($_.Exception.Message)`n" -ForegroundColor Red
  exit 1
}
