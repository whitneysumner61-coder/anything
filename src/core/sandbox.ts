// src/core/sandbox.ts
export type SandboxProfile = "strict" | "dev" | "ci";

export function enforcePolicy(profile: SandboxProfile, cmd: string, args: string[]) {
  // Minimal safety: block obviously dangerous shells in strict mode.
  if (profile === "strict") {
    const denied = new Set(["bash", "sh", "zsh", "powershell", "cmd"]);
    if (denied.has(cmd.toLowerCase())) {
      throw new Error(`Command '${cmd}' denied in strict profile`);
    }
  }
  // Extend here: allowlists, cwd restrictions, env filtering, network policy, etc.
  return { cmd, args };
}
