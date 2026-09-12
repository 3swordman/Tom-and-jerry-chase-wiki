import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { isAbsolute, relative, resolve, sep } from 'node:path';

export function createInventoryPage(output, rows, { pageSize = 25, cursor } = {}) {
  // ponytail: each page uses the full fetched inventory; page a saved snapshot if repeated reads become costly.
  const fail = (code) => {
    throw Object.assign(new Error(code), { code });
  };
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) fail('invalid_page_size');
  const fingerprint = createHash('sha256')
    .update(JSON.stringify([output.target, output.scope, rows]))
    .digest('hex');
  let offset = 0;
  if (cursor !== undefined) {
    const match = /^([a-f0-9]{64})\.(0|[1-9]\d*)$/.exec(cursor);
    if (!match) fail('invalid_inventory_cursor');
    if (match[1] !== fingerprint) fail('inventory_changed_restart_required');
    offset = Number(match[2]);
  }
  const actions = new Map();
  for (const item of output.report.rows)
    actions.set(item.rowId, (actions.get(item.rowId) ?? 0) + 1);
  const malformed = new Map(output.report.malformedRows.map(({ rowId, code }) => [rowId, code]));
  const groups = new Map();
  output.report.dependencyGroups.forEach(({ rowIds }, index) => {
    for (const id of rowIds) groups.set(id, { index, rowCount: rowIds.length });
  });
  const inventory = rows
    .filter(({ id }) => actions.has(id) || malformed.has(id))
    .map((row) => ({
      rowId: row.id,
      createdAt: row.created_at,
      entityType: row.entity_type,
      status: row.status,
      isPublic: row.is_public,
      inspectedActionCount: actions.get(row.id) ?? 0,
      malformedCode: malformed.get(row.id) ?? null,
      dependencyGroup: groups.get(row.id) ?? null,
    }));
  if (!Number.isSafeInteger(offset) || offset > inventory.length) fail('invalid_inventory_cursor');
  let end = Math.min(offset + pageSize, inventory.length);
  while (true) {
    const page = {
      target: output.target,
      scope: output.scope,
      inventory: inventory.slice(offset, end),
      pagination: {
        fingerprint,
        totalRows: inventory.length,
        offset,
        nextCursor: end < inventory.length ? `${fingerprint}.${end}` : null,
      },
    };
    if (Buffer.byteLength(`${JSON.stringify(page, null, 2)}\n`) <= 50_000) return page;
    if (end <= offset + 1) fail('inventory_row_too_large_use_output');
    end -= 1;
  }
}

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
