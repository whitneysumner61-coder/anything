// src/core/sessions.ts
import { randomUUID } from "node:crypto";

export type SessionId = string;

export type Session =
  | { kind: "process"; id: SessionId; pid: number; stdoutUri: string; stderrUri: string; startedAt: number; exited?: { code: number | null; signal: string | null } };

export class SessionStore {
  private sessions = new Map<SessionId, Session>();

  createProcessSession(pid: number, stdoutUri: string, stderrUri: string): SessionId {
    const id = `session://process/${randomUUID()}`;
    this.sessions.set(id, {
      kind: "process",
      id,
      pid,
      stdoutUri,
      stderrUri,
      startedAt: Date.now()
    });
    return id;
  }

  get(id: SessionId) {
    const s = this.sessions.get(id);
    if (!s) throw new Error(`Unknown session: ${id}`);
    return s;
  }

  markExited(id: SessionId, code: number | null, signal: string | null) {
    const s = this.get(id);
    if (s.kind !== "process") return;
    s.exited = { code, signal };
  }

  list() {
    return [...this.sessions.values()];
  }
}
