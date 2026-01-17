// src/core/resources.ts
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { createHash } from "node:crypto";

export type ResourceURI = string;

export type Resource =
  | { kind: "file"; uri: ResourceURI; absPath: string }
  | { kind: "log"; uri: ResourceURI; chunks: string[]; closed: boolean };

export class ResourceStore {
  private resources = new Map<ResourceURI, Resource>();

  fileUri(workspaceId: string, relPath: string) {
    return `resource://workspace/${workspaceId}/file/${encodeURIComponent(relPath)}`;
  }

  logUri(id: string) {
    return `resource://log/${id}`;
  }

  registerFile(uri: string, absPath: string) {
    this.resources.set(uri, { kind: "file", uri, absPath });
  }

  createLog(id: string) {
    const uri = this.logUri(id);
    this.resources.set(uri, { kind: "log", uri, chunks: [], closed: false });
    return uri;
  }

  appendLog(uri: string, line: string) {
    const r = this.resources.get(uri);
    if (!r || r.kind !== "log") throw new Error("Log not found");
    r.chunks.push(line);
  }

  closeLog(uri: string) {
    const r = this.resources.get(uri);
    if (!r || r.kind !== "log") throw new Error("Log not found");
    r.closed = true;
  }

  async read(uri: string, range?: { start?: number; end?: number }) {
    const r = this.resources.get(uri);
    if (!r) throw new Error(`Unknown resource: ${uri}`);

    if (r.kind === "file") {
      const data = await fs.readFile(r.absPath, "utf8");
      return {
        uri,
        kind: "text",
        content: data,
        sha256: sha256(data),
      };
    }

    // log
    const start = range?.start ?? 0;
    const end = range?.end ?? r.chunks.length;
    const slice = r.chunks.slice(start, end).join("");
    return {
      uri,
      kind: "text",
      content: slice,
      sha256: sha256(slice),
      closed: r.closed,
      nextStart: end
    };
  }

  async writeFile(uri: string, content: string) {
    const r = this.resources.get(uri);
    if (!r || r.kind !== "file") throw new Error("Not a file resource");
    await fs.mkdir(path.dirname(r.absPath), { recursive: true });
    await fs.writeFile(r.absPath, content, "utf8");
    return { uri, sha256: sha256(content) };
  }
}

function sha256(s: string) {
  return createHash("sha256").update(s, "utf8").digest("hex");
}
