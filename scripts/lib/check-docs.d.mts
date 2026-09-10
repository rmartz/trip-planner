// Type declarations for the plain-ESM check-docs module so the TypeScript spec
// (src/ci/check-docs.spec.ts) can import it under strict type checking. Keep in
// sync with check-docs.mjs.

export const INDEX_FILE: string;
export const LOG_FILE: string;
export const NON_CONTENT_FILES: Set<string>;

export interface DirectoryDescriptor {
  rel: string;
  hasIndex: boolean;
  contentFiles: string[];
  childIndexes: string[];
  indexLinks: string[];
}

export function frontmatterError(content: string): string | undefined;

export function indexFrontmatterError(
  content: string,
  isBundleRoot?: boolean,
): string | undefined;

export function extractLinkTargets(markdown: string): string[];

export function navigationViolations(dirs: DirectoryDescriptor[]): string[];
