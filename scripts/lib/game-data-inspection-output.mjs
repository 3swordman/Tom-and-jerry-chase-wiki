import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { isAbsolute, relative, resolve, sep } from 'node:path';

export function writeInspectionEvidence(projectDir, outputPath, evidence) {
  const absolutePath = resolve(projectDir, outputPath);
  const relativePath = relative(projectDir, absolutePath);
  if (
    !relativePath ||
    isAbsolute(relativePath) ||
    relativePath === '..' ||
    relativePath.startsWith(`..${sep}`)
  ) {
    throw Object.assign(new Error('evidence_path_must_be_ignored'), {
      code: 'evidence_path_must_be_ignored',
    });
  }
  try {
    execFileSync('git', ['check-ignore', '--quiet', '--', relativePath], {
      cwd: projectDir,
      stdio: 'ignore',
    });
  } catch {
    throw Object.assign(new Error('evidence_path_must_be_ignored'), {
      code: 'evidence_path_must_be_ignored',
    });
  }
  const head = execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: projectDir,
    encoding: 'utf8',
  }).trim();
  const serialized = `${JSON.stringify({ schemaVersion: 1, repository: { head }, ...evidence }, null, 2)}\n`;
  writeFileSync(absolutePath, serialized, { encoding: 'utf8', flag: 'wx', mode: 0o600 });
  return { evidencePath: absolutePath, evidenceBytes: Buffer.byteLength(serialized) };
}
