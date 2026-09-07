// Type declarations for the plain-ESM check-agents-md module so the TypeScript
// spec (src/ci/check-agents-md.spec.ts) can import it under strict type
// checking. Keep in sync with check-agents-md.mjs.

export const IMPORT_LINE: string;

export interface ClaudeFile {
  symlink: boolean;
  file: boolean;
  content: string;
}

export interface DirectoryDescriptor {
  hasAgents: boolean;
  hasClaude: boolean;
  claude?: ClaudeFile;
}

export function wrapperError(content: string): string | undefined;

export function directoryViolations(dir: DirectoryDescriptor): string[];
