import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const DEFAULT_EXCLUDED_DIRS = new Set(['archive', 'research']);

function usage(): never {
  // Keep it tiny + grep-friendly.
  // This is a local helper; we optimize for predictable output, not fancy UX.
  process.stdout.write(`Usage: docs-list [--docs <dir>] [--exclude <dir>]...

Options:
  --docs <dir>        Docs directory (default: ./docs)
  --exclude <dir>     Excluded subdirectory name (repeatable; default: archive,research)
  -h, --help          Show this help
`);
  process.exit(0);
}

function parseArgs(argv: string[]): { docsDir: string; excludedDirs: Set<string> } {
  let docsDir = 'docs';
  const excludedDirs = new Set<string>(DEFAULT_EXCLUDED_DIRS);

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '-h' || arg === '--help') {
      usage();
    }
    if (arg === '--docs') {
      const value = argv[i + 1];
      if (!value) {
        process.stderr.write('Error: --docs requires a value\n');
        process.exit(2);
      }
      docsDir = value;
      i += 1;
      continue;
    }
    if (arg === '--exclude') {
      const value = argv[i + 1];
      if (!value) {
        process.stderr.write('Error: --exclude requires a value\n');
        process.exit(2);
      }
      excludedDirs.add(value);
      i += 1;
      continue;
    }

    process.stderr.write(`Error: unknown arg: ${arg}\n`);
    process.exit(2);
  }

  return { docsDir, excludedDirs };
}

function compactStrings(values: unknown[]): string[] {
  const result: string[] = [];
  for (const value of values) {
    if (value === null || value === undefined) {
      continue;
    }
    const normalized = String(value).trim();
    if (normalized.length > 0) {
      result.push(normalized);
    }
  }
  return result;
}

function walkMarkdownFiles(dir: string, baseDir: string, excludedDirs: Set<string>): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.')) {
      continue;
    }

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (excludedDirs.has(entry.name)) {
        continue;
      }
      files.push(...walkMarkdownFiles(fullPath, baseDir, excludedDirs));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(path.relative(baseDir, fullPath));
    }
  }

  return files.sort((a, b) => a.localeCompare(b));
}

function extractMetadata(fullPath: string): {
  summary: string | null;
  readWhen: string[];
  error?: string;
} {
  const content = readFileSync(fullPath, 'utf8');

  if (!content.startsWith('---')) {
    return { summary: null, readWhen: [], error: 'missing front matter' };
  }

  const endIndex = content.indexOf('\n---', 3);
  if (endIndex === -1) {
    return { summary: null, readWhen: [], error: 'unterminated front matter' };
  }

  const frontMatter = content.slice(3, endIndex).trim();
  const lines = frontMatter.split('\n');

  let summaryLine: string | null = null;
  const readWhen: string[] = [];
  let collectingField: 'read_when' | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (line.startsWith('summary:')) {
      summaryLine = line;
      collectingField = null;
      continue;
    }

    if (line.startsWith('read_when:')) {
      collectingField = 'read_when';
      const inline = line.slice('read_when:'.length).trim();
      if (inline.startsWith('[') && inline.endsWith(']')) {
        try {
          const parsed = JSON.parse(inline.replace(/'/g, '"')) as unknown;
          if (Array.isArray(parsed)) {
            readWhen.push(...compactStrings(parsed));
          }
        } catch {
          // ignore malformed inline arrays
        }
      }
      continue;
    }

    if (collectingField === 'read_when') {
      if (line.startsWith('- ')) {
        const hint = line.slice(2).trim();
        if (hint) {
          readWhen.push(hint);
        }
      } else if (line === '') {
      } else {
        collectingField = null;
      }
    }
  }

  if (!summaryLine) {
    return { summary: null, readWhen, error: 'summary key missing' };
  }

  const summaryValue = summaryLine.slice('summary:'.length).trim();
  const normalized = summaryValue
    .replace(/^['"]|['"]$/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!normalized) {
    return { summary: null, readWhen, error: 'summary is empty' };
  }

  return { summary: normalized, readWhen };
}

const { docsDir, excludedDirs } = parseArgs(process.argv.slice(2));
const docsPath = path.resolve(process.cwd(), docsDir);

try {
  readdirSync(docsPath, { withFileTypes: true });
} catch {
  process.stderr.write(`Error: docs dir not found: ${docsPath}\n`);
  process.exit(1);
}

process.stdout.write(`Listing all markdown files in docs folder: ${docsPath}\n`);
const markdownFiles = walkMarkdownFiles(docsPath, docsPath, excludedDirs);

for (const relativePath of markdownFiles) {
  const fullPath = path.join(docsPath, relativePath);
  const { summary, readWhen, error } = extractMetadata(fullPath);
  if (summary) {
    process.stdout.write(`${relativePath} - ${summary}\n`);
    if (readWhen.length > 0) {
      process.stdout.write(`  Read when: ${readWhen.join('; ')}\n`);
    }
  } else {
    const reason = error ? ` - [${error}]` : '';
    process.stdout.write(`${relativePath}${reason}\n`);
  }
}

process.stdout.write(
  '\nReminder: keep docs up to date as behavior changes. When your task matches any "Read when" hint above, read that doc before coding, and suggest new coverage when it is missing.\n',
);

