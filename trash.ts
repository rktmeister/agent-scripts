import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export type MovePathsToTrashOptions = {
  allowMissing?: boolean;
};

export type MovePathsToTrashResult = {
  moved: string[];
  missing: string[];
  errors: string[];
};

const getTrashDir = (): string => {
  const home = os.homedir();
  if (process.platform === 'darwin') {
    return path.join(home, '.Trash');
  }
  return path.join(home, '.local', 'share', 'Trash', 'files');
};

const ensureDirSync = (dirPath: string): void => {
  fs.mkdirSync(dirPath, { recursive: true });
};

const uniqueDestPathSync = (trashDir: string, originalName: string): string => {
  const base = path.basename(originalName);
  const ext = path.extname(base);
  const stem = ext ? base.slice(0, -ext.length) : base;

  let candidate = path.join(trashDir, base);
  if (!fs.existsSync(candidate)) {
    return candidate;
  }

  const nonce = Date.now();
  for (let attempt = 1; attempt < 10_000; attempt += 1) {
    candidate = path.join(trashDir, `${stem}-${nonce}-${attempt}${ext}`);
    if (!fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(`Unable to find free Trash destination for ${base}`);
};

const moveSync = (sourcePath: string, destinationPath: string): void => {
  try {
    fs.renameSync(sourcePath, destinationPath);
  } catch {
    const stats = fs.lstatSync(sourcePath);
    fs.cpSync(sourcePath, destinationPath, { recursive: stats.isDirectory(), errorOnExist: true });
    fs.rmSync(sourcePath, { recursive: stats.isDirectory(), force: true });
  }
};

export function movePathsToTrash(
  targets: string[],
  cwd: string,
  options: MovePathsToTrashOptions = {}
): MovePathsToTrashResult {
  const result: MovePathsToTrashResult = {
    moved: [],
    missing: [],
    errors: [],
  };

  const trashDir = getTrashDir();
  ensureDirSync(trashDir);

  for (const target of targets) {
    const trimmed = target.trim();
    if (!trimmed) {
      continue;
    }

    const absolutePath = path.isAbsolute(trimmed) ? trimmed : path.resolve(cwd, trimmed);
    if (!fs.existsSync(absolutePath)) {
      if (!options.allowMissing) {
        result.missing.push(trimmed);
      }
      continue;
    }

    try {
      const destinationPath = uniqueDestPathSync(trashDir, absolutePath);
      moveSync(absolutePath, destinationPath);
      result.moved.push(trimmed);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      result.errors.push(`rm: ${trimmed}: ${message}`);
    }
  }

  return result;
}

function printHelp(): void {
  process.stdout.write(`Usage: trash [--allow-missing] <path>...

Move files/directories to the OS Trash (Linux: ~/.local/share/Trash/files, macOS: ~/.Trash).

Options:
  --allow-missing   Ignore missing paths (exit 0).
  -h, --help        Show this help.
`);
}

function main(argv: string[]): number {
  let allowMissing = false;
  const targets: string[] = [];

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '-h' || arg === '--help') {
      printHelp();
      return 0;
    }
    if (arg === '--allow-missing') {
      allowMissing = true;
      continue;
    }
    if (arg.startsWith('-')) {
      process.stderr.write(`trash: unknown option: ${arg}\n`);
      printHelp();
      return 2;
    }
    targets.push(arg);
  }

  if (targets.length === 0) {
    printHelp();
    return 2;
  }

  const result = movePathsToTrash(targets, process.cwd(), { allowMissing });

  for (const message of result.errors) {
    process.stderr.write(`${message}\n`);
  }
  for (const missing of result.missing) {
    process.stderr.write(`trash: missing: ${missing}\n`);
  }

  if (result.errors.length > 0) {
    return 1;
  }
  if (!allowMissing && result.missing.length > 0) {
    return 1;
  }
  return 0;
}

if (import.meta.main) {
  process.exit(main(process.argv.slice(2)));
}
