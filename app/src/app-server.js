// app/src/app-server.ts
import express from 'express';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = 3000;
// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
// MCP Client wrapper
class MCPClient {
    child = null;
    requestId = 0;
    pendingRequests = new Map();
    buffer = '';
    constructor() {
        this.connect();
    }
    connect() {
        const serverPath = path.join(__dirname, '../../dist/server.js');
        this.child = spawn('node', [serverPath], {
            stdio: ['pipe', 'pipe', 'pipe'],
        });
        this.child.stdout?.setEncoding('utf8');
        this.child.stdout?.on('data', (chunk) => {
            this.buffer += chunk;
            this.processBuffer();
        });
        this.child.stderr?.on('data', (chunk) => {
            console.error('MCP Server Error:', chunk.toString());
        });
        this.child.on('exit', (code) => {
            console.log('MCP Server exited with code:', code);
        });
        // Initialize the connection
        setTimeout(() => {
            this.sendInitialize();
        }, 100);
    }
    processBuffer() {
        const lines = this.buffer.split('\n');
        this.buffer = lines.pop() || '';
        for (const line of lines) {
            if (line.trim()) {
                try {
                    const message = JSON.parse(line);
                    this.handleMessage(message);
                }
                catch (error) {
                    console.error('Failed to parse message:', line);
                }
            }
        }
    }
    handleMessage(message) {
        if (message.id !== undefined && this.pendingRequests.has(message.id)) {
            const { resolve, reject } = this.pendingRequests.get(message.id);
            this.pendingRequests.delete(message.id);
            if (message.error) {
                reject(new Error(message.error.message || 'MCP Error'));
            }
            else {
                resolve(message.result);
            }
        }
    }
    async sendRequest(method, params) {
        return new Promise((resolve, reject) => {
            const id = ++this.requestId;
            this.pendingRequests.set(id, { resolve, reject });
            const request = {
                jsonrpc: '2.0',
                id,
                method,
                params: params || {},
            };
            this.child?.stdin?.write(JSON.stringify(request) + '\n');
            // Timeout after 30 seconds
            setTimeout(() => {
                if (this.pendingRequests.has(id)) {
                    this.pendingRequests.delete(id);
                    reject(new Error('Request timeout'));
                }
            }, 30000);
        });
    }
    async sendInitialize() {
        try {
            await this.sendRequest('initialize', {
                protocolVersion: '2024-11-05',
                capabilities: {},
                clientInfo: {
                    name: 'pybridge-webapp',
                    version: '0.1.0',
                },
            });
            // Send initialized notification
            this.child?.stdin?.write(JSON.stringify({
                jsonrpc: '2.0',
                method: 'notifications/initialized',
            }) + '\n');
            console.log('MCP Client initialized');
        }
        catch (error) {
            console.error('Failed to initialize MCP client:', error);
        }
    }
    async callTool(name, args) {
        return this.sendRequest('tools/call', {
            name,
            arguments: args,
        });
    }
    async listTools() {
        return this.sendRequest('tools/list');
    }
}
// Create MCP client instance
const mcpClient = new MCPClient();
// API Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.post('/api/workspace/open', async (req, res) => {
    try {
        const { root } = req.body;
        const result = await mcpClient.callTool('workspace_open', { root });
        // Parse the result from content array
        const data = JSON.parse(result.content[0].text);
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.post('/api/command/execute', async (req, res) => {
    try {
        const { workspace_id, cmd, args, sandbox_profile } = req.body;
        const result = await mcpClient.callTool('run_exec', {
            workspace_id,
            cmd,
            args: args || [],
            sandbox_profile: sandbox_profile || 'dev',
        });
        const data = JSON.parse(result.content[0].text);
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.post('/api/resource/read', async (req, res) => {
    try {
        const { uri, range } = req.body;
        const result = await mcpClient.callTool('resource_read', { uri, range });
        const data = JSON.parse(result.content[0].text);
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.post('/api/file/read', async (req, res) => {
    try {
        const { workspace_id, path: filePath } = req.body;
        // First, we need to construct the resource URI
        // For now, we'll use a helper endpoint or register the file
        // Simplified: assume files are registered when workspace opens
        const uri = `resource://workspace/${workspace_id}/file/${encodeURIComponent(filePath)}`;
        const result = await mcpClient.callTool('resource_read', { uri });
        const data = JSON.parse(result.content[0].text);
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.post('/api/file/write', async (req, res) => {
    try {
        const { workspace_id, path: filePath, content } = req.body;
        const uri = `resource://workspace/${workspace_id}/file/${encodeURIComponent(filePath)}`;
        const result = await mcpClient.callTool('resource_write', { uri, content });
        const data = JSON.parse(result.content[0].text);
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.get('/api/tools', async (req, res) => {
    try {
        const result = await mcpClient.listTools();
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Start server
app.listen(PORT, () => {
    console.log(`🚀 PyBridge DevOS Web App running at http://localhost:${PORT}`);
    console.log(`📂 Serving from: ${path.join(__dirname, '../public')}`);
});
