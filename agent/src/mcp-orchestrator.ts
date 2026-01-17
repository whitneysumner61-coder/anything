// agent/src/mcp-orchestrator.ts
// Dynamic MCP Server Management and Orchestration

import { spawn, type ChildProcess } from 'node:child_process';
import * as path from 'node:path';

export interface MCPServer {
  id: string;
  name: string;
  process: ChildProcess;
  port?: number;
  status: 'starting' | 'running' | 'stopped' | 'error';
  startedAt: Date;
}

export class MCPOrchestrator {
  private servers: Map<string, MCPServer> = new Map();
  private baseServerPath: string;

  constructor(baseServerPath?: string) {
    this.baseServerPath = baseServerPath || path.join(process.cwd(), 'dist', 'server.js');
  }

  async startServer(name: string, config?: any): Promise<MCPServer> {
    const id = `mcp_${name}_${Date.now()}`;

    console.log(`[MCP] Starting server: ${name}`);

    const child = spawn('node', [this.baseServerPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        MCP_SERVER_NAME: name,
        MCP_SERVER_ID: id,
        ...(config?.env || {})
      }
    });

    const server: MCPServer = {
      id,
      name,
      process: child,
      status: 'starting',
      startedAt: new Date()
    };

    // Handle output
    child.stdout?.on('data', (chunk) => {
      console.log(`[MCP:${name}] ${chunk.toString().trim()}`);
    });

    child.stderr?.on('data', (chunk) => {
      console.error(`[MCP:${name}:ERROR] ${chunk.toString().trim()}`);
    });

    // Handle events
    child.on('spawn', () => {
      server.status = 'running';
      console.log(`[MCP] Server ${name} is running (PID: ${child.pid})`);
    });

    child.on('error', (error) => {
      server.status = 'error';
      console.error(`[MCP] Server ${name} error:`, error.message);
    });

    child.on('exit', (code, signal) => {
      server.status = 'stopped';
      console.log(`[MCP] Server ${name} exited (code: ${code}, signal: ${signal})`);
      this.servers.delete(id);
    });

    this.servers.set(id, server);

    // Wait for startup
    await this.waitForServerReady(server);

    return server;
  }

  private async waitForServerReady(server: MCPServer, timeout: number = 5000): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      if (server.status === 'running') {
        return;
      }

      if (server.status === 'error' || server.status === 'stopped') {
        throw new Error(`Server failed to start: ${server.name}`);
      }

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    throw new Error(`Server startup timeout: ${server.name}`);
  }

  async stopServer(id: string): Promise<void> {
    const server = this.servers.get(id);

    if (!server) {
      console.warn(`[MCP] Server not found: ${id}`);
      return;
    }

    console.log(`[MCP] Stopping server: ${server.name}`);

    server.process.kill('SIGTERM');

    // Wait for graceful shutdown
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (!server.process.killed) {
      server.process.kill('SIGKILL');
    }

    this.servers.delete(id);
  }

  async stopAll(): Promise<void> {
    console.log(`[MCP] Stopping all servers (${this.servers.size})...`);

    const stopPromises = Array.from(this.servers.keys()).map(id =>
      this.stopServer(id)
    );

    await Promise.all(stopPromises);
  }

  listServers(): MCPServer[] {
    return Array.from(this.servers.values());
  }

  getServer(id: string): MCPServer | undefined {
    return this.servers.get(id);
  }

  async sendCommand(serverId: string, command: any): Promise<any> {
    const server = this.servers.get(serverId);

    if (!server) {
      throw new Error(`Server not found: ${serverId}`);
    }

    if (server.status !== 'running') {
      throw new Error(`Server not running: ${serverId}`);
    }

    return new Promise((resolve, reject) => {
      const message = JSON.stringify(command) + '\n';

      server.process.stdin?.write(message, (error) => {
        if (error) {
          reject(error);
        } else {
          // For now, just resolve immediately
          // In a real implementation, you'd wait for a response
          resolve({ success: true });
        }
      });
    });
  }
}
