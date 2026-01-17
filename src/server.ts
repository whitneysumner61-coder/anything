// src/server.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import * as path from "node:path";
import * as fs from "node:fs/promises";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";

import { ResourceStore } from "./core/resources.js";
import { SessionStore } from "./core/sessions.js";
import { enforcePolicy, SandboxProfile } from "./core/sandbox.js";

type Workspace = { id: string; root: string };

const workspaces = new Map<string, Workspace>();
const resources = new ResourceStore();
const sessions = new SessionStore();

const server = new Server(
  { name: "pybridge-devos", version: "0.1.0" },
  { capabilities: { tools: {}, resources: {} } }
);

function mustWorkspace(id: string) {
  const w = workspaces.get(id);
  if (!w) throw new Error(`Unknown workspace: ${id}`);
  return w;
}

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "workspace_open",
        description: "Open a local workspace root and return a workspace_id.",
        inputSchema: {
          type: "object",
          properties: { root: { type: "string" } },
          required: ["root"]
        }
      },
      {
        name: "resource_read",
        description: "Read a resource URI (file/log).",
        inputSchema: {
          type: "object",
          properties: {
            uri: { type: "string" },
            range: {
              type: "object",
              properties: { start: { type: "number" }, end: { type: "number" } }
            }
          },
          required: ["uri"]
        }
      },
      {
        name: "resource_write",
        description: "Write to a file resource URI.",
        inputSchema: {
          type: "object",
          properties: { uri: { type: "string" }, content: { type: "string" } },
          required: ["uri", "content"]
        }
      },
      {
        name: "run_exec",
        description: "Execute a command in a workspace; returns a process session and log URIs.",
        inputSchema: {
          type: "object",
          properties: {
            workspace_id: { type: "string" },
            cmd: { type: "string" },
            args: { type: "array", items: { type: "string" } },
            cwd: { type: "string" },
            sandbox_profile: { type: "string", enum: ["strict", "dev", "ci"] }
          },
          required: ["workspace_id", "cmd"]
        }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;

  if (name === "workspace_open") {
    const parsed = z.object({ root: z.string() }).parse(args);
    const rootAbs = path.resolve(parsed.root);
    const stat = await fs.stat(rootAbs).catch(() => null);
    if (!stat || !stat.isDirectory()) throw new Error("root must be an existing directory");

    const id = `ws_${randomUUID()}`;
    workspaces.set(id, { id, root: rootAbs });

    // Optional: pre-register a few key files as resources lazily later.
    return {
      content: [
        { type: "text", text: JSON.stringify({ workspace_id: id, root: rootAbs }, null, 2) }
      ]
    };
  }

  if (name === "resource_read") {
    const parsed = z.object({
      uri: z.string(),
      range: z.object({ start: z.number().optional(), end: z.number().optional() }).optional()
    }).parse(args);

    const data = await resources.read(parsed.uri, parsed.range);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  }

  if (name === "resource_write") {
    const parsed = z.object({ uri: z.string(), content: z.string() }).parse(args);
    const out = await resources.writeFile(parsed.uri, parsed.content);
    return { content: [{ type: "text", text: JSON.stringify(out, null, 2) }] };
  }

  if (name === "run_exec") {
    const parsed = z.object({
      workspace_id: z.string(),
      cmd: z.string(),
      args: z.array(z.string()).optional().default([]),
      cwd: z.string().optional(),
      sandbox_profile: z.enum(["strict", "dev", "ci"]).optional().default("dev")
    }).parse(args);

    const ws = mustWorkspace(parsed.workspace_id);
    const cwd = parsed.cwd ? path.resolve(ws.root, parsed.cwd) : ws.root;

    // Enforce minimal policy now; expand later (egress, env filtering, FS constraints, etc.)
    const pol = enforcePolicy(parsed.sandbox_profile as SandboxProfile, parsed.cmd, parsed.args);

    const stdoutUri = resources.createLog(`stdout_${randomUUID()}`);
    const stderrUri = resources.createLog(`stderr_${randomUUID()}`);

    const child = spawn(pol.cmd, pol.args, { cwd, stdio: ["ignore", "pipe", "pipe"] });

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");

    child.stdout.on("data", (chunk) => resources.appendLog(stdoutUri, chunk));
    child.stderr.on("data", (chunk) => resources.appendLog(stderrUri, chunk));

    const sessionId = sessions.createProcessSession(child.pid ?? -1, stdoutUri, stderrUri);

    child.on("exit", (code, signal) => {
      resources.closeLog(stdoutUri);
      resources.closeLog(stderrUri);
      sessions.markExited(sessionId, code, signal);
    });

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            { session_id: sessionId, stdout_uri: stdoutUri, stderr_uri: stderrUri },
            null,
            2
          )
        }
      ]
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
